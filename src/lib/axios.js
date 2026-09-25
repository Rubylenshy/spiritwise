import axios from 'axios'
import useAuthStore from '../store/authStore'
import { API_BASE_URL } from './config'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Endpoints that authenticate by credentials or refresh token, never the bearer token.
const TOKEN_AUTH_PATHS = ['/auth/login/', '/auth/register/', '/auth/token/refresh/', '/auth/logout/']
const isTokenAuthPath = (url = '') => TOKEN_AUTH_PATHS.some((p) => url.includes(p))

function endSession() {
    useAuthStore.getState().logout()
    if (window.location.pathname !== '/login') window.location.href = '/login'
}

// --- Access-token refresh ---
// Concurrent callers share one in-flight request: each refresh rotates the
// refresh token, and a second call with the old one would be rejected.
let refreshing = null

function refreshAccessToken() {
    const refreshToken = useAuthStore.getState().getRefreshToken()
    if (!refreshToken) {
        endSession()
        return Promise.reject(new Error('No refresh token'))
    }
    refreshing ??= axios
        // bare axios, not `api` — the interceptors must not re-enter on this call
        .post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: refreshToken })
        .then(({ data }) => {
            // ROTATE_REFRESH_TOKENS: keep the new refresh token, the old one is now blacklisted
            useAuthStore.getState().setTokens({
                accessToken: data.access,
                refreshToken: data.refresh ?? refreshToken,
            })
            return data.access
        })
        .catch((err) => {
            // Only a rejected token ends the session; a network blip shouldn't log anyone out.
            if (err.response?.status === 401 || err.response?.status === 400) endSession()
            throw err
        })
        .finally(() => { refreshing = null })
    return refreshing
}

// --- Request interceptor: attach access token ---
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().getAccessToken()
    if (token && !isTokenAuthPath(config.url)) config.headers.Authorization = `Bearer ${token}`
    return config
})

// --- Response interceptor: refresh once on 401, then retry ---
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isTokenAuthPath(originalRequest.url)
        ) {
            originalRequest._retry = true
            const token = await refreshAccessToken()
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
        }

        return Promise.reject(error)
    }
)

/**
 * Blacklist the refresh token server-side. Fire-and-forget: the caller clears
 * local state straight away whether or not this reaches the server.
 */
export function revokeSession() {
    const refresh = useAuthStore.getState().getRefreshToken()
    if (!refresh) return
    axios.post(`${API_BASE_URL}/auth/logout/`, { refresh }).catch(() => {})
}

export default api

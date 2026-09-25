import axios from 'axios'
import useAuthStore from '../store/authStore'
import { API_BASE_URL } from './config'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Endpoints that authenticate by credentials or the refresh cookie, never the bearer token.
const COOKIE_AUTH_PATHS = ['/auth/login/', '/auth/register/', '/auth/token/refresh/', '/auth/logout/']
const isCookieAuthPath = (url = '') => COOKIE_AUTH_PATHS.some((p) => url.includes(p))

function endSession() {
    useAuthStore.getState().logout()
    if (window.location.pathname !== '/login') window.location.href = '/login'
}

// --- Access-token refresh ---
// The refresh token is an httpOnly cookie the browser sends to /api/auth/ on
// its own. Concurrent callers share one in-flight request, because each
// refresh rotates the cookie and a second call with the old one would fail.
let refreshing = null

export function refreshAccessToken() {
    refreshing ??= axios
        // bare axios, not `api` — the interceptors must not re-enter on this call
        .post(`${API_BASE_URL}/auth/token/refresh/`, null, { withCredentials: true })
        .then(({ data }) => {
            useAuthStore.getState().setAccessToken(data.access)
            return data.access
        })
        .catch((err) => {
            // Only a rejected cookie ends the session; a network blip shouldn't log anyone out.
            if (err.response?.status === 401) endSession()
            throw err
        })
        .finally(() => { refreshing = null })
    return refreshing
}

// --- Request interceptor: attach access token ---
// After a reload the store has no access token yet, so mint one before the
// first request instead of letting it 401.
api.interceptors.request.use(async (config) => {
    if (isCookieAuthPath(config.url)) return config
    const { isAuthenticated, getAccessToken } = useAuthStore.getState()
    let token = getAccessToken()
    if (!token && isAuthenticated) token = await refreshAccessToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
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
            !isCookieAuthPath(originalRequest.url) &&
            useAuthStore.getState().isAuthenticated
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
 * Revoke the refresh cookie server-side. Fire-and-forget: the caller clears
 * local state straight away whether or not this reaches the server.
 */
export function revokeSession() {
    axios.post(`${API_BASE_URL}/auth/logout/`, null, { withCredentials: true }).catch(() => {})
}

export default api

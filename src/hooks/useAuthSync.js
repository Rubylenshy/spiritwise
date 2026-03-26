import { useEffect, useRef } from 'react'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'

/**
 * Call once at the app root (inside QueryClientProvider).
 * Fetches /api/auth/me/ on mount if authenticated and syncs
 * the latest user object (xp_points, streak, etc.) into Zustand.
 */
export function useAuthSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)
  const synced = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || synced.current) return
    synced.current = true

    api.get('/auth/me/')
      .then(({ data }) => setUser(data))
      .catch((err) => {
        // If 401 even after interceptor retry — token is truly gone
        if (err.response?.status === 401) logout()
      })
  }, [isAuthenticated, setUser, logout])
}

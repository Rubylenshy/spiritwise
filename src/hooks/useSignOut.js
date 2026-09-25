import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { revokeSession } from '../lib/axios'
import useAuthStore from '../store/authStore'

/**
 * Sign out: revoke the refresh cookie server-side (without waiting), clear the
 * auth store, and drop cached server state so the next user never sees this
 * one's favorites, playlists or progress.
 */
export function useSignOut() {
  const queryClient = useQueryClient()
  const logout = useAuthStore((s) => s.logout)

  return useCallback(() => {
    revokeSession()
    logout()
    queryClient.clear()
  }, [queryClient, logout])
}

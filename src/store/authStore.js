import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Tokens never touch localStorage. The access token lives only in memory and
 * the refresh token is an httpOnly cookie the backend sets on /api/auth/, so
 * after a reload the first API call mints a new access token (see lib/axios.js).
 * `isAuthenticated` is persisted only as a hint so the UI can render straight
 * away; a failed refresh flips it back.
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      // Prefills the login form with whatever was typed (username or email).
      // Deliberately survives logout; never store the password.
      lastUsername: '',

      setAuth: ({ user, accessToken, lastUsername }) =>
        set({
          user, accessToken, isAuthenticated: true,
          lastUsername: lastUsername ?? get().lastUsername,
        }),

      forgetLastUsername: () => set({ lastUsername: '' }),

      setUser: (user) => set({ user }),

      setAccessToken: (accessToken) => set({ accessToken }),

      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),

      getAccessToken: () => get().accessToken,
    }),
    {
      name: 'spiritwise-auth',
      version: 1,
      // v0 persisted accessToken/refreshToken; drop them so they don't linger.
      migrate: (persisted) => {
        const rest = { ...persisted }
        delete rest.accessToken
        delete rest.refreshToken
        return rest
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastUsername: state.lastUsername,
      }),
    }
  )
)

export default useAuthStore

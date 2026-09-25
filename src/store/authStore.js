import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtStorage } from '../lib/jwtStorage'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      // Prefills the login form with whatever was typed (username or email).
      // Deliberately survives logout; never store the password.
      lastUsername: '',

      setAuth: ({ user, accessToken, refreshToken, lastUsername }) =>
        set({
          user, accessToken, refreshToken, isAuthenticated: true,
          lastUsername: lastUsername ?? get().lastUsername,
        }),

      forgetLastUsername: () => set({ lastUsername: '' }),

      setUser: (user) => set({ user }),

      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
    }),
    {
      name: 'spiritwise-auth',
      // Saved as a signed JWT rather than plain JSON — see lib/jwtStorage.js
      storage: jwtStorage,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        lastUsername: state.lastUsername,
      }),
    }
  )
)

export default useAuthStore

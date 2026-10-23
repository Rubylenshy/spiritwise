import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      // Prefills the login form. Deliberately survives logout; never store the password.
      lastUsername: '',

      setAuth: ({ user, accessToken, refreshToken }) =>
        set({
          user, accessToken, refreshToken, isAuthenticated: true,
          lastUsername: user?.username ?? get().lastUsername,
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

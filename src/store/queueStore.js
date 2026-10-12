import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import useAuthStore from './authStore'

// Only the summary fields the queue UI shows. The audio URL is fetched when an
// item actually plays — fetching a sermon's detail counts a play and mints a
// stream token, so it must not happen just for queueing it.
const summary = ({ id, title, speaker, duration_seconds, thumbnail }) =>
  ({ id, title, speaker, duration_seconds, thumbnail })

/**
 * Sermons queued to play after the current one, in order. The global player
 * (AudioContext) takes from the front when a sermon ends, and drops a sermon
 * from the queue whenever it starts playing by any route.
 */
const useQueueStore = create(
  persist(
    (set, get) => ({
      items: [],

      add: (sermon) => {
        if (get().items.some((i) => i.id === sermon.id)) return
        set((s) => ({ items: [...s.items, summary(sermon)] }))
      },

      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      clear: () => set({ items: [] }),
    }),
    { name: 'spiritwise-queue' },
  ),
)

// The queue is per-user: drop it when the session ends, however it ends
// (sign-out, or a rejected refresh token in lib/axios.js).
useAuthStore.subscribe((state, prev) => {
  if (prev.isAuthenticated && !state.isAuthenticated) useQueueStore.getState().clear()
})

export default useQueueStore

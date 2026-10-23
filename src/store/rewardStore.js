import { create } from 'zustand'

let nextId = 0

/**
 * Queue of XP / badge announcements. Filled from server responses that
 * actually awarded something (see useApplyReward), rendered by RewardToaster.
 * Deliberately not persisted — an announcement is shown once, when earned.
 */
const useRewardStore = create((set) => ({
  toasts: [],

  announce: ({ xp_awarded = 0, new_badges = [] }) => {
    const toasts = [
      ...(xp_awarded > 0 ? [{ id: ++nextId, kind: 'xp', xp: xp_awarded }] : []),
      ...new_badges.map((badge) => ({ id: ++nextId, kind: 'badge', badge })),
    ]
    if (toasts.length) set((s) => ({ toasts: [...s.toasts, ...toasts] }))
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export default useRewardStore

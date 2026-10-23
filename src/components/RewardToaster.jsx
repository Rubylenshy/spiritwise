import { useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import useRewardStore from '../store/rewardStore'

const DURATION_MS = { xp: 3000, badge: 5000 }

function RewardToast({ toast, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), DURATION_MS[toast.kind])
    return () => clearTimeout(t)
  }, [toast.id, toast.kind, onDismiss])

  if (toast.kind === 'xp') {
    return (
      <div className="bg-blue-500 text-white font-medium px-5 py-3 rounded-2xl shadow-[0_20px_60px_-15px_rgba(59,130,246,.8)] animate-slide-up flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        <span>+{toast.xp} XP earned!</span>
      </div>
    )
  }

  return (
    <div className="card flex items-center gap-3 px-5 py-4 border-accent-500/40 animate-slide-up">
      <span className="text-3xl leading-none">{toast.badge.icon}</span>
      <div>
        <p className="text-accent-400 font-medium text-sm">Badge unlocked!</p>
        <p className="text-spirit-100 text-sm">{toast.badge.name}</p>
        <p className="text-spirit-500 text-xs">{toast.badge.description}</p>
      </div>
    </div>
  )
}

/** Stacks XP and badge announcements. Rendered once, in RootLayout. */
export default function RewardToaster() {
  const toasts = useRewardStore((s) => s.toasts)
  const dismiss = useRewardStore((s) => s.dismiss)

  if (!toasts.length) return null

  return (
    // Mobile: clears the BottomNav + FloatingPlayer; desktop: clears the player bar
    <div
      aria-live="polite"
      className="fixed right-4 z-50 flex flex-col items-end gap-2 bottom-[calc(8.5rem+env(safe-area-inset-bottom,0px))] lg:right-6 lg:bottom-24"
    >
      {toasts.map((t) => (
        <RewardToast key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}

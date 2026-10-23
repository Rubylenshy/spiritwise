// Reusable components shared across pages
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Sparkles, X } from 'lucide-react'

export function Spinner({ className = 'w-5 h-5' }) {
  return <Loader2 className={`animate-spin text-accent-500 ${className}`} />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner className="w-8 h-8" />
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="card p-10 text-center space-y-3">
      <p className="text-flame-400 font-medium">Unable to load</p>
      <p className="text-spirit-400 text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost text-sm mx-auto mt-2">
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title = 'Nothing here yet', subtitle }) {
  return (
    <div className="card p-12 text-center space-y-2">
      <p className="font-display text-xl text-spirit-300">{title}</p>
      {subtitle && <p className="text-spirit-500 text-sm">{subtitle}</p>}
    </div>
  )
}

/**
 * Footer for a useInfiniteQuery list: fetches the next page as it scrolls
 * into view (with a head start), and says so once everything has loaded.
 */
export function InfiniteScrollFooter({ hasNextPage, isFetchingNextPage, fetchNextPage, endLabel = "You've reached the end" }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !hasNextPage || isFetchingNextPage) return
    // Recreated after every page, so a sentinel still on screen keeps loading
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchNextPage() },
      { rootMargin: '400px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div ref={ref} className="flex justify-center py-4 min-h-[3rem]">
      {isFetchingNextPage
        ? <Spinner />
        : !hasNextPage && endLabel && <p className="text-spirit-500 text-xs">{endLabel}</p>}
    </div>
  )
}

/**
 * Centered dialog over a dimmed backdrop; Escape or a backdrop click closes it.
 * Portaled to <body>: glass cards (backdrop-filter) and animated wrappers
 * (transform) would otherwise become the containing block for `fixed`.
 */
export function Modal({ open, onClose, title, children, className = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`w-full glass-chrome border border-black/10 dark:border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-slide-up ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-lg text-spirit-100 truncate">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring rounded-lg p-1 text-spirit-400 hover:text-spirit-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

// Tag tints — blue accent, flame, and neutral glass, in both themes
const TAG_TONES = {
  accent: {
    on: 'bg-blue-500 border-blue-500 text-white',
    off: 'border-blue-500/30 text-accent-400 bg-blue-500/10 hover:bg-blue-500/20',
  },
  flame: {
    on: 'bg-flame-500 border-flame-500 text-white',
    off: 'border-flame-500/25 text-flame-400 bg-flame-500/10 hover:bg-flame-500/20',
  },
  indigo: {
    on: 'bg-indigo-500 border-indigo-500 text-white',
    off: 'border-indigo-500/30 text-indigo-500 dark:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20',
  },
  neutral: {
    on: 'bg-spirit-100 border-spirit-100 text-spirit-900',
    off: 'border-black/10 dark:border-white/10 text-spirit-300 bg-spirit-100/5 hover:bg-spirit-100/10',
  },
}

const TAG_TONE_BY_NAME = {
  Faith: 'accent',
  Worship: 'indigo',
  Strength: 'flame',
  Grace: 'neutral',
  Prayer: 'accent',
  Hope: 'indigo',
  Wisdom: 'accent',
}

export function TagPill({ tag, active, onClick }) {
  const name = tag?.name ?? tag
  const tone = TAG_TONES[TAG_TONE_BY_NAME[name] ?? 'neutral']

  return (
    <button
      onClick={onClick}
      className={`focus-ring text-xs px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-150 ${
        active ? tone.on : tone.off
      }`}
    >
      {name}
    </button>
  )
}

export function XPToast({ xp, show }) {
  if (!show || !xp) return null
  return (
    <div className="fixed bottom-6 right-6 bg-blue-500 text-white font-medium px-5 py-3 rounded-2xl shadow-[0_20px_60px_-15px_rgba(59,130,246,.8)] animate-slide-up z-50 flex items-center gap-2">
      <Sparkles className="w-5 h-5" />
      <span>+{xp} XP earned!</span>
    </div>
  )
}

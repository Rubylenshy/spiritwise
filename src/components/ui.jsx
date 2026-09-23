// Reusable components shared across pages
import { useState } from 'react'
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'

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

// Password field with a show/hide toggle. Takes the same props as <input>.
export function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`input-field pr-11 ${className}`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="focus-ring absolute inset-y-0 right-0 w-11 flex items-center justify-center rounded-r-xl text-spirit-500 hover:text-spirit-100 transition-colors"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

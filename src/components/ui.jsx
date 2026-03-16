// Reusable components shared across pages

export function Spinner({ className = 'w-5 h-5' }) {
  return (
    <svg className={`animate-spin text-gold-500 ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
    </svg>
  )
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
      <p className="font-display text-xl text-spirit-400 italic">{title}</p>
      {subtitle && <p className="text-spirit-500 text-sm">{subtitle}</p>}
    </div>
  )
}

export function TagPill({ tag, active, onClick }) {
  const TAG_COLORS = {
    Faith: active ? 'bg-gold-500 border-gold-400 text-spirit-900' : 'border-gold-500/30 text-gold-400 bg-gold-500/10',
    Worship: active ? 'bg-spirit-500 border-spirit-400 text-white' : 'border-spirit-500/30 text-spirit-300 bg-spirit-500/10',
    Strength: active ? 'bg-flame-500 border-flame-400 text-white' : 'border-flame-500/20 text-flame-400 bg-flame-500/10',
    Grace: active ? 'bg-spirit-400 border-spirit-300 text-white' : 'border-spirit-400/30 text-spirit-300 bg-spirit-400/10',
    Prayer: active ? 'bg-gold-600 border-gold-500 text-white' : 'border-gold-600/30 text-gold-500 bg-gold-600/10',
    Hope: active ? 'bg-spirit-300 border-spirit-200 text-spirit-900' : 'border-spirit-300/30 text-spirit-300 bg-spirit-300/10',
    Wisdom: active ? 'bg-gold-400 border-gold-300 text-spirit-900' : 'border-gold-400/30 text-gold-400 bg-gold-400/10',
  }

  const cls = TAG_COLORS[tag?.name ?? tag] ?? (
    active
      ? 'bg-spirit-600 border-spirit-500 text-white'
      : 'border-spirit-600 text-spirit-400 bg-spirit-600/10'
  )

  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${cls}`}
    >
      {tag?.name ?? tag}
    </button>
  )
}

export function XPToast({ xp, show }) {
  if (!show || !xp) return null
  return (
    <div className="fixed bottom-6 right-6 bg-gold-500 text-spirit-900 font-medium px-5 py-3 rounded-2xl shadow-lg animate-slide-up z-50 flex items-center gap-2">
      <span className="text-lg">✦</span>
      <span>+{xp} XP earned!</span>
    </div>
  )
}

import { useEngagementStats } from '../../hooks/useSermons'

export default function Navbar({ title = '', onMenuClick }) {
  const { data: stats } = useEngagementStats()
  const streak = stats?.current_streak ?? 0
  const xp = stats?.xp_points ?? 0

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-spirit-800 bg-spirit-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-spirit-400 hover:text-spirit-200 transition-colors p-1 -ml-1"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
          </svg>
        </button>
        <h1 className="font-display text-lg sm:text-xl text-spirit-100 italic">{title}</h1>
      </div>

      {/* Right side: streak + XP */}
      <div className="flex items-center gap-4">
        {/* XP pill */}
        <div className="flex items-center gap-1.5 bg-spirit-800 border border-spirit-700 rounded-full px-3 py-1.5">
          <span className="text-gold-400 text-xs font-mono font-medium">{xp.toLocaleString()} XP</span>
        </div>

        {/* Streak flame */}
        <div className="flex items-center gap-1.5 bg-spirit-800 border border-spirit-700 rounded-full px-3 py-1.5 group">
          <span
            className="text-base leading-none animate-flame"
            style={{ display: 'inline-block' }}
          >
            🔥
          </span>
          <span
            className={`text-sm font-medium font-mono ${
              streak > 0 ? 'text-flame-400' : 'text-spirit-500'
            }`}
          >
            {streak}
          </span>
        </div>
      </div>
    </header>
  )
}

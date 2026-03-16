import { useEngagementStats } from '../../hooks/useSermons'

export default function Navbar({ title = '' }) {
  const { data: stats } = useEngagementStats()
  const streak = stats?.current_streak ?? 0
  const xp = stats?.xp_points ?? 0

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-spirit-800 bg-spirit-900/80 backdrop-blur-sm sticky top-0 z-10">
      {/* Page title */}
      <h1 className="font-display text-xl text-spirit-100 italic">{title}</h1>

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

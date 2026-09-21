import { Flame, Menu, Sparkles } from 'lucide-react'
import { useEngagementStats } from '../../hooks/useSermons'
import ThemeToggle from '../ThemeToggle'

export default function Navbar({ title = '', onMenuClick }) {
  const { data: stats } = useEngagementStats()
  const streak = stats?.current_streak ?? 0
  const xp = stats?.xp_points ?? 0

  return (
    <header className="h-16 flex items-center justify-between gap-3 px-4 sm:px-6 sticky top-0 z-10 glass-chrome border-b border-black/5 dark:border-white/5">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden focus-ring rounded-lg text-spirit-400 hover:text-spirit-100 transition-colors p-1 -ml-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-display text-lg sm:text-xl text-spirit-100 truncate">{title}</h1>
      </div>

      {/* Right side: XP + streak + theme */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="glass hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5" title="Total XP">
          <Sparkles className="w-4 h-4 text-accent-400" />
          <span className="text-accent-400 text-xs font-mono font-medium">{xp.toLocaleString()} XP</span>
        </div>

        <div className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5" title="Current streak">
          <Flame className={`w-4 h-4 ${streak > 0 ? 'text-flame-400 animate-flame' : 'text-spirit-500'}`} />
          <span className={`text-sm font-medium font-mono ${streak > 0 ? 'text-flame-400' : 'text-spirit-500'}`}>
            {streak}
          </span>
        </div>

        <ThemeToggle />
      </div>
    </header>
  )
}

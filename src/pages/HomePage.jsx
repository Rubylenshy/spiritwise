import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useEngagementStats, useSermons } from '../hooks/useSermons'
import { PageLoader, ErrorState, TagPill } from '../components/ui'

function StreakCard({ streak }) {
  const filled = Math.min(streak % 7 || (streak > 0 ? 7 : 0), 7)
  const segments = Array.from({ length: 7 }, (_, i) => i < filled)

  return (
    <div className="card p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-flame-500/10 border border-flame-500/20 flex items-center justify-center text-2xl animate-flame">
          🔥
        </div>
        <div>
          <p className="label">Current streak</p>
          <p className="font-display text-3xl text-flame-400 leading-none mt-0.5">
            {streak} <span className="text-base font-sans text-spirit-500">days</span>
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        {segments.map((active, i) => (
          <div key={i} className={`w-2 h-8 rounded-full transition-all ${active ? 'bg-flame-400' : 'bg-spirit-700'}`} />
        ))}
      </div>
    </div>
  )
}

function DailyGoalCard({ minutesToday, goalMinutes }) {
  const progress = goalMinutes > 0 ? Math.min(minutesToday / goalMinutes, 1) : 0
  const pct = Math.round(progress * 100)
  const circumference = 2 * Math.PI * 28

  return (
    <div className="card p-5 flex items-center gap-5">
      <div className="relative w-16 h-16 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" className="text-spirit-700" />
          <circle
            cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5"
            className="text-gold-500 transition-all duration-700"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-medium text-gold-400">
          {pct}%
        </span>
      </div>
      <div>
        <p className="label">Daily goal</p>
        <p className="text-spirit-100 font-medium mt-0.5">Listen {goalMinutes} min today</p>
        <p className="text-spirit-500 text-xs mt-1">
          {minutesToday} of {goalMinutes} minutes completed
        </p>
      </div>
    </div>
  )
}

function StreakHeatmap({ last7 }) {
  if (!last7?.length) return null
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const padded = [...Array(Math.max(0, 7 - last7.length)).fill(null), ...last7]

  return (
    <div className="card p-5">
      <p className="label mb-3">Last 7 days</p>
      <div className="flex gap-2">
        {padded.map((entry, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className={`w-full h-8 rounded-lg transition-all ${entry ? 'bg-gold-500/80' : 'bg-spirit-800'}`} />
            <span className="text-xs text-spirit-500">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SermonCard({ sermon }) {
  const tag = sermon.tags?.[0]

  return (
    <Link to={`/sermons/${sermon.id}`} className="card-hover p-4 flex gap-4 items-start group">
      <div className="w-10 h-10 rounded-xl bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0 group-hover:border-gold-500/40 transition-colors">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold-500" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-spirit-100 font-medium text-sm leading-snug truncate">{sermon.title}</p>
        <p className="text-spirit-400 text-xs mt-0.5">{sermon.speaker} · {sermon.duration_display}</p>
        <p className="text-spirit-500 text-xs">{sermon.series_title}</p>
      </div>
      {tag && <TagPill tag={tag} />}
    </Link>
  )
}

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.first_name || user?.username || 'Friend'

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useEngagementStats()
  const { data: sermonsData, isLoading: sermonsLoading } = useSermons({ page_size: 4 })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
      <div>
        <h2 className="font-display text-4xl text-spirit-100 italic">{greeting}, {firstName}</h2>
        <p className="text-spirit-400 text-sm mt-1">Here's your spiritual journey today.</p>
      </div>

      {statsLoading ? (
        <PageLoader />
      ) : statsError ? (
        <ErrorState message="Could not load your stats." onRetry={refetchStats} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StreakCard streak={stats?.current_streak ?? 0} />
            <DailyGoalCard
              minutesToday={stats?.minutes_today ?? 0}
              goalMinutes={stats?.daily_goal_minutes ?? 30}
            />
          </div>

          <StreakHeatmap last7={stats?.last_7_days} />

          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="label">Total XP earned</p>
              <p className="font-display text-3xl text-gold-400 mt-0.5">
                {(stats?.xp_points ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-right space-y-2">
              <p className="text-spirit-400 text-sm">{stats?.sermons_completed ?? 0} sermons completed</p>
              <Link to="/leaderboard" className="btn-outline text-sm">View leaderboard →</Link>
            </div>
          </div>
        </>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-spirit-100 italic">Continue listening</h3>
          <Link to="/sermons" className="text-gold-400 text-sm hover:text-gold-300 transition-colors">Browse all →</Link>
        </div>
        {sermonsLoading ? <PageLoader /> : (
          <div className="space-y-2">
            {(sermonsData?.results ?? []).map((s) => <SermonCard key={s.id} sermon={s} />)}
          </div>
        )}
      </div>

      <div className="card p-6 border-l-2 border-l-gold-500 rounded-r-2xl rounded-l-none">
        <p className="label mb-3">Verse of the day</p>
        <blockquote className="font-display text-xl text-spirit-100 italic leading-relaxed">
          "Your word is a lamp to my feet and a light to my path."
        </blockquote>
        <p className="text-spirit-500 text-sm mt-3">— Psalm 119:105</p>
      </div>
    </div>
  )
}

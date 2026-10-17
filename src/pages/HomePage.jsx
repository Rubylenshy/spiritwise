import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { useEngagementStats, useSeries, useSermons } from '../hooks/useSermons'
import { PageLoader, ErrorState } from '../components/ui'
import { SermonTile } from '../components/SermonRow'
import { MediaTile, Shelf, shelfItemClass } from '../components/MediaGrid'
import { greetingFor } from '../lib/format'

function StreakCard({ streak }) {
  const filled = Math.min(streak % 7 || (streak > 0 ? 7 : 0), 7)
  const segments = Array.from({ length: 7 }, (_, i) => i < filled)

  return (
    <div className="card p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-flame-500/10 border border-flame-500/20 flex items-center justify-center text-flame-400">
          <Flame className="w-6 h-6 animate-flame" />
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
            className="text-accent-500 transition-all duration-700"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-medium text-accent-400">
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

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_MS = 24 * 60 * 60 * 1000

// The 7 calendar days ending today, oldest first, each marked active when the
// server logged activity that day. Days are UTC dates to match the server's
// streak records (`last7` holds only the active days, by date).
function lastSevenDays(last7 = []) {
  const active = new Set(last7.map((r) => r.date))
  const today = Date.now()
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today - (6 - i) * DAY_MS)
    const date = day.toISOString().slice(0, 10)
    return { date, label: WEEKDAYS[day.getUTCDay()], active: active.has(date), isToday: i === 6 }
  })
}

function StreakHeatmap({ last7 }) {
  const days = lastSevenDays(last7)

  return (
    <div className="card p-5">
      <p className="label mb-3">Last 7 days</p>
      <div className="flex gap-2">
        {days.map((day) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5" title={day.date}>
            <div className={`w-full h-8 rounded-lg transition-all ${day.active ? 'bg-accent-500/80' : 'bg-spirit-800'} ${
              day.isToday ? 'ring-1 ring-accent-500/50' : ''
            }`} />
            <span className={`text-xs ${day.isToday ? 'text-spirit-100 font-medium' : 'text-spirit-500'}`}>{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.first_name || user?.username || 'Friend'

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useEngagementStats()
  const { data: sermonsData, isLoading: sermonsLoading } = useSermons({ page_size: 10 })
  const { data: series } = useSeries()

  const greeting = greetingFor()

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-slide-up">
      <div>
        <h2 className="font-display text-4xl text-spirit-100">{greeting}, {firstName}</h2>
        <p className="text-spirit-400 text-sm mt-1">Here's your spiritual journey today.</p>
      </div>

      {statsLoading ? (
        <PageLoader />
      ) : statsError ? (
        <ErrorState message="Could not load your stats." onRetry={refetchStats} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              <p className="font-display text-3xl text-accent-400 mt-0.5">
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

      {sermonsLoading ? <PageLoader /> : sermonsData?.results?.length > 0 && (
        <Shelf title="Latest sermons" to="/sermons">
          {sermonsData.results.map((s) => (
            // A Shelf scrolls, which would clip the add-to-playlist menu
            <SermonTile key={s.id} sermon={s} showActions={false} className={shelfItemClass} />
          ))}
        </Shelf>
      )}

      {series?.length > 0 && (
        <Shelf title="Series" to="/series">
          {series.slice(0, 10).map((s) => (
            <div key={s.id} className={shelfItemClass}>
              <MediaTile
                to={`/series/${s.id}`}
                title={s.title}
                subtitle={`${s.sermon_count} sermon${s.sermon_count !== 1 ? 's' : ''}`}
                art={{ src: s.cover_image }}
              />
            </div>
          ))}
        </Shelf>
      )}

      <div className="card p-6 border-l-2 border-l-accent-500 rounded-r-2xl rounded-l-none">
        <p className="label mb-3">Verse of the day</p>
        <blockquote className="font-display text-xl text-spirit-100 leading-relaxed">
          "Your word is a lamp to my feet and a light to my path."
        </blockquote>
        <p className="text-spirit-500 text-sm mt-3">— Psalm 119:105</p>
      </div>
    </div>
  )
}

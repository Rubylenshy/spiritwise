import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { useEngagementStats, useSeries, useSermons } from '../../hooks/useSermons'
import { PageLoader, ErrorState } from '../../components/ui'
import { SermonTile } from '../../components/SermonRow'
import { MediaTile, Shelf, shelfItemClass } from '../../components/MediaGrid'
import { greetingFor, sermonCount } from '../../lib/format'
import StreakCard from './components/StreakCard'
import DailyGoalCard from './components/DailyGoalCard'
import StreakHeatmap from './components/StreakHeatmap'

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
                subtitle={sermonCount(s.sermon_count)}
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

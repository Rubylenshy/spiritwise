import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { useEngagementStats, useSermons } from '../../hooks/useSermons'
import { PageLoader, ErrorState } from '../../components/ui'
import StreakCard from './components/StreakCard'
import DailyGoalCard from './components/DailyGoalCard'
import StreakHeatmap from './components/StreakHeatmap'
import SermonCard from './components/SermonCard'

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.first_name || user?.username || 'Friend'

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useEngagementStats()
  const { data: sermonsData, isLoading: sermonsLoading } = useSermons({ page_size: 4 })

  const [badgeToast, setBadgeToast] = useState(null)
  const seenBadges = useRef(new Set())

  useEffect(() => {
    if (!stats?.recent_badges?.length) return
    const newest = stats.recent_badges[0]
    if (newest && !seenBadges.current.has(newest.name)) {
      seenBadges.current.add(newest.name)
      setBadgeToast(newest)
      setTimeout(() => setBadgeToast(null), 4000)
    }
  }, [stats?.recent_badges])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-slide-up">
      {badgeToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-spirit-800 border border-accent-500/40 text-spirit-100 px-5 py-4 rounded-2xl shadow-lg animate-slide-up">
          <span className="text-3xl leading-none">{badgeToast.icon}</span>
          <div>
            <p className="text-accent-400 font-medium text-sm">Badge unlocked!</p>
            <p className="text-spirit-200 text-sm">{badgeToast.name}</p>
          </div>
        </div>
      )}
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

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-spirit-100">Continue listening</h3>
          <Link to="/sermons" className="text-accent-400 text-sm hover:text-accent-300 transition-colors">Browse all →</Link>
        </div>
        {sermonsLoading ? <PageLoader /> : (
          <div className="space-y-2">
            {(sermonsData?.results ?? []).map((s) => <SermonCard key={s.id} sermon={s} />)}
          </div>
        )}
      </div>

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

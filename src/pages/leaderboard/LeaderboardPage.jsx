import { useState } from 'react'
import { useLeaderboard } from '../../hooks/useSermons'
import { PageLoader, ErrorState } from '../../components/ui'
import useAuthStore from '../../store/authStore'
import LeaderboardRow from './components/LeaderboardRow'

const PERIODS = [
  { key: 'weekly', label: 'This week' },
  { key: 'monthly', label: 'This month' },
  { key: 'all_time', label: 'All time' },
]

export default function LeaderboardPage() {
  const [period, setPeriod] = useState('weekly')
  const currentUser = useAuthStore((s) => s.user)
  const { data, isLoading, error, refetch } = useLeaderboard(period)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Period tabs */}
      <div className="flex gap-1 bg-spirit-800 border border-spirit-700 p-1 rounded-2xl w-fit">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`text-sm px-4 py-2 rounded-xl transition-all duration-150 ${
              period === key
                ? 'bg-spirit-700 text-accent-400 border border-spirit-600'
                : 'text-spirit-400 hover:text-spirit-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Your rank banner */}
      {data?.my_rank && (
        <div className="card p-4 flex items-center justify-between bg-spirit-700/50">
          <div>
            <p className="label mb-0.5">Your rank</p>
            <p className="font-display text-2xl text-accent-400">#{data.my_rank}</p>
          </div>
          <div className="text-right">
            <p className="label mb-0.5">Your XP</p>
            <p className="font-mono text-lg text-spirit-200">{(data.my_xp ?? 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      {isLoading ? <PageLoader />
        : error ? <ErrorState message="Could not load leaderboard." onRetry={refetch} />
        : !data?.entries?.length ? (
          <div className="card p-12 text-center">
            <p className="font-display text-xl text-spirit-400">No rankings yet</p>
            <p className="text-spirit-500 text-sm mt-2">Listen to sermons to earn XP and appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.entries.map((entry) => (
              <LeaderboardRow
                key={entry.user_id}
                entry={entry}
                isMe={entry.user_id === currentUser?.id}
              />
            ))}
          </div>
        )}
    </div>
  )
}

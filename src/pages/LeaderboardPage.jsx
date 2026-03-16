import { useState } from 'react'
import { useLeaderboard } from '../hooks/useSermons'
import { PageLoader, ErrorState } from '../components/ui'
import useAuthStore from '../store/authStore'

const PERIODS = [
  { key: 'weekly', label: 'This week' },
  { key: 'monthly', label: 'This month' },
  { key: 'all_time', label: 'All time' },
]

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

function LeaderboardRow({ entry, isMe }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl border transition-all ${
      isMe
        ? 'bg-gold-500/10 border-gold-500/30'
        : 'bg-spirit-800 border-spirit-700 hover:border-spirit-600'
    }`}>
      <div className="w-8 text-center shrink-0">
        {MEDALS[entry.rank]
          ? <span className="text-lg">{MEDALS[entry.rank]}</span>
          : <span className="text-spirit-500 text-sm font-mono">#{entry.rank}</span>
        }
      </div>

      <div className="w-9 h-9 rounded-full bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0">
        <span className="font-display text-sm text-gold-400">
          {entry.username?.[0]?.toUpperCase() ?? '?'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${isMe ? 'text-gold-400' : 'text-spirit-100'}`}>
          {entry.username}
          {isMe && <span className="text-xs text-gold-500/70 ml-2">(you)</span>}
        </p>
        <p className="text-spirit-500 text-xs">{entry.streak} day streak</p>
      </div>

      <div className="text-right shrink-0">
        <p className={`font-mono font-medium text-sm ${isMe ? 'text-gold-400' : 'text-spirit-300'}`}>
          {entry.xp.toLocaleString()}
        </p>
        <p className="text-spirit-600 text-xs">XP</p>
      </div>
    </div>
  )
}

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
                ? 'bg-spirit-700 text-gold-400 border border-spirit-600'
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
            <p className="font-display text-2xl text-gold-400">#{data.my_rank}</p>
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
            <p className="font-display text-xl text-spirit-400 italic">No rankings yet</p>
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

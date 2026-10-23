const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function LeaderboardRow({ entry, isMe }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl border transition-all ${
      isMe
        ? 'bg-accent-500/10 border-accent-500/30'
        : 'bg-spirit-800 border-spirit-700 hover:border-spirit-600'
    }`}>
      <div className="w-8 text-center shrink-0">
        {MEDALS[entry.rank]
          ? <span className="text-lg">{MEDALS[entry.rank]}</span>
          : <span className="text-spirit-500 text-sm font-mono">#{entry.rank}</span>
        }
      </div>

      <div className="w-9 h-9 rounded-full bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0">
        <span className="font-display text-sm text-accent-400">
          {entry.username?.[0]?.toUpperCase() ?? '?'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${isMe ? 'text-accent-400' : 'text-spirit-100'}`}>
          {entry.username}
          {isMe && <span className="text-xs text-accent-500/70 ml-2">(you)</span>}
        </p>
        <p className="text-spirit-500 text-xs">{entry.streak} day streak</p>
      </div>

      <div className="text-right shrink-0">
        <p className={`font-mono font-medium text-sm ${isMe ? 'text-accent-400' : 'text-spirit-300'}`}>
          {entry.xp.toLocaleString()}
        </p>
        <p className="text-spirit-600 text-xs">XP</p>
      </div>
    </div>
  )
}

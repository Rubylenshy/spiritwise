export default function StreakFreezeCard({ freezeAvailable, freezeEarnedAt, currentStreak }) {
  const nextFreezeAt = Math.ceil(currentStreak / 7) * 7
  const daysToNext = nextFreezeAt - currentStreak

  return (
    <div className={`card p-5 flex items-start gap-4 ${freezeAvailable ? 'border-spirit-500/40 bg-spirit-700/30' : ''}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
        freezeAvailable ? 'bg-spirit-600/40 border border-spirit-500/40' : 'bg-spirit-800 border border-spirit-700'
      }`}>
        🧊
      </div>
      <div className="flex-1 min-w-0">
        <p className="label mb-0.5">Streak freeze</p>
        {freezeAvailable ? (
          <>
            <p className="text-spirit-100 font-medium text-sm">Freeze available</p>
            <p className="text-spirit-400 text-xs mt-1 leading-relaxed">
              Your streak is protected. If you miss a day, your freeze will activate automatically
              and your streak will survive.
            </p>
            {freezeEarnedAt && (
              <p className="text-spirit-500 text-xs mt-1">
                Earned {new Date(freezeEarnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-spirit-400 text-sm">No freeze available</p>
            <p className="text-spirit-500 text-xs mt-1 leading-relaxed">
              {currentStreak === 0
                ? 'Start a streak to earn your first freeze at 7 days.'
                : daysToNext === 0
                  ? 'You just earned a freeze!'
                  : `${daysToNext} more day${daysToNext !== 1 ? 's' : ''} to earn your next freeze at ${nextFreezeAt} days.`
              }
            </p>
          </>
        )}
      </div>
    </div>
  )
}

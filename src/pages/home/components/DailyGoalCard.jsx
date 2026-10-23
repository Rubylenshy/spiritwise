export default function DailyGoalCard({ minutesToday, goalMinutes }) {
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

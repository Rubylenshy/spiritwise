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

export default function StreakHeatmap({ last7 }) {
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

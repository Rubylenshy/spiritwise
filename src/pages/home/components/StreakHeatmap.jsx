export default function StreakHeatmap({ last7 }) {
  if (!last7?.length) return null
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const padded = [...Array(Math.max(0, 7 - last7.length)).fill(null), ...last7]

  return (
    <div className="card p-5">
      <p className="label mb-3">Last 7 days</p>
      <div className="flex gap-2">
        {padded.map((entry, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className={`w-full h-8 rounded-lg transition-all ${entry ? 'bg-accent-500/80' : 'bg-spirit-800'}`} />
            <span className="text-xs text-spirit-500">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

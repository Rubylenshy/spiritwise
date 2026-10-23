import { Flame } from 'lucide-react'

export default function StreakCard({ streak }) {
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

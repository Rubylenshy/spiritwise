import { useState } from 'react'

export default function BadgeShelf({ badges, recentBadges }) {
  const [showAll, setShowAll] = useState(false)

  const allBadges = badges ?? []
  const displayed = showAll ? allBadges : allBadges.slice(0, 6)

  if (!allBadges.length) return (
    <div className="card p-5">
      <p className="label mb-3">Badges</p>
      <p className="text-spirit-500 text-sm">
        No badges yet — complete sermons and build streaks to earn them.
      </p>
    </div>
  )

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="label">Badges earned — {allBadges.length}</p>
        {allBadges.length > 6 && (
          <button onClick={() => setShowAll(v => !v)} className="text-accent-400 text-xs hover:text-accent-300 transition-colors">
            {showAll ? 'Show less' : `Show all ${allBadges.length}`}
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {displayed.map((ub) => {
          const isNew = recentBadges?.some(r => r.name === ub.badge.name)
          return (
            <div
              key={ub.id}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                isNew
                  ? 'bg-accent-500/10 border-accent-500/30'
                  : 'bg-spirit-800 border-spirit-700'
              }`}
            >
              {isNew && (
                <span className="absolute -top-1.5 -right-1.5 text-xs bg-accent-500 text-white font-medium px-1.5 py-0.5 rounded-full">
                  new
                </span>
              )}
              <span className="text-2xl leading-none">{ub.badge.icon}</span>
              <p className="text-spirit-200 text-xs font-medium text-center leading-tight">{ub.badge.name}</p>
              <p className="text-spirit-500 text-xs text-center leading-tight">{ub.badge.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

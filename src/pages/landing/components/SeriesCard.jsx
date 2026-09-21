import { useState } from 'react'
import { Heart, MoreHorizontal, Play } from 'lucide-react'
import { DEMO_SERIES, formatTime } from '../landingData'

/** Demo series card — the template's "playlist card", mapped onto a sermon series. */
export default function SeriesCard({ className = '' }) {
  const [followed, setFollowed] = useState(false)

  return (
    <div className={`lp-card overflow-hidden ${className}`}>
      {/* Cover */}
      <div className="relative aspect-[16/10]">
        <img src={DEMO_SERIES.cover} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-50 dark:from-[#171717] to-transparent" />
        <button
          type="button"
          aria-label={`Play ${DEMO_SERIES.title} series`}
          className="lp-focus absolute bottom-4 right-4 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(59,130,246,.8)] hover:scale-105 active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-blue-500/40"
        >
          <Play className="w-5 h-5 ml-0.5" />
        </button>
      </div>

      {/* Details */}
      <div className="p-5 pt-2">
        <p className="text-xs text-lp-fg/60">Series · {DEMO_SERIES.sermonCount} Sermons</p>
        <h3 className="text-xl font-medium tracking-tight text-lp-fg mt-1">{DEMO_SERIES.title}</h3>
        <p className="text-sm text-lp-fg/70">{DEMO_SERIES.speaker}</p>

        <ol className="mt-4 space-y-2">
          {DEMO_SERIES.preview.map((sermon, i) => (
            <li key={sermon.id} className="flex items-center gap-3 text-sm">
              <span className="font-mono text-xs text-lp-fg/60 w-5">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1 truncate text-lp-fg">{sermon.title}</span>
              <span className="font-mono text-xs text-lp-fg/60">{formatTime(sermon.duration)}</span>
            </li>
          ))}
        </ol>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setFollowed((v) => !v)}
            aria-pressed={followed}
            className="lp-focus inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium bg-blue-500/10 text-lp-accent-soft hover:bg-blue-500/20 transition-colors"
          >
            <Heart className={`w-4 h-4 ${followed ? 'fill-current' : ''}`} />
            {followed ? 'Following' : 'Follow series'}
          </button>
          <button type="button" aria-label="More options" className="lp-icon-btn w-8 h-8">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { TagPill } from './ui'

export default function SermonRow({ sermon }) {
  const tag = sermon.tags?.[0]

  return (
    <Link to={`/sermons/${sermon.id}`} className="card-hover px-5 py-4 flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-full bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0 group-hover:bg-accent-500 group-hover:border-accent-400 transition-all duration-200">
        <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:text-white text-accent-400 transition-colors" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-spirit-100 font-medium text-sm truncate">{sermon.title}</p>
        <p className="text-spirit-400 text-xs mt-0.5 truncate">
          {[sermon.speaker, sermon.series_title].filter(Boolean).join(' · ')}
        </p>
        {sermon.scripture_reference && (
          <p className="text-spirit-600 text-xs mt-0.5 italic">{sermon.scripture_reference}</p>
        )}
      </div>

      {tag && (
        <span className="hidden sm:block shrink-0">
          <TagPill tag={tag} />
        </span>
      )}

      <span className="text-spirit-500 text-xs font-mono shrink-0 w-12 text-right">
        {sermon.duration_display}
      </span>
    </Link>
  )
}

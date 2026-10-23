import { Link } from 'react-router-dom'
import { TagPill } from '../../../components/ui'

export default function SermonCard({ sermon }) {
  const tag = sermon.tags?.[0]

  return (
    <Link to={`/sermons/${sermon.id}`} className="card-hover p-4 flex gap-4 items-start group">
      <div className="w-10 h-10 rounded-xl bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0 group-hover:border-accent-500/40 transition-colors">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent-500" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-spirit-100 font-medium text-sm leading-snug truncate">{sermon.title}</p>
        <p className="text-spirit-400 text-xs mt-0.5">{sermon.speaker} · {sermon.duration_display}</p>
        <p className="text-spirit-500 text-xs">{sermon.series_title}</p>
      </div>
      {tag && <TagPill tag={tag} />}
    </Link>
  )
}

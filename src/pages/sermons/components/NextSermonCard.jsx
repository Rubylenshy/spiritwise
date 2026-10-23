import { Link } from 'react-router-dom'
import CoverArt from '../../../components/CoverArt'
import { formatDuration } from '../../../lib/format'

// Renders from the `next_sermon` summary only — fetching its detail here would
// count a play and mint a stream token before the user ever opens it.
export default function NextSermonCard({ nextSermon }) {
  if (!nextSermon) return null
  return (
    <div className="card p-5 flex items-center gap-4 animate-slide-up">
      <CoverArt src={nextSermon.thumbnail} seed={nextSermon.title} rounded="rounded-md" className="w-12 h-12" />
      <div className="flex-1 min-w-0">
        <p className="label mb-0.5">Up next in series</p>
        <p className="text-spirit-100 font-medium text-sm truncate">{nextSermon.title}</p>
        <p className="text-spirit-400 text-xs">{nextSermon.speaker} · {formatDuration(nextSermon.duration_seconds)}</p>
      </div>
      <Link to={`/sermons/${nextSermon.id}`} className="btn-primary text-sm shrink-0">
        Play →
      </Link>
    </div>
  )
}

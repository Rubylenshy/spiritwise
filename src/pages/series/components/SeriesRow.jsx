import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import CoverArt from '../../../components/CoverArt'
import { sermonCount } from '../../../lib/format'

/** A series in the list view (inside a TrackList). */
export default function SeriesRow({ series }) {
  return (
    <Link to={`/series/${series.id}`} className="focus-ring rounded-lg px-2 py-2 flex gap-4 items-center hover:bg-spirit-100/5 transition-colors group">
      <CoverArt src={series.cover_image} seed={series.title} rounded="rounded-md" className="w-14 h-14" />
      <div className="flex-1 min-w-0">
        <p className="text-spirit-100 font-medium text-sm truncate group-hover:text-accent-400 transition-colors">{series.title}</p>
        {series.description && (
          <p className="text-spirit-400 text-xs mt-0.5 line-clamp-1">{series.description}</p>
        )}
        <p className="text-spirit-500 text-xs mt-0.5">{sermonCount(series.sermon_count)}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-spirit-500 group-hover:text-spirit-100 transition-colors shrink-0" />
    </Link>
  )
}

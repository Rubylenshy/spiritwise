import { Link } from 'react-router-dom'
import { AudioWaveform } from 'lucide-react'

export default function SeriesCard({ series }) {
  return (
    <Link to={`/series/${series.id}`} className="card-hover p-5 flex gap-4 items-start group">
      <div className="w-12 h-12 rounded-2xl bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0 group-hover:border-accent-500/40 transition-colors overflow-hidden">
        {series.cover_image
          ? <img src={series.cover_image} alt="" className="w-full h-full object-cover" />
          : <AudioWaveform className="w-6 h-6 text-accent-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-spirit-100 font-medium truncate">{series.title}</p>
        {series.description && (
          <p className="text-spirit-400 text-sm mt-0.5 line-clamp-2 leading-relaxed">{series.description}</p>
        )}
        <p className="text-spirit-500 text-xs mt-1.5">{series.sermon_count} sermon{series.sermon_count !== 1 ? 's' : ''}</p>
      </div>
    </Link>
  )
}

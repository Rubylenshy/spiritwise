import { Link, useParams } from 'react-router-dom'
import { useSeries, useSeriesDetail } from '../hooks/useSermons'
import { PageLoader, ErrorState, EmptyState, TagPill } from '../components/ui'

function SeriesCard({ series }) {
  return (
    <Link to={`/series/${series.id}`} className="card-hover p-5 flex gap-4 items-start group">
      <div className="w-12 h-12 rounded-2xl bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0 group-hover:border-gold-500/40 transition-colors overflow-hidden">
        {series.cover_image
          ? <img src={series.cover_image} alt="" className="w-full h-full object-cover" />
          : <span className="font-display text-xl text-gold-400 italic">✦</span>
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

export function SeriesListPage() {
  const { data, isLoading, error, refetch } = useSeries()

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <p className="label">{data?.length ?? 0} series</p>

      {isLoading ? <PageLoader />
        : error ? <ErrorState message="Could not load series." onRetry={refetch} />
        : !data?.length ? <EmptyState title="No series yet" subtitle="Series will appear here once sermons are organised." />
        : (
          <div className="space-y-2">
            {data.map((s) => <SeriesCard key={s.id} series={s} />)}
          </div>
        )}
    </div>
  )
}

export function SeriesDetailPage() {
  const { id } = useParams()
  const { data, isLoading, error, refetch } = useSeriesDetail(id)

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message="Could not load this series." onRetry={refetch} />

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center gap-2 text-xs text-spirit-500">
        <Link to="/series" className="hover:text-spirit-300 transition-colors">Series</Link>
        <span>›</span>
        <span className="text-spirit-400">{data.title}</span>
      </div>

      <div className="card p-6 space-y-2">
        <h2 className="font-display text-2xl text-spirit-100 italic">{data.title}</h2>
        {data.description && <p className="text-spirit-400 text-sm leading-relaxed">{data.description}</p>}
        <p className="text-spirit-500 text-xs">{data.sermon_count} sermons</p>
      </div>

      <div className="space-y-2">
        {(data.sermons ?? []).map((sermon) => (
          <Link key={sermon.id} to={`/sermons/${sermon.id}`} className="card-hover px-5 py-4 flex items-center gap-4 group">
            <div className="w-9 h-9 rounded-full bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0 group-hover:bg-gold-500 group-hover:border-gold-400 transition-all">
              <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:text-spirit-900 text-gold-400 transition-colors" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-spirit-100 font-medium text-sm truncate">{sermon.title}</p>
              <p className="text-spirit-400 text-xs mt-0.5">{sermon.speaker}</p>
            </div>
            {sermon.tags?.[0] && <TagPill tag={sermon.tags[0]} />}
            <span className="text-spirit-500 text-xs font-mono shrink-0">{sermon.duration_display}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

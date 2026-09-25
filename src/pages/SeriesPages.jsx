import { Link, useParams } from 'react-router-dom'
import { AudioWaveform } from 'lucide-react'
import { useSeries, useSeriesDetail, useSermonsInfinite } from '../hooks/useSermons'
import { PageLoader, ErrorState, EmptyState } from '../components/ui'
import { LoadMore, SermonRow } from '../components/SermonRow'

function SeriesCard({ series }) {
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
  const sermons = useSermonsInfinite({ series: id })

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
        <h2 className="font-display text-2xl text-spirit-100">{data.title}</h2>
        {data.description && <p className="text-spirit-400 text-sm leading-relaxed">{data.description}</p>}
        <p className="text-spirit-500 text-xs">{data.sermon_count} sermon{data.sermon_count !== 1 ? 's' : ''}</p>
      </div>

      {sermons.isLoading ? <PageLoader />
        : sermons.error ? <ErrorState message="Could not load this series' sermons." onRetry={sermons.refetch} />
        : !sermons.items.length ? <EmptyState title="No sermons in this series yet" />
        : (
          <div className="space-y-2">
            {sermons.items.map((sermon) => <SermonRow key={sermon.id} sermon={sermon} showSeries={false} />)}
            <LoadMore query={sermons} />
          </div>
        )}
    </div>
  )
}

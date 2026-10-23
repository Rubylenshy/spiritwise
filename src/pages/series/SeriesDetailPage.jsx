import { Link, useParams } from 'react-router-dom'
import { useSeriesDetail } from '../../hooks/useSermons'
import { PageLoader, ErrorState } from '../../components/ui'
import InfiniteSermonList from '../../components/InfiniteSermonList'

export default function SeriesDetailPage() {
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
        <h2 className="font-display text-2xl text-spirit-100">{data.title}</h2>
        {data.description && <p className="text-spirit-400 text-sm leading-relaxed">{data.description}</p>}
        <p className="text-spirit-500 text-xs">{data.sermon_count} sermons</p>
      </div>

      <InfiniteSermonList
        params={{ series: id, page_size: 20 }}
        emptyTitle="No sermons in this series yet"
      />
    </div>
  )
}

import { useSeries } from '../../hooks/useSermons'
import { PageLoader, ErrorState, EmptyState } from '../../components/ui'
import SeriesCard from './components/SeriesCard'

export default function SeriesListPage() {
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

import { useSeries } from '../../hooks/useSermons'
import { useViewMode } from '../../hooks/useViewMode'
import { PageLoader, ErrorState, EmptyState } from '../../components/ui'
import { ListHeader, MediaGrid, MediaTile, TrackList } from '../../components/MediaGrid'
import { sermonCount } from '../../lib/format'
import SeriesRow from './components/SeriesRow'

export default function SeriesListPage() {
  const { data, isLoading, error, refetch } = useSeries()
  const [view, setView] = useViewMode('series')

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      <ListHeader label={`${data?.length ?? 0} series`} view={view} onView={setView} />

      {isLoading ? <PageLoader />
        : error ? <ErrorState message="Could not load series." onRetry={refetch} />
        : !data?.length ? <EmptyState title="No series yet" subtitle="Series will appear here once sermons are organised." />
        : view === 'grid' ? (
          <MediaGrid>
            {data.map((s) => (
              <MediaTile
                key={s.id}
                to={`/series/${s.id}`}
                title={s.title}
                subtitle={sermonCount(s.sermon_count)}
                art={{ src: s.cover_image }}
              />
            ))}
          </MediaGrid>
        ) : (
          <TrackList>
            {data.map((s) => <SeriesRow key={s.id} series={s} />)}
          </TrackList>
        )}
    </div>
  )
}

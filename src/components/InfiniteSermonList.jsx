import { useInfiniteSermons } from '../hooks/useSermons'
import { useViewMode } from '../hooks/useViewMode'
import { PageLoader, ErrorState, EmptyState, InfiniteScrollFooter } from './ui'
import { SermonRow, SermonTile } from './SermonRow'
import { ListHeader, MediaGrid, TrackList } from './MediaGrid'

/**
 * Sermons matching `params`, loading the next page as the list scrolls to its
 * end. Grid / list choice is remembered per `viewScope`; `showSeries={false}`
 * drops the series column (e.g. inside a series).
 */
export default function InfiniteSermonList({
  params, viewScope = 'sermons', label = 'Sermons', showSeries = true,
  emptyTitle = 'No sermons found', emptySubtitle,
}) {
  const [view, setView] = useViewMode(viewScope)
  const { data, isLoading, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteSermons(params)

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message="Could not load sermons." onRetry={refetch} />

  const sermons = data.pages.flatMap((p) => p.results)
  if (!sermons.length) return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />

  return (
    <div className="space-y-4">
      <ListHeader label={label} view={view} onView={setView} />
      {view === 'grid' ? (
        <MediaGrid>
          {sermons.map((s) => <SermonTile key={s.id} sermon={s} />)}
        </MediaGrid>
      ) : (
        <TrackList>
          {sermons.map((s) => <SermonRow key={s.id} sermon={s} showSeries={showSeries} />)}
        </TrackList>
      )}
      <InfiniteScrollFooter
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        endLabel={data.pages.length > 1 ? "That's every sermon" : null}
      />
    </div>
  )
}

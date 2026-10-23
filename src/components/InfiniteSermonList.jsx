import { useInfiniteSermons } from '../hooks/useSermons'
import { PageLoader, ErrorState, EmptyState, InfiniteScrollFooter } from './ui'
import SermonRow from './SermonRow'

/** Sermons matching `params`, loading the next page as the list scrolls to its end. */
export default function InfiniteSermonList({ params, emptyTitle = 'No sermons found', emptySubtitle }) {
  const { data, isLoading, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteSermons(params)

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message="Could not load sermons." onRetry={refetch} />

  const sermons = data.pages.flatMap((p) => p.results)
  if (!sermons.length) return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />

  return (
    <div className="space-y-2">
      {sermons.map((s) => <SermonRow key={s.id} sermon={s} />)}
      <InfiniteScrollFooter
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        endLabel={data.pages.length > 1 ? "That's every sermon" : null}
      />
    </div>
  )
}

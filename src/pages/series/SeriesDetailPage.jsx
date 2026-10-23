import { Link, useParams } from 'react-router-dom'
import { useInfiniteSermons, useSeriesDetail } from '../../hooks/useSermons'
import { usePlayback } from '../../hooks/usePlayback'
import { PageLoader, ErrorState, EmptyState, InfiniteScrollFooter } from '../../components/ui'
import { SermonRow } from '../../components/SermonRow'
import { CollectionHeader, TrackList } from '../../components/MediaGrid'
import { formatDuration, sermonCount } from '../../lib/format'

// The speaker heard most across the loaded sermons — the series' "artist" line.
function mainSpeaker(sermons) {
  const counts = new Map()
  for (const { speaker } of sermons) if (speaker) counts.set(speaker, (counts.get(speaker) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0]
}

export default function SeriesDetailPage() {
  const { id } = useParams()
  const { data, isLoading, error, refetch } = useSeriesDetail(id)
  const sermons = useInfiniteSermons({ series: id, page_size: 20 })
  const { playAll } = usePlayback()

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message="Could not load this series." onRetry={refetch} />

  const items = sermons.data?.pages.flatMap((p) => p.results) ?? []
  const speaker = mainSpeaker(items)
  // Total length only once every sermon is loaded — otherwise it'd undercount
  const total = !sermons.hasNextPage && items.length
    ? formatDuration(items.reduce((sum, s) => sum + (s.duration_seconds || 0), 0))
    : null

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      <div className="flex items-center gap-2 text-xs text-spirit-500">
        <Link to="/series" className="hover:text-spirit-300 transition-colors">Series</Link>
        <span>›</span>
        <span className="text-spirit-400 truncate">{data.title}</span>
      </div>

      <CollectionHeader
        art={{ src: data.cover_image, seed: data.title }}
        eyebrow="Series"
        title={data.title}
        subtitle={speaker}
        subtitleTo={speaker ? `/sermons?speaker=${encodeURIComponent(speaker)}` : undefined}
        meta={[sermonCount(data.sermon_count), total].filter(Boolean).join(' · ')}
        description={data.description}
        canPlay={items.length > 0}
        onPlay={() => playAll(items)}
        onShuffle={() => playAll(items, { shuffle: true })}
      />

      {sermons.isLoading ? <PageLoader />
        : sermons.error ? <ErrorState message="Could not load this series' sermons." onRetry={sermons.refetch} />
        : !items.length ? <EmptyState title="No sermons in this series yet" />
        : (
          <div>
            <TrackList>
              {items.map((sermon) => <SermonRow key={sermon.id} sermon={sermon} showSeries={false} />)}
            </TrackList>
            <InfiniteScrollFooter
              hasNextPage={sermons.hasNextPage}
              isFetchingNextPage={sermons.isFetchingNextPage}
              fetchNextPage={sermons.fetchNextPage}
              endLabel={null}
            />
          </div>
        )}
    </div>
  )
}

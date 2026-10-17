import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useSeries, useSeriesDetail, useSermonsInfinite } from '../hooks/useSermons'
import { usePlayback } from '../hooks/usePlayback'
import { useViewMode } from '../hooks/useViewMode'
import { PageLoader, ErrorState, EmptyState } from '../components/ui'
import { LoadMore, SermonRow } from '../components/SermonRow'
import CoverArt from '../components/CoverArt'
import { CollectionHeader, ListHeader, MediaGrid, MediaTile, TrackList } from '../components/MediaGrid'
import { formatDuration } from '../lib/format'

const sermonCount = (n) => `${n} sermon${n !== 1 ? 's' : ''}`

function SeriesRow({ series }) {
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

export function SeriesListPage() {
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

// The speaker heard most across the loaded sermons — the series' "artist" line.
function mainSpeaker(sermons) {
  const counts = new Map()
  for (const { speaker } of sermons) if (speaker) counts.set(speaker, (counts.get(speaker) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0]
}

export function SeriesDetailPage() {
  const { id } = useParams()
  const { data, isLoading, error, refetch } = useSeriesDetail(id)
  const sermons = useSermonsInfinite({ series: id })
  const { playAll } = usePlayback()

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message="Could not load this series." onRetry={refetch} />

  const speaker = mainSpeaker(sermons.items)
  // Total length only once every sermon is loaded — otherwise it'd undercount
  const total = !sermons.hasNextPage && sermons.items.length
    ? formatDuration(sermons.items.reduce((sum, s) => sum + (s.duration_seconds || 0), 0))
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
        canPlay={sermons.items.length > 0}
        onPlay={() => playAll(sermons.items)}
        onShuffle={() => playAll(sermons.items, { shuffle: true })}
      />

      {sermons.isLoading ? <PageLoader />
        : sermons.error ? <ErrorState message="Could not load this series' sermons." onRetry={sermons.refetch} />
        : !sermons.items.length ? <EmptyState title="No sermons in this series yet" />
        : (
          <div className="space-y-2">
            <TrackList>
              {sermons.items.map((sermon) => <SermonRow key={sermon.id} sermon={sermon} showSeries={false} />)}
            </TrackList>
            <LoadMore query={sermons} />
          </div>
        )}
    </div>
  )
}

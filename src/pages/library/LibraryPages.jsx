import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ChevronDown, ChevronRight, ChevronUp, Heart, ListMusic, Loader2, Mic2, Pencil, Plus, Trash2, X,
} from 'lucide-react'
import {
  useCreatePlaylist, useDeletePlaylist, useFavorites, useMovePlaylistItem, usePlaylist,
  usePlaylistItems, usePlaylists, useRemoveFromPlaylist, useRenamePlaylist, useSpeakers,
} from '../../hooks/useSermons'
import { usePlayback } from '../../hooks/usePlayback'
import { useViewMode } from '../../hooks/useViewMode'
import { PageLoader, ErrorState, EmptyState } from '../../components/ui'
import { LoadMore, SermonRow, SermonTile } from '../../components/SermonRow'
import CoverArt from '../../components/CoverArt'
import { CollectionHeader, ListHeader, MediaGrid, MediaTile, TrackList } from '../../components/MediaGrid'
import { formatDuration, sermonCount } from '../../lib/format'

const TABS = [
  { id: 'favorites', label: 'Favorites', Icon: Heart },
  { id: 'speakers', label: 'Speakers', Icon: Mic2 },
  { id: 'playlists', label: 'Playlists', Icon: ListMusic },
]

const smallIconButton =
  'focus-ring shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-spirit-500 hover:text-spirit-100 hover:bg-spirit-100/5 transition-colors disabled:opacity-30 disabled:pointer-events-none'

// ─── Favorites ────────────────────────────────────────────────────────────────


function FavoritesTab() {
  const favorites = useFavorites()
  const [view, setView] = useViewMode('favorites')

  if (favorites.isLoading) return <PageLoader />
  if (favorites.error) return <ErrorState message="Could not load your favorites." onRetry={favorites.refetch} />
  if (!favorites.items.length) {
    return <EmptyState title="No favorites yet" subtitle="Tap the heart on any sermon to keep it here." />
  }

  return (
    <div className="space-y-4">
      <ListHeader label={`${favorites.count} favorite${favorites.count !== 1 ? 's' : ''}`} view={view} onView={setView} />
      {view === 'grid' ? (
        <MediaGrid>
          {favorites.items.map((sermon) => <SermonTile key={sermon.id} sermon={sermon} />)}
        </MediaGrid>
      ) : (
        <TrackList>
          {favorites.items.map((sermon) => <SermonRow key={sermon.id} sermon={sermon} />)}
        </TrackList>
      )}
      <LoadMore query={favorites} />
    </div>
  )
}

// ─── Speakers ─────────────────────────────────────────────────────────────────

function SpeakersTab() {
  const { data, isLoading, error, refetch } = useSpeakers()

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message="Could not load speakers." onRetry={refetch} />
  if (!data?.length) return <EmptyState title="No speakers yet" />

  return (
    <div className="space-y-4">
      <p className="label">{data.length} speaker{data.length !== 1 ? 's' : ''}</p>
      <TrackList>
        {data.map((speaker) => (
          <Link
            key={speaker.name}
            to={`/sermons?speaker=${encodeURIComponent(speaker.name)}`}
            className="focus-ring rounded-lg px-2 py-2 flex items-center gap-4 hover:bg-spirit-100/5 transition-colors group"
          >
            <CoverArt seed={speaker.name} icon={Mic2} rounded="rounded-full" className="w-11 h-11" />
            <p className="flex-1 min-w-0 text-spirit-100 font-medium text-sm truncate">{speaker.name}</p>
            <span className="text-spirit-500 text-xs font-mono shrink-0">{sermonCount(speaker.sermon_count)}</span>
            <ChevronRight className="w-4 h-4 text-spirit-500 group-hover:text-spirit-100 transition-colors" />
          </Link>
        ))}
      </TrackList>
    </div>
  )
}

// ─── Playlists ────────────────────────────────────────────────────────────────

function NewPlaylistForm() {
  const [name, setName] = useState('')
  const create = useCreatePlaylist()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    create.mutate({ name: name.trim() }, {
      onSuccess: (playlist) => navigate(`/library/playlists/${playlist.id}`),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New playlist name"
        maxLength={100}
        aria-label="New playlist name"
        className="input-field"
      />
      <button
        type="submit"
        disabled={!name.trim() || create.isPending}
        className="btn-primary shrink-0 flex items-center gap-2 disabled:opacity-40"
      >
        {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Create
      </button>
    </form>
  )
}

function PlaylistsTab() {
  const { data, isLoading, error, refetch } = usePlaylists()
  const [view, setView] = useViewMode('playlists')

  return (
    <div className="space-y-4">
      <NewPlaylistForm />
      {isLoading ? <PageLoader />
        : error ? <ErrorState message="Could not load your playlists." onRetry={refetch} />
        : !data?.length ? <EmptyState title="No playlists yet" subtitle="Create one above, or add a sermon to a new playlist from any list." />
        : (
          <>
            <ListHeader label={`${data.length} playlist${data.length !== 1 ? 's' : ''}`} view={view} onView={setView} />
            {view === 'grid' ? (
              <MediaGrid>
                {data.map((playlist) => (
                  <MediaTile
                    key={playlist.id}
                    to={`/library/playlists/${playlist.id}`}
                    title={playlist.name}
                    subtitle={sermonCount(playlist.item_count)}
                    art={{ srcs: playlist.cover_thumbnails, icon: ListMusic }}
                  />
                ))}
              </MediaGrid>
            ) : (
              <TrackList>
                {data.map((playlist) => (
                  <Link
                    key={playlist.id}
                    to={`/library/playlists/${playlist.id}`}
                    className="focus-ring rounded-lg px-2 py-2 flex items-center gap-4 hover:bg-spirit-100/5 transition-colors group"
                  >
                    <CoverArt srcs={playlist.cover_thumbnails} seed={playlist.name} icon={ListMusic} rounded="rounded-md" className="w-11 h-11" />
                    <p className="flex-1 min-w-0 text-spirit-100 font-medium text-sm truncate">{playlist.name}</p>
                    <span className="text-spirit-500 text-xs font-mono shrink-0">{sermonCount(playlist.item_count)}</span>
                    <ChevronRight className="w-4 h-4 text-spirit-500 group-hover:text-spirit-100 transition-colors" />
                  </Link>
                ))}
              </TrackList>
            )}
          </>
        )}
    </div>
  )
}

// ─── Library page ─────────────────────────────────────────────────────────────

export function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === searchParams.get('tab')) ? searchParams.get('tab') : 'favorites'

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      <div role="tablist" aria-label="Library sections" className="glass rounded-full p-1 flex gap-1 w-fit">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setSearchParams(id === 'favorites' ? {} : { tab: id }, { replace: true })}
            className={`focus-ring rounded-full px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
              tab === id ? 'bg-accent-500 text-white' : 'text-spirit-400 hover:text-spirit-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'favorites' && <FavoritesTab />}
        {tab === 'speakers' && <SpeakersTab />}
        {tab === 'playlists' && <PlaylistsTab />}
      </div>
    </div>
  )
}

// ─── Playlist detail ──────────────────────────────────────────────────────────

function PlaylistHeader({ playlist, sermons, complete }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(playlist.name)
  const rename = useRenamePlaylist()
  const remove = useDeletePlaylist()
  const navigate = useNavigate()
  const { playAll } = usePlayback()

  const handleRename = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    rename.mutate({ playlistId: playlist.id, name: name.trim() }, { onSuccess: () => setEditing(false) })
  }

  const handleDelete = () => {
    if (!window.confirm(`Delete "${playlist.name}"? The sermons themselves stay in the library.`)) return
    remove.mutate({ playlistId: playlist.id }, {
      onSuccess: () => navigate('/library?tab=playlists', { replace: true }),
    })
  }

  // Total length only once every sermon is loaded — otherwise it'd undercount
  const total = complete && sermons.length
    ? formatDuration(sermons.reduce((sum, s) => sum + (s.duration_seconds || 0), 0))
    : null

  const title = editing ? (
    <form onSubmit={handleRename} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        autoFocus
        aria-label="Playlist name"
        className="input-field"
      />
      <button type="submit" disabled={!name.trim() || rename.isPending} className="btn-primary shrink-0 disabled:opacity-40">
        Save
      </button>
      <button
        type="button"
        onClick={() => { setEditing(false); setName(playlist.name) }}
        aria-label="Cancel rename"
        className="btn-ghost shrink-0 px-3"
      >
        <X className="w-4 h-4" />
      </button>
    </form>
  ) : playlist.name

  return (
    <CollectionHeader
      // Four or more covers make an Apple Music-style 2x2 mosaic
      art={{ srcs: sermons.map((s) => s.thumbnail), seed: playlist.name, icon: ListMusic }}
      eyebrow="Playlist"
      title={title}
      meta={[sermonCount(playlist.item_count), total].filter(Boolean).join(' · ')}
      canPlay={sermons.length > 0}
      onPlay={() => playAll(sermons)}
      onShuffle={() => playAll(sermons, { shuffle: true })}
      actions={!editing && (
        <>
          <button type="button" onClick={() => setEditing(true)} aria-label="Rename playlist" title="Rename" className={smallIconButton}>
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={remove.isPending}
            aria-label="Delete playlist"
            title="Delete"
            className={`${smallIconButton} hover:text-flame-400`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    />
  )
}

export function PlaylistDetailPage() {
  const { id } = useParams()
  const { data: playlist, isLoading, error, refetch } = usePlaylist(id)
  const items = usePlaylistItems(id)
  const move = useMovePlaylistItem()
  const removeItem = useRemoveFromPlaylist()
  const busy = move.isPending || removeItem.isPending
  const sermonsInOrder = items.items.map((item) => item.sermon)

  if (isLoading) return <PageLoader />
  if (error) {
    return error.response?.status === 404
      ? <EmptyState title="Playlist not found" subtitle="It may have been deleted." />
      : <ErrorState message="Could not load this playlist." onRetry={refetch} />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      <div className="flex items-center gap-2 text-xs text-spirit-500">
        <Link to="/library?tab=playlists" className="hover:text-spirit-300 transition-colors">Playlists</Link>
        <span>›</span>
        <span className="text-spirit-400 truncate">{playlist.name}</span>
      </div>

      {/* key: reset the rename draft when the server name changes */}
      <PlaylistHeader
        key={playlist.name}
        playlist={playlist}
        sermons={sermonsInOrder}
        complete={!items.isLoading && !items.hasNextPage}
      />

      {items.isLoading ? <PageLoader />
        : items.error ? <ErrorState message="Could not load this playlist's sermons." onRetry={items.refetch} />
        : !items.items.length ? (
          <EmptyState title="This playlist is empty" subtitle="Use the playlist button on any sermon to add it here." />
        ) : (
          <div className="space-y-2">
            <TrackList>
              {items.items.map((item, i) => {
              const vars = { playlistId: playlist.id, sermonId: item.sermon.id }
              return (
                <SermonRow
                  key={item.id}
                  sermon={item.sermon}
                  actions={
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => move.mutate({ ...vars, direction: 'up' })}
                        disabled={busy || i === 0}
                        aria-label="Move up"
                        title="Move up"
                        className={smallIconButton}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move.mutate({ ...vars, direction: 'down' })}
                        disabled={busy || (i === items.items.length - 1 && !items.hasNextPage)}
                        aria-label="Move down"
                        title="Move down"
                        className={smallIconButton}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem.mutate(vars)}
                        disabled={busy}
                        aria-label="Remove from playlist"
                        title="Remove from playlist"
                        className={`${smallIconButton} hover:text-flame-400`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  }
                />
              )
              })}
            </TrackList>
            <LoadMore query={items} />
          </div>
        )}
    </div>
  )
}

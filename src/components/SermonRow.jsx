import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Heart, ListEnd, ListPlus, Loader2, Pause, Play, Plus } from 'lucide-react'
import {
  useAddToPlaylist, useCreatePlaylist, useIsFavorited, usePlaylists, useRemoveFromPlaylist,
  useToggleFavorite,
} from '../hooks/useSermons'
import { useDismiss } from '../hooks/useDismiss'
import { usePlayback } from '../hooks/usePlayback'
import { useAudio, useNowPlaying } from '../context/AudioContext'
import useQueueStore from '../store/queueStore'
import CoverArt, { NowPlayingBars } from './CoverArt'
import { formatDuration } from '../lib/format'

// Round icon buttons. `plain` sits on a surface; `overlay` floats on artwork.
const ICON_TONES = {
  plain: 'text-spirit-500 hover:text-spirit-100 hover:bg-spirit-100/5',
  overlay: 'bg-black/40 text-white hover:bg-black/60 backdrop-blur-md',
}
const FAVORITED_TONES = {
  plain: 'text-flame-400 hover:bg-spirit-100/5',
  overlay: 'bg-black/40 text-flame-400 hover:bg-black/60 backdrop-blur-md',
}
const iconButton = (tone, size) =>
  `focus-ring shrink-0 ${size} flex items-center justify-center rounded-full transition-colors ${tone}`
const defaultSize = (variant) => (variant === 'overlay' ? 'w-8 h-8' : 'w-9 h-9')

/** Heart toggle. Optimistic — the cache flips before the server answers. */
export function FavoriteButton({ sermon, variant = 'plain', size = defaultSize(variant) }) {
  const toggle = useToggleFavorite()
  const favorited = useIsFavorited(sermon)

  return (
    <button
      type="button"
      onClick={() => toggle.mutate({ sermonId: sermon.id, favorited: !favorited })}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={favorited}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={iconButton((favorited ? FAVORITED_TONES : ICON_TONES)[variant], size)}
    >
      <Heart className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} />
    </button>
  )
}

function QueueToggle({ sermon }) {
  const { currentSermon } = useAudio()
  const queued = useQueueStore((s) => s.items.some((i) => i.id === sermon.id))
  const add = useQueueStore((s) => s.add)
  const remove = useQueueStore((s) => s.remove)
  const isPlaying = currentSermon?.id === sermon.id

  return (
    <button
      type="button"
      disabled={isPlaying}
      onClick={() => (queued ? remove(sermon.id) : add(sermon))}
      className="focus-ring w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-spirit-200 hover:bg-spirit-100/5 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
    >
      {queued ? <Check className="w-4 h-4 text-accent-500" /> : <ListEnd className="w-4 h-4" />}
      <span className="flex-1 text-left">
        {isPlaying ? 'Now playing' : queued ? 'In queue — remove' : 'Add to queue'}
      </span>
    </button>
  )
}

/** Add menu: queue the sermon, tick existing playlists, or create a new one with it. */
export function AddToPlaylistButton({ sermon, align = 'right', variant = 'plain' }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const ref = useRef(null)
  useDismiss(ref, open, () => setOpen(false))

  const { data: playlists, isLoading } = usePlaylists(sermon.id, { enabled: open })
  const add = useAddToPlaylist()
  const remove = useRemoveFromPlaylist()
  const create = useCreatePlaylist()
  const busy = add.isPending || remove.isPending

  const toggle = (playlist) => {
    const vars = { playlistId: playlist.id, sermonId: sermon.id }
    if (playlist.has_sermon) remove.mutate(vars)
    else add.mutate(vars)
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    create.mutate({ name: name.trim(), sermonId: sermon.id }, { onSuccess: () => setName('') })
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Add to queue or playlist"
        aria-expanded={open}
        title="Add to queue or playlist"
        className={iconButton(ICON_TONES[variant], defaultSize(variant))}
      >
        <ListPlus className="w-4 h-4" />
      </button>

      {open && (
        <div
          className={`absolute z-30 top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'} w-64 card p-2 space-y-1 text-left animate-fade-in`}
        >
          <QueueToggle sermon={sermon} />

          <p className="label px-2 pt-2 mt-1 border-t border-black/5 dark:border-white/5">Add to playlist</p>

          {isLoading ? (
            <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-accent-500" /></div>
          ) : (
            <ul className="max-h-56 overflow-y-auto">
              {(playlists ?? []).map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggle(p)}
                    className="focus-ring w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-spirit-200 hover:bg-spirit-100/5 transition-colors disabled:opacity-60"
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      p.has_sermon ? 'bg-accent-500 border-accent-500 text-white' : 'border-spirit-600'
                    }`}>
                      {p.has_sermon && <Check className="w-3 h-3" />}
                    </span>
                    <span className="flex-1 text-left truncate">{p.name}</span>
                    <span className="text-spirit-500 text-xs font-mono">{p.item_count}</span>
                  </button>
                </li>
              ))}
              {!playlists?.length && (
                <li className="px-2 py-2 text-xs text-spirit-500">No playlists yet — create one below.</li>
              )}
            </ul>
          )}

          <form onSubmit={handleCreate} className="flex gap-1.5 pt-1 border-t border-black/5 dark:border-white/5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New playlist"
              maxLength={100}
              aria-label="New playlist name"
              className="input-field py-1.5 text-sm mt-1.5"
            />
            <button
              type="submit"
              disabled={!name.trim() || create.isPending}
              aria-label="Create playlist"
              className="btn-primary mt-1.5 px-2.5 py-1.5 disabled:opacity-40"
            >
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

/**
 * A sermon in a track list (inside TrackList): artwork, title, length, then
 * favorite / playlist actions. `actions` adds extra controls (e.g. playlist
 * reorder) before them. Wide screens get Speaker and Series columns.
 */
export function SermonRow({ sermon, actions, showSeries = true }) {
  const { currentId, playing } = useNowPlaying()
  const isCurrent = currentId === sermon.id
  const meta = [sermon.speaker, showSeries && sermon.series_title].filter(Boolean).join(' · ')

  return (
    // relative + focus-within:z-20 lifts the row above its siblings while its
    // playlist popover is open
    <div className="relative focus-within:z-20 pl-1.5 sm:pl-2 pr-0.5 sm:pr-1 py-1.5 flex items-center gap-1 sm:gap-2 rounded-lg hover:bg-spirit-100/5 transition-colors group">
      <Link to={`/sermons/${sermon.id}`} className="focus-ring rounded-lg flex-1 min-w-0 flex items-center gap-3">
        <CoverArt src={sermon.thumbnail} seed={sermon.series_title || sermon.title} rounded="rounded-md" className="w-11 h-11">
          <span className={`absolute inset-0 flex items-center justify-center bg-black/45 text-white transition-opacity ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            {isCurrent ? <NowPlayingBars playing={playing} /> : <Play className="w-4 h-4" fill="currentColor" />}
          </span>
        </CoverArt>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isCurrent ? 'text-accent-400' : 'text-spirit-100'}`}>{sermon.title}</p>
          {meta && <p className="lg:hidden text-spirit-400 text-xs mt-0.5 truncate">{meta}</p>}
          {sermon.scripture_reference && (
            <p className="hidden lg:block text-spirit-500 text-xs mt-0.5 truncate">{sermon.scripture_reference}</p>
          )}
        </div>

        <span className="hidden lg:block w-40 xl:w-48 shrink-0 truncate text-sm text-spirit-400">{sermon.speaker}</span>
        {showSeries && (
          <span className="hidden xl:block w-48 shrink-0 truncate text-sm text-spirit-400">{sermon.series_title}</span>
        )}

        <span className="text-spirit-500 text-xs font-mono shrink-0 w-14 text-right">
          {formatDuration(sermon.duration_seconds)}
        </span>
      </Link>

      {actions}
      <FavoriteButton sermon={sermon} />
      <AddToPlaylistButton sermon={sermon} />
    </div>
  )
}

/**
 * A sermon in a grid or shelf: artwork that plays in place on hover (the
 * global player picks it up), then title and speaker linking to the player
 * page. `showActions={false}` drops the heart / add menu — a Shelf scrolls,
 * so it would clip the menu.
 */
export function SermonTile({ sermon, showActions = true, className = '' }) {
  const { currentId, playing, playSermon } = usePlayback()
  const isCurrent = currentId === sermon.id
  const isPlaying = isCurrent && playing
  // Controls show on hover / keyboard focus, and stay up for the playing sermon
  const reveal = isCurrent
    ? 'opacity-100'
    : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto'

  return (
    <div className={`group relative focus-within:z-20 min-w-0 ${className}`}>
      <div className="relative">
        <Link to={`/sermons/${sermon.id}`} tabIndex={-1} aria-hidden className="block rounded-xl">
          <CoverArt
            src={sermon.thumbnail}
            seed={sermon.series_title || sermon.title}
            rounded="rounded-xl"
            className="w-full shadow-[0_12px_30px_-14px_rgba(0,0,0,.55)]"
          />
        </Link>
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none transition-opacity duration-200 ${
          isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
        }`} />
        <div className={`absolute inset-x-2 bottom-2 flex items-end justify-between gap-2 transition-opacity duration-200 ${reveal}`}>
          <button
            type="button"
            onClick={() => playSermon(sermon)}
            aria-label={`${isPlaying ? 'Pause' : 'Play'} ${sermon.title}`}
            title={isPlaying ? 'Pause' : 'Play'}
            className="focus-ring w-10 h-10 rounded-full bg-accent-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying
              ? <Pause className="w-4 h-4" fill="currentColor" />
              : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
          </button>
          {showActions && (
            <div className="flex items-center gap-1.5">
              <FavoriteButton sermon={sermon} variant="overlay" />
              <AddToPlaylistButton sermon={sermon} variant="overlay" />
            </div>
          )}
        </div>
      </div>

      <Link to={`/sermons/${sermon.id}`} className="focus-ring rounded flex items-center gap-1.5 mt-2">
        {isCurrent && <NowPlayingBars playing={playing} className="h-3 shrink-0 text-accent-400" />}
        <span className={`text-sm font-medium truncate ${isCurrent ? 'text-accent-400' : 'text-spirit-100'}`}>{sermon.title}</span>
      </Link>
      <p className="text-sm text-spirit-400 truncate">{sermon.speaker}</p>
    </div>
  )
}

/** "Load more" footer for usePagedList-backed lists. */
export function LoadMore({ query }) {
  if (!query.hasNextPage) return null
  return (
    <div className="flex justify-center pt-2">
      <button
        type="button"
        onClick={() => query.fetchNextPage()}
        disabled={query.isFetchingNextPage}
        className="btn-ghost text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-60"
      >
        {query.isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin" />}
        {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
      </button>
    </div>
  )
}

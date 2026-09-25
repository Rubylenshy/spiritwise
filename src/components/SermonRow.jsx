import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Heart, ListPlus, Loader2, Plus } from 'lucide-react'
import {
  useAddToPlaylist, useCreatePlaylist, useIsFavorited, usePlaylists, useRemoveFromPlaylist,
  useToggleFavorite,
} from '../hooks/useSermons'
import { useDismiss } from '../hooks/useDismiss'
import { TagPill } from './ui'
import { formatDuration } from '../lib/format'

const iconButton =
  'focus-ring shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-spirit-500 hover:text-spirit-100 hover:bg-spirit-100/5 transition-colors'

/** Heart toggle. Optimistic — the cache flips before the server answers. */
export function FavoriteButton({ sermon, className = '' }) {
  const toggle = useToggleFavorite()
  const favorited = useIsFavorited(sermon)

  return (
    <button
      type="button"
      onClick={() => toggle.mutate({ sermonId: sermon.id, favorited: !favorited })}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={favorited}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`${iconButton} ${favorited ? 'text-flame-400 hover:text-flame-400' : ''} ${className}`}
    >
      <Heart className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} />
    </button>
  )
}

/** "Add to playlist" popover: tick existing playlists or create a new one with this sermon. */
export function AddToPlaylistButton({ sermon, align = 'right' }) {
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
        aria-label="Add to playlist"
        aria-expanded={open}
        title="Add to playlist"
        className={iconButton}
      >
        <ListPlus className="w-4 h-4" />
      </button>

      {open && (
        <div
          className={`absolute z-30 top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'} w-64 card p-2 space-y-1 text-left animate-fade-in`}
        >
          <p className="label px-2 pt-1">Add to playlist</p>

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
 * A sermon in a list: the link to its player, then favorite / playlist
 * actions. `actions` adds extra controls (e.g. playlist reorder) before them.
 */
export function SermonRow({ sermon, actions, showSeries = true }) {
  const tag = sermon.tags?.[0]
  const meta = [sermon.speaker, showSeries && sermon.series_title].filter(Boolean).join(' · ')

  return (
    // relative + focus-within:z-20 lifts the row above its (blurred, so
    // stacking-context) siblings while its playlist popover is open
    <div className="card-hover relative focus-within:z-20 pl-5 pr-2 py-3 flex items-center gap-2 sm:gap-3 group">
      <Link to={`/sermons/${sermon.id}`} className="focus-ring rounded-xl flex-1 min-w-0 flex items-center gap-4 py-1">
        <div className="w-10 h-10 rounded-full bg-spirit-700 border border-spirit-600 flex items-center justify-center shrink-0 group-hover:bg-accent-500 group-hover:border-accent-400 transition-all duration-200">
          <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:text-white text-accent-400 transition-colors" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-spirit-100 font-medium text-sm truncate">{sermon.title}</p>
          {meta && <p className="text-spirit-400 text-xs mt-0.5 truncate">{meta}</p>}
          {sermon.scripture_reference && (
            <p className="text-spirit-600 text-xs mt-0.5 italic">{sermon.scripture_reference}</p>
          )}
        </div>

        {tag && (
          <span className="hidden sm:block shrink-0">
            <TagPill tag={tag} />
          </span>
        )}

        <span className="text-spirit-500 text-xs font-mono shrink-0 text-right">
          {formatDuration(sermon.duration_seconds)}
        </span>
      </Link>

      {actions}
      <FavoriteButton sermon={sermon} />
      <AddToPlaylistButton sermon={sermon} />
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

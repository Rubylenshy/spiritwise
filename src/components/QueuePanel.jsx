import { useState } from 'react'
import { Check, ListMusic, Loader2, Play, X } from 'lucide-react'
import { useAudio } from '../context/AudioContext'
import { useCreatePlaylistFrom } from '../hooks/useSermons'
import useQueueStore from '../store/queueStore'
import { formatDuration } from '../lib/format'

/** "Save as playlist": the playing sermon followed by the queue, in order. */
function SaveAsPlaylist({ sermonIds }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const create = useCreatePlaylistFrom()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    create.mutate({ name: name.trim(), sermonIds }, {
      onSuccess: () => { setName(''); setOpen(false) },
    })
  }

  if (!open) {
    return (
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => { create.reset(); setOpen(true) }} className="btn-ghost text-xs px-3 py-1.5">
          Save as playlist
        </button>
        {create.isSuccess && (
          <span className="text-accent-500 text-xs flex items-center gap-1"><Check className="w-4 h-4" /> Saved</span>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <div className="flex gap-1.5">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Playlist name"
          maxLength={100}
          aria-label="Playlist name"
          className="input-field py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={!name.trim() || create.isPending}
          className="btn-primary px-3 py-1.5 text-sm shrink-0 disabled:opacity-40"
        >
          {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cancel"
          className="focus-ring rounded-lg w-8 shrink-0 flex items-center justify-center text-spirit-500 hover:text-spirit-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {create.isError && <p className="text-flame-400 text-xs">Could not save the playlist. Try again.</p>}
    </form>
  )
}

/** The play queue: what plays after the current sermon, with play-now / remove / clear / save. */
export default function QueuePanel({ className = '' }) {
  const { currentSermon, playFromQueue } = useAudio()
  const items = useQueueStore((s) => s.items)
  const remove = useQueueStore((s) => s.remove)
  const clear = useQueueStore((s) => s.clear)
  const [starting, setStarting] = useState(null)

  const playNow = async (id) => {
    setStarting(id)
    await playFromQueue(id)
    setStarting(null)
  }

  const sermonIds = [...(currentSermon ? [currentSermon.id] : []), ...items.map((i) => i.id)]

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="label mb-0">
          Up next{items.length > 0 && <span className="text-spirit-500 font-mono"> · {items.length}</span>}
        </p>
        {items.length > 0 && (
          <button type="button" onClick={clear} className="focus-ring rounded text-xs text-spirit-500 hover:text-flame-400 transition-colors">
            Clear queue
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex items-center gap-3 py-2 text-spirit-500">
          <ListMusic className="w-5 h-5 shrink-0" />
          <p className="text-xs">Your queue is empty. Use the add menu on any sermon to queue it.</p>
        </div>
      ) : (
        <ol className="max-h-64 overflow-y-auto -mx-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-1 rounded-lg hover:bg-spirit-100/5 transition-colors">
              <button
                type="button"
                onClick={() => playNow(item.id)}
                disabled={starting != null}
                title="Play now"
                className="focus-ring rounded-lg flex-1 min-w-0 flex items-center gap-3 px-2 py-2 text-left disabled:opacity-60 group"
              >
                <span className="w-4 h-4 shrink-0 flex items-center justify-center text-spirit-500 group-hover:text-accent-400">
                  {starting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-spirit-100 text-sm truncate">{item.title}</span>
                  <span className="block text-spirit-500 text-xs truncate">{item.speaker}</span>
                </span>
                <span className="text-spirit-500 text-xs font-mono shrink-0">{formatDuration(item.duration_seconds)}</span>
              </button>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.title} from queue`}
                className="focus-ring rounded-lg w-8 h-8 shrink-0 flex items-center justify-center text-spirit-500 hover:text-spirit-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ol>
      )}

      {sermonIds.length > 0 && items.length > 0 && <SaveAsPlaylist sermonIds={sermonIds} />}
    </div>
  )
}

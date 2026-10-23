import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, FileSpreadsheet, Pencil, Search, Upload } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'
import { useManageList, useManageSermons, useManagedSermon, useSaveManaged } from '../../hooks/useSermons'
import {
  EmptyState, ErrorState, InfiniteScrollFooter, Modal, PageLoader, Spinner, TagPill,
} from '../../components/ui'
import { BulkCsvImport, UploadPanel } from './ImportPanels'
import { FieldError, Segmented, apiErrors } from './shared'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
]

function StatusPill({ published }) {
  return published ? (
    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-accent-400">Published</span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full bg-spirit-100/5 border border-black/10 dark:border-white/10 text-spirit-400">Draft</span>
  )
}

function SermonForm({ sermon, onDone }) {
  const { data: seriesList } = useManageList('series')
  const { data: tagList } = useManageList('tags')
  const save = useSaveManaged('sermons')

  const [form, setForm] = useState({
    title: sermon.title,
    speaker: sermon.speaker,
    series: sermon.series ?? '',
    tag_ids: sermon.tags.map((t) => t.id),
    scripture_reference: sermon.scripture_reference,
    sermon_date: sermon.sermon_date ?? '',
    description: sermon.description,
    is_published: sermon.is_published,
  })
  const [errors, setErrors] = useState({})

  const set = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }
  const handleChange = (e) => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value)
  const toggleTag = (id) =>
    set('tag_ids', form.tag_ids.includes(id) ? form.tag_ids.filter((t) => t !== id) : [...form.tag_ids, id])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setErrors({ title: 'Title is required.' }); return }
    save.mutate(
      {
        id: sermon.id,
        ...form,
        series: form.series ? Number(form.series) : null,
        sermon_date: form.sermon_date || null,
      },
      { onSuccess: onDone, onError: (err) => setErrors(apiErrors(err)) },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="label" htmlFor="title">Title</label>
        <input id="title" name="title" maxLength={300} value={form.title} onChange={handleChange} className="input-field" />
        <FieldError errors={errors} name="title" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="label" htmlFor="speaker">Speaker</label>
          <input id="speaker" name="speaker" maxLength={255} value={form.speaker} onChange={handleChange} className="input-field" />
          <FieldError errors={errors} name="speaker" />
        </div>
        <div className="space-y-1.5">
          <label className="label" htmlFor="sermon_date">Date</label>
          <input id="sermon_date" name="sermon_date" type="date" value={form.sermon_date} onChange={handleChange} className="input-field" />
          <FieldError errors={errors} name="sermon_date" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="label" htmlFor="series">Series</label>
          <select id="series" name="series" value={form.series} onChange={handleChange} className="input-field">
            <option value="">— None —</option>
            {(seriesList ?? []).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <FieldError errors={errors} name="series" />
        </div>
        <div className="space-y-1.5">
          <label className="label" htmlFor="scripture_reference">Scripture reference</label>
          <input id="scripture_reference" name="scripture_reference" maxLength={200} value={form.scripture_reference} onChange={handleChange} className="input-field" placeholder="John 3:16" />
          <FieldError errors={errors} name="scripture_reference" />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="label">Tags</p>
        {tagList?.length ? (
          <div className="flex gap-2 flex-wrap">
            {tagList.map((tag) => (
              <TagPill
                key={tag.id}
                tag={tag}
                active={form.tag_ids.includes(tag.id)}
                onClick={(e) => { e.preventDefault(); toggleTag(tag.id) }}
              />
            ))}
          </div>
        ) : (
          <p className="text-spirit-500 text-xs">No tags yet — create them in the Tags tab.</p>
        )}
        <FieldError errors={errors} name="tag_ids" />
      </div>

      <div className="space-y-1.5">
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} className="input-field resize-none" />
      </div>

      <label className="flex items-center justify-between py-3 border-t border-black/5 dark:border-white/5 cursor-pointer">
        <span>
          <span className="block text-spirit-200 text-sm font-medium">Published</span>
          <span className="block text-spirit-500 text-xs mt-0.5">Listeners only see published sermons</span>
        </span>
        <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} className="w-5 h-5 accent-accent-500" />
      </label>

      <FieldError errors={errors} name="detail" />

      <div className="flex gap-3">
        <button type="button" onClick={onDone} className="btn-ghost flex-1">Cancel</button>
        <button type="submit" disabled={save.isPending} className="btn-primary flex-1">
          {save.isPending && <Spinner className="w-4 h-4" />}
          Save changes
        </button>
      </div>
    </form>
  )
}

/** Edit form for one sermon; fetches it when only the id is known (after an upload). */
function SermonEditModal({ sermonId, onClose }) {
  const { data, error } = useManagedSermon(sermonId)
  if (!sermonId) return null
  return (
    <Modal open onClose={onClose} title="Edit sermon" className="max-w-xl">
      {error ? <ErrorState message="Could not load this sermon." /> : !data ? <PageLoader /> : (
        <>
          <Link to={`/sermons/${data.id}`} className="inline-flex items-center gap-1.5 text-xs text-accent-400 hover:underline -mt-2">
            Open in player <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <SermonForm key={data.id} sermon={data} onDone={onClose} />
        </>
      )}
    </Modal>
  )
}

export default function SermonsTab() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState(null)   // sermon id
  const [importer, setImporter] = useState(null) // null | 'upload' | 'csv'
  const debouncedQuery = useDebounce(query, 400)

  const { data, isLoading, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useManageSermons({ q: debouncedQuery || undefined, status: status || undefined })
  const sermons = data?.pages.flatMap((p) => p.results) ?? []

  const editAfterUpload = (id) => {
    setImporter(null)
    setEditing(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-spirit-500 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, speaker, series…"
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setImporter('upload')} className="btn-primary flex-1 sm:flex-none">
            <Upload className="w-4 h-4" /> Upload
          </button>
          <button type="button" onClick={() => setImporter('csv')} className="btn-ghost flex-1 sm:flex-none">
            <FileSpreadsheet className="w-4 h-4" /> Bulk CSV
          </button>
        </div>
      </div>

      <Segmented options={STATUS_FILTERS} value={status} onChange={setStatus} size="sm" />

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message="Could not load sermons." onRetry={refetch} />
      ) : !sermons.length ? (
        <EmptyState title="No sermons found" subtitle={query || status ? 'Try a different search or filter.' : 'Upload one to get started.'} />
      ) : (
        <div className="space-y-2">
          {sermons.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setEditing(s.id)}
              className="card-hover w-full text-left px-5 py-4 flex items-center gap-4 group focus-ring"
            >
              <div className="flex-1 min-w-0">
                <p className="text-spirit-100 font-medium text-sm truncate">{s.title}</p>
                <p className="text-spirit-400 text-xs mt-0.5 truncate">
                  {[s.speaker, s.series_title, s.sermon_date].filter(Boolean).join(' · ') || '—'}
                </p>
                {s.tags.length > 0 && (
                  <p className="text-spirit-500 text-xs mt-1 truncate">{s.tags.map((t) => t.name).join(', ')}</p>
                )}
              </div>
              <StatusPill published={s.is_published} />
              <Pencil className="w-4 h-4 text-spirit-500 group-hover:text-accent-400 transition-colors shrink-0" />
            </button>
          ))}
          <InfiniteScrollFooter
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            endLabel={data.pages.length > 1 ? "That's every sermon" : null}
          />
        </div>
      )}

      <SermonEditModal sermonId={editing} onClose={() => setEditing(null)} />

      <Modal open={importer === 'upload'} onClose={() => setImporter(null)} title="Upload a sermon" className="max-w-2xl">
        <UploadPanel onEdit={editAfterUpload} />
      </Modal>
      <Modal open={importer === 'csv'} onClose={() => setImporter(null)} title="Bulk CSV import" className="max-w-2xl">
        <BulkCsvImport />
      </Modal>
    </div>
  )
}

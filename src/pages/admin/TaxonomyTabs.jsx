import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useDeleteManaged, useManageList, useSaveManaged } from '../../hooks/useSermons'
import { EmptyState, ErrorState, Modal, PageLoader, Spinner } from '../../components/ui'
import { FieldError, apiErrors } from './shared'

// Series and tags share one editor: a name field (`title` / `name`), an
// optional description, and a delete that only unlinks their sermons.
const KINDS = {
  series: {
    noun: 'series',
    nameField: 'title',
    hasDescription: true,
    deleteNote: 'Its sermons stay in the library, just without a series.',
  },
  tags: {
    noun: 'tag',
    nameField: 'name',
    hasDescription: false,
    deleteNote: 'It will be removed from every sermon that has it.',
  },
}

function EditorModal({ kind, item, onClose }) {
  const cfg = KINDS[kind]
  const save = useSaveManaged(kind)
  const remove = useDeleteManaged(kind)
  const isNew = !item.id

  const [form, setForm] = useState({
    [cfg.nameField]: item[cfg.nameField] ?? '',
    ...(cfg.hasDescription && { description: item.description ?? '' }),
  })
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors({})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form[cfg.nameField].trim()) {
      setErrors({ [cfg.nameField]: 'This field is required.' })
      return
    }
    save.mutate({ id: item.id, ...form }, { onSuccess: onClose, onError: (err) => setErrors(apiErrors(err)) })
  }

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    remove.mutate(item.id, { onSuccess: onClose, onError: (err) => setErrors(apiErrors(err)) })
  }

  return (
    <Modal open onClose={onClose} title={isNew ? `New ${cfg.noun}` : `Edit ${cfg.noun}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="label" htmlFor={cfg.nameField}>{cfg.nameField === 'title' ? 'Title' : 'Name'}</label>
          <input
            id={cfg.nameField}
            name={cfg.nameField}
            maxLength={255}
            autoFocus
            value={form[cfg.nameField]}
            onChange={handleChange}
            className="input-field"
          />
          <FieldError errors={errors} name={cfg.nameField} />
        </div>

        {cfg.hasDescription && (
          <div className="space-y-1.5">
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} className="input-field resize-none" />
          </div>
        )}

        <FieldError errors={errors} name="detail" />

        {confirmDelete && (
          <p className="text-flame-400 text-sm bg-flame-500/10 border border-flame-500/20 rounded-xl px-4 py-2.5">
            Delete this {cfg.noun}? {cfg.deleteNote}
          </p>
        )}

        <div className="flex gap-3">
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={remove.isPending}
              className="btn-ghost !px-3 !text-flame-400"
              aria-label={confirmDelete ? 'Confirm delete' : `Delete ${cfg.noun}`}
            >
              {remove.isPending ? <Spinner className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
              {confirmDelete && 'Confirm'}
            </button>
          )}
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={save.isPending} className="btn-primary flex-1">
            {save.isPending && <Spinner className="w-4 h-4" />}
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function TaxonomyTab({ kind }) {
  const cfg = KINDS[kind]
  const { data, isLoading, error, refetch } = useManageList(kind)
  const [editing, setEditing] = useState(null)  // item, or {} for a new one

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="label">{data ? `${data.length} ${data.length === 1 ? cfg.noun : kind}` : ' '}</p>
        <button type="button" onClick={() => setEditing({})} className="btn-primary">
          <Plus className="w-4 h-4" /> New {cfg.noun}
        </button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={`Could not load ${kind}.`} onRetry={refetch} />
      ) : !data.length ? (
        <EmptyState title={`No ${kind} yet`} />
      ) : (
        <div className="space-y-2">
          {data.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setEditing(item)}
              className="card-hover w-full text-left px-5 py-4 flex items-center gap-4 group focus-ring"
            >
              <div className="flex-1 min-w-0">
                <p className="text-spirit-100 font-medium text-sm truncate">{item[cfg.nameField]}</p>
                {item.description && <p className="text-spirit-400 text-xs mt-0.5 truncate">{item.description}</p>}
              </div>
              <span className="text-spirit-500 text-xs font-mono shrink-0">
                {item.sermon_count} sermon{item.sermon_count !== 1 ? 's' : ''}
              </span>
              <Pencil className="w-4 h-4 text-spirit-500 group-hover:text-accent-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}

      {editing && <EditorModal kind={kind} item={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

export const SeriesTab = () => <TaxonomyTab kind="series" />
export const TagsTab = () => <TaxonomyTab kind="tags" />

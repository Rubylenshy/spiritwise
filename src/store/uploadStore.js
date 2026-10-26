import { create } from 'zustand'
import { detectAudioMeta, parseFilename } from '../lib/audioMeta'

export const ACCEPTED_FORMATS = '.mp3,.m4a,.aac,.ogg,.opus,.wav,.flac'
const ACCEPTED_EXTENSIONS = ACCEPTED_FORMATS.split(',')

// No response at all means the request never completed (connection dropped,
// or R2 refused the browser's PUT because the bucket CORS isn't set up).
const uploadErrorMessage = (err, fallback) =>
  err.response?.data?.detail ?? (err.response ? fallback : 'Network error — the upload did not complete.')

let nextRowId = 1

function makeRow(file) {
  // Filename guess shows instantly; addFiles upgrades it once the tags are read.
  const { title, speaker, date } = parseFilename(file.name)
  return {
    id: nextRowId++,
    file,
    title,
    speaker,
    date,
    detecting: true,
    status: 'pending', // 'pending' | 'uploading' | 'done' | 'error'
    progress: 0,
    error: '',
    r2Key: null, // set once the audio is in R2, so a retry only re-runs finalize
    sermonId: null,
  }
}

/**
 * Admin audio uploads. Kept outside the import modals so closing one (or
 * leaving the dashboard) doesn't lose track of an upload in flight:
 * UploadIndicator shows progress app-wide and reopens the right modal.
 *
 * Runners take `upload` — `useUploadSermon().mutateAsync` — so the query
 * invalidation stays in the hook. Not persisted: File objects can't be, and
 * a reload ends the upload anyway.
 */
const useUploadStore = create((set, get) => ({
  // Which import modal is open: null | 'upload' | 'batch' | 'csv'
  importer: null,
  // Hides the indicator's "finished" notice until the next upload starts
  noticeDismissed: false,

  openImporter: (importer) => set({ importer, noticeDismissed: true }),
  closeImporter: () => set({ importer: null }),
  dismissNotice: () => set({ noticeDismissed: true }),

  // ── Single upload ───────────────────────────────────────────────────────────
  // null, or { file, fields, r2Key, status: 'uploading' | 'done' | 'error', progress, error, result }
  single: null,

  startSingle: async ({ file, fields }, upload) => {
    // Retrying the same file reuses its R2 key, so only finalize re-runs
    const prev = get().single
    const r2Key = prev?.file === file ? prev.r2Key : null
    const patch = (p) => set((s) => ({ single: s.single && { ...s.single, ...p } }))

    set({ single: { file, fields, r2Key, status: 'uploading', progress: 0, error: '', result: null }, noticeDismissed: false })
    try {
      const result = await upload({
        file,
        fields,
        r2Key,
        onStored: (key) => patch({ r2Key: key }),
        onProgress: (pct) => patch({ progress: Math.round(pct * 0.9) }), // 0-90% during upload
      })
      patch({ status: 'done', progress: 100, result })
    } catch (err) {
      patch({ status: 'error', progress: 0, error: uploadErrorMessage(err, 'Upload failed. Please try again.') })
    }
  },

  resetSingle: () => set({ single: null }),

  // ── Batch queue ─────────────────────────────────────────────────────────────
  rows: [],
  shared: { sermon_speaker: '', sermon_series_title: '', sermon_tags: '' },
  rejected: [],
  running: false,
  stopRequested: false,

  setShared: (patch) => set((s) => ({ shared: { ...s.shared, ...patch } })),

  updateRow: (id, patch) => set((s) => ({ rows: s.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

  addFiles: (fileList) => {
    const files = Array.from(fileList)
    const ok = files.filter((f) => ACCEPTED_EXTENSIONS.includes(f.name.slice(f.name.lastIndexOf('.')).toLowerCase()))
    const seen = new Set(get().rows.map((r) => `${r.file.name}:${r.file.size}`))
    const added = ok.filter((f) => !seen.has(`${f.name}:${f.size}`)).map(makeRow)
    set((s) => ({ rows: [...s.rows, ...added], rejected: files.filter((f) => !ok.includes(f)).map((f) => f.name) }))

    // Fill in tag-detected values, but never overwrite a field the admin already edited.
    added.forEach(async (initial) => {
      const meta = await detectAudioMeta(initial.file)
      set((s) => ({
        rows: s.rows.map((r) => {
          if (r.id !== initial.id) return r
          const pick = (field) => (r[field] === initial[field] && meta[field]) || r[field]
          return { ...r, title: pick('title'), speaker: pick('speaker'), date: pick('date'), detecting: false }
        }),
      }))
    })
  },

  removeRow: (id) => set((s) => ({ rows: s.rows.filter((r) => r.id !== id) })),
  retryRow: (id) => get().updateRow(id, { status: 'pending', error: '' }),
  clearFinished: () => set((s) => ({ rows: s.rows.filter((r) => r.status !== 'done') })),
  stop: () => set({ stopRequested: true }),

  runQueue: async (upload) => {
    const { updateRow } = get()
    set({ running: true, stopRequested: false, noticeDismissed: false })

    // Rows are re-read each iteration, so edits and earlier results are visible
    const ids = get().rows.filter((r) => r.status === 'pending' || r.status === 'error').map((r) => r.id)
    for (const id of ids) {
      if (get().stopRequested) break
      const row = get().rows.find((r) => r.id === id)
      if (!row) continue
      if (!row.title.trim()) { updateRow(id, { status: 'error', error: 'Title is required.' }); continue }

      const { shared } = get()
      updateRow(id, { status: 'uploading', progress: row.r2Key ? 100 : 0, error: '' })
      try {
        const data = await upload({
          file: row.file,
          r2Key: row.r2Key,
          onStored: (key) => updateRow(id, { r2Key: key }),
          fields: {
            sermon_title: row.title.trim(),
            sermon_speaker: row.speaker.trim() || shared.sermon_speaker.trim(),
            sermon_date: row.date,
            // Blank: the backend uses each file's album tag instead
            sermon_series_title: shared.sermon_series_title.trim(),
            sermon_tags: shared.sermon_tags,
          },
          onProgress: (pct) => updateRow(id, { progress: pct }),
        })
        updateRow(id, { status: 'done', progress: 100, sermonId: data.sermon_id })
      } catch (err) {
        updateRow(id, { status: 'error', error: uploadErrorMessage(err, 'Upload failed.') })
      }
    }

    set({ running: false, stopRequested: false })
  },
}))

/** True while any upload is streaming from this tab. */
export const selectUploading = (s) => s.running || s.single?.status === 'uploading'

export default useUploadStore

import { useState, useRef, useEffect } from 'react'
import { AlertCircle, CheckCircle2, RotateCcw, ShieldCheck, Sparkles, UploadCloud, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ADMIN_URL } from '../lib/config'
import { useSeries, useBulkImportCsv, useUploadSermon } from '../hooks/useSermons'
import { Spinner } from '../components/ui'
import { detectAudioMeta, parseFilename } from '../lib/audioMeta'

const CSV_TEMPLATE = `id,slug,r2_key,title,speaker,series,tags,description,scripture_reference,sermon_date,audio_url,is_published
,,sermons/2026-01-12-walking-in-purpose.m4a,Walking in Purpose,Pastor James,Foundations,"Faith, Purpose",A message on discovering your calling.,John 3:16,2026-01-12,,false
`

function downloadCsvTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sermon-bulk-import-template.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function BulkCsvImport() {
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const bulkImport = useBulkImportCsv()

  const handleFileChange = e => {
    const f = e.target.files[0]
    setFile(f || null)
    setFileError('')
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!file) { setFileError('Please select a CSV file.'); return }
    bulkImport.mutate(file, {
      onError: err => setFileError(err.response?.data?.detail ?? 'Bulk import failed. Please try again.'),
    })
  }

  const reset = () => {
    bulkImport.reset()
    setFile(null)
    setFileError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const result = bulkImport.data

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 bg-accent-500/[0.08] border border-accent-500/20 rounded-2xl px-5 py-4">
        <Sparkles className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-accent-400 font-medium text-sm">Bulk metadata import from CSV</p>
          <p className="text-spirit-400 text-xs leading-relaxed">
            Create sermon records or update existing ones (match by <span className="font-mono text-spirit-300">id</span>, <span className="font-mono text-spirit-300">slug</span> or <span className="font-mono text-spirit-300">r2_key</span>) in one pass.
            For audio already in the R2 bucket, put its object key in <span className="font-mono text-spirit-300">r2_key</span> — duration, cover art and any blank speaker/date/description are read from the file.
            Re-running the same CSV updates those sermons rather than duplicating them.
          </p>
          <button type="button" onClick={downloadCsvTemplate} className="text-accent-400 hover:underline text-xs mt-1">
            Download CSV template →
          </button>
        </div>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="label" htmlFor="csv_file">CSV file</label>
            <input
              ref={fileRef}
              id="csv_file"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="input-field file:mr-3 file:btn-ghost file:px-3 file:py-1 file:border-0 file:text-xs"
            />
            {file && <p className="text-spirit-400 text-xs">{file.name} · {(file.size / 1024).toFixed(1)} KB</p>}
            {fileError && <p className="text-flame-400 text-xs">{fileError}</p>}
          </div>

          <button type="submit" disabled={bulkImport.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
            {bulkImport.isPending ? <><Spinner className="w-4 h-4" /> Importing…</> : 'Run bulk import'}
          </button>
        </form>
      ) : (
        <div className="space-y-4 animate-slide-up">
          <div className="card p-5 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-display text-accent-400">{result.created}</p>
              <p className="text-spirit-500 text-xs">Created</p>
            </div>
            <div>
              <p className="text-2xl font-display text-spirit-200">{result.updated}</p>
              <p className="text-spirit-500 text-xs">Updated</p>
            </div>
            <div>
              <p className={`text-2xl font-display ${result.failed ? 'text-flame-400' : 'text-spirit-200'}`}>{result.failed}</p>
              <p className="text-spirit-500 text-xs">Failed</p>
            </div>
          </div>

          <div className="card divide-y divide-spirit-700 max-h-96 overflow-y-auto">
            {result.results.map(r => (
              <div key={r.row} className="px-5 py-3 flex items-start gap-3 text-sm">
                <span className="text-spirit-500 text-xs font-mono shrink-0 mt-0.5">row {r.row}</span>
                {r.status === 'error' ? (
                  <div className="flex-1 min-w-0">
                    <span className="text-flame-400 text-xs uppercase tracking-wide">error</span>
                    <p className="text-spirit-300 text-xs mt-0.5">{r.error}</p>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <span className="text-spirit-200 truncate">{r.title}</span>
                    <span className={`text-xs shrink-0 ${r.status === 'created' ? 'text-accent-400' : 'text-spirit-400'}`}>{r.status}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={reset} className="btn-ghost w-full text-sm">Import another CSV</button>
        </div>
      )}
    </div>
  )
}

const ACCEPTED_FORMATS = '.mp3,.m4a,.aac,.ogg,.opus,.wav,.flac'

const FORMAT_GUIDE = [
  { ext: 'AAC (.m4a)', size: '~32 MB / 45 min', quality: 'Excellent', compat: 'All browsers', recommended: true },
  { ext: 'Opus (.opus)', size: '~21 MB / 45 min', quality: 'Excellent', compat: 'Chrome, Firefox', recommended: false },
  { ext: 'Ogg (.ogg)', size: '~32 MB / 45 min', quality: 'Very good', compat: 'Chrome, Firefox', recommended: false },
  { ext: 'MP3 (.mp3)', size: '~42 MB / 45 min', quality: 'Good', compat: 'All browsers', recommended: false },
]

function FormatGuide() {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-spirit-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-accent-400 text-sm font-medium">Recommended: AAC (.m4a) at 96kbps</span>
          <span className="text-xs text-spirit-500">saves ~25% vs MP3, plays everywhere</span>
        </div>
        <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 text-spirit-500 transition-transform ${open ? 'rotate-180' : ''}`} stroke="currentColor" strokeWidth={1.5}>
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </button>
      {open && (
        <div className="border-t border-spirit-700 px-5 py-4">
          <p className="label mb-3">Format comparison for a 45-minute sermon</p>
          <div className="space-y-2">
            {FORMAT_GUIDE.map(f => (
              <div key={f.ext} className={`flex items-center gap-3 p-3 rounded-xl ${f.recommended ? 'bg-accent-500/10 border border-accent-500/20' : 'bg-spirit-800'}`}>
                <div className="w-28 shrink-0">
                  <p className={`text-sm font-medium ${f.recommended ? 'text-accent-400' : 'text-spirit-200'}`}>{f.ext}</p>
                  {f.recommended && <span className="text-xs text-accent-500/70">recommended</span>}
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2 text-xs text-spirit-400">
                  <span>{f.size}</span>
                  <span>{f.quality}</span>
                  <span>{f.compat}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-spirit-500 text-xs mt-3 leading-relaxed">
            Convert with: <span className="text-spirit-300 font-mono">ffmpeg -i input.mp3 -c:a aac -b:a 96k output.m4a</span>
            <br/>Or use Audacity (free) → File → Export → Export as M4A
          </p>
        </div>
      )}
    </div>
  )
}

// No response at all means the request never completed (connection dropped,
// or R2 refused the browser's PUT because the bucket CORS isn't set up).
const uploadErrorMessage = (err, fallback) =>
  err.response?.data?.detail ?? (err.response ? fallback : 'Network error — the upload did not complete.')

function UploadForm({ onSuccess }) {
  const { data: seriesData } = useSeries()
  const upload = useUploadSermon()
  const fileRef = useRef(null)

  const [file, setFile] = useState(null)
  const [form, setForm] = useState({
    sermon_title: '',
    sermon_speaker: '',
    sermon_series: '',
    sermon_date: '',
    sermon_tags: '',
    description: '',
    scripture_ref: '',
  })
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [storedKey, setStoredKey] = useState(null) // set once the file is in R2, so a retry only re-runs finalize

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const [parsingMeta, setParsingMeta] = useState(false)

  const handleFileChange = async e => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setStoredKey(null)

    // Tags are read in the browser — the file isn't sent anywhere until submit.
    setParsingMeta(true)
    const meta = await detectAudioMeta(f)
    setForm(prev => ({
      ...prev,
      sermon_title:   meta.title   || prev.sermon_title,
      sermon_speaker: meta.speaker || prev.sermon_speaker,
      sermon_date:    meta.date    || prev.sermon_date,
    }))
    setParsingMeta(false)
  }

  const validate = () => {
    const errs = {}
    if (!file) errs.file = 'Please select an audio file.'
    if (!form.sermon_title.trim()) errs.sermon_title = 'Title is required.'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setUploading(true)
    setProgress(0)
    setUploadError('')

    try {
      const data = await upload.mutateAsync({
        file,
        fields: form,
        r2Key: storedKey,
        onStored: setStoredKey,
        onProgress: pct => setProgress(Math.round(pct * 0.9)), // 0-90% during upload
      })
      setProgress(100)
      setTimeout(() => onSuccess(data), 400)
    } catch (err) {
      setUploadError(uploadErrorMessage(err, 'Upload failed. Please try again.'))
      setUploading(false)
      setProgress(0)
    }
  }

  const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* File picker */}
      <div
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          file
            ? 'border-accent-500/50 bg-accent-500/5'
            : errors.file
            ? 'border-flame-500/50 bg-flame-500/5'
            : 'border-spirit-600 hover:border-spirit-500 hover:bg-spirit-800/50'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_FORMATS}
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? (
          <div className="space-y-1">
            <p className="text-accent-400 font-medium">{file.name}</p>
            <p className="text-spirit-400 text-sm">{fileSizeMB} MB · {file.type || 'audio file'}</p>
            <p className="text-spirit-500 text-xs mt-2">Click to change file</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-spirit-500 mx-auto" stroke="currentColor" strokeWidth={1.5}>
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-spirit-300 font-medium">Click to select audio file</p>
            <p className="text-spirit-500 text-xs">MP3, AAC, M4A, OGG, Opus, WAV, FLAC</p>
          </div>
        )}
      </div>
      {parsingMeta && (
        <p className="text-spirit-400 text-xs -mt-2 flex items-center gap-1.5">
          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
          </svg>
          Reading audio tags…
        </p>
      )}
      {errors.file && <p className="text-flame-400 text-xs -mt-3">{errors.file}</p>}

      {/* Metadata */}
      <div className="space-y-1.5">
        <label className="label" htmlFor="sermon_title">Title <span className="text-flame-400">*</span></label>
        <input id="sermon_title" name="sermon_title" type="text" value={form.sermon_title} onChange={handleChange} className="input-field" placeholder="Walking in Purpose" />
        {errors.sermon_title && <p className="text-flame-400 text-xs">{errors.sermon_title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="label" htmlFor="sermon_speaker">Speaker</label>
          <input id="sermon_speaker" name="sermon_speaker" type="text" value={form.sermon_speaker} onChange={handleChange} className="input-field" placeholder="Pastor James" />
        </div>
        <div className="space-y-1.5">
          <label className="label" htmlFor="sermon_date">Date</label>
          <input id="sermon_date" name="sermon_date" type="date" value={form.sermon_date} onChange={handleChange} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="label" htmlFor="sermon_series">Series</label>
          <select id="sermon_series" name="sermon_series" value={form.sermon_series} onChange={handleChange} className="input-field">
            <option value="">— None —</option>
            {(seriesData ?? []).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="label" htmlFor="sermon_tags">Tags</label>
          <input id="sermon_tags" name="sermon_tags" type="text" value={form.sermon_tags} onChange={handleChange} className="input-field" placeholder="Faith, Hope" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="label" htmlFor="scripture_ref">Scripture reference</label>
        <input id="scripture_ref" name="scripture_ref" type="text" value={form.scripture_ref} onChange={handleChange} className="input-field" placeholder="John 3:16" />
      </div>

      <div className="space-y-1.5">
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} className="input-field resize-none" placeholder="Brief description of the sermon..." />
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-spirit-400">
            <span>{progress < 90 ? 'Uploading to R2…' : progress < 100 ? 'Processing…' : 'Complete!'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-spirit-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {uploadError && (
        <p className="text-flame-400 text-sm bg-flame-500/10 border border-flame-500/20 rounded-xl px-4 py-3">
          {uploadError}
        </p>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {uploading ? <><Spinner className="w-4 h-4" /> Uploading…</> : 'Upload to R2'}
      </button>
    </form>
  )
}

const ACCEPTED_EXTENSIONS = ACCEPTED_FORMATS.split(',')

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

function QueueRow({ row, locked, onChange, onRemove, onRetry }) {
  const editable = !locked && (row.status === 'pending' || row.status === 'error')
  const set = field => e => onChange(row.id, { [field]: e.target.value })

  return (
    <div className="px-5 py-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          {row.status === 'uploading' && <Spinner className="w-4 h-4 text-accent-400" />}
          {row.status === 'done' && <CheckCircle2 className="w-4 h-4 text-accent-400" />}
          {row.status === 'error' && <AlertCircle className="w-4 h-4 text-flame-400" />}
          {row.status === 'pending' && <span className="block w-4 h-4 rounded-full border border-spirit-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-spirit-200 text-sm truncate">{row.file.name}</p>
          <p className="text-spirit-500 text-xs font-mono">{(row.file.size / 1024 / 1024).toFixed(1)} MB</p>
        </div>
        {row.status === 'done' && row.sermonId && (
          <Link to={`/sermons/${row.sermonId}`} className="text-accent-400 hover:underline text-xs shrink-0">Preview →</Link>
        )}
        {row.status === 'error' && !locked && (
          <button type="button" onClick={() => onRetry(row.id)} className="text-spirit-400 hover:text-spirit-200 shrink-0" title="Retry">
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
        {editable && (
          <button type="button" onClick={() => onRemove(row.id)} className="text-spirit-500 hover:text-flame-400 shrink-0" title="Remove">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {editable && row.detecting && (
        <p className="text-spirit-500 text-xs flex items-center gap-1.5"><Spinner className="w-3 h-3" /> Reading audio tags…</p>
      )}

      {editable && (
        <div className="space-y-2">
          <input type="text" value={row.title} onChange={set('title')} className="input-field" placeholder="Title *" aria-label="Title" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={row.speaker} onChange={set('speaker')} className="input-field" placeholder="Speaker (default / from tags)" aria-label="Speaker" />
            <input type="date" value={row.date} onChange={set('date')} className="input-field" aria-label="Date" />
          </div>
        </div>
      )}

      {row.status === 'uploading' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-spirit-400">
            <span>{row.progress < 100 ? 'Uploading…' : 'Processing…'}</span>
            <span className="font-mono">{row.progress}%</span>
          </div>
          <div className="h-1.5 bg-spirit-700 rounded-full overflow-hidden">
            <div className="h-full bg-accent-500 rounded-full transition-all duration-300" style={{ width: `${row.progress}%` }} />
          </div>
        </div>
      )}

      {row.status === 'done' && <p className="text-spirit-400 text-xs truncate">{row.title}</p>}
      {row.error && <p className="text-flame-400 text-xs">{row.error}</p>}
    </div>
  )
}

function BatchUpload() {
  const { data: seriesData } = useSeries()
  const upload = useUploadSermon()
  const fileRef = useRef(null)

  const [rows, setRows] = useState([])
  const [shared, setShared] = useState({ sermon_speaker: '', sermon_series: '', sermon_tags: '' })
  const [running, setRunning] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [rejected, setRejected] = useState([])

  // The upload loop reads rows through a ref so edits made before "Upload all"
  // and status changes from earlier iterations are both visible to it.
  const rowsRef = useRef(rows)
  rowsRef.current = rows
  const stopRef = useRef(false)

  // Uploads stream from this tab — warn before the admin closes it mid-queue.
  useEffect(() => {
    if (!running) return
    const warn = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [running])

  const updateRow = (id, patch) => setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)))

  const addFiles = fileList => {
    const files = Array.from(fileList)
    const ok = files.filter(f => ACCEPTED_EXTENSIONS.includes(f.name.slice(f.name.lastIndexOf('.')).toLowerCase()))
    setRejected(files.filter(f => !ok.includes(f)).map(f => f.name))

    const seen = new Set(rowsRef.current.map(r => `${r.file.name}:${r.file.size}`))
    const added = ok.filter(f => !seen.has(`${f.name}:${f.size}`)).map(makeRow)
    setRows(prev => [...prev, ...added])

    // Fill in tag-detected values, but never overwrite a field the admin already edited.
    added.forEach(async initial => {
      const meta = await detectAudioMeta(initial.file)
      setRows(prev => prev.map(r => {
        if (r.id !== initial.id) return r
        const pick = field => (r[field] === initial[field] && meta[field]) || r[field]
        return { ...r, title: pick('title'), speaker: pick('speaker'), date: pick('date'), detecting: false }
      }))
    })
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragging(false)
    if (!running) addFiles(e.dataTransfer.files)
  }

  const runQueue = async () => {
    stopRef.current = false
    setRunning(true)

    const ids = rowsRef.current.filter(r => r.status === 'pending' || r.status === 'error').map(r => r.id)
    for (const id of ids) {
      if (stopRef.current) break
      const row = rowsRef.current.find(r => r.id === id)
      if (!row) continue
      if (!row.title.trim()) { updateRow(id, { status: 'error', error: 'Title is required.' }); continue }

      updateRow(id, { status: 'uploading', progress: row.r2Key ? 100 : 0, error: '' })
      try {
        const data = await upload.mutateAsync({
          file: row.file,
          r2Key: row.r2Key,
          onStored: key => updateRow(id, { r2Key: key }),
          fields: {
            sermon_title: row.title.trim(),
            sermon_speaker: row.speaker.trim() || shared.sermon_speaker.trim(),
            sermon_date: row.date,
            sermon_series: shared.sermon_series,
            sermon_tags: shared.sermon_tags,
          },
          onProgress: pct => updateRow(id, { progress: pct }),
        })
        updateRow(id, { status: 'done', progress: 100, sermonId: data.sermon_id })
      } catch (err) {
        updateRow(id, { status: 'error', error: uploadErrorMessage(err, 'Upload failed.') })
      }
    }

    setRunning(false)
  }

  const retryRow = id => updateRow(id, { status: 'pending', error: '' })
  const removeRow = id => setRows(prev => prev.filter(r => r.id !== id))
  const clearFinished = () => setRows(prev => prev.filter(r => r.status !== 'done'))

  const counts = rows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {})
  const queued = (counts.pending ?? 0) + (counts.error ?? 0)
  const detecting = rows.some(r => r.detecting)

  return (
    <div className="space-y-5">
      <div
        onClick={() => !running && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); if (!running) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          running ? 'opacity-50 cursor-not-allowed border-spirit-600'
            : dragging ? 'border-accent-500/50 bg-accent-500/5 cursor-pointer'
            : 'border-spirit-600 hover:border-spirit-500 hover:bg-spirit-800/50 cursor-pointer'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={ACCEPTED_FORMATS}
          onChange={e => { addFiles(e.target.files); e.target.value = '' }}
          className="hidden"
        />
        <UploadCloud className="w-10 h-10 text-spirit-500 mx-auto mb-2" />
        <p className="text-spirit-300 font-medium">Drop audio files here, or click to select</p>
        <p className="text-spirit-500 text-xs mt-1">Files upload one after another — keep this tab open until the queue finishes</p>
      </div>
      {rejected.length > 0 && (
        <p className="text-flame-400 text-xs -mt-3">Skipped unsupported files: {rejected.join(', ')}</p>
      )}

      {rows.length > 0 && (
        <>
          <div className="card p-5 space-y-3">
            <p className="label">Applied to every file</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="label" htmlFor="batch_series">Series</label>
                <select
                  id="batch_series"
                  value={shared.sermon_series}
                  disabled={running}
                  onChange={e => setShared(prev => ({ ...prev, sermon_series: e.target.value }))}
                  className="input-field"
                >
                  <option value="">— None —</option>
                  {(seriesData ?? []).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="label" htmlFor="batch_tags">Tags</label>
                <input
                  id="batch_tags"
                  type="text"
                  value={shared.sermon_tags}
                  disabled={running}
                  onChange={e => setShared(prev => ({ ...prev, sermon_tags: e.target.value }))}
                  className="input-field"
                  placeholder="Faith, Hope"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label" htmlFor="batch_speaker">Default speaker</label>
              <input
                id="batch_speaker"
                type="text"
                value={shared.sermon_speaker}
                disabled={running}
                onChange={e => setShared(prev => ({ ...prev, sermon_speaker: e.target.value }))}
                className="input-field"
                placeholder="Used when a file has no speaker set"
              />
            </div>
            <p className="text-spirit-500 text-xs leading-relaxed">
              Title, speaker and date are pre-filled from each file&apos;s audio tags or filename (dates read as DD.MM.YYYY) — check them before uploading.
              Anything left blank falls back to the default speaker above, then the file&apos;s tags.
            </p>
          </div>

          <div className="card divide-y divide-spirit-700">
            <div className="px-5 py-3 flex items-center justify-between gap-3 text-xs text-spirit-400">
              <span>
                {rows.length} file{rows.length === 1 ? '' : 's'}
                {counts.done ? ` · ${counts.done} uploaded` : ''}
                {counts.error ? ` · ${counts.error} failed` : ''}
              </span>
              {counts.done > 0 && !running && (
                <button type="button" onClick={clearFinished} className="hover:text-spirit-200">Clear finished</button>
              )}
            </div>
            {rows.map(row => (
              <QueueRow key={row.id} row={row} locked={running} onChange={updateRow} onRemove={removeRow} onRetry={retryRow} />
            ))}
          </div>

          {running ? (
            <button type="button" onClick={() => { stopRef.current = true }} className="btn-ghost w-full text-sm">
              Stop after current file
            </button>
          ) : (
            <button type="button" onClick={runQueue} disabled={!queued || detecting} className="btn-primary w-full">
              {detecting ? 'Reading audio tags…' : queued ? `Upload ${queued} file${queued === 1 ? '' : 's'}` : 'All files uploaded'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

function SuccessCard({ result, onUploadAnother }) {
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="card p-6 border-l-2 border-l-accent-500 rounded-r-2xl rounded-l-none text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 mx-auto text-accent-400" />
        <h3 className="font-display text-2xl text-accent-400">Upload complete</h3>
        <p className="text-spirit-400 text-sm">
          <span className="text-spirit-200 font-medium">{result.sermon_title}</span> has been uploaded to R2 and is ready to review.
        </p>
      </div>

      <div className="card p-5 space-y-3">
        <p className="label">Next steps</p>
        <div className="space-y-2 text-sm text-spirit-300">
          <div className="flex items-start gap-2">
            <span className="text-accent-500 shrink-0 mt-0.5">1.</span>
            <span>Open <a href={`${ADMIN_URL}/sermons/sermon/`} target="_blank" rel="noreferrer" className="text-accent-400 hover:underline">Django admin → Sermons</a> and find <span className="text-spirit-200">{result.sermon_title}</span></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-accent-500 shrink-0 mt-0.5">2.</span>
            <span>Add reflection questions, verify the speaker and series, set the sermon date</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-accent-500 shrink-0 mt-0.5">3.</span>
            <span>Check <span className="font-mono text-spirit-300 text-xs">Is published</span> → Save — it will appear in the library immediately</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link to={`/sermons/${result.sermon_id}`} className="btn-outline flex-1 text-center text-sm">
          Preview sermon →
        </Link>
        <button onClick={onUploadAnother} className="btn-ghost flex-1 text-sm">
          Upload another
        </button>
      </div>
    </div>
  )
}

export default function CloudImportPage() {
  const [result, setResult] = useState(null)
  const [mode, setMode] = useState('single') // 'single' | 'batch' | 'bulk'

  const tabs = [
    { id: 'single', label: 'Upload one' },
    { id: 'batch', label: 'Upload many' },
    { id: 'bulk', label: 'Bulk CSV' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Mode tabs */}
      <div className="flex gap-2 p-1 bg-spirit-800 rounded-2xl">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${mode === t.id ? 'bg-spirit-700 text-accent-400' : 'text-spirit-400 hover:text-spirit-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mode === 'batch' ? (
        <>
          <FormatGuide />
          <BatchUpload />
        </>
      ) : mode === 'single' ? (
        <>
          {/* Admin notice */}
          <div className="flex items-start gap-3 bg-accent-500/[0.08] border border-accent-500/20 rounded-2xl px-5 py-4">
            <ShieldCheck className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-accent-400 font-medium text-sm">Admin only — uploads directly to Cloudflare R2</p>
              <p className="text-spirit-400 text-xs mt-0.5 leading-relaxed">
                Files are stored securely in R2 and streamed through Django&apos;s authenticated proxy. The raw URL is never exposed to users.
              </p>
            </div>
          </div>

          <FormatGuide />

          {result ? (
            <SuccessCard result={result} onUploadAnother={() => setResult(null)} />
          ) : (
            <div className="card p-6">
              <p className="label mb-5">Upload sermon audio</p>
              <UploadForm onSuccess={setResult} />
            </div>
          )}
        </>
      ) : (
        <BulkCsvImport />
      )}
    </div>
  )
}

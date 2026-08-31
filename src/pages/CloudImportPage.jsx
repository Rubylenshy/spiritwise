import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import { useSeries, useBulkImportCsv } from '../hooks/useSermons'
import { Spinner } from '../components/ui'

const CSV_TEMPLATE = `id,slug,title,speaker,series,tags,description,scripture_reference,sermon_date,audio_url,is_published
,,Walking in Purpose,Pastor James,Foundations,"Faith, Purpose",A message on discovering your calling.,John 3:16,2026-01-12,,true
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
      <div className="flex items-start gap-3 bg-gold-500/8 border border-gold-500/20 rounded-2xl px-5 py-4">
        <span className="text-gold-400 text-lg shrink-0 mt-0.5">✦</span>
        <div className="space-y-1">
          <p className="text-gold-400 font-medium text-sm">Bulk metadata import from CSV</p>
          <p className="text-spirit-400 text-xs leading-relaxed">
            Create sermon records or update existing ones (match by <span className="font-mono text-spirit-300">id</span> or <span className="font-mono text-spirit-300">slug</span>) in one pass.
            This edits metadata only — audio still needs to be uploaded separately, or reference an already-hosted file via <span className="font-mono text-spirit-300">audio_url</span>.
          </p>
          <button type="button" onClick={downloadCsvTemplate} className="text-gold-400 hover:underline text-xs mt-1">
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
              <p className="text-2xl font-display text-gold-400">{result.created}</p>
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
                    <span className={`text-xs shrink-0 ${r.status === 'created' ? 'text-gold-400' : 'text-spirit-400'}`}>{r.status}</span>
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
          <span className="text-gold-400 text-sm font-medium">Recommended: AAC (.m4a) at 96kbps</span>
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
              <div key={f.ext} className={`flex items-center gap-3 p-3 rounded-xl ${f.recommended ? 'bg-gold-500/10 border border-gold-500/20' : 'bg-spirit-800'}`}>
                <div className="w-28 shrink-0">
                  <p className={`text-sm font-medium ${f.recommended ? 'text-gold-400' : 'text-spirit-200'}`}>{f.ext}</p>
                  {f.recommended && <span className="text-xs text-gold-500/70">recommended</span>}
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

function UploadForm({ onSuccess }) {
  const { data: seriesData } = useSeries()
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

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const [parsingMeta, setParsingMeta] = useState(false)

  const handleFileChange = async e => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)

    // Auto-fill title from filename as immediate fallback
    const filenameTitle = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    if (!form.sermon_title) {
      setForm(prev => ({ ...prev, sermon_title: filenameTitle }))
    }

    // Parse audio tags from the file
    setParsingMeta(true)
    try {
      const fd = new FormData()
      fd.append('audio_file', f)
      const { data } = await api.post('/imports/parse-metadata/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setForm(prev => ({
        ...prev,
        sermon_title:   data.title   || prev.sermon_title || filenameTitle,
        sermon_speaker: data.artist  || prev.sermon_speaker,
        sermon_date:    data.date    || prev.sermon_date,
        description:    data.comment || prev.description,
      }))
    } catch {
      // tag parsing failed — keep filename title, no crash
    } finally {
      setParsingMeta(false)
    }
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

    const formData = new FormData()
    formData.append('audio_file', file)
    Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v) })

    try {
      const { data } = await api.post('/imports/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          const pct = Math.round((e.loaded / e.total) * 90) // 0-90% during upload
          setProgress(pct)
        },
      })
      setProgress(100)
      setTimeout(() => onSuccess(data), 400)
    } catch (err) {
      setUploadError(err.response?.data?.detail ?? 'Upload failed. Please try again.')
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
            ? 'border-gold-500/50 bg-gold-500/5'
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
            <p className="text-gold-400 font-medium">{file.name}</p>
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
              className="h-full bg-gold-500 rounded-full transition-all duration-300"
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

function SuccessCard({ result, onUploadAnother }) {
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="card p-6 border-l-2 border-l-gold-500 rounded-r-2xl rounded-l-none text-center space-y-3">
        <div className="text-4xl">✦</div>
        <h3 className="font-display text-2xl text-gold-400 italic">Upload complete</h3>
        <p className="text-spirit-400 text-sm">
          <span className="text-spirit-200 font-medium">{result.sermon_title}</span> has been uploaded to R2 and is ready to review.
        </p>
      </div>

      <div className="card p-5 space-y-3">
        <p className="label">Next steps</p>
        <div className="space-y-2 text-sm text-spirit-300">
          <div className="flex items-start gap-2">
            <span className="text-gold-500 shrink-0 mt-0.5">1.</span>
            <span>Open <a href="http://localhost:8000/admin/sermons/sermon/" target="_blank" rel="noreferrer" className="text-gold-400 hover:underline">Django admin → Sermons</a> and find <span className="text-spirit-200">{result.sermon_title}</span></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gold-500 shrink-0 mt-0.5">2.</span>
            <span>Add reflection questions, verify the speaker and series, set the sermon date</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gold-500 shrink-0 mt-0.5">3.</span>
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
  const [mode, setMode] = useState('single') // 'single' | 'bulk'

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Mode tabs */}
      <div className="flex gap-2 p-1 bg-spirit-800 rounded-2xl">
        <button
          onClick={() => setMode('single')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'single' ? 'bg-spirit-700 text-gold-400' : 'text-spirit-400 hover:text-spirit-200'}`}
        >
          Upload one sermon
        </button>
        <button
          onClick={() => setMode('bulk')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'bulk' ? 'bg-spirit-700 text-gold-400' : 'text-spirit-400 hover:text-spirit-200'}`}
        >
          Bulk CSV import
        </button>
      </div>

      {mode === 'single' ? (
        <>
          {/* Admin notice */}
          <div className="flex items-start gap-3 bg-gold-500/8 border border-gold-500/20 rounded-2xl px-5 py-4">
            <span className="text-gold-400 text-lg shrink-0 mt-0.5">✦</span>
            <div>
              <p className="text-gold-400 font-medium text-sm">Admin only — uploads directly to Cloudflare R2</p>
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

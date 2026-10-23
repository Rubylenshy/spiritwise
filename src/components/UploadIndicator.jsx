import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import useUploadStore, { selectUploading } from '../store/uploadStore'
import { Spinner } from './ui'

function Progress({ value }) {
  return (
    <div className="h-1 bg-spirit-700 rounded-full overflow-hidden">
      <div className="h-full bg-accent-500 rounded-full transition-all duration-300" style={{ width: `${value}%` }} />
    </div>
  )
}

// One upload job: clicking it reopens its modal on the dashboard
function UploadCard({ state, title, detail, progress, onOpen, onDismiss }) {
  return (
    <div className="glass-chrome border border-black/10 dark:border-white/10 rounded-2xl shadow-lg w-72 max-w-[calc(100vw-2rem)] flex items-start gap-1 animate-slide-up">
      <button type="button" onClick={onOpen} className="focus-ring rounded-2xl flex-1 min-w-0 text-left pl-4 py-3 space-y-2">
        <span className="flex items-center gap-2.5">
          {state === 'uploading' && <Spinner className="w-4 h-4 text-accent-400 shrink-0" />}
          {state === 'done' && <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />}
          {state === 'error' && <AlertCircle className="w-4 h-4 text-flame-400 shrink-0" />}
          <span className="min-w-0">
            <span className="block text-spirit-100 text-sm font-medium truncate">{title}</span>
            <span className="block text-spirit-500 text-xs truncate">{detail}</span>
          </span>
        </span>
        {state === 'uploading' && <Progress value={progress} />}
      </button>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="focus-ring rounded-lg p-1 m-2 text-spirit-500 hover:text-spirit-100 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      ) : <span className="w-3 shrink-0" />}
    </div>
  )
}

function singleCard(single) {
  const title = single.fields.sermon_title
  if (single.status === 'uploading') {
    return { state: 'uploading', title, progress: single.progress, detail: `${single.progress < 90 ? 'Uploading' : 'Processing'} · ${single.progress}%` }
  }
  if (single.status === 'done') return { state: 'done', title, detail: 'Upload complete — ready to review' }
  return { state: 'error', title, detail: single.error }
}

function batchCard(rows, running) {
  const count = (status) => rows.filter((r) => r.status === status).length
  const done = count('done')
  const failed = count('error')
  if (running) {
    const current = rows.find((r) => r.status === 'uploading')
    // Finished files count whole, the one in flight by its progress
    const progress = Math.round(((done + failed + (current?.progress ?? 0) / 100) / rows.length) * 100)
    return {
      state: 'uploading',
      title: `Uploading ${Math.min(done + failed + 1, rows.length)} of ${rows.length}`,
      detail: current ? `${current.title} · ${current.progress}%` : 'Starting…',
      progress,
    }
  }
  if (!done && !failed) return null
  return {
    state: failed ? 'error' : 'done',
    title: `${done} sermon${done === 1 ? '' : 's'} uploaded`,
    detail: failed ? `${failed} failed — open to retry` : 'Ready to review',
  }
}

/**
 * App-wide progress for admin uploads (see uploadStore), so closing an
 * import modal or leaving the dashboard doesn't hide them. Hidden while an
 * import modal is open, since that shows the full detail. Rendered once, in
 * RootLayout.
 */
export default function UploadIndicator() {
  const navigate = useNavigate()
  const importer = useUploadStore((s) => s.importer)
  const single = useUploadStore((s) => s.single)
  const rows = useUploadStore((s) => s.rows)
  const running = useUploadStore((s) => s.running)
  const noticeDismissed = useUploadStore((s) => s.noticeDismissed)
  const uploading = useUploadStore(selectUploading)
  const openImporter = useUploadStore((s) => s.openImporter)
  const dismissNotice = useUploadStore((s) => s.dismissNotice)

  // Uploads stream from this tab — warn before it's closed or reloaded mid-upload
  useEffect(() => {
    if (!uploading) return
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [uploading])

  if (importer) return null

  const cards = [
    single && { key: 'upload', ...singleCard(single) },
    { key: 'batch', ...batchCard(rows, running) },
  ].filter((c) => c?.state)
    // Finished notices stay until dismissed or seen in their modal
    .filter((c) => c.state === 'uploading' || !noticeDismissed)

  if (!cards.length) return null

  const open = (kind) => {
    navigate('/dashboard')
    openImporter(kind)
  }

  return (
    // Bottom-left, clear of the reward toasts (right) and the player bar / bottom nav
    <div
      aria-live="polite"
      className="fixed left-4 z-40 flex flex-col gap-2 bottom-[calc(8.5rem+env(safe-area-inset-bottom,0px))] lg:left-[17.5rem] lg:bottom-24"
    >
      {cards.map(({ key, ...card }) => (
        <UploadCard
          key={key}
          {...card}
          onOpen={() => open(key)}
          onDismiss={card.state === 'uploading' ? null : dismissNotice}
        />
      ))}
    </div>
  )
}

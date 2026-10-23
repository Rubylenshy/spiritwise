import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, Trash2, ZoomIn, ZoomOut } from 'lucide-react'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'
import { Modal, Spinner } from './ui'

const VIEWPORT = 256   // crop window, CSS px
const OUTPUT = 512     // uploaded square, px
const MAX_ZOOM = 4
const ACCEPT = 'image/jpeg,image/png,image/webp'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/**
 * Square crop with a round guide: drag to position, slider to zoom.
 * The image always covers the window, so the crop never has empty corners.
 */
function Cropper({ src, onCancel, onCrop, busy }) {
  const [img, setImg] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef(null)

  // Scale at zoom 1: the image's short side fills the window
  const baseScale = img ? VIEWPORT / Math.min(img.naturalWidth, img.naturalHeight) : 1
  const scale = baseScale * zoom

  const clampOffset = useCallback((x, y, s) => ({
    x: clamp(x, VIEWPORT - img.naturalWidth * s, 0),
    y: clamp(y, VIEWPORT - img.naturalHeight * s, 0),
  }), [img])

  useEffect(() => {
    const image = new Image()
    image.onload = () => {
      const s = VIEWPORT / Math.min(image.naturalWidth, image.naturalHeight)
      setImg(image)
      setZoom(1)
      // Start centred
      setOffset({ x: (VIEWPORT - image.naturalWidth * s) / 2, y: (VIEWPORT - image.naturalHeight * s) / 2 })
    }
    image.src = src
  }, [src])

  // Zoom about the window's centre so the subject stays put
  const applyZoom = (next) => {
    if (!img) return
    next = clamp(next, 1, MAX_ZOOM)
    const nextScale = baseScale * next
    const c = VIEWPORT / 2
    setOffset(clampOffset(
      c - ((c - offset.x) / scale) * nextScale,
      c - ((c - offset.y) / scale) * nextScale,
      nextScale,
    ))
    setZoom(next)
  }

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    setOffset(clampOffset(e.clientX - drag.current.x, e.clientY - drag.current.y, scale))
  }
  const onPointerUp = () => { drag.current = null }

  const handleCrop = () => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = OUTPUT
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, -offset.x / scale, -offset.y / scale, VIEWPORT / scale, VIEWPORT / scale, 0, 0, OUTPUT, OUTPUT)
    canvas.toBlob((blob) => blob && onCrop(blob), 'image/jpeg', 0.9)
  }

  return (
    <div className="space-y-5">
      <div
        className="relative mx-auto rounded-2xl overflow-hidden bg-spirit-800 cursor-grab active:cursor-grabbing select-none touch-none"
        style={{ width: VIEWPORT, height: VIEWPORT }}
        onPointerDown={img ? onPointerDown : undefined}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {img ? (
          <img
            src={src}
            alt=""
            draggable={false}
            className="absolute top-0 left-0 max-w-none pointer-events-none"
            style={{
              width: img.naturalWidth * scale,
              height: img.naturalHeight * scale,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><Spinner /></div>
        )}
        {/* Round guide — the avatar is shown as a circle everywhere */}
        <div className="absolute inset-0 pointer-events-none rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ring-2 ring-white/70" />
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => applyZoom(zoom - 0.25)} aria-label="Zoom out" className="focus-ring rounded-lg p-1 text-spirit-400 hover:text-spirit-100">
          <ZoomOut className="w-4 h-4" />
        </button>
        <input
          type="range" min={1} max={MAX_ZOOM} step={0.01}
          value={zoom}
          onChange={(e) => applyZoom(Number(e.target.value))}
          aria-label="Zoom"
          className="flex-1 accent-accent-500"
        />
        <button type="button" onClick={() => applyZoom(zoom + 0.25)} aria-label="Zoom in" className="focus-ring rounded-lg p-1 text-spirit-400 hover:text-spirit-100">
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
      <p className="text-spirit-500 text-xs text-center -mt-2">Drag to reposition</p>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} disabled={busy} className="btn-ghost flex-1">Cancel</button>
        <button type="button" onClick={handleCrop} disabled={!img || busy} className="btn-primary flex-1">
          {busy && <Spinner className="w-4 h-4" />}
          Save photo
        </button>
      </div>
    </div>
  )
}

/**
 * Profile photo with its own editor: clicking it opens the full-size photo
 * with Replace / Remove; choosing a file goes through the cropper first.
 */
export default function AvatarEditor({ user }) {
  const setUser = useAuthStore((s) => s.setUser)
  const fileRef = useRef(null)
  const [mode, setMode] = useState(null)       // null | 'view' | 'crop'
  const [source, setSource] = useState(null)   // object URL of the picked file
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(false)

  useEffect(() => () => { if (source) URL.revokeObjectURL(source) }, [source])

  const close = useCallback(() => {
    if (busy) return
    setMode(null)
    setSource(null)
    setError('')
    setConfirmRemove(false)
  }, [busy])

  const pickFile = () => fileRef.current?.click()

  const handleFile = (e) => {
    const file = e.target.files[0]
    e.target.value = ''  // picking the same file again should still fire
    if (!file) return
    if (!ACCEPT.split(',').includes(file.type)) {
      setError('Use a JPEG, PNG or WebP image.')
      setMode('view')
      return
    }
    setError('')
    setSource(URL.createObjectURL(file))
    setMode('crop')
  }

  const run = async (request) => {
    setBusy(true)
    setError('')
    try {
      const { data } = await request()
      setUser(data)
      setBusy(false)
      setMode(null)
      setSource(null)
      setConfirmRemove(false)
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Could not update your photo. Please try again.')
      setBusy(false)
    }
  }

  const upload = (blob) => run(() => {
    const fd = new FormData()
    fd.append('avatar', blob, 'avatar.jpg')
    return api.post('/auth/avatar/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  })

  const remove = () => run(() => api.delete('/auth/avatar/'))

  const initials = (user?.first_name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase()

  return (
    <>
      <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={handleFile} />

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => (user?.avatar ? setMode('view') : pickFile())}
          title={user?.avatar ? 'View photo' : 'Add a photo'}
          className="focus-ring w-16 h-16 rounded-full bg-spirit-600 border-2 border-spirit-500 flex items-center justify-center overflow-hidden"
        >
          {user?.avatar
            ? <img src={user.avatar} alt="Your profile photo" className="w-full h-full object-cover" />
            : <span className="font-display text-2xl text-accent-400">{initials}</span>
          }
        </button>
        <button
          type="button"
          onClick={pickFile}
          aria-label={user?.avatar ? 'Replace photo' : 'Add a photo'}
          className="focus-ring absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center hover:bg-accent-400 transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      <Modal open={mode === 'view'} onClose={close} title="Profile photo">
        {user?.avatar ? (
          <img src={user.avatar} alt="Your profile photo" className="w-64 h-64 max-w-full mx-auto rounded-full object-cover border border-black/10 dark:border-white/10" />
        ) : (
          <div className="w-40 h-40 mx-auto rounded-full bg-spirit-700 flex items-center justify-center">
            <span className="font-display text-5xl text-accent-400">{initials}</span>
          </div>
        )}
        {error && <p className="text-flame-400 text-sm text-center">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={pickFile} disabled={busy} className="btn-primary flex-1">
            <ImagePlus className="w-4 h-4" /> {user?.avatar ? 'Replace' : 'Choose photo'}
          </button>
          {user?.avatar && (
            <button
              type="button"
              onClick={() => (confirmRemove ? remove() : setConfirmRemove(true))}
              disabled={busy}
              className={`btn-ghost flex-1 ${confirmRemove ? '!text-flame-400' : ''}`}
            >
              {busy ? <Spinner className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
              {confirmRemove ? 'Confirm remove' : 'Remove'}
            </button>
          )}
        </div>
      </Modal>

      <Modal open={mode === 'crop'} onClose={close} title="Crop your photo">
        {source && <Cropper src={source} onCancel={close} onCrop={upload} busy={busy} />}
        {error && <p className="text-flame-400 text-sm text-center">{error}</p>}
      </Modal>
    </>
  )
}

import { useRef, useState } from 'react'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Scrubbable progress bar for the audio player. Drag (mouse, touch or pen),
 * tap/click to jump, or use the arrow keys. The seek is committed on release
 * so dragging doesn't fire a network range request per pixel.
 *
 * `className` sizes the hit area (keep it taller than the track for touch);
 * `trackClassName` styles the visible track.
 */
export default function SeekBar({
  currentTime,
  duration,
  onSeek,
  disabled = false,
  className = '',
  trackClassName = 'h-1.5 rounded-full',
}) {
  const [dragRatio, setDragRatio] = useState(null)
  const barRef = useRef(null)

  const canSeek = !disabled && duration > 0
  const ratio = dragRatio ?? (duration > 0 ? Math.min(1, currentTime / duration) : 0)

  const ratioAt = (clientX) => {
    const rect = barRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  const handlePointerDown = (e) => {
    if (!canSeek || e.button > 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragRatio(ratioAt(e.clientX))
  }

  const handlePointerMove = (e) => {
    if (dragRatio === null) return
    setDragRatio(ratioAt(e.clientX))
  }

  const handlePointerUp = (e) => {
    if (dragRatio === null) return
    onSeek(ratioAt(e.clientX) * duration)
    setDragRatio(null)
  }

  const handleKeyDown = (e) => {
    if (!canSeek) return
    const steps = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -30, PageUp: 30 }
    if (e.key in steps) onSeek(Math.max(0, Math.min(duration, currentTime + steps[e.key])))
    else if (e.key === 'Home') onSeek(0)
    else if (e.key === 'End') onSeek(duration)
    else return
    e.preventDefault()
  }

  const dragging = dragRatio !== null

  return (
    <div
      ref={barRef}
      role="slider"
      tabIndex={canSeek ? 0 : -1}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration) || 0}
      aria-valuenow={Math.round(ratio * duration) || 0}
      aria-valuetext={`${formatTime(ratio * duration)} of ${formatTime(duration)}`}
      aria-disabled={!canSeek}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setDragRatio(null)}
      onKeyDown={handleKeyDown}
      className={`focus-ring group relative flex touch-none select-none ${
        canSeek ? 'cursor-pointer' : 'cursor-default'
      } ${className}`}
    >
      <div className={`relative w-full bg-spirit-100/10 ${trackClassName}`}>
        <div
          className={`h-full bg-accent-500 rounded-[inherit] ${dragging ? '' : 'transition-[width] duration-100'}`}
          style={{ width: `${ratio * 100}%` }}
        />
        {canSeek && (
          <div
            className={`absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400 shadow transition-opacity ${
              dragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100'
            }`}
            style={{ left: `${ratio * 100}%` }}
          />
        )}
      </div>
    </div>
  )
}

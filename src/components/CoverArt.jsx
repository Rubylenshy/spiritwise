import { useState } from 'react'
import { AudioWaveform } from 'lucide-react'
import { mediaUrl } from '../lib/config'

// Generated artwork for anything without its own — picked per item from its
// title, so a series or playlist keeps the same cover everywhere.
const GRADIENTS = [
  'from-blue-500 to-indigo-700',
  'from-neutral-600 to-neutral-900',
  'from-indigo-400 to-blue-700',
  'from-blue-400 to-blue-800',
  'from-indigo-500 to-neutral-900',
  'from-neutral-500 to-blue-900',
]

function gradientFor(seed = '') {
  let hash = 0
  for (const ch of String(seed)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return GRADIENTS[hash % GRADIENTS.length]
}

const imgClass = 'w-full h-full object-cover select-none'

/**
 * Square artwork, Apple Music style: rounded, hairline edge, never a broken
 * image. `srcs` with four or more distinct images makes a 2×2 mosaic (a
 * playlist); otherwise the first image shows. With none — or if it fails to
 * load — a gradient seeded by `seed` stands in. Size it with `className`.
 */
export default function CoverArt({
  src, srcs, seed, icon: Icon = AudioWaveform, rounded = 'rounded-lg', className = '', children,
}) {
  const [failed, setFailed] = useState(null)
  const urls = [...new Set((srcs ?? [src]).filter(Boolean).map(mediaUrl))]
  const mosaic = urls.length >= 4 ? urls.slice(0, 4) : null
  const single = !mosaic && urls[0] !== failed ? urls[0] : null
  const hasArt = mosaic || single

  return (
    <div
      className={`relative aspect-square overflow-hidden shrink-0 ${rounded} ${
        hasArt ? 'bg-spirit-700' : `bg-gradient-to-br ${gradientFor(seed)}`
      } ${className}`}
    >
      {mosaic ? (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {mosaic.map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
              className={imgClass}
            />
          ))}
        </div>
      ) : single ? (
        <img
          key={single}
          src={single}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(single)}
          className={`absolute inset-0 ${imgClass}`}
        />
      ) : (
        <Icon className="absolute inset-0 m-auto w-[38%] h-[38%] text-white/85" strokeWidth={1.5} />
      )}
      <span aria-hidden className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/10 dark:ring-white/10 pointer-events-none" />
      {children}
    </div>
  )
}

/** Animated equaliser bars marking the sermon that's in the player. */
export function NowPlayingBars({ playing, className = '' }) {
  return (
    <span role="img" aria-label={playing ? 'Now playing' : 'Paused'} className={`flex items-end gap-[2px] h-3.5 ${className}`}>
      {[0, -0.45, -0.2].map((delay) => (
        <span
          key={delay}
          className={`w-[3px] h-full rounded-full bg-current origin-bottom animate-eq ${playing ? '' : '[animation-play-state:paused]'}`}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, LayoutGrid, List, Play, Shuffle } from 'lucide-react'
import CoverArt from './CoverArt'

const VIEWS = [
  { id: 'grid', label: 'Grid view', Icon: LayoutGrid },
  { id: 'list', label: 'List view', Icon: List },
]

/** Segmented grid / list switch (pair with useViewMode). */
export function ViewToggle({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Layout" className="shrink-0 flex p-0.5 rounded-lg bg-spirit-700/60 dark:bg-white/[0.06]">
      {VIEWS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          aria-label={label}
          title={label}
          onClick={() => onChange(id)}
          className={`focus-ring w-8 h-7 rounded-md flex items-center justify-center transition-colors ${
            value === id
              ? 'bg-white text-spirit-100 shadow-sm dark:bg-white/15'
              : 'text-spirit-500 hover:text-spirit-100'
          }`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}

/** Count label on the left, grid / list switch on the right. */
export function ListHeader({ label, view, onView }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="label">{label}</p>
      {onView && <ViewToggle value={view} onChange={onView} />}
    </div>
  )
}

/** Responsive artwork grid — tiles size themselves to the column. */
export function MediaGrid({ children }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-6">
      {children}
    </div>
  )
}

const tileArtClass = 'w-full shadow-[0_12px_30px_-14px_rgba(0,0,0,.55)] group-hover:brightness-90 transition-[filter] duration-200'

/** Artwork + title + subtitle linking somewhere — a series or playlist in a grid. */
export function MediaTile({ to, title, subtitle, art }) {
  return (
    <Link to={to} className="group focus-ring rounded-xl block min-w-0">
      <CoverArt seed={title} rounded="rounded-xl" className={tileArtClass} {...art} />
      <p className="mt-2 text-sm font-medium text-spirit-100 truncate">{title}</p>
      {subtitle && <p className="text-sm text-spirit-400 truncate">{subtitle}</p>}
    </Link>
  )
}

/** Grouped list container — rows inside share one surface, split by hairlines. */
export function TrackList({ children }) {
  return (
    // relative + focus-within:z-20: a row's playlist popover can overhang the
    // list and must sit above the (blurred, so stacking-context) cards below it
    <div className="card relative focus-within:z-20 p-1.5 sm:p-2 divide-y divide-black/5 dark:divide-white/5">
      {children}
    </div>
  )
}

/** A titled, horizontally scrolling row of tiles (Home). */
export function Shelf({ title, to, children }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-3 mb-3">
        <h3 className="text-xl font-bold tracking-tight text-spirit-100">{title}</h3>
        {to && (
          <Link to={to} className="focus-ring rounded flex items-center text-sm text-accent-400 hover:text-accent-300 transition-colors">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 -mx-4 px-4 sm:-mx-6 sm:px-6 pt-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  )
}

/** Width + snap for a tile inside a Shelf. */
export const shelfItemClass = 'w-36 sm:w-44 shrink-0 snap-start'

function Description({ text }) {
  const [open, setOpen] = useState(false)
  const long = text.length > 160
  return (
    <p className="text-spirit-400 text-sm leading-relaxed pt-2 max-w-2xl mx-auto sm:mx-0">
      <span className={open || !long ? '' : 'line-clamp-2'}>{text}</span>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="focus-ring rounded text-xs font-semibold uppercase tracking-wider text-accent-400 hover:text-accent-300 mt-1"
        >
          {open ? 'Less' : 'More'}
        </button>
      )}
    </p>
  )
}

/**
 * Album-style header for a series or playlist: big artwork, bold title, an
 * accent subtitle line, meta, then Play / Shuffle. `title` may be a node
 * (e.g. the playlist rename form); `actions` sit after the play buttons.
 */
export function CollectionHeader({
  art, eyebrow, title, subtitle, subtitleTo, meta, description, onPlay, onShuffle, canPlay, actions,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-7">
      <CoverArt
        rounded="rounded-xl"
        className="w-52 sm:w-56 lg:w-64 shadow-[0_24px_60px_-20px_rgba(0,0,0,.6)]"
        {...art}
      />
      <div className="flex-1 min-w-0 w-full text-center sm:text-left">
        {eyebrow && <p className="label mb-1">{eyebrow}</p>}
        {typeof title === 'string'
          ? <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-spirit-100 break-words">{title}</h2>
          : title}
        {subtitle && (subtitleTo
          ? <Link to={subtitleTo} className="focus-ring rounded inline-block mt-1 text-lg text-accent-400 hover:text-accent-300 transition-colors">{subtitle}</Link>
          : <p className="mt-1 text-lg text-accent-400">{subtitle}</p>
        )}
        {meta && <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-spirit-500">{meta}</p>}
        {description && <Description text={description} />}

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 pt-5">
          <button type="button" onClick={onPlay} disabled={!canPlay} className="btn-accent min-w-[7.5rem]">
            <Play className="w-4 h-4" fill="currentColor" /> Play
          </button>
          <button type="button" onClick={onShuffle} disabled={!canPlay} className="btn-tinted min-w-[7.5rem]">
            <Shuffle className="w-4 h-4" /> Shuffle
          </button>
          {actions}
        </div>
      </div>
    </div>
  )
}

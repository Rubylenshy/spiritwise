import { useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import leaders from '../../../data/leaders'
import { useReveal, revealClass, revealDelay } from '../useReveal'

// `leader.accent` (gold/spirit/flame) predates the blue landing palette — map it onto it
const AVATAR_CLASSES = {
  gold: 'bg-blue-500/15 border-blue-500/30 text-lp-accent-soft',
  spirit: 'bg-lp-fg/5 border-black/10 dark:border-white/10 text-lp-fg/70',
  flame: 'bg-flame-500/10 border-flame-500/25 text-flame-400',
}

function LeaderCard({ leader }) {
  return (
    <div className="lp-card group w-72 h-full p-5 flex flex-col gap-4 cursor-default">
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 text-base font-medium overflow-hidden transition-transform duration-200 group-hover:scale-105 ${
            AVATAR_CLASSES[leader.accent] || AVATAR_CLASSES.gold
          }`}
        >
          {leader.avatar_url
            ? <img src={leader.avatar_url} alt={leader.name} className="w-full h-full object-cover" />
            : leader.initials}
        </div>
        <div className="min-w-0">
          <p className="text-lp-fg font-medium text-sm truncate">{leader.name}</p>
          <p className="text-lp-fg/70 text-xs truncate">{leader.title} · {leader.church}</p>
          <p className="text-lp-fg/60 text-xs mt-0.5">{leader.flag} {leader.country}</p>
        </div>
      </div>

      <blockquote className="text-xs leading-relaxed italic flex-1 text-lp-fg/70">
        &ldquo;{leader.quote}&rdquo;
      </blockquote>

      <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
        <span className="text-lp-fg/60 text-xs">{leader.sermon_count} sermons</span>
        <button type="button" className="lp-focus text-xs text-lp-fg/60 hover:text-lp-accent-soft transition-colors flex items-center gap-1 rounded">
          Browse
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function LeadersSection() {
  const [ref, visible] = useReveal()
  const scrollRef = useRef(null)
  const drag = useRef({ startX: 0, scrollLeft: 0 })
  const [isDragging, setIsDragging] = useState(false)

  // Drag-to-scroll
  const onMouseDown = (e) => {
    setIsDragging(true)
    drag.current = { startX: e.pageX - scrollRef.current.offsetLeft, scrollLeft: scrollRef.current.scrollLeft }
  }
  const onMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    scrollRef.current.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX)
  }
  const onMouseUp = () => setIsDragging(false)

  return (
    <section id="leaders" ref={ref} className="relative py-24 lg:py-32 scroll-mt-16">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 ${revealClass(visible)}`}>
        <p className="lp-eyebrow mb-4">Featured voices</p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h2 className="lp-h2">
            Voices that
            <br />
            <span className="text-lp-accent-soft">move the world.</span>
          </h2>
          <p className="text-lp-fg/70 text-sm max-w-xs leading-relaxed">
            Sermons from the preachers shaping global Christianity — all in one library.
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`flex gap-4 overflow-x-auto py-4 px-4 sm:px-6 lg:px-8 select-none [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {leaders.map((leader, i) => (
          <div key={leader.id} className={`shrink-0 ${revealClass(visible)}`} style={revealDelay(Math.min(i, 6) + 1)}>
            <LeaderCard leader={leader} />
          </div>
        ))}
      </div>

      <p className="text-center text-lp-fg/60 text-xs mt-4">← drag to explore →</p>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import leaders from '../../../data/leaders'

const ACCENT_COLORS = {
  gold: {
    avatar: 'bg-gold-500/15 border-gold-500/30 text-gold-400',
    border: 'hover:border-gold-500/50',
    quote: 'text-gold-400/70',
  },
  spirit: {
    avatar: 'bg-spirit-500/15 border-spirit-500/30 text-spirit-300',
    border: 'hover:border-spirit-400/40',
    quote: 'text-spirit-400/80',
  },
  flame: {
    avatar: 'bg-flame-500/10 border-flame-500/20 text-flame-400',
    border: 'hover:border-flame-500/40',
    quote: 'text-flame-400/70',
  },
}

function LeaderCard({ leader, index }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const colors = ACCENT_COLORS[leader.accent] || ACCENT_COLORS.gold

  return (
    <div
      ref={ref}
      className={`group shrink-0 w-72 bg-spirit-800/60 border border-spirit-700 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-500 cursor-default ${colors.border} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${(index % 4) * 80}ms` }}
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 font-display text-lg italic transition-all duration-200 group-hover:scale-105 ${colors.avatar}`}>
          {leader.avatar_url
            ? <img src={leader.avatar_url} alt={leader.name} className="w-full h-full object-cover rounded-full" />
            : leader.initials
          }
        </div>
        <div className="min-w-0">
          <p className="text-spirit-100 font-medium text-sm truncate">{leader.name}</p>
          <p className="text-spirit-400 text-xs truncate">{leader.title} · {leader.church}</p>
          <p className="text-spirit-600 text-xs mt-0.5">{leader.flag} {leader.country}</p>
        </div>
      </div>

      {/* Quote */}
      <blockquote className={`text-xs leading-relaxed italic flex-1 ${colors.quote}`}>
        "{leader.quote}"
      </blockquote>

      {/* Sermon count */}
      <div className="flex items-center justify-between pt-3 border-t border-spirit-700/60">
        <span className="text-spirit-600 text-xs">{leader.sermon_count} sermons</span>
        <button className="text-xs text-spirit-500 hover:text-spirit-300 transition-colors flex items-center gap-1">
          Browse
          <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5" stroke="currentColor" strokeWidth={1.8}>
            <path d="M2 6h8M6 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function LeadersSection() {
  const [visible, setVisible] = useState(false)
  const headerRef = useRef(null)
  const scrollRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (headerRef.current) observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  // Drag-to-scroll
  const onMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }
  const onMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    scrollRef.current.scrollLeft = scrollLeft - (x - startX)
  }
  const onMouseUp = () => setIsDragging(false)

  return (
    <section id="leaders" className="relative py-24 lg:py-32 bg-spirit-900 overflow-hidden">
      {/* Dark-on-dark texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Side fade gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-spirit-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-spirit-900 to-transparent z-10 pointer-events-none" />

      {/* Section header */}
      <div
        ref={headerRef}
        className={`max-w-7xl mx-auto px-6 lg:px-8 mb-12 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0 translate-y-6'}`}
      >
        <p className="text-gold-500/70 text-xs uppercase tracking-[0.2em] mb-4">Featured voices</p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-spirit-100 italic leading-tight">
            Voices that
            <br />
            <span className="text-gold-400">move the world.</span>
          </h2>
          <p className="text-spirit-400 text-sm max-w-xs leading-relaxed">
            Sermons from the preachers shaping global Christianity — all in one library.
          </p>
        </div>
      </div>

      {/* Horizontal scroll row */}
      <div
        ref={scrollRef}
        className={`flex gap-4 overflow-x-auto pb-4 px-6 lg:px-8 scrollbar-hide select-none transition-all duration-700 delay-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {leaders.map((leader, i) => (
          <LeaderCard key={leader.id} leader={leader} index={i} />
        ))}
      </div>

      {/* Drag hint */}
      <p className="text-center text-spirit-700 text-xs mt-4">← drag to explore →</p>
    </section>
  )
}

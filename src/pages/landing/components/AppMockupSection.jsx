import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: '2.4k+', label: 'Sermons' },
  { value: '18k+', label: 'Listeners worldwide' },
  { value: '365', label: 'Days of content' },
  { value: '92%', label: 'Streak retention' },
]

function BrowserMockup() {
  const [progress, setProgress] = useState(34)
  const [playing, setPlaying] = useState(true)

  // Slowly advance the progress bar
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setProgress(p => p >= 98 ? 10 : p + 0.3)
    }, 100)
    return () => clearInterval(id)
  }, [playing])

  const elapsed = Math.floor((progress / 100) * 3124)
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <div className="relative">
      {/* Browser chrome */}
      <div className="bg-spirit-800 border border-spirit-700 rounded-2xl overflow-hidden shadow-2xl shadow-spirit-950/80">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-spirit-700 bg-spirit-900/50">
          <div className="flex gap-1.5">
            {['bg-flame-500', 'bg-gold-500/60', 'bg-spirit-500'].map((c, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />
            ))}
          </div>
          <div className="flex-1 mx-3 bg-spirit-800 border border-spirit-700 rounded-lg px-3 py-1 text-xs text-spirit-500 font-mono">
            spiritwise.app/sermons/renewed-strength
          </div>
        </div>

        {/* App content */}
        <div className="p-4 space-y-3 bg-spirit-900">
          {/* Breadcrumb */}
          <p className="text-spirit-600 text-xs">Sermons › Foundations › Renewed Strength</p>

          {/* Player card */}
          <div className="bg-spirit-800 border border-spirit-700 rounded-xl p-4 space-y-4">
            {/* Title area */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0">
                <span className="font-display text-gold-400 text-2xl italic">✦</span>
              </div>
              <div>
                <p className="text-spirit-100 font-medium text-sm">Renewed Strength</p>
                <p className="text-spirit-400 text-xs">Pastor James Adeyemi · Foundations</p>
                <p className="text-gold-500/70 text-xs italic mt-0.5">Isaiah 40:31</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-1 bg-spirit-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-spirit-600">
                <span>{mins}:{String(secs).padStart(2, '0')}</span>
                <span>52:04</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-5">
              <button className="text-spirit-400 hover:text-spirit-200 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M19 20L9 12l10-8v16z"/><path d="M5 4v16" strokeLinecap="round"/>
                </svg>
              </button>
              <button
                onClick={() => setPlaying(p => !p)}
                className="w-10 h-10 rounded-full bg-gold-500 hover:bg-gold-400 flex items-center justify-center transition-all active:scale-95"
              >
                {playing ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-spirit-900" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-spirit-900 ml-0.5" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
              </button>
              <button className="text-spirit-400 hover:text-spirit-200 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M5 4l10 8-10 8V4z"/><path d="M19 4v16" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Streak + XP strip */}
          <div className="flex gap-2">
            <div className="flex-1 bg-spirit-800 border border-spirit-700 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <span className="text-base">🔥</span>
              <div>
                <p className="text-flame-400 font-mono font-medium text-sm leading-none">14</p>
                <p className="text-spirit-600 text-xs mt-0.5">day streak</p>
              </div>
            </div>
            <div className="flex-1 bg-spirit-800 border border-spirit-700 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <span className="text-gold-400 font-display text-base">✦</span>
              <div>
                <p className="text-gold-400 font-mono font-medium text-sm leading-none">2,480</p>
                <p className="text-spirit-600 text-xs mt-0.5">XP earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating player bar hint */}
      <div className="absolute -bottom-4 inset-x-4 bg-spirit-900 border border-spirit-700 rounded-xl px-3 py-2 flex items-center gap-3 shadow-lg">
        <div className="w-6 h-6 rounded-md bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
          <span className="font-display text-gold-400 text-xs italic">✦</span>
        </div>
        <p className="text-spirit-400 text-xs flex-1 truncate">Renewed Strength · Pastor James Adeyemi</p>
        <div className="flex gap-1 items-end h-3 opacity-60">
          {[3, 5, 8, 5, 3].map((h, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full bg-gold-400"
              style={{
                height: `${h}px`,
                animation: `waveBar ${0.7 + i * 0.1}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.07}s`,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes waveBar {
            from { transform: scaleY(0.4); }
            to   { transform: scaleY(1); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default function AppMockupSection() {
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

  return (
    <section className="relative py-24 lg:py-32 bg-spirit-900 overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div ref={ref} className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>

          {/* Left: mockup */}
          <div className="relative pb-8">
            <BrowserMockup />
          </div>

          {/* Right: copy + stats */}
          <div className="space-y-8 lg:pl-8">
            <div>
              <p className="text-gold-500/70 text-xs uppercase tracking-[0.2em] mb-4">The experience</p>
              <h2 className="font-display text-[clamp(1.8rem,3vw,2.8rem)] text-spirit-100 italic leading-tight mb-4">
                Sermon player, streak counter,
                <br />
                <span className="text-gold-400">all in one flow.</span>
              </h2>
              <p className="text-spirit-400 text-sm leading-relaxed">
                The floating player follows you everywhere — switch pages, browse sermons, check the leaderboard. Your audio never stops.
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {STATS.map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-spirit-800/60 border border-spirit-700/60 rounded-xl p-4"
                >
                  <p className="font-display text-2xl text-gold-400 italic leading-none">{value}</p>
                  <p className="text-spirit-500 text-xs mt-1.5 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            <ul className="space-y-3 text-sm text-spirit-400">
              {[
                'Floating player bar persists across every page',
                'Lock screen controls via MediaSession API',
                'Progress saved automatically every 15 seconds',
                'Resume right where you left off, on any device',
              ].map(text => (
                <li key={text} className="flex items-center gap-2.5">
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-gold-500 shrink-0" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 8l4 4 6-7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

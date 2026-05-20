import { useRef, useEffect, useState } from 'react'

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.6}>
        <path d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Sermon library',
    description: 'Thousands of sermons from global leaders, searchable by speaker, topic, or scripture — all in one place.',
    accent: 'gold',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.6}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Streak system',
    description: 'Build habits that stick. Your streak counter tracks daily listening — miss a day and your freeze kicks in.',
    accent: 'flame',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.6}>
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'WordLookUp',
    description: 'Hear a scripture reference while listening? Tap once — the full passage appears instantly, in your version.',
    accent: 'spirit',
    highlight: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.6}>
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Series',
    description: 'Follow a preacher\'s sermon series from start to finish. Up next always knows where you left off.',
    accent: 'gold',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.6}>
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Leaderboard',
    description: 'Earn XP for every sermon completed. Compete weekly or build a quiet all-time record at your own pace.',
    accent: 'gold',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.6}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Mobile player',
    description: 'Pick up where you left off from any device. Lock screen controls, background play, and offline caching.',
    accent: 'spirit',
  },
]

const ACCENT_CLASSES = {
  gold: 'bg-gold-500/10 border-gold-500/20 text-gold-400',
  flame: 'bg-flame-500/10 border-flame-500/20 text-flame-400',
  spirit: 'bg-spirit-500/10 border-spirit-500/20 text-spirit-300',
}

function FeatureCard({ feature, index }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`relative group p-6 rounded-2xl border transition-all duration-500 ${
        feature.highlight
          ? 'bg-gold-500/5 border-gold-500/25 hover:border-gold-500/50'
          : 'bg-spirit-800/60 border-spirit-700/60 hover:border-spirit-600'
      } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {feature.highlight && (
        <div className="absolute -top-px inset-x-6 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
      )}

      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 transition-all duration-200 group-hover:scale-105 ${ACCENT_CLASSES[feature.accent]}`}>
        {feature.icon}
      </div>

      <h3 className="font-display text-lg text-spirit-100 italic mb-2 flex items-center gap-2">
        {feature.title}
        {feature.highlight && (
          <span className="text-xs font-sans not-italic text-gold-500 bg-gold-500/10 border border-gold-500/20 px-2 py-0.5 rounded-full">
            new
          </span>
        )}
      </h3>
      <p className="text-spirit-400 text-sm leading-relaxed">{feature.description}</p>
    </div>
  )
}

export default function FeaturesSection({ featuresRef }) {
  return (
    <section
      id="features"
      ref={featuresRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-spirit-900" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #C9A84C 0%, transparent 50%), radial-gradient(circle at 80% 50%, #5A7AA8 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-gold-500/70 text-xs uppercase tracking-[0.2em] mb-4">Everything you need</p>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-spirit-100 italic leading-tight">
            Built for the serious
            <br />
            <span className="text-gold-400">scripture listener</span>
          </h2>
          <p className="text-spirit-400 text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Every feature is designed around one goal: making it easier to spend meaningful time in the Word, every single day.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

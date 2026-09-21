import { Flame, Layers, Library, ScanSearch, Smartphone, Trophy } from 'lucide-react'
import { useReveal, revealClass, revealDelay } from '../useReveal'

const FEATURES = [
  {
    Icon: Library,
    title: 'Sermon library',
    description: 'Thousands of sermons from global leaders, searchable by speaker, topic, or scripture — all in one place.',
  },
  {
    Icon: Flame,
    title: 'Streak system',
    description: 'Build habits that stick. Your streak counter tracks daily listening — miss a day and your freeze kicks in.',
    flame: true,
  },
  {
    Icon: ScanSearch,
    title: 'WordLookUp',
    description: 'Hear a scripture reference while listening? Tap once — the full passage appears instantly, in your version.',
    highlight: true,
  },
  {
    Icon: Layers,
    title: 'Series',
    description: 'Follow a preacher\'s sermon series from start to finish. Up next always knows where you left off.',
  },
  {
    Icon: Trophy,
    title: 'Leaderboard',
    description: 'Earn XP for every sermon completed. Compete weekly or build a quiet all-time record at your own pace.',
  },
  {
    Icon: Smartphone,
    title: 'Mobile player',
    description: 'Pick up where you left off from any device. Lock screen controls, background play, and offline caching.',
  },
]

function FeatureCard({ feature }) {
  const { Icon } = feature
  return (
    <div className={`lp-card group relative h-full p-6 ${feature.highlight ? '!ring-blue-500/30' : ''}`}>
      {feature.highlight && (
        <div className="absolute -top-px inset-x-6 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
      )}
      <div
        className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105 ${
          feature.flame
            ? 'bg-flame-500/10 border-flame-500/20 text-flame-400'
            : 'bg-blue-500/10 border-blue-500/20 text-lp-accent-soft'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-medium tracking-tight text-lp-fg mb-2 flex items-center gap-2">
        {feature.title}
        {feature.highlight && (
          <span className="text-xs font-medium text-lp-accent-soft bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
            new
          </span>
        )}
      </h3>
      <p className="text-lp-fg/70 text-sm leading-relaxed">{feature.description}</p>
    </div>
  )
}

export default function FeaturesSection({ featuresRef }) {
  const [ref, visible] = useReveal()

  return (
    <section id="features" ref={featuresRef} className="relative py-24 lg:py-32 scroll-mt-16">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${revealClass(visible)}`}>
          <p className="lp-eyebrow mb-4">Everything you need</p>
          <h2 className="lp-h2">
            Built for the serious
            <br />
            <span className="text-lp-accent-soft">scripture listener</span>
          </h2>
          <p className="text-lp-fg/70 text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Every feature is designed around one goal: making it easier to spend meaningful time in the Word, every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <div key={feature.title} className={revealClass(visible)} style={revealDelay(i + 1)}>
              <FeatureCard feature={feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Check, Flame, Sparkles } from 'lucide-react'
import SeriesCard from './SeriesCard'
import { useReveal, revealClass, revealDelay } from '../useReveal'

const STATS = [
  { value: '2.4k+', label: 'Sermons' },
  { value: '18k+', label: 'Listeners worldwide' },
  { value: '365', label: 'Days of content' },
  { value: '92%', label: 'Streak retention' },
]

const POINTS = [
  'Floating player bar persists across every page',
  'Lock screen controls via MediaSession API',
  'Progress saved automatically every 15 seconds',
  'Resume right where you left off, on any device',
]

function StreakStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      <div className="lp-card px-4 py-3 flex items-center gap-3">
        <Flame className="w-5 h-5 text-flame-400" />
        <div>
          <p className="text-flame-400 font-mono font-medium text-sm leading-none">14</p>
          <p className="text-lp-fg/60 text-xs mt-1">day streak</p>
        </div>
      </div>
      <div className="lp-card px-4 py-3 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-lp-accent-soft" />
        <div>
          <p className="text-lp-accent-soft font-mono font-medium text-sm leading-none">2,480</p>
          <p className="text-lp-fg/60 text-xs mt-1">XP earned</p>
        </div>
      </div>
    </div>
  )
}

export default function AppMockupSection() {
  const [ref, visible] = useReveal()

  return (
    <section className="relative py-24 lg:py-32">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Visual */}
        <div className={`max-w-md w-full mx-auto ${revealClass(visible)}`}>
          <SeriesCard />
          <StreakStrip />
        </div>

        {/* Copy + stats */}
        <div className="space-y-8 lg:pl-8">
          <div className={revealClass(visible)} style={revealDelay(1)}>
            <p className="lp-eyebrow mb-4">The experience</p>
            <h2 className="lp-h2 mb-4">
              Sermon player, streak counter,
              <br />
              <span className="text-lp-accent-soft">all in one flow.</span>
            </h2>
            <p className="text-lp-fg/70 text-sm leading-relaxed">
              The floating player follows you everywhere — switch pages, browse sermons, check the leaderboard. Your audio never stops.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {STATS.map(({ value, label }, i) => (
              <div key={label} className={revealClass(visible)} style={revealDelay(i + 2)}>
                <div className="lp-card p-4 h-full">
                  <p className="text-2xl font-medium tracking-tight text-lp-fg leading-none">{value}</p>
                  <p className="text-lp-fg/60 text-xs mt-2 uppercase tracking-wider">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <ul className={`space-y-3 text-sm text-lp-fg/70 ${revealClass(visible)}`} style={revealDelay(6)}>
            {POINTS.map((text) => (
              <li key={text} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-lp-accent-soft shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

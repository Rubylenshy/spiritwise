import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import PlayerCard from './PlayerCard'
import { useReveal, revealClass, revealDelay, SHELL_STEP_MS } from '../useReveal'
import { useSessionCta } from '../useSessionCta'

const STATS = [
  { value: '2.4k+', label: 'Sermons' },
  { value: '18k+', label: 'Listeners' },
  { value: '365', label: 'Days of content' },
]

export default function HeroSection({ featuresRef }) {
  const [ref, visible] = useReveal({ immediate: true })
  const cta = useSessionCta({ label: 'Get started free', to: '/signup' })

  const handleWatchDemo = () => {
    featuresRef?.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Each block below is a "shell" staggered 80ms apart
  const shell = (i) => ({ className: revealClass(visible), style: revealDelay(i, SHELL_STEP_MS) })

  return (
    <section ref={ref} className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">

        {/* Copy */}
        <div className="text-center lg:text-left">
          <div {...shell(0)}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full lp-glass text-xs font-medium text-lp-fg/70">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Now with WordLookUp — find any scripture in seconds
            </span>
          </div>

          <h1
            {...shell(1)}
            className={`${revealClass(visible)} mt-8 font-light tracking-tighter leading-[1.02] text-lp-fg text-[clamp(2.75rem,6.5vw,5.25rem)]`}
          >
            Your daily
            <br />
            <span className="text-lp-accent-soft">scripture journey,</span>
            <br />
            elevated.
          </h1>

          <p
            {...shell(2)}
            className={`${revealClass(visible)} mt-6 text-lg text-lp-fg/70 leading-relaxed max-w-xl mx-auto lg:mx-0`}
          >
            Stream thousands of sermons, build unbreakable listening streaks, and
            look up any Bible passage the moment a preacher mentions it.
          </p>

          <div
            {...shell(3)}
            className={`${revealClass(visible)} mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3`}
          >
            <Link to={cta.to} className="lp-btn-primary group px-6 py-3 text-base w-full sm:w-auto">
              {cta.label}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button type="button" onClick={handleWatchDemo} className="lp-btn-glass px-6 py-3 text-base w-full sm:w-auto">
              <Play className="w-4 h-4" />
              Watch demo
            </button>
          </div>

          <div
            {...shell(4)}
            className={`${revealClass(visible)} mt-12 flex items-center justify-center lg:justify-start gap-6 sm:gap-8`}
          >
            {STATS.map(({ value, label }, i) => (
              <div key={label} className="flex items-center gap-6 sm:gap-8">
                {i > 0 && <div className="w-px h-8 bg-black/10 dark:bg-white/10" />}
                <div>
                  <p className="text-2xl font-medium tracking-tight text-lp-fg leading-none">{value}</p>
                  <p className="text-lp-fg/60 text-xs uppercase tracking-widest mt-1.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player */}
        <div {...shell(5)}>
          <PlayerCard className="max-w-md mx-auto lg:ml-auto lg:mr-0" />
        </div>
      </div>
    </section>
  )
}

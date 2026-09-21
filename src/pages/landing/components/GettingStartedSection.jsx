import { Link } from 'react-router-dom'
import { ArrowRight, Flame, Library, UserPlus } from 'lucide-react'
import { useReveal, revealClass, revealDelay } from '../useReveal'
import { useSessionCta } from '../useSessionCta'

const STEPS = [
  {
    number: '01',
    Icon: UserPlus,
    title: 'Create your account',
    description: 'Sign up in under 30 seconds. No credit card, no trial expiry — your library and streaks start immediately.',
  },
  {
    number: '02',
    Icon: Library,
    title: 'Browse the sermon library',
    description: 'Search by speaker, topic, or scripture. Follow a series, or discover something new from voices around the world.',
  },
  {
    number: '03',
    Icon: Flame,
    title: 'Build your streak',
    description: 'Listen daily, answer reflection questions, earn XP. At 7 days you unlock a streak freeze — so life can\'t break your momentum.',
    accent: true,
  },
]

/**
 * Layout:
 * - Mobile: vertical timeline — number column on the left (with a connector
 *   running down to the next step), step card on the right.
 * - Desktop: three-column grid (1fr | auto | 1fr) — number sits on the
 *   centre line, cards alternate left/right.
 */
export default function GettingStartedSection() {
  const [ref, visible] = useReveal()
  const cta = useSessionCta({ label: 'Start for free', to: '/signup' })

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <p className="text-[clamp(4rem,15vw,12rem)] font-light tracking-tighter text-lp-fg/[0.03] whitespace-nowrap">
          Start today
        </p>
      </div>

      <div ref={ref} className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${revealClass(visible)}`}>
          <p className="lp-eyebrow mb-4">Three steps</p>
          <h2 className="lp-h2">
            You&apos;re one minute away from
            <br />
            <span className="text-lp-accent-soft">your first sermon.</span>
          </h2>
        </div>

        <ol className="relative">
          {/* Desktop centre connector */}
          <div
            className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-7 bottom-7 w-px bg-gradient-to-b from-transparent via-black/15 dark:via-white/15 to-transparent"
            aria-hidden="true"
          />

          {STEPS.map((step, i) => {
            const onLeft = i % 2 === 0
            const isLast = i === STEPS.length - 1
            const { Icon } = step
            const tone = step.accent
              ? { ring: 'border-flame-500/40', text: 'text-flame-400', chip: 'bg-flame-500/10 border-flame-500/20 text-flame-400' }
              : { ring: 'border-blue-500/40', text: 'text-lp-accent-soft', chip: 'bg-blue-500/10 border-blue-500/20 text-lp-accent-soft' }

            return (
              <li
                key={step.number}
                className={`relative grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-10 lg:items-center ${
                  isLast ? '' : 'pb-8 lg:pb-14'
                } ${revealClass(visible)}`}
                style={revealDelay(i + 1, 150)}
              >
                {/* Mobile connector — from this number down to the next */}
                {!isLast && (
                  <div
                    className="lg:hidden absolute left-6 top-12 bottom-0 w-px -translate-x-1/2 bg-black/10 dark:bg-white/10"
                    aria-hidden="true"
                  />
                )}

                {/* Step number */}
                <div
                  className={`col-start-1 row-start-1 lg:col-start-2 relative z-10 w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 bg-lp-bg flex items-center justify-center ${tone.ring}`}
                >
                  <span className={`text-sm lg:text-base font-medium font-mono ${tone.text}`}>{step.number}</span>
                </div>

                {/* Step card */}
                <div className={`col-start-2 row-start-1 min-w-0 ${onLeft ? 'lg:col-start-1' : 'lg:col-start-3'}`}>
                  <div className={`lp-card p-5 sm:p-6 ${onLeft ? 'lg:text-right' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${tone.chip} ${onLeft ? 'lg:ml-auto' : ''}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-medium tracking-tight text-lp-fg mb-2">{step.title}</h3>
                    <p className="text-lp-fg/70 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <div className={`text-center mt-16 ${revealClass(visible)}`} style={revealDelay(5)}>
          <Link to={cta.to} className="lp-btn-primary group px-8 py-4 text-base rounded-2xl">
            {cta.label}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          {!cta.isAuthenticated && (
            <p className="text-lp-fg/60 text-xs mt-3">No credit card · No trial cutoff · Start in 30 seconds</p>
          )}
        </div>
      </div>
    </section>
  )
}

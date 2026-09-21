import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import useAuthStore from '../../../store/authStore'
import { useReveal, revealClass, revealDelay } from '../useReveal'

const PLANS = [
  {
    name: 'Free',
    price: '0',
    tagline: 'Everything you need to start.',
    features: [
      'Unlimited sermons & series',
      'Daily streak tracking',
      'XP + leaderboard',
      'WordLookUp (basic)',
      'Reflection questions',
      'All Bible versions',
    ],
    cta: 'Get started free',
    ctaTo: '/signup',
    signedInCta: 'Go to your library',
    signedInTo: '/home',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '4',
    period: '/mo',
    tagline: 'For the dedicated daily listener.',
    features: [
      'Everything in Free',
      'Offline sermon caching',
      'Push notifications',
      'Priority scripture AI',
      'Saved verse collection',
      'Early access to new features',
    ],
    cta: 'Start Pro free for 14 days',
    ctaTo: '/signup?plan=pro',
    // No billing flow yet — signed-in users land on their profile
    signedInCta: 'Upgrade to Pro',
    signedInTo: '/profile',
    highlight: true,
    badge: 'Most popular',
  },
]

export default function PricingSection() {
  const [ref, visible] = useReveal()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <section id="pricing" className="relative py-24 lg:py-32 scroll-mt-16">
      <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 ${revealClass(visible)}`}>
          <p className="lp-eyebrow mb-4">Pricing</p>
          <h2 className="lp-h2">
            Simple, honest pricing.
            <br />
            <span className="text-lp-accent-soft">Free forever if you want.</span>
          </h2>
          <p className="text-lp-fg/70 text-sm mt-4 max-w-xl mx-auto">
            The full sermon library, streaks, and WordLookUp are free — no credit card, no trial cutoff.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <div key={plan.name} className={revealClass(visible)} style={revealDelay(i + 1)}>
              <div className={`lp-card relative h-full p-7 flex flex-col ${plan.highlight ? '!ring-blue-500/40' : ''}`}>
                {plan.highlight && (
                  <div className="absolute -top-px inset-x-8 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
                )}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-medium text-white bg-blue-500 px-3 py-1 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-4xl font-light tracking-tighter ${plan.highlight ? 'text-lp-accent-soft' : 'text-lp-fg'}`}>
                      {plan.price === '0' ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.period && <span className="text-lp-fg/60 text-sm">{plan.period}</span>}
                  </div>
                  <p className="text-lp-fg/70 text-sm">{plan.tagline}</p>
                </div>

                <ul className="flex-1 space-y-3 mb-7">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-lp-fg/70">
                      <Check className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-lp-accent-soft' : 'text-lp-fg/60'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={isAuthenticated ? plan.signedInTo : plan.ctaTo}
                  className={`${plan.highlight ? 'lp-btn-primary' : 'lp-btn-glass'} w-full py-3`}
                >
                  {isAuthenticated ? plan.signedInCta : plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className={`text-center text-lp-fg/60 text-xs mt-8 ${revealClass(visible)}`} style={revealDelay(3)}>
          No credit card required for Free plan. Pro billed monthly, cancel anytime.
        </p>
      </div>
    </section>
  )
}

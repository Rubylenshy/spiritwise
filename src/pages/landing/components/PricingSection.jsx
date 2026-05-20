import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

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
    highlight: true,
    badge: 'Most popular',
  },
]

export default function PricingSection() {
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
    <section id="pricing" className="relative py-24 lg:py-32 bg-spirit-800/20 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #C9A84C 0%, transparent 70%)' }}
      />

      <div ref={ref} className="relative max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0 translate-y-6'}`}>
          <p className="text-gold-500/70 text-xs uppercase tracking-[0.2em] mb-4">Pricing</p>
          <h2 className="font-display text-[clamp(2rem,3.5vw,3rem)] text-spirit-100 italic leading-tight">
            Simple, honest pricing.
            <br />
            <span className="text-gold-400">Free forever if you want.</span>
          </h2>
          <p className="text-spirit-400 text-sm mt-4 max-w-xl mx-auto">
            The full sermon library, streaks, and WordLookUp are free — no credit card, no trial cutoff.
          </p>
        </div>

        {/* Plan cards */}
        <div className={`grid md:grid-cols-2 gap-5 max-w-3xl mx-auto transition-all duration-700 delay-150 ${visible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 flex flex-col ${
                plan.highlight
                  ? 'bg-spirit-800 border border-gold-500/30'
                  : 'bg-spirit-800/50 border border-spirit-700'
              }`}
            >
              {/* Top highlight line */}
              {plan.highlight && (
                <div className="absolute -top-px inset-x-8 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
              )}

              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-medium text-spirit-900 bg-gold-500 px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`font-display text-4xl italic ${plan.highlight ? 'text-gold-400' : 'text-spirit-200'}`}>
                    {plan.price === '0' ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-spirit-500 text-sm">{plan.period}</span>
                  )}
                </div>
                <p className="text-spirit-400 text-sm">{plan.tagline}</p>
              </div>

              <ul className="flex-1 space-y-3 mb-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-spirit-300">
                    <svg viewBox="0 0 16 16" fill="none" className={`w-3.5 h-3.5 shrink-0 ${plan.highlight ? 'text-gold-500' : 'text-spirit-500'}`} stroke="currentColor" strokeWidth={2.2}>
                      <path d="M3 8l4 4 6-7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaTo}
                className={`w-full text-center py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                  plan.highlight
                    ? 'bg-gold-500 hover:bg-gold-400 text-spirit-900 shadow-lg shadow-gold-500/20'
                    : 'border border-spirit-600 hover:border-spirit-500 text-spirit-300 hover:text-spirit-100'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Fine print */}
        <p className={`text-center text-spirit-600 text-xs mt-8 transition-all duration-700 delay-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          No credit card required for Free plan. Pro billed monthly, cancel anytime.
        </p>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Sign up in under 30 seconds. No credit card, no trial expiry — your library and streaks start immediately.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.6}>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Browse the sermon library',
    description: 'Search by speaker, topic, or scripture. Follow a series, or discover something new from voices around the world.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.6}>
        <path d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Build your streak',
    description: 'Listen daily, answer reflection questions, earn XP. At 7 days you unlock a streak freeze — so life can\'t break your momentum.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-flame-400" stroke="currentColor" strokeWidth={1.6}>
        <path d="M12 2c0 6-8 8-8 14a8 8 0 1016 0c0-6-8-8-8-14z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22c-2.8 0-4-1.6-4-3.5s1.2-3.5 4-5c2.8 1.5 4 3.1 4 5s-1.2 3.5-4 3.5z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: true,
  },
]

export default function GettingStartedSection() {
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
    <section className="relative py-24 lg:py-32 bg-spirit-800/10 overflow-hidden">
      {/* Background quote watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.02]"
        aria-hidden="true"
      >
        <p className="font-display text-[clamp(4rem,15vw,12rem)] text-spirit-100 italic whitespace-nowrap">
          Start today
        </p>
      </div>

      <div ref={ref} className="relative max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0 translate-y-6'}`}>
          <p className="text-gold-500/70 text-xs uppercase tracking-[0.2em] mb-4">Three steps</p>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-spirit-100 italic leading-tight">
            You're one minute away from
            <br />
            <span className="text-gold-400">your first sermon.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line — desktop */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-px top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-spirit-700 to-transparent" />

          <div className="space-y-8 lg:space-y-0">
            {STEPS.map((step, i) => {
              const isEven = i % 2 === 0
              return (
                <div
                  key={step.number}
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center transition-all duration-700 ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  } lg:mb-16`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {/* Content — alternates sides on desktop */}
                  <div className={`flex flex-col justify-center ${isEven ? 'lg:text-right lg:pr-8' : 'lg:order-2 lg:pl-8'}`}>
                    <div className={`flex items-center gap-3 mb-3 ${isEven ? 'lg:justify-end' : ''}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        step.accent
                          ? 'bg-flame-500/10 border border-flame-500/20 text-flame-400'
                          : 'bg-gold-500/10 border border-gold-500/20 text-gold-400'
                      } ${isEven ? 'lg:order-2' : ''}`}>
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="font-display text-2xl text-spirit-100 italic mb-2">{step.title}</h3>
                    <p className="text-spirit-400 text-sm leading-relaxed max-w-xs lg:max-w-none">
                      {step.description}
                    </p>
                  </div>

                  {/* Step number circle — center for desktop */}
                  <div className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center ${isEven ? '' : ''}`}>
                    <div className={`w-14 h-14 rounded-full bg-spirit-900 border-2 flex items-center justify-center ${
                      step.accent ? 'border-flame-500/40' : 'border-gold-500/40'
                    }`}>
                      <span className={`font-display text-lg italic ${step.accent ? 'text-flame-400' : 'text-gold-400'}`}>
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Mobile step number */}
                  <div className={`lg:hidden flex items-center gap-3 mb-4 mt-8 ${i === 0 ? 'mt-0' : ''}`}>
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      step.accent ? 'border-flame-500/40 bg-flame-500/5' : 'border-gold-500/40 bg-gold-500/5'
                    }`}>
                      <span className={`font-display text-sm italic ${step.accent ? 'text-flame-400' : 'text-gold-400'}`}>
                        {step.number}
                      </span>
                    </div>
                    <div className="h-px flex-1 bg-spirit-800" />
                  </div>

                  {/* Empty column for alternating layout */}
                  {isEven && <div className="hidden lg:block" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className={`text-center mt-16 transition-all duration-700 delay-500 ${visible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-spirit-900 font-medium rounded-2xl text-base transition-all duration-200 active:scale-95 shadow-lg shadow-gold-500/20 hover:shadow-gold-400/30"
          >
            Start for free
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8}>
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <p className="text-spirit-600 text-xs mt-3">No credit card · No trial cutoff · Start in 30 seconds</p>
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

function AudioWaveform() {
  // Animated bars mimicking an audio waveform
  const bars = [4, 7, 12, 18, 24, 30, 24, 30, 18, 24, 30, 24, 18, 12, 7, 4]

  return (
    <div className="flex items-end justify-center gap-0.5 h-10 opacity-30">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-gold-400"
          style={{
            height: `${h}px`,
            animation: `landingWave ${0.8 + i * 0.1}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </div>
  )
}

function GoldGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Central gold glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(ellipse, #C9A84C 0%, transparent 70%)',
        }}
      />
      {/* Top-right accent */}
      <div
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(ellipse, #C9A84C 0%, transparent 70%)',
        }}
      />
      {/* Bottom-left accent */}
      <div
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-[0.03]"
        style={{
          background: 'radial-gradient(ellipse, #8DA8CC 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

export default function HeroSection({ featuresRef }) {
  const handleWatchDemo = () => {
    featuresRef?.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-spirit-900">
      {/* Background glow effects */}
      <GoldGlow />

      {/* Decorative background scripture text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <p
          className="font-display text-[clamp(3rem,10vw,9rem)] text-spirit-800/40 italic leading-tight text-center px-8 whitespace-nowrap"
          style={{ letterSpacing: '-0.02em' }}
        >
          "Thy word is a lamp"
        </p>
      </div>

      {/* Grid overlay - very subtle */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 pt-32 pb-20 text-center">

        {/* Eyebrow pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/25 bg-gold-500/8 text-gold-400 text-xs font-medium tracking-wider uppercase mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
          Now with WordLookUp — find any scripture in seconds
        </div>

        {/* Headline */}
        <h1
          className="font-display text-[clamp(2.8rem,7vw,6rem)] text-spirit-100 italic leading-[1.08] tracking-tight mb-6 animate-slide-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          Your daily
          <br />
          <span className="text-gold-400">scripture journey,</span>
          <br />
          elevated.
        </h1>

        {/* Subheadline */}
        <p
          className="text-spirit-400 text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto mb-10 animate-slide-up"
          style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          Stream thousands of sermons, build unbreakable listening streaks, and
          look up any Bible passage the moment a preacher mentions it.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          <Link
            to="/signup"
            className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 bg-gold-500 hover:bg-gold-400 text-spirit-900 font-medium rounded-2xl text-base transition-all duration-200 active:scale-95 shadow-lg shadow-gold-500/20 hover:shadow-gold-400/30"
          >
            Get started free
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" stroke="currentColor" strokeWidth={1.8}>
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <button
            onClick={handleWatchDemo}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 border border-spirit-700 hover:border-spirit-500 text-spirit-300 hover:text-spirit-100 font-medium rounded-2xl text-base transition-all duration-200 active:scale-95"
          >
            <span className="w-8 h-8 rounded-full border border-spirit-600 flex items-center justify-center">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 ml-0.5" fill="currentColor">
                <polygon points="4 2 14 8 4 14 4 2"/>
              </svg>
            </span>
            Watch demo
          </button>
        </div>

        {/* Waveform + stat strip */}
        <div
          className="mt-16 animate-slide-up"
          style={{ animationDelay: '0.45s', animationFillMode: 'both' }}
        >
          <AudioWaveform />

          <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
            {[
              { value: '2.4k+', label: 'Sermons' },
              { value: '18k+', label: 'Listeners' },
              { value: '365', label: 'Days of content' },
            ].map(({ value, label }, i) => (
              <div key={label} className="flex items-center gap-8">
                {i > 0 && <div className="w-px h-6 bg-spirit-700" />}
                <div className="text-center">
                  <p className="font-display text-2xl text-gold-400 leading-none">{value}</p>
                  <p className="text-spirit-500 text-xs uppercase tracking-widest mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in"
          style={{ animationDelay: '1s', animationFillMode: 'both' }}
        >
          <p className="text-spirit-600 text-xs uppercase tracking-widest">Scroll to explore</p>
          <div className="w-5 h-8 border border-spirit-700 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-gold-500/60 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* Wave/gradient bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #0B0F1A)',
        }}
      />

      {/* Keyframe for waveform animation — injected via style tag */}
      <style>{`
        @keyframes landingWave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </section>
  )
}

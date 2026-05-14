import { useRef } from 'react'
import LandingNav from './components/LandingNav'
import HeroSection from './components/HeroSection'

/**
 * LandingPage — public, no RootLayout.
 * Has its own full-width layout: no sidebar, no bottom nav, no floating player.
 * Sections will be added progressively through LP2–LP3.
 */
export default function LandingPage() {
  // Ref for smooth-scroll from hero "Watch demo" CTA
  const featuresRef = useRef(null)

  return (
    <div className="min-h-screen bg-spirit-900 text-spirit-100">
      <LandingNav />

      {/* ── Hero (LP1) ─────────────────────────────────────── */}
      <HeroSection featuresRef={featuresRef} />

      {/* ── Features section stub (LP2) ──────────────────────
          Will be replaced in LP2 with full features + WordLookUp spotlight */}
      <section
        id="features"
        ref={featuresRef}
        className="max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center"
      >
        <p className="font-display text-3xl text-spirit-400 italic">
          Features section coming in LP2 ✦
        </p>
      </section>

      {/* ── Leaders stub (LP3) ───────────────────────────────── */}
      <section id="leaders" className="py-8" />

      {/* ── Pricing stub (LP3) ───────────────────────────────── */}
      <section id="pricing" className="py-8" />
    </div>
  )
}

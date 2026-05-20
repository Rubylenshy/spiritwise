import { useRef } from 'react'

// LP1 — already built
import LandingNav from './components/LandingNav'
import HeroSection from './components/HeroSection'

// LP2 — features + WordLookUp spotlight + app mockup + pricing
import FeaturesSection from './components/FeaturesSection'
import WordLookUpSpotlight from './components/WordLookUpSpotlight'
import AppMockupSection from './components/AppMockupSection'
import PricingSection from './components/PricingSection'

// LP3 — leaders + getting started + footer
import LeadersSection from './components/LeadersSection'
import GettingStartedSection from './components/GettingStartedSection'
import LandingFooter from './components/LandingFooter'

/**
 * LandingPage — public, no RootLayout.
 * No sidebar, no bottom nav, no floating player.
 *
 * Sections:
 *   LP1: Navbar + Hero
 *   LP2: Features · WordLookUp spotlight · App mockup · Pricing
 *   LP3: Leaders · Getting Started · Footer
 *   LP4: /wordlookup route shell (separate page)
 */
export default function LandingPage() {
  // Ref for smooth-scroll from hero "Watch demo" CTA → features section
  const featuresRef = useRef(null)

  return (
    <div className="min-h-screen bg-spirit-900 text-spirit-100">
      {/* ── LP1: Navbar ─────────────────────────────────────── */}
      <LandingNav />

      {/* ── LP1: Hero ───────────────────────────────────────── */}
      <HeroSection featuresRef={featuresRef} />

      {/* ── LP2: Features grid ──────────────────────────────── */}
      <FeaturesSection featuresRef={featuresRef} />

      {/* ── LP2: WordLookUp product spotlight ───────────────── */}
      <WordLookUpSpotlight />

      {/* ── LP2: App mockup / demo visual ───────────────────── */}
      <AppMockupSection />

      {/* ── LP3: World gospel leaders ───────────────────────── */}
      <LeadersSection />

      {/* ── LP2: Pricing ────────────────────────────────────── */}
      {/*
        Pricing sits after leaders so the value is clear before
        the ask — the leader library justifies even the free tier.
      */}
      <PricingSection />

      {/* ── LP3: Getting started ────────────────────────────── */}
      <GettingStartedSection />

      {/* ── LP3: Footer ─────────────────────────────────────── */}
      <LandingFooter />
    </div>
  )
}

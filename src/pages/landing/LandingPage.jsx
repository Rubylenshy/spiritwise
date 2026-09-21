import { useRef } from 'react'

import VideoBackground from '../../components/VideoBackground'
import LandingNav from './components/LandingNav'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import WordLookUpSpotlight from './components/WordLookUpSpotlight'
import AppMockupSection from './components/AppMockupSection'
import LeadersSection from './components/LeadersSection'
import PricingSection from './components/PricingSection'
import GettingStartedSection from './components/GettingStartedSection'
import LandingFooter from './components/LandingFooter'

/**
 * LandingPage — public, no RootLayout (no sidebar, bottom nav or floating player).
 *
 * Design: glass cards over a fixed looping video, Inter type, blue accent,
 * light/dark via ThemeContext (the only page that uses `dark:` variants).
 * Layer stack: video (fixed, z-[-10]) → sticky header (z-30) → main (z-10).
 * Signed-in visitors see their profile menu and "Go to your library" CTAs.
 */
export default function LandingPage() {
  // Ref for smooth-scroll from hero "Watch demo" CTA → features section
  const featuresRef = useRef(null)

  return (
    <div className="isolate min-h-screen flex flex-col font-inter text-lp-fg antialiased selection:bg-indigo-500/30 dark:selection:bg-indigo-500/60">
      <VideoBackground />
      <LandingNav />

      <main className="flex-1 relative z-10">
        <HeroSection featuresRef={featuresRef} />
        <FeaturesSection featuresRef={featuresRef} />
        <WordLookUpSpotlight />
        <AppMockupSection />
        <LeadersSection />
        {/* Pricing after leaders so the value is clear before the ask */}
        <PricingSection />
        <GettingStartedSection />
      </main>

      <LandingFooter />
    </div>
  )
}

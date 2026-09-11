import { useRef } from 'react'
import { AnalysisSection } from './landing/sections/AnalysisSection'
import { BridgeSection } from './landing/sections/BridgeSection'
import { ClaritySection } from './landing/sections/ClaritySection'
import { HeroSection } from './landing/sections/HeroSection'
import { LandingFooter } from './landing/sections/LandingFooter'
import { LandingHeader } from './landing/sections/LandingHeader'
import { WidgetsSection } from './landing/sections/WidgetsSection'
import { useGsapLandingMotion } from './landing/useGsapLandingMotion'

export function App() {
  const shellRef = useRef<HTMLElement>(null)

  useGsapLandingMotion(shellRef)

  return (
    <main ref={shellRef} className="site-shell">
      <LandingHeader />
      <HeroSection />
      <ClaritySection />
      <AnalysisSection />
      <WidgetsSection />
      <BridgeSection />
      <LandingFooter />
    </main>
  )
}

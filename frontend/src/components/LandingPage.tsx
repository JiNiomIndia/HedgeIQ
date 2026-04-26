/**
 * LandingPage — public marketing page for HedgeIQ.
 * Composed from focused sub-components in ./landing/.
 * Story: built from a real $2,355 AAL loss; production-grade tooling.
 *
 * Theming: the landing page inherits CSS variables from the unified theme
 * system (frontend/src/styles/theme.css). On mount we apply the user's
 * stored theme (default 'midnight') to <html data-theme>. The theme
 * switcher in the navbar updates this at runtime.
 * @component
 */
import { useEffect } from 'react';

import BentoGrid from './landing/BentoGrid';
import FAQAccordion from './landing/FAQAccordion';
import FinalCTA from './landing/FinalCTA';
import Footer from './landing/Footer';
import Hero from './landing/Hero';
import LiveDemoCard from './landing/LiveDemoCard';
import Navbar from './landing/Navbar';
import Pricing from './landing/Pricing';
import ProblemSolutionSplit from './landing/ProblemSolutionSplit';
import Testimonial from './landing/Testimonial';
import TechStack from './landing/TechStack';
import TrustStrip from './landing/TrustStrip';
import TrustSecurity from './landing/TrustSecurity';
import ExplainerVideo from './landing/ExplainerVideo';
import WorkflowShowcase from './landing/WorkflowShowcase';

import './landing/landing.css';

const VALID_THEMES = ['midnight', 'meridian', 'lumen', 'terminal'] as const;

export default function LandingPage() {
  // Override the app's body overflow:hidden so the marketing page can scroll naturally.
  // Apply the unified theme (default: midnight) so the landing inherits from
  // theme.css instead of carrying hardcoded inline overrides.
  useEffect(() => {
    document.documentElement.classList.add('landing-html');
    document.body.classList.add('landing-body');

    let stored: string | null = null;
    try {
      stored = localStorage.getItem('hedgeiq_theme');
      if (!stored) {
        const legacy = localStorage.getItem('hedgeiq_wiki_theme');
        if (legacy) {
          localStorage.setItem('hedgeiq_theme', legacy);
          localStorage.removeItem('hedgeiq_wiki_theme');
          stored = legacy;
        }
      }
    } catch {
      /* ignore */
    }
    const theme = stored && (VALID_THEMES as readonly string[]).includes(stored) ? stored : 'midnight';
    document.documentElement.setAttribute('data-theme', theme);

    return () => {
      document.documentElement.classList.remove('landing-html');
      document.body.classList.remove('landing-body');
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Navbar />
      <main>
        <Hero />
        <ExplainerVideo />
        <TrustStrip />
        <ProblemSolutionSplit />
        <BentoGrid />
        <WorkflowShowcase />
        <TrustSecurity />
        <Pricing />
        <LiveDemoCard />
        <TechStack />
        <Testimonial />
        <FAQAccordion />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

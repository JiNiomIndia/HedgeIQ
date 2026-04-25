/**
 * LandingPage — public marketing page for HedgeIQ.
 * Composed from focused sub-components in ./landing/.
 * Story: built from a real $2,355 AAL loss; production-grade tooling.
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

export default function LandingPage() {
  // Override the app's body overflow:hidden so the marketing page can scroll naturally.
  useEffect(() => {
    document.documentElement.classList.add('landing-html');
    document.body.classList.add('landing-body');
    return () => {
      document.documentElement.classList.remove('landing-html');
      document.body.classList.remove('landing-body');
    };
  }, []);

  return (
    <div
      style={{
        // Dark-mode CSS variable overrides scoped to the landing page only.
        ['--bg' as string]: '#0A0E1A',
        ['--surface' as string]: '#11172A',
        ['--surface-2' as string]: '#1A2236',
        ['--surface-sunken' as string]: '#0B1220',
        ['--text' as string]: '#F8FAFC',
        ['--text-muted' as string]: '#94A3B8',
        ['--text-subtle' as string]: '#64748B',
        ['--accent' as string]: '#8B5CF6',
        ['--accent-2' as string]: '#6366F1',
        ['--accent-contrast' as string]: '#FFFFFF',
        ['--border' as string]: '#1E293B',
        ['--border-strong' as string]: '#334155',
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-sans)',
      } as React.CSSProperties}
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

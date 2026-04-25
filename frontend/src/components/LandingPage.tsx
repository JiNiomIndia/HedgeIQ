/**
 * LandingPage — public marketing page for HedgeIQ.
 * Composed from focused sub-components in ./landing/.
 * Story: built from a real $2,355 AAL loss; production-grade tooling.
 * @component
 */
import { useEffect } from 'react';

import FAQAccordion from './landing/FAQAccordion';
import FeatureGrid from './landing/FeatureGrid';
import FinalCTA from './landing/FinalCTA';
import Footer from './landing/Footer';
import Hero from './landing/Hero';
import HowItWorks from './landing/HowItWorks';
import LiveDemoCard from './landing/LiveDemoCard';
import Navbar from './landing/Navbar';
import ProblemSolutionSplit from './landing/ProblemSolutionSplit';
import Testimonial from './landing/Testimonial';
import TechStack from './landing/TechStack';
import TrustStrip from './landing/TrustStrip';

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <ProblemSolutionSplit />
        <FeatureGrid />
        <HowItWorks />
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

/**
 * LandingPage component tests.
 * Verifies hero, primary CTAs to /login, feature cards (>=6), FAQ (8 items), and core sections.
 */
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import LandingPage from '../components/LandingPage';



beforeAll(() => {
  // Stub matchMedia for the carousel's prefers-reduced-motion check.
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (q: string) => ({
        matches: false, media: q, onchange: null,
        addListener: () => {}, removeListener: () => {},
        addEventListener: () => {}, removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
});

describe('LandingPage', () => {
  it('renders the hero h1', () => {
    render(<LandingPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(/Hedge your portfolio at midnight/i);
  });

  it('primary "Get started" CTA links to /login', () => {
    render(<LandingPage />);
    const ctas = screen.getAllByRole('link', { name: /get started/i });
    expect(ctas.length).toBeGreaterThanOrEqual(1);
    ctas.forEach(cta => expect(cta).toHaveAttribute('href', '/login'));
  });

  it('renders at least 6 feature cards', () => {
    render(<LandingPage />);
    const titles = [
      /Unified portfolio dashboard/i,
      /Smart hedge calculator/i,
      /Plain-English AI advisor/i,
      /Real-time options chain/i,
      /Smart caching/i,
      /Production-grade security/i,
    ];
    titles.forEach(t => expect(screen.getByText(t)).toBeInTheDocument());
    const featuresSection = document.getElementById('features');
    expect(featuresSection?.querySelectorAll('article').length).toBeGreaterThanOrEqual(6);
  });

  it('FAQ section has exactly 8 questions', () => {
    render(<LandingPage />);
    const faq = document.getElementById('faq');
    expect(faq).not.toBeNull();
    const items = faq!.querySelectorAll('details');
    expect(items.length).toBe(8);
  });

  it('renders the founder testimonial', () => {
    render(<LandingPage />);
    expect(screen.getByText(/I lost \$2,355/i)).toBeInTheDocument();
  });

  it('renders the AAL position context (problem section)', () => {
    render(<LandingPage />);
    expect(screen.getByText(/5,000 shares of AAL/i)).toBeInTheDocument();
  });

  it('renders sticky navbar with HedgeIQ wordmark', () => {
    render(<LandingPage />);
    // Wordmark appears in navbar and footer; both are <a> with HedgeIQ text
    const marks = screen.getAllByText('HedgeIQ');
    expect(marks.length).toBeGreaterThanOrEqual(2);
  });

  it('navbar Sign in link points to /login', () => {
    render(<LandingPage />);
    const signIn = screen.getByRole('link', { name: /sign in/i });
    expect(signIn).toHaveAttribute('href', '/login');
  });

  it('renders all anchor sections (#features, #how, #pricing, #faq)', () => {
    render(<LandingPage />);
    ['features', 'how', 'pricing', 'faq'].forEach(id => {
      expect(document.getElementById(id)).not.toBeNull();
    });
  });

  it('final CTA includes a docs link to /wiki', () => {
    render(<LandingPage />);
    const docs = screen.getByRole('link', { name: /read the docs/i });
    expect(docs).toHaveAttribute('href', '/wiki');
  });

  it('hero carousel exposes a region landmark', () => {
    render(<LandingPage />);
    // Carousel is wrapped in a region with aria-label
    const region = screen.getByRole('region', { name: /carousel/i });
    expect(region).toBeInTheDocument();
    // Has prev/next controls
    expect(within(region).getByRole('button', { name: /next slide/i })).toBeInTheDocument();
    expect(within(region).getByRole('button', { name: /previous slide/i })).toBeInTheDocument();
  });
});

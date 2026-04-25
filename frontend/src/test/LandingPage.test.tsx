/**
 * LandingPage component tests.
 * Verifies hero, primary CTAs to /login, feature cards (>=6), FAQ (8 items), and core sections.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeAll } from 'vitest';
import LandingPage from '../components/LandingPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

beforeAll(() => {
  // Stub matchMedia for prefers-reduced-motion checks.
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
    renderPage();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(/Hedge your portfolio at midnight/i);
  });

  it('primary "Get started" CTA links to /login', () => {
    renderPage();
    const ctas = screen.getAllByRole('link', { name: /get started/i });
    expect(ctas.length).toBeGreaterThanOrEqual(1);
    ctas.forEach(cta => expect(cta).toHaveAttribute('href', '/login'));
  });

  it('renders at least 6 feature cards', () => {
    renderPage();
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
    renderPage();
    const faq = document.getElementById('faq');
    expect(faq).not.toBeNull();
    const items = faq!.querySelectorAll('details');
    expect(items.length).toBe(8);
  });

  it('renders the founder testimonial', () => {
    renderPage();
    expect(screen.getByText(/I lost \$2,355/i)).toBeInTheDocument();
  });

  it('renders the AAL position context (problem section)', () => {
    renderPage();
    expect(screen.getByText(/5,000 shares of AAL/i)).toBeInTheDocument();
  });

  it('renders sticky navbar with HedgeIQ wordmark', () => {
    renderPage();
    const marks = screen.getAllByText('HedgeIQ');
    expect(marks.length).toBeGreaterThanOrEqual(2);
  });

  it('navbar Sign in link points to /login', () => {
    renderPage();
    const signIn = screen.getByRole('link', { name: /sign in/i });
    expect(signIn).toHaveAttribute('href', '/login');
  });

  it('renders all anchor sections (#features, #how, #faq)', () => {
    renderPage();
    ['features', 'how', 'faq'].forEach(id => {
      expect(document.getElementById(id)).not.toBeNull();
    });
  });

  it('final CTA includes a docs link to /wiki', () => {
    renderPage();
    const docs = screen.getByRole('link', { name: /read the docs/i });
    expect(docs).toHaveAttribute('href', '/wiki');
  });

  it('renders the LiveDemoWidget', () => {
    renderPage();
    // Demo widget exposes role="img" with aria-label "Interactive product demo"
    expect(screen.getByLabelText(/interactive product demo/i)).toBeInTheDocument();
    // Hedge Calculator header appears inside the widget (may also appear in feature copy)
    expect(screen.getAllByText(/Hedge Calculator/i).length).toBeGreaterThanOrEqual(1);
  });

  it('hero CTAs are React Router Links (rendered as anchors with href="/login")', () => {
    renderPage();
    // Every "Get started" CTA renders as an <a href="/login">
    const ctas = screen.getAllByRole('link', { name: /get started/i });
    expect(ctas.length).toBeGreaterThan(0);
    ctas.forEach(cta => {
      expect(cta.tagName).toBe('A');
      expect(cta).toHaveAttribute('href', '/login');
    });
  });
});

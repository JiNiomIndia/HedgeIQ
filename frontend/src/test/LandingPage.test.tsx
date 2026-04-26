/**
 * LandingPage component tests.
 * Verifies hero, primary CTAs to /login, feature cards (>=6), FAQ (8 items), and core sections.
 */
import { render as rtlRender, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import LandingPage from '../components/LandingPage';

const render = (ui: ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);



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
  // jsdom lacks IntersectionObserver; WorkflowShowcase needs it
  if (!('IntersectionObserver' in globalThis)) {
    // @ts-expect-error - test stub
    globalThis.IntersectionObserver = class {
      observe() {} unobserve() {} disconnect() {} takeRecords() { return []; }
    };
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

  it('renders the BentoGrid with at least 6 feature cards', () => {
    render(<LandingPage />);
    const titles = [
      /Unified portfolio/i,
      /Smart hedge/i,
      /AI advisor/i,
      /Real-time chains/i,
      /Smart caching/i,
      /Production security/i,
    ];
    titles.forEach(t => expect(screen.getAllByText(t).length).toBeGreaterThanOrEqual(1));
    const featuresSection = document.getElementById('features');
    expect(featuresSection?.querySelectorAll('article').length).toBeGreaterThanOrEqual(6);
  });

  it('renders the WorkflowShowcase with 4 steps', () => {
    render(<LandingPage />);
    const how = document.getElementById('how');
    expect(how).not.toBeNull();
    ['Connect', 'Sync', 'Hedge', 'Decide'].forEach(t => {
      const headings = within(how!).getAllByRole('heading', { level: 3, name: t });
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders the Pricing section with 3 tiers', () => {
    render(<LandingPage />);
    const pricing = document.getElementById('pricing');
    expect(pricing).not.toBeNull();
    expect(pricing?.querySelectorAll('article').length).toBe(3);
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$19')).toBeInTheDocument();
    expect(screen.getByText('$99')).toBeInTheDocument();
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
    expect(screen.getAllByText(/5,000 shares of AAL/i).length).toBeGreaterThan(0);
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

  it('renders all anchor sections (#features, #how, #faq)', () => {
    render(<LandingPage />);
    ['features', 'how', 'faq'].forEach(id => {
      expect(document.getElementById(id)).not.toBeNull();
    });
  });

  it('final CTA includes a docs link to /help', () => {
    render(<LandingPage />);
    const docs = screen.getByRole('link', { name: /read the docs/i });
    expect(docs).toHaveAttribute('href', '/help');
  });

  it('Footer "Documentation" link points to /help', () => {
    render(<LandingPage />);
    const docs = screen.getByRole('link', { name: /^documentation$/i });
    expect(docs).toHaveAttribute('href', '/help');
  });

  it('navbar exposes 4 theme buttons (Midnight, Meridian, Lumen, Terminal)', () => {
    render(<LandingPage />);
    ['Midnight', 'Meridian', 'Lumen', 'Terminal'].forEach(name => {
      const btn = screen.getByRole('button', { name: new RegExp(`^${name}$`, 'i') });
      expect(btn).toBeInTheDocument();
      expect(btn.getAttribute('data-theme-btn')).toBe(name.toLowerCase());
    });
  });
});

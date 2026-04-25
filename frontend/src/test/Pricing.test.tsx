/**
 * Pricing tests — 3 tiers, Pro emphasized, correct prices.
 */
import { render as rtlRender, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { describe, it, expect } from 'vitest';
import Pricing from '../components/landing/Pricing';

const render = (ui: ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

describe('Pricing', () => {
  it('renders 3 tiers', () => {
    render(<Pricing />);
    expect(screen.getAllByTestId('pricing-tier')).toHaveLength(3);
  });

  it('Pro tier is emphasized with Most popular badge', () => {
    render(<Pricing />);
    const tiers = screen.getAllByTestId('pricing-tier');
    const emphasized = tiers.filter(t => (t as HTMLElement).dataset.emphasized === 'true');
    expect(emphasized).toHaveLength(1);
    expect(screen.getByText(/Most popular/i)).toBeInTheDocument();
  });

  it('shows correct prices for Free, Pro, Team', () => {
    render(<Pricing />);
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$19')).toBeInTheDocument();
    expect(screen.getByText('$99')).toBeInTheDocument();
  });

  it('Free CTA links to /login, Team CTA links to /contact', () => {
    render(<Pricing />);
    const freeCta = screen.getByRole('link', { name: /^Get started$/i });
    expect(freeCta).toHaveAttribute('href', '/login');
    const teamCta = screen.getByRole('link', { name: /Contact sales/i });
    expect(teamCta).toHaveAttribute('href', '/contact');
  });

  it('shows GA pricing disclaimer', () => {
    render(<Pricing />);
    expect(screen.getByText(/finalized at GA/i)).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TrustSecurity from '../components/landing/TrustSecurity';

describe('TrustSecurity', () => {
  it('renders three blocks with platform names', () => {
    render(<TrustSecurity />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/where it belongs/i);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getAllByText(/SnapTrade/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Polygon\.io/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Anthropic Claude/).length).toBeGreaterThan(0);
    // Reference strip platforms
    expect(screen.getAllByText(/Wealthsimple/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Robinhood/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Notion AI/).length).toBeGreaterThan(0);
  });
});

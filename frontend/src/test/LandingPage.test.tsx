/**
 * LandingPage component tests.
 * Verifies: hero copy, story section, feature cards, waitlist form.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LandingPage from '../components/LandingPage';

// Stub fetch so waitlist POST doesn't hit real network
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ message: 'ok' }) });
});

describe('LandingPage', () => {
  it('renders hero headline', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Hedge your portfolio at midnight/i)).toBeInTheDocument();
  });

  it('renders all three feature cards', () => {
    render(<LandingPage />);
    expect(screen.getByText('Unified dashboard')).toBeInTheDocument();
    expect(screen.getByText('Smart hedge calculator')).toBeInTheDocument();
    expect(screen.getByText('Plain English AI')).toBeInTheDocument();
  });

  it('renders the AAL origin story', () => {
    render(<LandingPage />);
    expect(screen.getByText(/5,000 shares of AAL/i)).toBeInTheDocument();
  });

  it('shows waitlist input and join button by default', () => {
    render(<LandingPage />);
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
  });

  it('calls waitlist API and shows success message on join', async () => {
    render(<LandingPage />);
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@hedgeiq.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /join/i }));
    await waitFor(() => {
      expect(screen.getByText(/You're on the list/i)).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/waitlist'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('does not call API if email is empty', async () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByRole('button', { name: /join/i }));
    await waitFor(() => expect(mockFetch).not.toHaveBeenCalled());
  });

  it('renders the Try it free CTA link', () => {
    render(<LandingPage />);
    const cta = screen.getByRole('link', { name: /try it free/i });
    expect(cta).toHaveAttribute('href', '/dashboard');
  });
});

/**
 * BrokerPicker component tests.
 *
 * Contract:
 *  - Renders 5+ broker cards (currently 8 supported via SnapTrade).
 *  - Clicking a card calls GET /api/v1/auth/connect-broker?broker=<ID>
 *    with the bearer token from localStorage and navigates the browser
 *    to the returned connection_url.
 *  - Closes via the X button, Escape key, and outside click.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BrokerPicker, { SUPPORTED_BROKERS } from '../components/BrokerPicker';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Stub window.location.href assignments — jsdom throws on real nav.
const originalLocation = window.location;

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.setItem('hedgeiq_token', 'test-token');
  // @ts-expect-error — replace location for href tracking
  delete window.location;
  // @ts-expect-error — partial mock is fine for the assertion we make
  window.location = { href: '' } as Location;
});

afterEach(() => {
  // @ts-expect-error — restore
  window.location = originalLocation;
});

describe('BrokerPicker', () => {
  it('renders at least 5 broker cards', () => {
    render(<BrokerPicker onClose={() => {}} />);
    expect(SUPPORTED_BROKERS.length).toBeGreaterThanOrEqual(5);
    for (const b of SUPPORTED_BROKERS) {
      expect(screen.getByLabelText(`Connect ${b.name}`)).toBeInTheDocument();
    }
  });

  it('clicking a broker card calls /api/v1/auth/connect-broker with bearer token', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ connection_url: 'https://snaptrade.example/oauth/abc' }),
    });
    render(<BrokerPicker onClose={() => {}} />);
    fireEvent.click(screen.getByLabelText('Connect Robinhood'));
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/auth/connect-broker');
    expect(url).toContain('broker=ROBINHOOD');
    expect(opts.headers.Authorization).toBe('Bearer test-token');
    await waitFor(() => {
      expect(window.location.href).toBe('https://snaptrade.example/oauth/abc');
    });
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    render(<BrokerPicker onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error UI when API call fails', async () => {
    mockFetch.mockRejectedValue(new Error('boom'));
    render(<BrokerPicker onClose={() => {}} />);
    fireEvent.click(screen.getByLabelText('Connect Fidelity'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

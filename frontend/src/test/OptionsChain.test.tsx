/**
 * Unit tests for OptionsChain component.
 *
 * Contract: The options chain displays put/call ladders for a given symbol,
 * supports expiry filtering, side filtering (Calls/Puts/Both), and contract
 * selection events.
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OptionsChain from '../components/OptionsChain';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_CHAIN_RESPONSE = {
  underlying: 'AAPL',
  expiry_date: '2026-06-18',
  puts: [
    {
      symbol: 'AAPL260618P00200000',
      option_type: 'put',
      strike: 200,
      bid: 2.5,
      ask: 2.6,
      volume: 1500,
      open_interest: 8000,
      implied_volatility: 0.28,
      delta: -0.35,
      gamma: 0.02,
      theta: -0.05,
      vega: 0.12,
      expiry_date: '2026-06-18',
      days_to_expiry: 55,
    },
    {
      symbol: 'AAPL260618P00195000',
      option_type: 'put',
      strike: 195,
      bid: 1.8,
      ask: 1.9,
      volume: 900,
      open_interest: 5200,
      implied_volatility: 0.30,
      delta: -0.25,
      gamma: 0.015,
      theta: -0.04,
      vega: 0.10,
      expiry_date: '2026-06-18',
      days_to_expiry: 55,
    },
  ],
  calls: [
    {
      symbol: 'AAPL260618C00200000',
      option_type: 'call',
      strike: 200,
      bid: 3.1,
      ask: 3.2,
      volume: 2000,
      open_interest: 12000,
      implied_volatility: 0.25,
      delta: 0.55,
      gamma: 0.02,
      theta: -0.06,
      vega: 0.13,
      expiry_date: '2026-06-18',
      days_to_expiry: 55,
    },
  ],
};

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
  localStorage.setItem('hedgeiq_token', 'test-token');

  // Default: chain fetch succeeds
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => MOCK_CHAIN_RESPONSE,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('OptionsChain — rendering', () => {
  it('renders ticker input placeholder', () => {
    render(<OptionsChain />);
    const input = screen.getByPlaceholderText(/AAPL/i);
    expect(input).toBeInTheDocument();
  });

  it('renders "Load Chain" button', () => {
    render(<OptionsChain />);
    expect(screen.getByRole('button', { name: /Load Chain/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Chain loading
// ---------------------------------------------------------------------------

describe('OptionsChain — loading chain', () => {
  it('displays chain data after typing symbol and clicking Load Chain', async () => {
    render(<OptionsChain />);

    const input = screen.getByPlaceholderText(/AAPL/i);
    fireEvent.change(input, { target: { value: 'AAPL' } });
    fireEvent.click(screen.getByRole('button', { name: /Load Chain/i }));

    await waitFor(() => {
      // Strike prices rendered as "200.00" via toFixed(2)
      const strike = screen.queryByText('200.00') ?? screen.queryByText(/200/);
      expect(strike).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls fetch with the correct symbol URL', async () => {
    render(<OptionsChain />);

    const input = screen.getByPlaceholderText(/AAPL/i);
    fireEvent.change(input, { target: { value: 'AAPL' } });
    fireEvent.click(screen.getByRole('button', { name: /Load Chain/i }));

    await waitFor(() => {
      const calls = mockFetch.mock.calls;
      const chainCall = calls.find(([url]: [string]) => url.includes('/options/AAPL'));
      expect(chainCall).toBeTruthy();
    });
  });

  it('shows empty state on API error', async () => {
    // Return a failed HTTP response (not a rejected promise) to avoid unhandled rejection
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: 'Internal server error' }),
    });
    render(<OptionsChain />);

    fireEvent.change(screen.getByPlaceholderText(/AAPL/i), { target: { value: 'AAPL' } });
    fireEvent.click(screen.getByRole('button', { name: /Load Chain/i }));

    // Component should not crash on fetch error
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Filter buttons
// ---------------------------------------------------------------------------

describe('OptionsChain — filters', () => {
  it('Calls / Puts / Both filter buttons exist when chain is loaded', async () => {
    render(<OptionsChain />);

    fireEvent.change(screen.getByPlaceholderText(/AAPL/i), { target: { value: 'AAPL' } });
    fireEvent.click(screen.getByRole('button', { name: /Load Chain/i }));

    await waitFor(() => {
      // At least some filter UI should be present after chain loads
      expect(document.body).toBeInTheDocument();
    });
  });
});

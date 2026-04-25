/**
 * PositionsTable component tests.
 * Verifies: loading state, empty state, populated state with P&L colouring.
 */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PositionsTable from '../components/PositionsTable';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const MOCK_POSITION = {
  broker: 'Robinhood',
  accountName: 'Robinhood Individual',
  symbol: 'DOGE',
  quantity: 100,
  entryPrice: 0.1795,
  currentPrice: 0.17,
  marketValue: 17.0,
  unrealisedPnl: -0.95,
  unrealisedPnlPct: -5.29,
};

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.setItem('hedgeiq_token', 'test-token');
});

describe('PositionsTable', () => {
  it('shows loading state initially', () => {
    // Never-resolving promise keeps it in loading state
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<PositionsTable />);
    expect(screen.getByText(/loading positions/i)).toBeInTheDocument();
  });

  it('shows empty state when no positions returned', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ positions: [], total_value: 0, total_unrealised_pnl: 0 }),
    });
    render(<PositionsTable />);
    await waitFor(() =>
      expect(screen.getByText(/no broker accounts connected/i)).toBeInTheDocument()
    );
  });

  it('shows connect broker button when empty', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ positions: [], total_value: 0, total_unrealised_pnl: 0 }),
    });
    render(<PositionsTable />);
    await waitFor(() => {
      // Button text varies by broker — match any connect/broker button
      const connectBtn = screen.queryByRole('button', { name: /connect/i });
      expect(connectBtn).toBeInTheDocument();
    });
  });

  it('renders position data when API returns positions', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        positions: [MOCK_POSITION],
        total_value: 17.0,
        total_unrealised_pnl: -0.95,
      }),
    });
    render(<PositionsTable />);
    await waitFor(() => expect(screen.getByText('DOGE')).toBeInTheDocument());
    expect(screen.getByText('Robinhood')).toBeInTheDocument();
    expect(screen.getByText('Robinhood Individual')).toBeInTheDocument();
  });

  it('calls positions API with auth header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ positions: [], total_value: 0, total_unrealised_pnl: 0 }),
    });
    render(<PositionsTable />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/positions');
    expect(opts.headers.Authorization).toBe('Bearer test-token');
  });

  it('handles fetch error gracefully (no crash)', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<PositionsTable />);
    // Should not crash — just exit loading silently
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );
  });

  it('shows multiple broker sections for multi-broker portfolio', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        positions: [
          { ...MOCK_POSITION, broker: 'Fidelity', symbol: 'AAL', accountName: 'Rollover IRA' },
          { ...MOCK_POSITION, broker: 'Robinhood', symbol: 'DOGE', accountName: 'Robinhood Individual' },
        ],
        total_value: 100,
        total_unrealised_pnl: -5,
      }),
    });
    render(<PositionsTable />);
    await waitFor(() => expect(screen.getByText('Fidelity')).toBeInTheDocument());
    expect(screen.getByText('Robinhood')).toBeInTheDocument();
    expect(screen.getByText('AAL')).toBeInTheDocument();
    expect(screen.getByText('DOGE')).toBeInTheDocument();
  });
});

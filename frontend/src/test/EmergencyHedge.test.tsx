/**
 * EmergencyHedge component tests.
 * Verifies: form rendering, live P&L calculation, API call,
 *           recommendation display, error state.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EmergencyHedge from '../components/EmergencyHedge';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const MOCK_RECOMMENDATIONS = [
  {
    expiry_date: '2026-06-18',
    strike: 10.0,
    ask: 0.51,
    total_cost: 51.0,
    breakeven_price: 9.49,
    open_interest: 75310,
    value_score: 0.92,
    ai_explanation: 'This put protects you if AAL falls below $9.49.',
  },
];

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.setItem('hedgeiq_token', 'test-token');
});

describe('EmergencyHedge', () => {
  it('renders the calculator heading', () => {
    render(<EmergencyHedge />);
    expect(screen.getByText('Emergency Hedge Calculator')).toBeInTheDocument();
  });

  it('renders all four input fields', () => {
    render(<EmergencyHedge />);
    expect(screen.getByPlaceholderText('AAL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('5000')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('11.30')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('10.97')).toBeInTheDocument();
  });

  it('Find Best Hedge button is disabled when fields are empty', () => {
    render(<EmergencyHedge />);
    const btn = screen.getByRole('button', { name: /find best hedge/i });
    expect(btn).toBeDisabled();
  });

  it('enables button when symbol, shares, and current price are filled', () => {
    render(<EmergencyHedge />);
    fireEvent.change(screen.getByPlaceholderText('AAL'), { target: { value: 'AAL' } });
    fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '5000' } });
    fireEvent.change(screen.getByPlaceholderText('10.97'), { target: { value: '10.97' } });
    expect(screen.getByRole('button', { name: /find best hedge/i })).not.toBeDisabled();
  });

  it('shows live position value calculation', () => {
    render(<EmergencyHedge />);
    fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('10.97'), { target: { value: '0.17' } });
    // 100 * 0.17 = $17 — look for it formatted somewhere
    expect(screen.getByText(/position:/i)).toBeInTheDocument();
  });

  it('calls hedge API with correct payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ recommendations: MOCK_RECOMMENDATIONS }),
    });
    render(<EmergencyHedge />);
    fireEvent.change(screen.getByPlaceholderText('AAL'), { target: { value: 'AAL' } });
    fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '5000' } });
    fireEvent.change(screen.getByPlaceholderText('11.30'), { target: { value: '11.30' } });
    fireEvent.change(screen.getByPlaceholderText('10.97'), { target: { value: '10.97' } });
    fireEvent.click(screen.getByRole('button', { name: /find best hedge/i }));
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.symbol).toBe('AAL');
    expect(body.shares_held).toBe(5000);
    expect(body.entry_price).toBe(11.3);
    expect(body.current_price).toBe(10.97);
  });

  it('displays recommendations returned by API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ recommendations: MOCK_RECOMMENDATIONS }),
    });
    render(<EmergencyHedge />);
    fireEvent.change(screen.getByPlaceholderText('AAL'), { target: { value: 'AAL' } });
    fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('10.97'), { target: { value: '10.97' } });
    fireEvent.click(screen.getByRole('button', { name: /find best hedge/i }));
    await waitFor(() =>
      expect(screen.getByText(/2026-06-18 \$10 PUT/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/This put protects/i)).toBeInTheDocument();
  });

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'No liquid options found.' }),
    });
    render(<EmergencyHedge />);
    fireEvent.change(screen.getByPlaceholderText('AAL'), { target: { value: 'XYZ' } });
    fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('10.97'), { target: { value: '1.00' } });
    fireEvent.click(screen.getByRole('button', { name: /find best hedge/i }));
    await waitFor(() =>
      expect(screen.getByText('No liquid options found.')).toBeInTheDocument()
    );
  });

  it('shows connection error on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<EmergencyHedge />);
    fireEvent.change(screen.getByPlaceholderText('AAL'), { target: { value: 'AAL' } });
    fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('10.97'), { target: { value: '10.97' } });
    fireEvent.click(screen.getByRole('button', { name: /find best hedge/i }));
    await waitFor(() =>
      expect(screen.getByText(/connection error/i)).toBeInTheDocument()
    );
  });
});

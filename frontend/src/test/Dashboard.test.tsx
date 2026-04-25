/**
 * Dashboard component tests.
 * Verifies: header elements, preset chips, edit-layout toggle, sign-out behaviour.
 * PriceChart (lightweight-charts) is mocked to prevent canvas/URL errors in jsdom.
 *
 * Contract: The dashboard renders a multi-widget grid with preset layouts,
 * an edit-layout mode, a preferences popover, and sign-out.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../components/Dashboard';
import { ThemeProvider } from '../lib/ThemeProvider';

// Mock lightweight-charts to prevent canvas/URL errors in jsdom
vi.mock('lightweight-charts', () => ({
  createChart: () => ({
    addCandlestickSeries: () => ({ setData: () => {}, applyOptions: () => {} }),
    addHistogramSeries: () => ({ setData: () => {}, applyOptions: () => {} }),
    addLineSeries: () => ({ setData: () => {}, applyOptions: () => {} }),
    applyOptions: () => {},
    resize: () => {},
    remove: () => {},
    timeScale: () => ({ fitContent: () => {}, setVisibleLogicalRange: () => {} }),
    subscribeCrosshairMove: () => {},
    unsubscribeCrosshairMove: () => {},
  }),
  CrosshairMode: { Normal: 1 },
  LineStyle: { Solid: 0 },
  ColorType: { Solid: 'solid' },
}));

// All child components (PositionsTable, PriceChart, AIChat etc.) call fetch — stub globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ positions: [], total_value: 0, total_unrealised_pnl: 0 }),
  });
  localStorage.setItem('hedgeiq_token', 'test-token');
});

function renderDashboard() {
  return render(<ThemeProvider><Dashboard /></ThemeProvider>);
}

describe('Dashboard', () => {
  it('renders the HedgeIQ brand name', () => {
    renderDashboard();
    expect(screen.getByText('HedgeIQ')).toBeInTheDocument();
  });

  it('renders a Sign out button', () => {
    renderDashboard();
    expect(screen.getByText(/sign out/i)).toBeInTheDocument();
  });

  it('renders the Edit Layout button', () => {
    renderDashboard();
    // Could be "Edit Layout" or an icon button depending on viewport
    const editBtn = screen.queryByText(/edit layout/i) ?? screen.queryByTitle(/edit layout/i);
    expect(editBtn).toBeInTheDocument();
  });

  it('renders preset chip buttons', () => {
    renderDashboard();
    // At least one preset chip should be visible (Day Trader, Long-Term, etc.)
    const chips = screen.getAllByRole('button');
    expect(chips.length).toBeGreaterThan(1);
  });

  it('Edit Layout toggles to Done when clicked', () => {
    renderDashboard();
    const editBtn = screen.getByText(/edit layout/i);
    fireEvent.click(editBtn);
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });

  it('Done button returns to normal mode', () => {
    renderDashboard();
    fireEvent.click(screen.getByText(/edit layout/i));
    fireEvent.click(screen.getByText(/done/i));
    expect(screen.getByText(/edit layout/i)).toBeInTheDocument();
  });

  it('sign out clears hedgeiq_token from localStorage', () => {
    Object.defineProperty(window, 'location', {
      value: { href: '/' },
      writable: true,
    });
    renderDashboard();
    fireEvent.click(screen.getByText(/sign out/i));
    expect(localStorage.getItem('hedgeiq_token')).toBeNull();
  });

  it('renders Preferences button', () => {
    renderDashboard();
    const prefsBtn = screen.queryByTitle(/preferences/i) ??
                     screen.queryByLabelText(/preferences/i) ??
                     screen.queryByText(/preferences/i);
    expect(prefsBtn).toBeInTheDocument();
  });
});

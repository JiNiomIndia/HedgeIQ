import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart, CandlestickSeries, HistogramSeries,
  type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData,
} from 'lightweight-charts';
import { API } from '../lib/api';

interface Bar {
  date: string; open: number; high: number; low: number; close: number; volume: number;
}

const PERIODS = [
  { label: '5D',  days: 5 },
  { label: '1M',  days: 30 },
  { label: '3M',  days: 90 },
  { label: '6M',  days: 180 },
  { label: '1Y',  days: 365 },
];

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function buildChartOptions(containerEl: HTMLElement) {
  return {
    width: containerEl.clientWidth,
    height: containerEl.clientHeight,
    layout: {
      background: { color: cssVar('--bg') || '#0a0d12' },
      textColor: cssVar('--text-muted') || '#888',
      fontFamily: cssVar('--font-sans') || 'sans-serif',
      fontSize: 11,
    },
    grid: {
      vertLines: { color: cssVar('--border') || '#1e2a3a', style: 1 },
      horzLines: { color: cssVar('--border') || '#1e2a3a', style: 1 },
    },
    crosshair: {
      vertLine: { color: cssVar('--text-subtle') || '#555', labelBackgroundColor: cssVar('--surface') || '#111' },
      horzLine: { color: cssVar('--text-subtle') || '#555', labelBackgroundColor: cssVar('--surface') || '#111' },
    },
    rightPriceScale: {
      borderColor: cssVar('--border') || '#1e2a3a',
    },
    timeScale: {
      borderColor: cssVar('--border') || '#1e2a3a',
      timeVisible: true,
      secondsVisible: false,
    },
    handleScroll: { mouseWheel: true, pressedMouseMove: true },
    handleScale: { mouseWheel: true, pinch: true },
  };
}

export default function PriceChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const candleRef    = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volRef       = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [days, setDays]       = useState(90);
  const [meta, setMeta]       = useState<{ last: number; change: number; changePct: number }>({ last: 0, change: 0, changePct: 0 });
  const [loading, setLoading] = useState(true);

  const initChart = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }

    const chart = createChart(el, buildChartOptions(el));
    chartRef.current = chart;

    const pos = cssVar('--pos') || '#26a69a';
    const neg = cssVar('--neg') || '#ef5350';

    candleRef.current = chart.addSeries(CandlestickSeries, {
      upColor: pos, downColor: neg,
      borderUpColor: pos, borderDownColor: neg,
      wickUpColor: pos, wickDownColor: neg,
    });

    volRef.current = chart.addSeries(HistogramSeries, {
      color: pos,
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
    });
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; };
  }, []);

  useEffect(() => {
    const cleanup = initChart();
    return cleanup;
  }, [initChart]);

  useEffect(() => {
    if (!candleRef.current || !volRef.current) return;
    setLoading(true);
    fetch(`${API}/api/v1/quotes/${symbol}/chart?days=${days}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
    })
      .then(r => r.json())
      .then(d => {
        const bars: Bar[] = d.bars || [];
        setMeta({ last: d.last_close || 0, change: d.day_change || 0, changePct: d.day_change_pct || 0 });

        const pos = cssVar('--pos') || '#26a69a';
        const neg = cssVar('--neg') || '#ef5350';

        const candleData: CandlestickData[] = bars.map(b => ({
          time: b.date as unknown as import('lightweight-charts').Time,
          open: b.open, high: b.high, low: b.low, close: b.close,
        }));
        const volData: HistogramData[] = bars.map(b => ({
          time: b.date as unknown as import('lightweight-charts').Time,
          value: b.volume,
          color: b.close >= b.open ? pos + '66' : neg + '66',
        }));

        candleRef.current?.setData(candleData);
        volRef.current?.setData(volData);
        chartRef.current?.timeScale().fitContent();
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [symbol, days]);

  const up = meta.change >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{symbol}</span>
        <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
          ${meta.last.toFixed(2)}
        </span>
        <span style={{ fontSize: 'var(--fs-sm)', color: up ? 'var(--pos)' : 'var(--neg)', fontVariantNumeric: 'tabular-nums' }}>
          {up ? '+' : ''}{meta.change.toFixed(2)} ({up ? '+' : ''}{meta.changePct.toFixed(2)}%)
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
          {PERIODS.map(p => (
            <button key={p.label} onClick={() => setDays(p.days)}
              style={{
                padding: '2px 7px', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                border: 'none', borderRadius: 'var(--radius-sm)',
                background: days === p.days ? 'var(--accent)' : 'transparent',
                color: days === p.days ? 'var(--accent-contrast)' : 'var(--text-muted)',
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'var(--bg)', zIndex: 1 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>Loading…</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Sparkline — compact SVG line chart of closing prices.
 * Color: green if up over the period, red if down.
 * @component
 */
import { useEffect, useState } from 'react';
import { API } from '../lib/api';

interface Bar { date: string; close: number; high: number; low: number; open: number; }

export default function Sparkline({ symbol, days = 30, width = 100, height = 30 }: { symbol: string; days?: number; width?: number; height?: number }) {
  const [bars, setBars] = useState<Bar[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/v1/quotes/${symbol}/chart?days=${days}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
    })
      .then(r => r.json())
      .then(d => { if (!cancelled) setBars(d.bars || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [symbol, days]);

  if (!bars.length) return <div style={{ width, height, background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }} />;

  const closes = bars.map(b => b.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const dx = (width - 2) / (closes.length - 1);

  const path = closes
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${(1 + i * dx).toFixed(1)} ${(height - 2 - ((c - min) / range) * (height - 4)).toFixed(1)}`)
    .join(' ');

  const up = closes[closes.length - 1] >= closes[0];
  const color = up ? 'var(--pos)' : 'var(--neg)';

  return (
    <svg width={width} height={height} style={{ display: 'inline-block' }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

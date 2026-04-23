/**
 * PriceChart — SVG candlestick chart with volume bars.
 * @component
 */
import { useEffect, useState } from 'react';
import { API } from '../lib/api';

interface Bar {
  date: string; open: number; high: number; low: number; close: number; volume: number;
}

export default function PriceChart({ symbol, days = 90, height = 260 }: { symbol: string; days?: number; height?: number }) {
  const [bars, setBars] = useState<Bar[]>([]);
  const [meta, setMeta] = useState<{ last: number; change: number; changePct: number }>({ last: 0, change: 0, changePct: 0 });

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/api/v1/quotes/${symbol}/chart?days=${days}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
    })
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        setBars(d.bars || []);
        setMeta({ last: d.last_close || 0, change: d.day_change || 0, changePct: d.day_change_pct || 0 });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [symbol, days]);

  if (!bars.length) return <div style={{ height, width: '100%', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', opacity: 0.6 }} />;

  const W = 700;
  const priceH = height * 0.72;
  const volH = height * 0.22;
  const padL = 55, padR = 15, padT = 10;
  const plotW = W - padL - padR;

  const highs = bars.map(b => b.high);
  const lows = bars.map(b => b.low);
  const priceMax = Math.max(...highs);
  const priceMin = Math.min(...lows);
  const priceRange = priceMax - priceMin || 1;
  const maxVol = Math.max(...bars.map(b => b.volume)) || 1;

  const bw = Math.max(1, plotW / bars.length * 0.7);
  const step = plotW / bars.length;

  const priceY = (p: number) => padT + priceH - ((p - priceMin) / priceRange) * priceH;

  const gridLevels = 4;
  const gridLines = Array.from({ length: gridLevels + 1 }, (_, i) => priceMin + (priceRange / gridLevels) * i);

  const up = meta.change >= 0;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8, padding: '0 4px' }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'var(--text)' }}>{symbol}</span>
        <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--text)' }}>${meta.last.toFixed(2)}</span>
        <span style={{ fontSize: 'var(--fs-sm)', color: up ? 'var(--pos)' : 'var(--neg)' }}>
          {up ? '+' : ''}{meta.change.toFixed(2)} ({up ? '+' : ''}{meta.changePct.toFixed(2)}%)
        </span>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginLeft: 'auto' }}>{days}-day chart</span>
      </div>
      <svg viewBox={`0 0 ${W} ${height}`} style={{ width: '100%' }}>
        {gridLines.map((p, i) => (
          <g key={i}>
            <line x1={padL} y1={priceY(p)} x2={W - padR} y2={priceY(p)} stroke="var(--border)" strokeWidth="0.5" />
            <text x={padL - 5} y={priceY(p) + 3} textAnchor="end" fill="var(--text-muted)" fontSize="10">${p.toFixed(2)}</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const cx = padL + step * i + step / 2;
          const barUp = b.close >= b.open;
          const color = barUp ? 'var(--pos)' : 'var(--neg)';
          const bodyTop = priceY(Math.max(b.open, b.close));
          const bodyBottom = priceY(Math.min(b.open, b.close));
          const bodyH = Math.max(1, bodyBottom - bodyTop);
          return (
            <g key={i}>
              <line x1={cx} y1={priceY(b.high)} x2={cx} y2={priceY(b.low)} stroke={color} strokeWidth="1" />
              <rect x={cx - bw / 2} y={bodyTop} width={bw} height={bodyH} fill={color} />
            </g>
          );
        })}
        {bars.map((b, i) => {
          const cx = padL + step * i + step / 2;
          const barUp = b.close >= b.open;
          const vH = (b.volume / maxVol) * volH;
          return (
            <rect key={i} x={cx - bw / 2} y={padT + priceH + volH - vH}
              width={bw} height={vH}
              fill={barUp ? 'var(--pos)' : 'var(--neg)'} opacity="0.3" />
          );
        })}
        <text x={padL} y={height - 5} fill="var(--text-muted)" fontSize="10">{bars[0]?.date}</text>
        <text x={W - padR} y={height - 5} textAnchor="end" fill="var(--text-muted)" fontSize="10">{bars[bars.length - 1]?.date}</text>
      </svg>
    </div>
  );
}

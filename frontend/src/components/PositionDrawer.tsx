import { useEffect, useRef, useState } from 'react';
import { API } from '../lib/api';
import { bus, EVENTS } from '../lib/event-bus';
import PriceChart from './PriceChart';

interface Position {
  symbol: string; broker: string; accountName: string;
  quantity: number; entryPrice: number; currentPrice: number;
  marketValue: number; unrealisedPnl: number; unrealisedPnlPct: number;
}

interface Article {
  title: string; published_utc: string; article_url: string;
  publisher: string; description: string; image_url: string;
}

function timeAgo(iso: string): string {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PositionDrawer() {
  const [position, setPosition] = useState<Position | null>(null);
  const [news, setNews]         = useState<Article[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = bus.on<Position>(EVENTS.POSITION_SELECTED, pos => {
      setPosition(pos);
      setNews([]);
      setNewsLoading(true);
      fetch(`${API}/api/v1/quotes/${pos.symbol}/news?limit=8`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
      })
        .then(r => r.json())
        .then(d => { setNews(d.articles || []); setNewsLoading(false); })
        .catch(() => setNewsLoading(false));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPosition(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setPosition(null);
      }
    };
    if (position) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [position]);

  if (!position) return null;

  const pnlColor = position.unrealisedPnl >= 0 ? 'var(--pos)' : 'var(--neg)';
  const fmt = (n: number) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const stats = [
    { label: 'Current Price',  value: fmt(position.currentPrice), color: 'var(--text)' },
    { label: 'Entry Price',    value: fmt(position.entryPrice),   color: 'var(--text-muted)' },
    { label: 'Quantity',       value: position.quantity?.toLocaleString(), color: 'var(--text)' },
    { label: 'Market Value',   value: fmt(position.marketValue),  color: 'var(--text)' },
    { label: 'Unrealised P&L', value: fmt(position.unrealisedPnl), color: pnlColor },
    { label: 'P&L %',         value: `${position.unrealisedPnl >= 0 ? '+' : ''}${position.unrealisedPnlPct?.toFixed(2)}%`, color: pnlColor },
  ];

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 90 }} />

      {/* Drawer */}
      <div ref={drawerRef} style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)', zIndex: 91, display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 'var(--fs-xl)', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{position.symbol}</span>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1px 6px' }}>
                {position.broker}
              </span>
            </div>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', margin: 0 }}>{position.accountName}</p>
          </div>
          <button onClick={() => setPosition(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: 4 }}>
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '8px 12px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                <p style={{ fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums', fontSize: 'var(--fs-sm)', margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{ height: 220, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <PriceChart symbol={position.symbol} />
          </div>

          {/* External links */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Yahoo Finance', url: `https://finance.yahoo.com/quote/${position.symbol}` },
              { label: 'SEC Filings', url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${position.symbol}&type=10-K` },
              { label: 'Earnings', url: `https://finance.yahoo.com/calendar/earnings?symbol=${position.symbol}` },
            ].map(link => (
              <a key={link.label} href={link.url} target="_blank" rel="noreferrer"
                className="btn btn-sm btn-ghost"
                style={{ textDecoration: 'none', fontSize: 'var(--fs-xs)' }}>
                ↗ {link.label}
              </a>
            ))}
          </div>

          {/* News */}
          <div>
            <p style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>Recent News</p>
            {newsLoading && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>Loading news…</p>}
            {!newsLoading && news.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>No recent news available.</p>
            )}
            {news.map((a, i) => (
              <a key={i} href={a.article_url} target="_blank" rel="noreferrer"
                style={{ display: 'block', textDecoration: 'none', marginBottom: 10,
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', background: 'var(--bg)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 'var(--fs-xs)', marginBottom: 4, lineHeight: 1.4 }}>{a.title}</p>
                {a.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 4, lineHeight: 1.4,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                    {a.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {a.publisher && <span style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 600 }}>{a.publisher}</span>}
                  <span style={{ fontSize: 9, color: 'var(--text-subtle)' }}>{timeAgo(a.published_utc)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

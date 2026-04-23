import { useState, useEffect } from 'react';
import { API } from '../lib/api';
import { bus, EVENTS } from '../lib/event-bus';

interface Tick {
  symbol: string; last: number; change: number; changePct: number;
}

const TAPE_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'META', 'GOOGL', 'AMZN', 'BTC-USD'];

export default function MarketTape() {
  const [ticks, setTicks] = useState<Tick[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchTick = async (sym: string): Promise<Tick | null> => {
      try {
        const r = await fetch(`${API}/api/v1/quotes/${sym}/chart?days=5`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
        });
        const d = await r.json();
        return { symbol: sym, last: d.last_close || 0, change: d.day_change || 0, changePct: d.day_change_pct || 0 };
      } catch { return null; }
    };

    const load = async () => {
      const results = await Promise.all(TAPE_SYMBOLS.map(fetchTick));
      if (mounted) setTicks(results.filter(Boolean) as Tick[]);
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (!ticks.length) return null;

  const doubled = [...ticks, ...ticks];

  return (
    <div style={{
      height: 28, overflow: 'hidden', background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--border)', flexShrink: 0,
      display: 'flex', alignItems: 'center',
    }}>
      <div className="market-tape-track" style={{ display: 'flex', gap: 0 }}>
        {doubled.map((t, i) => {
          const up = t.change >= 0;
          return (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 20px',
              borderRight: '1px solid var(--border)', cursor: 'pointer', fontSize: 11 }}
              onClick={() => bus.emit(EVENTS.SYMBOL_SELECTED, t.symbol)}>
              <span style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono, monospace)' }}>{t.symbol}</span>
              <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono, monospace)' }}>
                ${t.last.toFixed(2)}
              </span>
              <span style={{ color: up ? 'var(--pos)' : 'var(--neg)', fontVariantNumeric: 'tabular-nums', fontSize: 10, fontFamily: 'var(--font-mono, monospace)' }}>
                {up ? '▲' : '▼'} {Math.abs(t.changePct).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

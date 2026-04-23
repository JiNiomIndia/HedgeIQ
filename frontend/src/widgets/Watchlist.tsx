import { useState, useEffect, useRef } from 'react';
import { API } from '../lib/api';
import { bus, EVENTS } from '../lib/event-bus';

interface Quote {
  symbol: string; last: number; change: number; changePct: number;
  loading?: boolean; error?: boolean;
}

const DEFAULT_SYMBOLS = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'TSLA'];
const POLL_MS = 30_000;

const STORAGE_KEY = 'hedgeiq_watchlist';

function loadSymbols(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_SYMBOLS;
}

function saveSymbols(syms: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(syms));
}

export default function Watchlist() {
  const [symbols, setSymbols] = useState<string[]>(loadSymbols);
  const [quotes, setQuotes]   = useState<Record<string, Quote>>({});
  const [adding, setAdding]   = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQuote = async (sym: string) => {
    setQuotes(q => ({ ...q, [sym]: { ...q[sym], symbol: sym, loading: true } }));
    try {
      const r = await fetch(`${API}/api/v1/quotes/${sym}/chart?days=5`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
      });
      const d = await r.json();
      setQuotes(q => ({
        ...q,
        [sym]: { symbol: sym, last: d.last_close || 0, change: d.day_change || 0, changePct: d.day_change_pct || 0 },
      }));
    } catch {
      setQuotes(q => ({ ...q, [sym]: { ...q[sym], symbol: sym, error: true, loading: false } }));
    }
  };

  const fetchAll = (syms: string[]) => syms.forEach(s => fetchQuote(s));

  useEffect(() => {
    fetchAll(symbols);
    intervalRef.current = setInterval(() => fetchAll(symbols), POLL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [symbols]);

  const addSymbol = () => {
    const sym = adding.trim().toUpperCase();
    if (!sym || symbols.includes(sym)) { setAdding(''); return; }
    const next = [...symbols, sym];
    setSymbols(next);
    saveSymbols(next);
    setAdding('');
  };

  const removeSymbol = (sym: string) => {
    const next = symbols.filter(s => s !== sym);
    setSymbols(next);
    saveSymbols(next);
    setQuotes(q => { const copy = { ...q }; delete copy[sym]; return copy; });
  };

  const selectSymbol = (sym: string) => bus.emit(EVENTS.SYMBOL_SELECTED, sym);

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Add symbol bar */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, flexShrink: 0 }}>
        <input value={adding} onChange={e => setAdding(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && addSymbol()}
          placeholder="Add symbol…" className="input"
          style={{ flex: 1, fontSize: 'var(--fs-xs)', padding: '4px 8px' }} />
        <button onClick={addSymbol} className="btn btn-sm btn-primary" style={{ fontSize: 'var(--fs-xs)', padding: '4px 10px' }}>+ Add</button>
      </div>

      {/* Quote list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)' }}>
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ textAlign: 'left', padding: '6px 12px', fontWeight: 500 }}>Symbol</th>
              <th style={{ textAlign: 'right', fontWeight: 500 }}>Last</th>
              <th style={{ textAlign: 'right', fontWeight: 500 }}>Chg</th>
              <th style={{ textAlign: 'right', fontWeight: 500, paddingRight: 8 }}>Chg%</th>
              <th style={{ width: 28 }} />
            </tr>
          </thead>
          <tbody>
            {symbols.map(sym => {
              const q = quotes[sym];
              const up = (q?.change ?? 0) >= 0;
              return (
                <tr key={sym} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => selectSymbol(sym)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '7px 12px', fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
                    {sym}
                    {q?.loading && <span style={{ marginLeft: 4, fontSize: 9, color: 'var(--text-subtle)' }}>…</span>}
                    {q?.error && <span style={{ marginLeft: 4, fontSize: 9, color: 'var(--neg)' }}>err</span>}
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text)', fontWeight: 600 }}>
                    {q?.last ? fmt(q.last) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: up ? 'var(--pos)' : 'var(--neg)' }}>
                    {q?.change != null ? `${up ? '+' : ''}${q.change.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 4, fontVariantNumeric: 'tabular-nums', color: up ? 'var(--pos)' : 'var(--neg)' }}>
                    {q?.changePct != null ? `${up ? '+' : ''}${q.changePct.toFixed(2)}%` : '—'}
                  </td>
                  <td style={{ textAlign: 'center', paddingRight: 4 }}>
                    <button onClick={e => { e.stopPropagation(); removeSymbol(sym); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: 12, padding: '0 4px' }}
                      title="Remove">×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {symbols.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 'var(--fs-xs)' }}>
            Add symbols to watch
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '5px 12px', borderTop: '1px solid var(--border)', fontSize: 9, color: 'var(--text-subtle)', flexShrink: 0 }}>
        Click row → chart updates · refreshes every 30s · EOD prices
      </div>
    </div>
  );
}

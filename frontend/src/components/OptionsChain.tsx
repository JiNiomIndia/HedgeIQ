import { useState } from 'react';
import AIExplainer from './AIExplainer';
import PriceChart from './PriceChart';
import { API } from '../lib/api';

interface Contract {
  symbol: string; option_type: string; strike: number;
  bid: number; ask: number; volume: number; open_interest: number;
  implied_volatility: number; delta: number | null; expiry_date: string;
  days_to_expiry: number;
}

type SideFilter = 'puts' | 'calls' | 'both';

export default function OptionsChain() {
  const [symbol, setSymbol]               = useState('');
  const [loaded, setLoaded]               = useState('');
  const [chain, setChain]                 = useState<{puts: Contract[], calls: Contract[]}>({ puts: [], calls: [] });
  const [quote, setQuote]                 = useState<{ last: number; change: number; changePct: number } | null>(null);
  const [loading, setLoading]             = useState(false);
  const [selected, setSelected]           = useState<Contract | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [side, setSide]                   = useState<SideFilter>('puts');
  const [strikeRange, setStrikeRange]     = useState(20);
  const [showChart, setShowChart]         = useState(true);

  const fetchAll = async () => {
    if (!symbol) return;
    setLoading(true);
    const token = localStorage.getItem('hedgeiq_token');
    const [cr, qr] = await Promise.all([
      fetch(`${API}/api/v1/options/${symbol}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/api/v1/quotes/${symbol}/chart?days=5`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]);
    const puts: Contract[] = cr.puts || [];
    const calls: Contract[] = cr.calls || [];
    setChain({ puts, calls });
    setQuote({ last: qr.last_close || 0, change: qr.day_change || 0, changePct: qr.day_change_pct || 0 });
    const firstExpiry = puts[0]?.expiry_date || calls[0]?.expiry_date || '';
    setSelectedExpiry(firstExpiry);
    setLoaded(symbol);
    setLoading(false);
  };

  const f2 = (n: number) => n?.toFixed(2);
  const allExpiries = [...new Set([...chain.puts, ...chain.calls].map(c => c.expiry_date))].sort();

  const expPuts  = chain.puts.filter(p => !selectedExpiry || p.expiry_date === selectedExpiry);
  const expCalls = chain.calls.filter(c => !selectedExpiry || c.expiry_date === selectedExpiry);
  const allStrikes = [...new Set([...expPuts, ...expCalls].map(c => c.strike))].sort((a, b) => a - b);

  const atmStrike = quote && allStrikes.length
    ? allStrikes.reduce((best, s) => Math.abs(s - quote.last) < Math.abs(best - quote.last) ? s : best, allStrikes[0])
    : 0;

  const half = Math.floor(strikeRange / 2);
  const atmIdx = allStrikes.indexOf(atmStrike);
  const visibleStrikes = atmIdx >= 0
    ? allStrikes.slice(Math.max(0, atmIdx - half), atmIdx + half + 1)
    : allStrikes.slice(0, strikeRange);

  const dte = expPuts[0]?.days_to_expiry ?? expCalls[0]?.days_to_expiry ?? 0;

  const surface  = { background: 'var(--surface)', border: '1px solid var(--border)' };
  const cellText = { color: 'var(--text)' };

  return (
    <div style={{ padding: 16 }}>
      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && fetchAll()}
          placeholder="Enter ticker e.g. AAPL"
          className="input" style={{ flex: 1 }} />
        <button onClick={fetchAll} className="btn btn-primary" style={{ padding: '7px 20px' }}>Load Chain</button>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', padding: '32px 0', textAlign: 'center' }}>Loading chain…</p>}

      {loaded && quote && !loading && (
        <>
          {/* Symbol header */}
          <div style={{ ...surface, borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Symbol</span>
              <h2 style={{ fontWeight: 700, fontSize: 'var(--fs-xl)', color: 'var(--text)', margin: 0 }}>{loaded}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-2xl)', color: 'var(--text)', margin: 0 }}>${f2(quote.last)}</p>
              <p style={{ fontSize: 'var(--fs-sm)', color: quote.change >= 0 ? 'var(--pos)' : 'var(--neg)', margin: 0 }}>
                {quote.change >= 0 ? '+' : ''}{f2(quote.change)} ({quote.change >= 0 ? '+' : ''}{f2(quote.changePct)}%)
              </p>
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', display: 'flex', gap: 16, marginLeft: 'auto', alignItems: 'center' }}>
              <span>Contracts: <span style={cellText}>{chain.puts.length + chain.calls.length}</span></span>
              <span>Expiries: <span style={cellText}>{allExpiries.length}</span></span>
              <button onClick={() => setShowChart(s => !s)} className="btn btn-sm btn-ghost">
                {showChart ? 'Hide chart' : 'Show chart'}
              </button>
            </div>
          </div>

          {/* Price chart */}
          {showChart && (
            <div style={{ ...surface, borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 12 }}>
              <PriceChart symbol={loaded} days={90} height={240} />
            </div>
          )}

          {/* Filters */}
          <div style={{ ...surface, borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 8, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
            <div>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Option type</p>
              <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {(['calls', 'puts', 'both'] as SideFilter[]).map(s => (
                  <button key={s} onClick={() => setSide(s)}
                    className={side === s ? 'btn-primary' : 'btn-ghost'}
                    style={{ padding: '4px 12px', fontSize: 'var(--fs-xs)', fontWeight: 700, textTransform: 'capitalize', border: 'none' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Strike range</p>
              <select value={strikeRange} onChange={e => setStrikeRange(parseInt(e.target.value))}
                className="input" style={{ width: 'auto', padding: '4px 8px', fontSize: 'var(--fs-xs)' }}>
                <option value={6}>6 strikes</option>
                <option value={10}>10 strikes</option>
                <option value={20}>20 strikes</option>
                <option value={50}>All</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Expiration ({dte} days)</p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {allExpiries.map(ex => (
                  <button key={ex} onClick={() => setSelectedExpiry(ex)}
                    className={selectedExpiry === ex ? 'chip' : 'chip chip-outline'}
                    style={{ cursor: 'pointer', ...(selectedExpiry === ex ? { background: 'var(--accent-bg)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}) }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chain table */}
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  {(side === 'calls' || side === 'both') && (
                    <>
                      <th style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 500 }}>Call Bid</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Call Ask</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Vol</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>OI</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>IV</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Δ</th>
                    </>
                  )}
                  <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700, color: 'var(--accent)' }}>STRIKE</th>
                  {(side === 'puts' || side === 'both') && (
                    <>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Δ</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>IV</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>OI</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Vol</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Put Bid</th>
                      <th style={{ textAlign: 'right', paddingRight: 8, fontWeight: 500 }}>Put Ask</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleStrikes.map(strike => {
                  const put  = expPuts.find(p => p.strike === strike);
                  const call = expCalls.find(c => c.strike === strike);
                  const isATM = strike === atmStrike;
                  return (
                    <tr key={strike} onClick={() => put && setSelected(put)}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        background: isATM ? 'var(--warn-bg)' : 'transparent',
                        borderLeft: isATM ? '2px solid var(--warn)' : '2px solid transparent',
                      }}>
                      {(side === 'calls' || side === 'both') && (
                        <>
                          <td style={{ textAlign: 'right', padding: '6px', fontVariantNumeric: 'tabular-nums', color: 'var(--pos)' }}>{call ? f2(call.bid) : '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--neg)' }}>{call ? f2(call.ask) : '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{call?.volume?.toLocaleString() ?? '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{call?.open_interest?.toLocaleString() ?? '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{call ? (call.implied_volatility * 100).toFixed(0) + '%' : '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{call?.delta?.toFixed(2) ?? '—'}</td>
                        </>
                      )}
                      <td style={{ textAlign: 'center', fontWeight: 700, padding: '6px 12px', fontVariantNumeric: 'tabular-nums', color: isATM ? 'var(--warn)' : 'var(--text)' }}>
                        {f2(strike)}{isATM ? ' ATM' : ''}
                      </td>
                      {(side === 'puts' || side === 'both') && (
                        <>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{put?.delta?.toFixed(2) ?? '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{put ? (put.implied_volatility * 100).toFixed(0) + '%' : '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{put?.open_interest?.toLocaleString() ?? '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{put?.volume?.toLocaleString() ?? '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--pos)' }}>{put ? f2(put.bid) : '—'}</td>
                          <td style={{ textAlign: 'right', paddingRight: 8, fontVariantNumeric: 'tabular-nums', color: 'var(--neg)' }}>{put ? f2(put.ask) : '—'}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', marginTop: 8 }}>
            Click any row to get an AI explanation. ATM row highlighted amber.{' '}
            <span style={{ color: 'var(--pos)' }}>Green = bid</span>,{' '}
            <span style={{ color: 'var(--neg)' }}>red = ask</span>, Δ = delta.
          </p>
        </>
      )}

      {selected && (
        <div style={{ position: 'fixed', right: 24, bottom: 24, width: 320, zIndex: 40, boxShadow: 'var(--shadow-md)' }}>
          <AIExplainer contract={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}

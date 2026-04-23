import { useState, useEffect, useCallback } from 'react';
import { API } from '../lib/api';
import { bus, EVENTS } from '../lib/event-bus';

interface Contract {
  symbol: string; option_type: string; strike: number;
  bid: number; ask: number; volume: number; open_interest: number;
  implied_volatility: number;
  delta: number | null; gamma: number | null; theta: number | null; vega: number | null;
  expiry_date: string; days_to_expiry: number;
}

type SideFilter = 'puts' | 'calls' | 'both';

function IvSmileChart({ puts, calls, atmStrike }: { puts: Contract[]; calls: Contract[]; atmStrike: number }) {
  const all = [...puts, ...calls];
  if (all.length < 2) return null;
  const strikes = [...new Set(all.map(c => c.strike))].sort((a, b) => a - b);
  const W = 260, H = 70, padL = 6, padR = 6, padT = 6, padB = 16;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const ivByStrike = (contracts: Contract[]) => Object.fromEntries(contracts.map(c => [c.strike, c.implied_volatility * 100]));
  const callIVs = ivByStrike(calls);
  const putIVs  = ivByStrike(puts);
  const allIVs  = Object.values({ ...callIVs, ...putIVs }).filter(v => v > 0);
  if (!allIVs.length) return null;
  const ivMin = Math.min(...allIVs), ivMax = Math.max(...allIVs);
  const ivRange = ivMax - ivMin || 1;
  const xScale = strikes.length > 1 ? plotW / (strikes.length - 1) : plotW;
  const yScale = (iv: number) => padT + plotH - ((iv - ivMin) / ivRange) * plotH;
  const xPos   = (idx: number) => padL + idx * xScale;

  const pathFor = (ivMap: Record<number, number>) => {
    const pts = strikes.map((s, i) => ivMap[s] ? `${xPos(i).toFixed(1)},${yScale(ivMap[s]).toFixed(1)}` : null).filter(Boolean);
    return pts.length < 2 ? '' : `M ${pts.join(' L ')}`;
  };

  return (
    <div style={{ marginTop: 8, marginBottom: 12 }}>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>IV Skew (calls <span style={{ color: 'var(--pos)' }}>—</span> puts <span style={{ color: 'var(--neg)' }}>—</span>)</p>
      <svg width={W} height={H} style={{ display: 'block' }}>
        {/* ATM line */}
        {atmStrike > 0 && (() => {
          const atmIdx = strikes.indexOf(atmStrike);
          if (atmIdx < 0) return null;
          const x = xPos(atmIdx);
          return <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="var(--warn)" strokeWidth="1" strokeDasharray="3,2" opacity="0.7" />;
        })()}
        {/* IV lines */}
        {pathFor(callIVs) && <path d={pathFor(callIVs)} stroke="var(--pos)" strokeWidth="1.5" fill="none" />}
        {pathFor(putIVs)  && <path d={pathFor(putIVs)}  stroke="var(--neg)" strokeWidth="1.5" fill="none" />}
        {/* X axis labels */}
        {[0, Math.floor(strikes.length / 2), strikes.length - 1].map(idx => (
          <text key={idx} x={xPos(idx)} y={H - 2} textAnchor="middle" fill="var(--text-muted)" fontSize="9">
            {strikes[idx]?.toFixed(0)}
          </text>
        ))}
      </svg>
    </div>
  );
}

function OiBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(1, value / max) * 48 : 0;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, width: 60, justifyContent: 'flex-end' }}>
      <div style={{ width: pct, height: 4, background: color, borderRadius: 2, opacity: 0.7 }} />
      <span style={{ fontSize: 9, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', minWidth: 28, textAlign: 'right' }}>
        {value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value || '—'}
      </span>
    </div>
  );
}

function GreekPanel({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const isCall = contract.option_type === 'call';
  const mid = ((contract.bid || 0) + (contract.ask || 0)) / 2;
  const breakeven = isCall ? contract.strike + mid : contract.strike - mid;
  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, width: 300, zIndex: 40,
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 'var(--fs-md)' }}>
            {contract.symbol} ${contract.strike} {isCall ? 'C' : 'P'}
          </span>
          <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)', color: isCall ? 'var(--pos)' : 'var(--neg)',
            background: isCall ? 'var(--accent-bg)' : 'rgba(239,83,80,0.10)',
            padding: '1px 6px', borderRadius: 'var(--radius-pill)' }}>
            {isCall ? 'CALL' : 'PUT'}
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Bid', value: `$${contract.bid?.toFixed(2) ?? '—'}`, color: 'var(--pos)' },
          { label: 'Ask', value: `$${contract.ask?.toFixed(2) ?? '—'}`, color: 'var(--neg)' },
          { label: 'Mid', value: `$${mid.toFixed(2)}`, color: 'var(--text)' },
          { label: 'IV', value: `${(contract.implied_volatility * 100).toFixed(1)}%`, color: 'var(--accent)' },
          { label: 'Volume', value: contract.volume?.toLocaleString() ?? '—', color: 'var(--text)' },
          { label: 'OI', value: contract.open_interest?.toLocaleString() ?? '—', color: 'var(--text)' },
        ].map(r => (
          <div key={r.label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '6px 8px' }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{r.label}</p>
            <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: r.color, fontVariantNumeric: 'tabular-nums' }}>{r.value}</p>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginBottom: 10 }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Greeks</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { label: 'Delta (Δ)', value: contract.delta?.toFixed(3) ?? '—' },
            { label: 'Gamma (Γ)', value: contract.gamma?.toFixed(4) ?? '—' },
            { label: 'Theta (Θ)', value: contract.theta != null ? contract.theta.toFixed(3) : '—' },
            { label: 'Vega (V)',  value: contract.vega?.toFixed(3) ?? '—' },
          ].map(g => (
            <div key={g.label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '5px 8px' }}>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 1 }}>{g.label}</p>
              <p style={{ fontWeight: 600, fontSize: 'var(--fs-xs)', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{g.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--accent-bg)', borderRadius: 'var(--radius-sm)', padding: '6px 10px' }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Breakeven at expiry</p>
        <p style={{ fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>${breakeven.toFixed(2)}</p>
      </div>

      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>Expires {contract.expiry_date} · {contract.days_to_expiry}d</p>
    </div>
  );
}

export default function OptionsChain() {
  const [symbol, setSymbol]               = useState('');
  const [loaded, setLoaded]               = useState('');
  const [chain, setChain]                 = useState<{puts: Contract[], calls: Contract[]}>({ puts: [], calls: [] });
  const [quote, setQuote]                 = useState<{ last: number; change: number; changePct: number } | null>(null);
  const [loading, setLoading]             = useState(false);
  const [selected, setSelected]           = useState<Contract | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [side, setSide]                   = useState<SideFilter>('both');
  const [strikeRange, setStrikeRange]     = useState(20);
  const [showSmile, setShowSmile]         = useState(false);

  const fetchAll = useCallback(async (sym: string) => {
    if (!sym) return;
    setLoading(true);
    const token = localStorage.getItem('hedgeiq_token');
    const [cr, qr] = await Promise.all([
      fetch(`${API}/api/v1/options/${sym}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/api/v1/quotes/${sym}/chart?days=5`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]);
    const puts: Contract[] = cr.puts || [];
    const calls: Contract[] = cr.calls || [];
    setChain({ puts, calls });
    setQuote({ last: qr.last_close || 0, change: qr.day_change || 0, changePct: qr.day_change_pct || 0 });
    const firstExpiry = puts[0]?.expiry_date || calls[0]?.expiry_date || '';
    setSelectedExpiry(firstExpiry);
    setLoaded(sym);
    setLoading(false);
  }, []);

  useEffect(() => {
    return bus.on<string>(EVENTS.SYMBOL_SELECTED, sym => {
      setSymbol(sym);
      fetchAll(sym);
    });
  }, [fetchAll]);

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
  const totalPutOI  = expPuts.reduce((s, p) => s + (p.open_interest || 0), 0);
  const totalCallOI = expCalls.reduce((s, p) => s + (p.open_interest || 0), 0);
  const pcRatio = totalCallOI > 0 ? (totalPutOI / totalCallOI).toFixed(2) : '—';
  const maxPutOI  = Math.max(...expPuts.map(p => p.open_interest || 0), 1);
  const maxCallOI = Math.max(...expCalls.map(c => c.open_interest || 0), 1);
  const maxOI     = Math.max(maxPutOI, maxCallOI);

  return (
    <div style={{ padding: 16 }}>
      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && fetchAll(symbol)}
          placeholder="Enter ticker e.g. AAPL  (or click a position row)"
          className="input" style={{ flex: 1 }} />
        <button onClick={() => fetchAll(symbol)} className="btn btn-primary" style={{ padding: '7px 20px' }}>Load Chain</button>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', padding: '32px 0', textAlign: 'center' }}>Loading chain…</p>}

      {loaded && quote && !loading && (
        <>
          {/* Symbol header + P/C ratio */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Symbol</span>
              <h2 style={{ fontWeight: 700, fontSize: 'var(--fs-xl)', color: 'var(--text)', margin: 0 }}>{loaded}</h2>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-2xl)', color: 'var(--text)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>${f2(quote.last)}</p>
              <p style={{ fontSize: 'var(--fs-sm)', color: quote.change >= 0 ? 'var(--pos)' : 'var(--neg)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                {quote.change >= 0 ? '+' : ''}{f2(quote.change)} ({quote.change >= 0 ? '+' : ''}{f2(quote.changePct)}%)
              </p>
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', display: 'flex', gap: 16, marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, marginBottom: 2 }}>Put/Call OI Ratio</p>
                <p style={{ margin: 0, fontWeight: 700, color: parseFloat(pcRatio) > 1 ? 'var(--neg)' : 'var(--pos)', fontVariantNumeric: 'tabular-nums' }}>{pcRatio}</p>
              </div>
              <div>
                <p style={{ margin: 0, marginBottom: 2 }}>Total OI</p>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{(totalPutOI + totalCallOI).toLocaleString()}</p>
              </div>
              <div>
                <p style={{ margin: 0, marginBottom: 2 }}>Expiries</p>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)' }}>{allExpiries.length}</p>
              </div>
              <button onClick={() => setShowSmile(s => !s)} className="btn btn-sm btn-ghost">
                {showSmile ? 'Hide IV Smile' : 'IV Smile'}
              </button>
            </div>
          </div>

          {/* IV Smile */}
          {showSmile && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 12 }}>
              <IvSmileChart puts={expPuts} calls={expCalls} atmStrike={atmStrike} />
            </div>
          )}

          {/* Filters */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 8, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
            <div>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Option type</p>
              <div className="seg">
                {(['calls', 'puts', 'both'] as SideFilter[]).map(s => (
                  <button key={s} className={side === s ? 'active' : ''} onClick={() => setSide(s)}
                    style={{ textTransform: 'capitalize' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Strike range</p>
              <select value={strikeRange} onChange={e => setStrikeRange(parseInt(e.target.value))}
                className="input" style={{ width: 'auto', padding: '4px 8px', fontSize: 'var(--fs-xs)' }}>
                <option value={6}>±3 strikes</option>
                <option value={10}>±5 strikes</option>
                <option value={20}>±10 strikes</option>
                <option value={100}>All</option>
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
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'auto', border: '1px solid var(--border)', background: 'var(--bg)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  {(side === 'calls' || side === 'both') && (
                    <>
                      <th style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 500 }}>Bid</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Ask</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Vol</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>OI ▸</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>IV%</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Δ</th>
                      <th style={{ textAlign: 'center', padding: '2px 4px', fontWeight: 500, fontSize: 9, color: 'var(--pos)' }}>CALLS</th>
                    </>
                  )}
                  <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700, color: 'var(--accent)' }}>STRIKE</th>
                  {(side === 'puts' || side === 'both') && (
                    <>
                      <th style={{ textAlign: 'center', padding: '2px 4px', fontWeight: 500, fontSize: 9, color: 'var(--neg)' }}>PUTS</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Δ</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>IV%</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>◂ OI</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Vol</th>
                      <th style={{ textAlign: 'right', fontWeight: 500 }}>Bid</th>
                      <th style={{ textAlign: 'right', paddingRight: 8, fontWeight: 500 }}>Ask</th>
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
                    <tr key={strike}
                      style={{
                        borderBottom: '1px solid var(--border)', cursor: 'pointer',
                        background: isATM ? 'var(--warn-bg)' : 'transparent',
                        borderLeft: isATM ? '2px solid var(--warn)' : '2px solid transparent',
                      }}>
                      {(side === 'calls' || side === 'both') && (
                        <>
                          <td style={{ textAlign: 'right', padding: '5px 6px', fontVariantNumeric: 'tabular-nums', color: 'var(--pos)' }}>{call ? f2(call.bid) : '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--neg)' }}>{call ? f2(call.ask) : '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{call?.volume?.toLocaleString() ?? '—'}</td>
                          <td style={{ textAlign: 'right', padding: '5px 4px' }} onClick={() => call && setSelected(call)}>
                            <OiBar value={call?.open_interest ?? 0} max={maxOI} color="var(--pos)" />
                          </td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{call ? (call.implied_volatility * 100).toFixed(0) : '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{call?.delta?.toFixed(2) ?? '—'}</td>
                          <td style={{ width: 4 }} />
                        </>
                      )}
                      <td style={{ textAlign: 'center', fontWeight: 700, padding: '5px 12px', fontVariantNumeric: 'tabular-nums', color: isATM ? 'var(--warn)' : 'var(--text)', whiteSpace: 'nowrap' }}>
                        {f2(strike)}{isATM ? ' ◆' : ''}
                      </td>
                      {(side === 'puts' || side === 'both') && (
                        <>
                          <td style={{ width: 4 }} />
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{put?.delta?.toFixed(2) ?? '—'}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{put ? (put.implied_volatility * 100).toFixed(0) : '—'}</td>
                          <td style={{ textAlign: 'right', padding: '5px 4px' }} onClick={() => put && setSelected(put)}>
                            <OiBar value={put?.open_interest ?? 0} max={maxOI} color="var(--neg)" />
                          </td>
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
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', marginTop: 6 }}>
            Click any row to see Greeks + breakeven. OI bars show relative open interest. <span style={{ color: 'var(--warn)' }}>◆</span> = ATM.
          </p>
        </>
      )}

      {selected && <GreekPanel contract={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

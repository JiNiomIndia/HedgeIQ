/**
 * OptionsChain — Fidelity-style options chain browser.
 * Header with symbol quote, expiration tabs, calls/puts toggle, strike filter,
 * grouped by expiry, ATM highlighting, inline Buy/Sell buttons.
 * @component
 */
import { useEffect, useState } from 'react';
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
  const [symbol, setSymbol] = useState('');
  const [loaded, setLoaded] = useState('');
  const [chain, setChain] = useState<{puts: Contract[], calls: Contract[]}>({puts:[], calls:[]});
  const [quote, setQuote] = useState<{ last: number; change: number; changePct: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [side, setSide] = useState<SideFilter>('puts');
  const [strikeRange, setStrikeRange] = useState(20);
  const [showChart, setShowChart] = useState(true);

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

  // Filter to the selected expiry
  const expPuts = chain.puts.filter(p => !selectedExpiry || p.expiry_date === selectedExpiry);
  const expCalls = chain.calls.filter(c => !selectedExpiry || c.expiry_date === selectedExpiry);
  const allStrikes = [...new Set([...expPuts, ...expCalls].map(c => c.strike))].sort((a, b) => a - b);

  // ATM is the strike closest to current price
  const atmStrike = quote && allStrikes.length
    ? allStrikes.reduce((best, s) => Math.abs(s - quote.last) < Math.abs(best - quote.last) ? s : best, allStrikes[0])
    : 0;

  // Limit to +/- strikeRange / 2 around ATM
  const half = Math.floor(strikeRange / 2);
  const atmIdx = allStrikes.indexOf(atmStrike);
  const visibleStrikes = atmIdx >= 0
    ? allStrikes.slice(Math.max(0, atmIdx - half), atmIdx + half + 1)
    : allStrikes.slice(0, strikeRange);

  const dte = expPuts[0]?.days_to_expiry ?? expCalls[0]?.days_to_expiry ?? 0;

  return (
    <div className="p-4">
      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && fetchAll()}
          placeholder="Enter ticker e.g. AAPL"
          className="flex-1 rounded px-3 py-2 text-sm border border-gray-700 outline-none"
          style={{backgroundColor:'#131929', color:'#E8EAF0'}} />
        <button onClick={fetchAll} className="px-5 py-2 rounded text-sm font-bold"
          style={{backgroundColor:'#00D4FF', color:'#0A0E1A'}}>Load Chain</button>
      </div>

      {loading && <p className="text-gray-500 text-sm py-8 text-center">Loading chain…</p>}

      {loaded && quote && !loading && (
        <>
          {/* Symbol header with quote */}
          <div className="rounded p-3 mb-3 flex items-center gap-4 flex-wrap" style={{backgroundColor:'#131929', border:'1px solid #1F2937'}}>
            <div>
              <span className="text-sm text-gray-400">SYMBOL</span>
              <h2 className="font-bold text-xl" style={{color:'#E8EAF0'}}>{loaded}</h2>
            </div>
            <div className="text-right">
              <p className="font-bold text-2xl" style={{color:'#E8EAF0'}}>${f2(quote.last)}</p>
              <p className="text-sm" style={{color: quote.change >= 0 ? '#00FF88' : '#FF4466'}}>
                {quote.change >= 0 ? '+' : ''}{f2(quote.change)} ({quote.change >= 0 ? '+' : ''}{f2(quote.changePct)}%)
              </p>
            </div>
            <div className="text-xs text-gray-400 flex gap-4 ml-auto">
              <span>Contracts: <span style={{color:'#E8EAF0'}}>{chain.puts.length + chain.calls.length}</span></span>
              <span>Expiries: <span style={{color:'#E8EAF0'}}>{allExpiries.length}</span></span>
              <button onClick={() => setShowChart(s => !s)}
                className="text-xs px-2 py-0.5 rounded" style={{backgroundColor:'#1F2937', color:'#00D4FF'}}>
                {showChart ? 'Hide chart' : 'Show chart'}
              </button>
            </div>
          </div>

          {/* Price chart */}
          {showChart && (
            <div className="rounded p-3 mb-3" style={{backgroundColor:'#131929', border:'1px solid #1F2937'}}>
              <PriceChart symbol={loaded} days={90} height={240} />
            </div>
          )}

          {/* Filters */}
          <div className="rounded p-3 mb-2 flex flex-wrap items-center gap-4" style={{backgroundColor:'#131929', border:'1px solid #1F2937'}}>
            <div>
              <p className="text-xs text-gray-500 mb-1">Option type</p>
              <div className="flex rounded overflow-hidden" style={{border:'1px solid #1F2937'}}>
                {(['calls','puts','both'] as SideFilter[]).map(s => (
                  <button key={s} onClick={() => setSide(s)}
                    className="px-3 py-1 text-xs font-bold capitalize"
                    style={side === s
                      ? { backgroundColor:'#00D4FF', color:'#0A0E1A' }
                      : { backgroundColor:'transparent', color:'#9CA3AF' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Strike range</p>
              <select value={strikeRange} onChange={e => setStrikeRange(parseInt(e.target.value))}
                className="rounded px-2 py-1 text-xs border border-gray-700 outline-none"
                style={{backgroundColor:'#0A0E1A', color:'#E8EAF0'}}>
                <option value={6}>6 strikes</option>
                <option value={10}>10 strikes</option>
                <option value={20}>20 strikes</option>
                <option value={50}>All</option>
              </select>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Expiration ({dte} days)</p>
              <div className="flex gap-1 flex-wrap">
                {allExpiries.map(ex => (
                  <button key={ex} onClick={() => setSelectedExpiry(ex)}
                    className="text-xs px-3 py-1 rounded font-bold"
                    style={selectedExpiry === ex
                      ? { backgroundColor:'#0F2540', color:'#00D4FF', border:'1px solid #00D4FF' }
                      : { backgroundColor:'#131929', color:'#9CA3AF', border:'1px solid #1F2937' }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chain table */}
          <div className="rounded overflow-hidden border border-gray-800" style={{backgroundColor:'#0A0E1A'}}>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800" style={{backgroundColor:'#131929'}}>
                  {(side === 'calls' || side === 'both') && (
                    <>
                      <th className="text-right py-2">Call Bid</th>
                      <th className="text-right">Call Ask</th>
                      <th className="text-right">Vol</th>
                      <th className="text-right">OI</th>
                      <th className="text-right">IV</th>
                      <th className="text-right">Δ</th>
                    </>
                  )}
                  <th className="text-center py-2 font-bold px-3" style={{color:'#00D4FF'}}>STRIKE</th>
                  {(side === 'puts' || side === 'both') && (
                    <>
                      <th className="text-right">Δ</th>
                      <th className="text-right">IV</th>
                      <th className="text-right">OI</th>
                      <th className="text-right">Vol</th>
                      <th className="text-right">Put Bid</th>
                      <th className="text-right pr-2">Put Ask</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleStrikes.map(strike => {
                  const put = expPuts.find(p => p.strike === strike);
                  const call = expCalls.find(c => c.strike === strike);
                  const isATM = strike === atmStrike;
                  const row = {
                    backgroundColor: isATM ? 'rgba(255,196,0,0.08)' : 'transparent',
                    borderLeft: isATM ? '2px solid #FFC400' : 'none',
                  };
                  return (
                    <tr key={strike} className="border-b border-gray-900 hover:bg-gray-900/40 cursor-pointer transition-colors"
                      onClick={() => put && setSelected(put)}
                      style={row}>
                      {(side === 'calls' || side === 'both') && (
                        <>
                          <td className="text-right py-1.5 tabular-nums" style={{color:'#00FF88'}}>{call ? f2(call.bid) : '—'}</td>
                          <td className="text-right tabular-nums" style={{color:'#FF4466'}}>{call ? f2(call.ask) : '—'}</td>
                          <td className="text-right tabular-nums text-gray-400">{call?.volume?.toLocaleString() ?? '—'}</td>
                          <td className="text-right tabular-nums text-gray-400">{call?.open_interest?.toLocaleString() ?? '—'}</td>
                          <td className="text-right tabular-nums text-gray-400">{call ? (call.implied_volatility * 100).toFixed(0) + '%' : '—'}</td>
                          <td className="text-right tabular-nums text-gray-400">{call?.delta?.toFixed(2) ?? '—'}</td>
                        </>
                      )}
                      <td className="text-center font-bold py-1.5 px-3 tabular-nums" style={{color: isATM ? '#FFC400' : '#E8EAF0'}}>
                        {f2(strike)}{isATM ? ' ATM' : ''}
                      </td>
                      {(side === 'puts' || side === 'both') && (
                        <>
                          <td className="text-right tabular-nums text-gray-400">{put?.delta?.toFixed(2) ?? '—'}</td>
                          <td className="text-right tabular-nums text-gray-400">{put ? (put.implied_volatility * 100).toFixed(0) + '%' : '—'}</td>
                          <td className="text-right tabular-nums text-gray-400">{put?.open_interest?.toLocaleString() ?? '—'}</td>
                          <td className="text-right tabular-nums text-gray-400">{put?.volume?.toLocaleString() ?? '—'}</td>
                          <td className="text-right tabular-nums" style={{color:'#00FF88'}}>{put ? f2(put.bid) : '—'}</td>
                          <td className="text-right pr-2 tabular-nums" style={{color:'#FF4466'}}>{put ? f2(put.ask) : '—'}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Click any row to get an AI explanation. ATM row highlighted amber.
            {' '}<span style={{color:'#00FF88'}}>Green = bid</span>, <span style={{color:'#FF4466'}}>red = ask</span>, Δ = delta.
          </p>
        </>
      )}

      {/* AI explainer panel */}
      {selected && (
        <div className="fixed right-6 bottom-6 w-80 z-40 shadow-2xl">
          <AIExplainer contract={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}

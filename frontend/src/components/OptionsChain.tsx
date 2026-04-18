/**
 * OptionsChain — browse options chains for any ticker.
 * Calls GET /api/v1/options/{symbol}.
 * Two-column layout: Calls | Strike | Puts.
 * @component
 */
import { useState } from 'react';
import AIExplainer from './AIExplainer';

interface Contract {
  symbol: string; option_type: string; strike: number;
  bid: number; ask: number; volume: number; open_interest: number;
  implied_volatility: number; delta: number; expiry_date: string;
}

import { API } from '../lib/api';

export default function OptionsChain() {
  const [symbol, setSymbol] = useState('');
  const [chain, setChain] = useState<{puts: Contract[], calls: Contract[]}>({puts:[], calls:[]});
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);

  const fetchChain = async () => {
    if (!symbol) return;
    setLoading(true);
    const res = await fetch(`${API}/api/v1/options/${symbol}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` }
    });
    const data = await res.json();
    setChain({ puts: data.puts || [], calls: data.calls || [] });
    setLoading(false);
  };

  const strikes = [...new Set([...chain.puts, ...chain.calls].map(c => c.strike))].sort((a,b) => a-b);
  const f2 = (n: number) => n?.toFixed(2);

  return (
    <div className="p-6 flex gap-4">
      <div className="flex-1">
        <div className="flex gap-2 mb-4">
          <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && fetchChain()} placeholder="Enter ticker e.g. AAL"
            className="flex-1 rounded px-3 py-2 text-sm border border-gray-700"
            style={{backgroundColor:'#131929', color:'#E8EAF0'}} />
          <button onClick={fetchChain} className="px-4 py-2 rounded text-sm font-bold"
            style={{backgroundColor:'#00D4FF', color:'#0A0E1A'}}>Load Chain</button>
        </div>
        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {strikes.length > 0 && (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-right py-1">Call Bid</th><th className="text-right">Call Ask</th>
                <th className="text-right">Call OI</th>
                <th className="text-center font-bold py-1 px-2" style={{color:'#00D4FF'}}>STRIKE</th>
                <th className="text-right">Put Bid</th><th className="text-right">Put Ask</th>
                <th className="text-right">Put OI</th>
              </tr>
            </thead>
            <tbody>
              {strikes.map(strike => {
                const put = chain.puts.find(p => p.strike === strike);
                const call = chain.calls.find(c => c.strike === strike);
                return (
                  <tr key={strike} className="border-b border-gray-900 cursor-pointer hover:bg-gray-900"
                    onClick={() => put && setSelected(put)}>
                    <td className="text-right py-1 text-gray-400">{call ? f2(call.bid) : '-'}</td>
                    <td className="text-right text-gray-400">{call ? f2(call.ask) : '-'}</td>
                    <td className="text-right text-gray-500">{call?.open_interest?.toLocaleString() ?? '-'}</td>
                    <td className="text-center font-bold px-2" style={{backgroundColor:'#131929', color:'#E8EAF0'}}>{f2(strike)}</td>
                    <td className="text-right text-gray-400">{put ? f2(put.bid) : '-'}</td>
                    <td className="text-right text-gray-400">{put ? f2(put.ask) : '-'}</td>
                    <td className="text-right text-gray-500">{put?.open_interest?.toLocaleString() ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {selected && <div className="w-72"><AIExplainer contract={selected} onClose={() => setSelected(null)} /></div>}
    </div>
  );
}

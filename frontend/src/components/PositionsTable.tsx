/**
 * PositionsTable — Fidelity-style unified portfolio view.
 * Dense tabular layout: account summary cards, per-row sparkline, day change,
 * cost basis, % of portfolio. Grouped by broker/account.
 * @component
 */
import { useEffect, useState } from 'react';
import { API } from '../lib/api';
import Sparkline from './Sparkline';

interface Position {
  broker: string; accountName: string; symbol: string;
  quantity: number; entryPrice: number; currentPrice: number;
  marketValue: number; unrealisedPnl: number; unrealisedPnlPct: number;
}

const fmt = (n: number) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const pct = (n: number) => `${n >= 0 ? '+' : ''}${n?.toFixed(2)}%`;

interface ChartData { day_change: number; day_change_pct: number; last_close: number; }

export default function PositionsTable() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [dayChanges, setDayChanges] = useState<Record<string, ChartData>>({});

  useEffect(() => {
    fetch(`${API}/api/v1/positions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` }
    }).then(r => r.json()).then(data => {
      const pos: Position[] = data.positions || [];
      setPositions(pos);
      setTotalValue(data.total_value || 0);
      setTotalPnl(data.total_unrealised_pnl || 0);
      const hasDemo = pos.some((p) => p.symbol === 'AAL' && p.broker === 'Fidelity' && pos.length <= 2);
      setIsDemo(hasDemo);
      setLoading(false);
      // Fetch day changes per unique symbol in parallel
      const symbols = [...new Set(pos.map(p => p.symbol))];
      symbols.forEach(sym => {
        fetch(`${API}/api/v1/quotes/${sym}/chart?days=5`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
        })
          .then(r => r.json())
          .then(d => setDayChanges(prev => ({ ...prev, [sym]: { day_change: d.day_change, day_change_pct: d.day_change_pct, last_close: d.last_close } })))
          .catch(() => {});
      });
    }).catch(() => setLoading(false));
  }, []);

  const connectBroker = async () => {
    try {
      const res = await fetch(`${API}/api/v1/auth/connect-broker?broker=ROBINHOOD`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
      });
      const data = await res.json();
      if (data.connection_url) window.open(data.connection_url, '_blank');
    } catch { alert('Could not generate broker connection link. Try again.'); }
  };

  const totalDayChange = positions.reduce((sum, p) => sum + (dayChanges[p.symbol]?.day_change || 0) * p.quantity, 0);
  const totalDayPct = totalValue ? (totalDayChange / totalValue) * 100 : 0;
  const totalPnlPct = totalValue - totalPnl ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

  const accounts = [...new Set(positions.map(p => `${p.broker}|${p.accountName}`))];

  if (loading) return <div className="p-6 text-gray-500">Loading positions...</div>;
  if (!positions.length) return (
    <div className="p-6 text-center">
      <p className="text-gray-500 mb-4">No broker accounts connected.</p>
      <button onClick={connectBroker} className="px-4 py-2 rounded text-sm font-bold" style={{backgroundColor:'#00D4FF',color:'#0A0E1A'}}>
        Connect Robinhood
      </button>
    </div>
  );

  return (
    <div className="p-6">
      {isDemo && (
        <div className="rounded-lg px-4 py-3 mb-4 flex items-center justify-between text-sm"
          style={{backgroundColor:'rgba(255,196,0,0.08)', border:'1px solid rgba(255,196,0,0.25)', color:'#FFC400'}}>
          <span>⚠️ Showing <strong>demo data</strong> — connect your broker to see live positions</span>
          <button onClick={connectBroker}
            className="ml-4 px-3 py-1 rounded text-xs font-bold"
            style={{backgroundColor:'#FFC400', color:'#0A0E1A'}}>
            Connect Broker
          </button>
        </div>
      )}

      {/* Account summary header */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="rounded p-3" style={{backgroundColor:'#131929'}}>
          <p className="text-gray-500 text-xs mb-1">Total Value</p>
          <p className="text-xl font-bold" style={{color:'#E8EAF0'}}>{fmt(totalValue)}</p>
        </div>
        <div className="rounded p-3" style={{backgroundColor:'#131929'}}>
          <p className="text-gray-500 text-xs mb-1">Day's Change</p>
          <p className="text-xl font-bold" style={{color: totalDayChange >= 0 ? '#00FF88' : '#FF4466'}}>
            {totalDayChange >= 0 ? '+' : ''}{fmt(totalDayChange)}
          </p>
          <p className="text-xs" style={{color: totalDayChange >= 0 ? '#00FF88' : '#FF4466'}}>{pct(totalDayPct)}</p>
        </div>
        <div className="rounded p-3" style={{backgroundColor:'#131929'}}>
          <p className="text-gray-500 text-xs mb-1">Total P&amp;L</p>
          <p className="text-xl font-bold" style={{color: totalPnl >= 0 ? '#00FF88' : '#FF4466'}}>{fmt(totalPnl)}</p>
          <p className="text-xs" style={{color: totalPnl >= 0 ? '#00FF88' : '#FF4466'}}>{pct(totalPnlPct)}</p>
        </div>
        <div className="rounded p-3" style={{backgroundColor:'#131929'}}>
          <p className="text-gray-500 text-xs mb-1">Positions</p>
          <p className="text-xl font-bold" style={{color:'#E8EAF0'}}>{positions.length}</p>
          <p className="text-xs text-gray-500">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Per-account tables */}
      {accounts.map(key => {
        const [broker, accountName] = key.split('|');
        const accountPositions = positions.filter(p => p.broker === broker && p.accountName === accountName);
        const accountValue = accountPositions.reduce((s, p) => s + p.marketValue, 0);
        return (
        <div key={key} className="mb-6 rounded overflow-hidden border border-gray-800">
          <div className="px-4 py-2 flex items-center justify-between" style={{backgroundColor:'#131929'}}>
            <div>
              <span className="font-bold" style={{color:'#E8EAF0'}}>{accountName}</span>
              <span className="ml-2 text-xs text-gray-500">{broker}</span>
            </div>
            <span className="text-sm font-bold" style={{color:'#00D4FF'}}>{fmt(accountValue)}</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800" style={{backgroundColor:'#0A0E1A'}}>
                <th className="text-left py-2 pl-4">Symbol</th>
                <th className="text-right">Last</th>
                <th className="text-right">Day $</th>
                <th className="text-right">Day %</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Cost</th>
                <th className="text-right">Mkt Value</th>
                <th className="text-right">Total P&amp;L</th>
                <th className="text-right">P&amp;L %</th>
                <th className="text-right">% Port</th>
                <th className="text-center pr-4">30d</th>
              </tr>
            </thead>
            <tbody>
              {accountPositions.map((p, i) => {
                const dc = dayChanges[p.symbol];
                const dayChg = dc?.day_change || 0;
                const dayPct = dc?.day_change_pct || 0;
                const pctPort = totalValue ? (p.marketValue / totalValue) * 100 : 0;
                return (
                <tr key={i} className="border-b border-gray-900 hover:bg-gray-900/40 transition-colors">
                  <td className="py-2 pl-4 font-bold" style={{color:'#00D4FF'}}>{p.symbol}</td>
                  <td className="text-right tabular-nums" style={{color:'#E8EAF0'}}>{fmt(p.currentPrice)}</td>
                  <td className="text-right tabular-nums" style={{color: dayChg >= 0 ? '#00FF88' : '#FF4466'}}>
                    {dc ? (dayChg >= 0 ? '+' : '') + dayChg.toFixed(2) : '—'}
                  </td>
                  <td className="text-right tabular-nums" style={{color: dayChg >= 0 ? '#00FF88' : '#FF4466'}}>
                    {dc ? pct(dayPct) : '—'}
                  </td>
                  <td className="text-right tabular-nums text-gray-300">{p.quantity?.toLocaleString()}</td>
                  <td className="text-right tabular-nums text-gray-400">{fmt(p.entryPrice)}</td>
                  <td className="text-right tabular-nums font-bold" style={{color:'#E8EAF0'}}>{fmt(p.marketValue)}</td>
                  <td className="text-right tabular-nums font-bold" style={{color: p.unrealisedPnl >= 0 ? '#00FF88' : '#FF4466'}}>{fmt(p.unrealisedPnl)}</td>
                  <td className="text-right tabular-nums" style={{color: p.unrealisedPnlPct >= 0 ? '#00FF88' : '#FF4466'}}>{pct(p.unrealisedPnlPct)}</td>
                  <td className="text-right tabular-nums text-gray-400">{pctPort.toFixed(1)}%</td>
                  <td className="text-center pr-4 pl-2"><Sparkline symbol={p.symbol} days={30} width={80} height={24} /></td>
                </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-700" style={{backgroundColor:'#0F1420'}}>
                <td colSpan={6} className="py-2 pl-4 font-bold text-gray-400">Account total</td>
                <td className="text-right tabular-nums font-bold" style={{color:'#E8EAF0'}}>{fmt(accountValue)}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
        );
      })}
    </div>
  );
}

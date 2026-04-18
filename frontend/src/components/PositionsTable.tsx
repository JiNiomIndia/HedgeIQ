/**
 * PositionsTable — unified portfolio view across all brokers.
 * Fetches from GET /api/v1/positions.
 * Groups rows by broker, colours P&L green/red.
 * @component
 */
import { useEffect, useState } from 'react';

interface Position {
  broker: string; accountName: string; symbol: string;
  quantity: number; entryPrice: number; currentPrice: number;
  marketValue: number; unrealisedPnl: number; unrealisedPnlPct: number;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const fmt = (n: number) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const pct = (n: number) => `${n >= 0 ? '+' : ''}${n?.toFixed(2)}%`;

export default function PositionsTable() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);

  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/v1/positions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` }
    }).then(r => r.json()).then(data => {
      const pos = data.positions || [];
      setPositions(pos);
      setTotalValue(data.total_value || 0);
      setTotalPnl(data.total_unrealised_pnl || 0);
      // Detect demo data: mock uses ROBINHOOD + FIDELITY with DOGE
      const hasDemo = pos.some((p: Position) => p.symbol === 'DOGE' && p.broker === 'ROBINHOOD');
      setIsDemo(hasDemo);
      setLoading(false);
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

  const brokers = [...new Set(positions.map(p => p.broker))];
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
      <div className="flex gap-6 mb-6">
        <div className="rounded p-4" style={{backgroundColor:'#131929'}}>
          <p className="text-gray-500 text-xs mb-1">Total Portfolio</p>
          <p className="text-xl font-bold" style={{color:'#E8EAF0'}}>{fmt(totalValue)}</p>
        </div>
        <div className="rounded p-4" style={{backgroundColor:'#131929'}}>
          <p className="text-gray-500 text-xs mb-1">Unrealised P&amp;L</p>
          <p className="text-xl font-bold" style={{color: totalPnl >= 0 ? '#00FF88' : '#FF4466'}}>{fmt(totalPnl)}</p>
        </div>
      </div>
      {brokers.map(broker => (
        <div key={broker} className="mb-6">
          <h3 className="text-sm font-bold mb-2" style={{color:'#00D4FF'}}>{broker}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left py-2">Account</th><th className="text-left">Symbol</th>
                <th className="text-right">Qty</th><th className="text-right">Entry</th>
                <th className="text-right">Current</th><th className="text-right">Value</th>
                <th className="text-right">P&amp;L</th><th className="text-right">P&amp;L%</th>
              </tr>
            </thead>
            <tbody>
              {positions.filter(p => p.broker === broker).map((p, i) => (
                <tr key={i} className="border-b border-gray-900">
                  <td className="py-2 text-gray-400">{p.accountName}</td>
                  <td className="font-bold" style={{color:'#00D4FF'}}>{p.symbol}</td>
                  <td className="text-right">{p.quantity?.toLocaleString()}</td>
                  <td className="text-right">{fmt(p.entryPrice)}</td>
                  <td className="text-right">{fmt(p.currentPrice)}</td>
                  <td className="text-right">{fmt(p.marketValue)}</td>
                  <td className="text-right font-bold" style={{color: p.unrealisedPnl >= 0 ? '#00FF88' : '#FF4466'}}>{fmt(p.unrealisedPnl)}</td>
                  <td className="text-right" style={{color: p.unrealisedPnlPct >= 0 ? '#00FF88' : '#FF4466'}}>{pct(p.unrealisedPnlPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

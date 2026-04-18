/**
 * EmergencyHedge — calculate optimal puts to hedge a stock position.
 * Designed for midnight use: large inputs, high contrast, minimal clicks.
 * Calls POST /api/v1/hedge/recommend.
 * @component
 */
import { useState } from 'react';

interface Recommendation {
  expiry_date: string; strike: number; ask: number;
  total_cost: number; breakeven_price: number;
  open_interest: number; value_score: number; ai_explanation?: string;
  _localExplain?: string; _explaining?: boolean;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const fmt = (n: number) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function EmergencyHedge() {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const explainRec = async (idx: number, rec: Recommendation) => {
    setRecs(prev => prev.map((r, i) => i === idx ? { ...r, _explaining: true } : r));
    try {
      const res = await fetch(`${API}/api/v1/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
        body: JSON.stringify({
          contract: {
            symbol, expiry: rec.expiry_date, strike: rec.strike,
            option_type: 'put', ask: rec.ask,
            open_interest: rec.open_interest,
            total_cost: rec.total_cost, breakeven: rec.breakeven_price,
          }
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setRecs(prev => prev.map((r, i) => i === idx
        ? { ...r, _localExplain: data.explanation, _explaining: false } : r));
    } catch {
      setRecs(prev => prev.map((r, i) => i === idx
        ? { ...r, _localExplain: 'Could not load explanation. Try again.', _explaining: false } : r));
    }
  };

  const positionValue = parseFloat(shares) * parseFloat(currentPrice);
  const positionLoss = (parseFloat(currentPrice) - parseFloat(entryPrice)) * parseFloat(shares);

  const findHedge = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/v1/hedge/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
        body: JSON.stringify({ symbol, shares_held: parseInt(shares),
          entry_price: parseFloat(entryPrice), current_price: parseFloat(currentPrice) })
      });
      if (!res.ok) { const e = await res.json(); setError(e.detail || 'No liquid options found.'); }
      else setRecs((await res.json()).recommendations);
    } catch { setError('Connection error. Check backend is running.'); }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-2" style={{color:'#E8EAF0'}}>Emergency Hedge Calculator</h2>
      <p className="text-gray-500 text-sm mb-6">Designed for midnight decisions — find the best puts in 60 seconds.</p>
      <div className="rounded p-4 mb-4 space-y-3" style={{backgroundColor:'#131929'}}>
        <div>
          <label className="text-gray-500 text-xs block mb-1">TICKER SYMBOL</label>
          <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="AAL"
            className="w-full rounded px-3 py-3 text-2xl font-bold border border-gray-700"
            style={{backgroundColor:'#0A0E1A', color:'#E8EAF0'}} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{label:'SHARES HELD', val:shares, set:setShares, ph:'5000'},
            {label:'ENTRY PRICE', val:entryPrice, set:setEntryPrice, ph:'11.30'},
            {label:'CURRENT PRICE', val:currentPrice, set:setCurrentPrice, ph:'10.97'}].map(f => (
            <div key={f.label}>
              <label className="text-gray-500 text-xs block mb-1">{f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} type="number" step="0.01"
                className="w-full rounded px-3 py-3 text-xl font-bold border border-gray-700"
                style={{backgroundColor:'#0A0E1A', color:'#E8EAF0'}} />
            </div>
          ))}
        </div>
        {shares && currentPrice && (
          <div className="flex gap-4 text-sm pt-1">
            <span className="text-gray-500">Position: <span className="font-bold" style={{color:'#E8EAF0'}}>{fmt(positionValue)}</span></span>
            {entryPrice && <span className="text-gray-500">P&amp;L: <span className="font-bold" style={{color: positionLoss >= 0 ? '#00FF88' : '#FF4466'}}>{fmt(positionLoss)}</span></span>}
          </div>
        )}
        <button onClick={findHedge} disabled={loading || !symbol || !shares || !currentPrice}
          className="w-full py-4 rounded text-lg font-bold disabled:opacity-50"
          style={{backgroundColor:'#00D4FF', color:'#0A0E1A'}}>
          {loading ? 'Calculating...' : '🛡️ Find Best Hedge'}
        </button>
      </div>
      {error && <div className="rounded p-3 text-sm mb-4 border" style={{borderColor:'#FF4466', color:'#FF4466', backgroundColor:'rgba(255,68,102,0.1)'}}>{error}</div>}
      {recs.map((rec, i) => (
        <div key={i} className="rounded p-4 mb-3 border border-gray-800" style={{backgroundColor:'#131929'}}>
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-lg" style={{color:'#00D4FF'}}>{rec.expiry_date} ${rec.strike} PUT</span>
            <span className="font-bold text-lg" style={{color:'#E8EAF0'}}>{fmt(rec.total_cost)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <span className="text-gray-500">Ask: <span style={{color:'#E8EAF0'}}>${rec.ask?.toFixed(2)}</span></span>
            <span className="text-gray-500">Breakeven: <span style={{color:'#E8EAF0'}}>${rec.breakeven_price?.toFixed(2)}</span></span>
            <span className="text-gray-500">OI: <span style={{color:'#E8EAF0'}}>{rec.open_interest?.toLocaleString()}</span></span>
          </div>
          {(rec.ai_explanation || rec._localExplain) && (
            <p className="text-gray-400 text-xs border-t border-gray-800 pt-2 leading-relaxed">
              {rec._localExplain || rec.ai_explanation}
            </p>
          )}
          <div className="flex gap-2 mt-3 flex-wrap">
            {!rec._localExplain && !rec.ai_explanation && (
              <button
                onClick={() => explainRec(i, rec)}
                disabled={rec._explaining}
                className="text-xs px-3 py-1 rounded font-bold disabled:opacity-50"
                style={{backgroundColor:'rgba(0,212,255,0.15)', color:'#00D4FF', border:'1px solid rgba(0,212,255,0.3)'}}>
                {rec._explaining ? 'Claude is thinking…' : '🤖 Ask Claude to explain'}
              </button>
            )}
            <button className="text-xs px-3 py-1 rounded" style={{backgroundColor:'#1F2937', color:'#E8EAF0'}}>Buy on Fidelity</button>
            <button className="text-xs px-3 py-1 rounded" style={{backgroundColor:'#1F2937', color:'#E8EAF0'}}>Buy on Public</button>
          </div>
        </div>
      ))}
    </div>
  );
}

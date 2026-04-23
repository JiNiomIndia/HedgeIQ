import { useState } from 'react';
import { API } from '../lib/api';
import { Markdown } from '../lib/markdown';
import PayoffChart from './PayoffChart';

interface Recommendation {
  expiry_date: string; strike: number; ask: number;
  total_cost: number; breakeven_price: number;
  open_interest: number; value_score: number; ai_explanation?: string;
  contracts_to_buy: number;
  _localExplain?: string; _explaining?: boolean;
}

const fmt = (n: number) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function EmergencyHedge() {
  const [symbol, setSymbol]           = useState('');
  const [shares, setShares]           = useState('');
  const [entryPrice, setEntryPrice]   = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [recs, setRecs]               = useState<Recommendation[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const explainRec = async (idx: number, rec: Recommendation) => {
    setRecs(prev => prev.map((r, i) => i === idx ? { ...r, _explaining: true } : r));
    try {
      const res = await fetch(`${API}/api/v1/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
        body: JSON.stringify({
          contract: { symbol, expiry: rec.expiry_date, strike: rec.strike,
            option_type: 'put', ask: rec.ask, open_interest: rec.open_interest,
            total_cost: rec.total_cost, breakeven: rec.breakeven_price },
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setRecs(prev => prev.map((r, i) => i === idx ? { ...r, _localExplain: data.explanation, _explaining: false } : r));
    } catch {
      setRecs(prev => prev.map((r, i) => i === idx
        ? { ...r, _localExplain: 'Could not load explanation. Try again.', _explaining: false } : r));
    }
  };

  const positionValue = parseFloat(shares) * parseFloat(currentPrice);
  const positionLoss  = (parseFloat(currentPrice) - parseFloat(entryPrice)) * parseFloat(shares);

  const findHedge = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/v1/hedge/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
        body: JSON.stringify({ symbol, shares_held: parseInt(shares),
          entry_price: parseFloat(entryPrice), current_price: parseFloat(currentPrice) }),
      });
      if (!res.ok) { const e = await res.json(); setError(e.detail || 'No liquid options found.'); }
      else setRecs((await res.json()).recommendations);
    } catch { setError('Connection error. Check backend is running.'); }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', borderRadius: 'var(--radius-sm)', padding: '10px 12px',
    background: 'var(--bg)', color: 'var(--text)',
    border: '1px solid var(--border)', fontFamily: 'var(--font-sans)',
    fontSize: 'var(--fs-lg)', fontWeight: 700,
  };

  return (
    <div style={{ padding: 24, maxWidth: 680 }}>
      <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Emergency Hedge Calculator</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginBottom: 24 }}>
        Designed for midnight decisions — find the best puts in 60 seconds.
      </p>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ color: 'var(--text-subtle)', fontSize: 'var(--fs-xs)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ticker Symbol</label>
          <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
            placeholder="AAL" style={{ ...inputStyle, fontSize: 'var(--fs-2xl)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[{ label: 'Shares Held', val: shares, set: setShares, ph: '5000' },
            { label: 'Entry Price', val: entryPrice, set: setEntryPrice, ph: '11.30' },
            { label: 'Current Price', val: currentPrice, set: setCurrentPrice, ph: '10.97' }].map(f => (
            <div key={f.label}>
              <label style={{ color: 'var(--text-subtle)', fontSize: 'var(--fs-xs)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                type="number" step="0.01" style={inputStyle} />
            </div>
          ))}
        </div>

        {shares && currentPrice && (
          <div style={{ display: 'flex', gap: 16, fontSize: 'var(--fs-sm)', paddingTop: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>Position: <span style={{ fontWeight: 700, color: 'var(--text)' }}>{fmt(positionValue)}</span></span>
            {entryPrice && (
              <span style={{ color: 'var(--text-muted)' }}>P&L: <span style={{ fontWeight: 700, color: positionLoss >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmt(positionLoss)}</span></span>
            )}
          </div>
        )}

        <button onClick={findHedge} disabled={loading || !symbol || !shares || !currentPrice}
          className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-lg)', padding: '14px', opacity: loading || !symbol || !shares || !currentPrice ? 0.5 : 1 }}>
          {loading ? 'Calculating…' : '🛡️ Find Best Hedge'}
        </button>
      </div>

      {error && (
        <div style={{ borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 'var(--fs-sm)', marginBottom: 16, border: '1px solid var(--neg)', color: 'var(--neg)', background: 'var(--neg-bg)' }}>
          {error}
        </div>
      )}

      {recs.map((rec, i) => {
        const contracts = rec.contracts_to_buy || Math.ceil(parseInt(shares || '0') / 100);
        return (
          <div key={i} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'var(--accent)' }}>{rec.expiry_date} ${rec.strike} PUT</span>
                <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--accent-muted)', color: 'var(--accent)' }}>#{i + 1}</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'var(--text)' }}>{fmt(rec.total_cost)}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 'var(--fs-xs)', marginBottom: 12 }}>
              {[['Ask', `$${rec.ask?.toFixed(2)}`], ['Breakeven', `$${rec.breakeven_price?.toFixed(2)}`],
                ['OI', rec.open_interest?.toLocaleString()], ['Contracts', contracts]].map(([k, v]) => (
                <span key={k} style={{ color: 'var(--text-muted)' }}>{k}: <span style={{ color: 'var(--text)' }}>{v}</span></span>
              ))}
            </div>

            <div style={{ marginBottom: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Payoff at expiry — combined stock + put</p>
              <PayoffChart
                shares={parseInt(shares)} entryPrice={parseFloat(entryPrice)}
                currentPrice={parseFloat(currentPrice)} strike={rec.strike}
                premium={rec.ask} contracts={contracts}
              />
            </div>

            {(rec.ai_explanation || rec._localExplain) && (
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <Markdown text={rec._localExplain || rec.ai_explanation || ''} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {!rec._localExplain && !rec.ai_explanation && (
                <button onClick={() => explainRec(i, rec)} disabled={rec._explaining}
                  className="chip chip-outline" style={{ cursor: rec._explaining ? 'default' : 'pointer', opacity: rec._explaining ? 0.5 : 1, fontSize: 'var(--fs-xs)' }}>
                  {rec._explaining ? 'Claude is thinking…' : '🤖 Ask Claude to explain'}
                </button>
              )}
              <button className="chip" style={{ fontSize: 'var(--fs-xs)', cursor: 'pointer' }}>Buy on Fidelity</button>
              <button className="chip" style={{ fontSize: 'var(--fs-xs)', cursor: 'pointer' }}>Buy on Public</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

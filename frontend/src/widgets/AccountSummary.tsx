import { useEffect, useState } from 'react';
import { API } from '../lib/api';

const fmt = (n: number) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const pct = (n: number) => `${n >= 0 ? '+' : ''}${n?.toFixed(2)}%`;

export default function AccountSummary() {
  const [totalValue, setTotalValue]     = useState(0);
  const [totalPnl, setTotalPnl]         = useState(0);
  const [posCount, setPosCount]         = useState(0);
  const [totalDayChg]                   = useState(0);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetch(`${API}/api/v1/positions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
    })
      .then(r => r.json())
      .then(data => {
        const positions = data.positions || [];
        setTotalValue(data.total_value || 0);
        setTotalPnl(data.total_unrealised_pnl || 0);
        setPosCount(positions.length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 12 }}>
      {[0,1,2,3].map(i => <div key={i} style={{ height: 64, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', opacity: 0.6 }} />)}
    </div>
  );

  const pnlPct  = totalValue - totalPnl ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;
  const dayChgPct = totalValue ? (totalDayChg / totalValue) * 100 : 0;

  const cards = [
    { label: 'Portfolio Value', value: fmt(totalValue), sub: null, color: 'var(--text)' },
    { label: "Day's Change", value: (totalDayChg >= 0 ? '+' : '') + fmt(totalDayChg), sub: pct(dayChgPct), color: totalDayChg >= 0 ? 'var(--pos)' : 'var(--neg)' },
    { label: 'Total P&L', value: fmt(totalPnl), sub: pct(pnlPct), color: totalPnl >= 0 ? 'var(--pos)' : 'var(--neg)' },
    { label: 'Open Positions', value: String(posCount), sub: null, color: 'var(--text)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 12 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '10px 14px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</p>
          <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: c.color, fontVariantNumeric: 'tabular-nums' }}>{c.value}</p>
          {c.sub && <p style={{ fontSize: 'var(--fs-xs)', color: c.color, fontVariantNumeric: 'tabular-nums' }}>{c.sub}</p>}
        </div>
      ))}
    </div>
  );
}

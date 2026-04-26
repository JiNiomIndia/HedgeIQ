import { useEffect, useState } from 'react';
import { API } from '../lib/api';
import Sparkline from './Sparkline';
import { bus, EVENTS } from '../lib/event-bus';
import BrokerPicker from './BrokerPicker';

interface Position {
  broker: string; accountName: string; symbol: string;
  quantity: number; entryPrice: number; currentPrice: number;
  marketValue: number; unrealisedPnl: number; unrealisedPnlPct: number;
}

const fmt = (n: number) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const pct = (n: number) => `${n >= 0 ? '+' : ''}${n?.toFixed(2)}%`;

interface ChartData { day_change: number; day_change_pct: number; last_close: number; }

export default function PositionsTable() {
  const [positions, setPositions]     = useState<Position[]>([]);
  const [loading, setLoading]         = useState(true);
  const [totalValue, setTotalValue]   = useState(0);
  const [totalPnl, setTotalPnl]       = useState(0);
  const [isDemo, setIsDemo]           = useState(false);
  const [dayChanges, setDayChanges]   = useState<Record<string, ChartData>>({});
  const [showPicker, setShowPicker]   = useState(false);

  useEffect(() => {
    fetch(`${API}/api/v1/positions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` }
    }).then(r => r.json()).then(data => {
      const pos: Position[] = data.positions || [];
      setPositions(pos);
      setTotalValue(data.total_value || 0);
      setTotalPnl(data.total_unrealised_pnl || 0);
      setIsDemo(pos.some(p => p.symbol === 'AAL' && p.broker === 'Fidelity' && pos.length <= 2));
      setLoading(false);
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
  const totalDayPct    = totalValue ? (totalDayChange / totalValue) * 100 : 0;
  const totalPnlPct    = totalValue - totalPnl ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;
  const accounts       = [...new Set(positions.map(p => `${p.broker}|${p.accountName}`))];

  if (loading) return <div style={{ padding: 24, color: 'var(--text-muted)' }}>Loading positions...</div>;

  if (!positions.length) return (
    <>
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No broker accounts connected.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={connectBroker} className="btn btn-primary">Connect Robinhood</button>
          <button onClick={() => setShowPicker(true)} className="btn">+ Add broker</button>
        </div>
      </div>
      {showPicker && <BrokerPicker onClose={() => setShowPicker(false)} />}
    </>
  );

  const summaryCard = { background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: 12, border: '1px solid var(--border)' };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--text)' }}>Positions</h3>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="btn btn-sm btn-ghost"
          style={{ fontSize: 'var(--fs-xs)' }}
          aria-label="Connect another broker"
          title="Connect a broker via SnapTrade"
        >
          + Add broker
        </button>
      </div>
      {showPicker && <BrokerPicker onClose={() => setShowPicker(false)} />}
      {isDemo && (
        <div style={{ borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--fs-sm)', background: 'var(--warn-bg)', border: '1px solid var(--warn)', color: 'var(--warn)' }}>
          <span>⚠️ Showing <strong>demo data</strong> — connect your broker to see live positions</span>
          <button onClick={connectBroker} className="btn btn-sm"
            style={{ marginLeft: 16, background: 'var(--warn)', color: 'var(--bg)', borderColor: 'var(--warn)' }}>
            Connect Broker
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={summaryCard}>
          <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--fs-xs)', marginBottom: 4 }}>Total Value</p>
          <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: 'var(--text)' }}>{fmt(totalValue)}</p>
        </div>
        <div style={summaryCard}>
          <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--fs-xs)', marginBottom: 4 }}>Day's Change</p>
          <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: totalDayChange >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
            {totalDayChange >= 0 ? '+' : ''}{fmt(totalDayChange)}
          </p>
          <p style={{ fontSize: 'var(--fs-xs)', color: totalDayChange >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{pct(totalDayPct)}</p>
        </div>
        <div style={summaryCard}>
          <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--fs-xs)', marginBottom: 4 }}>Total P&L</p>
          <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: totalPnl >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmt(totalPnl)}</p>
          <p style={{ fontSize: 'var(--fs-xs)', color: totalPnl >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{pct(totalPnlPct)}</p>
        </div>
        <div style={summaryCard}>
          <p style={{ color: 'var(--text-subtle)', fontSize: 'var(--fs-xs)', marginBottom: 4 }}>Positions</p>
          <p style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: 'var(--text)' }}>{positions.length}</p>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Per-account tables */}
      {accounts.map(key => {
        const [broker, accountName] = key.split('|');
        const accountPositions = positions.filter(p => p.broker === broker && p.accountName === accountName);
        const accountValue = accountPositions.reduce((s, p) => s + p.marketValue, 0);
        return (
          <div key={key} style={{ marginBottom: 24, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
              <div>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{accountName}</span>
                <span style={{ marginLeft: 8, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{broker}</span>
              </div>
              <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--accent)' }}>{fmt(accountValue)}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                  {['Symbol','Last','Day $','Day %','Qty','Cost','Mkt Value','Total P&L','P&L %','% Port','30d'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 0 ? 'left' : i === 10 ? 'center' : 'right', padding: '8px 6px', fontWeight: 500, paddingLeft: i === 0 ? 16 : 6, paddingRight: i === 10 ? 16 : 6 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accountPositions.map((p, i) => {
                  const dc     = dayChanges[p.symbol];
                  const dayChg = dc?.day_change || 0;
                  const dayPct = dc?.day_change_pct || 0;
                  const pctPort = totalValue ? (p.marketValue / totalValue) * 100 : 0;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                      onClick={() => { bus.emit(EVENTS.SYMBOL_SELECTED, p.symbol); bus.emit(EVENTS.POSITION_SELECTED, p); }}>
                      <td style={{ padding: '6px 6px 6px 16px', fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{p.symbol}</td>
                      <td style={{ textAlign: 'right', padding: '6px', fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>{fmt(p.currentPrice)}</td>
                      <td style={{ textAlign: 'right', padding: '6px', fontVariantNumeric: 'tabular-nums', color: dayChg >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                        {dc ? (dayChg >= 0 ? '+' : '') + dayChg.toFixed(2) : '—'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '6px', fontVariantNumeric: 'tabular-nums', color: dayChg >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                        {dc ? pct(dayPct) : '—'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '6px', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{p.quantity?.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', padding: '6px', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{fmt(p.entryPrice)}</td>
                      <td style={{ textAlign: 'right', padding: '6px', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--text)' }}>{fmt(p.marketValue)}</td>
                      <td style={{ textAlign: 'right', padding: '6px', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: p.unrealisedPnl >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmt(p.unrealisedPnl)}</td>
                      <td style={{ textAlign: 'right', padding: '6px', fontVariantNumeric: 'tabular-nums', color: p.unrealisedPnlPct >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{pct(p.unrealisedPnlPct)}</td>
                      <td style={{ textAlign: 'right', padding: '6px', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{pctPort.toFixed(1)}%</td>
                      <td style={{ textAlign: 'center', padding: '6px 16px 6px 6px' }}><Sparkline symbol={p.symbol} days={30} width={80} height={24} /></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-sunken)' }}>
                  <td colSpan={6} style={{ padding: '8px 6px 8px 16px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>Account total</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--fs-xs)' }}>{fmt(accountValue)}</td>
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

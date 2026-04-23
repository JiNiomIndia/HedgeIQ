import { useState, useEffect } from 'react';
import { API } from '../lib/api';
import { bus, EVENTS } from '../lib/event-bus';

type Direction = 'buy' | 'sell';
type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';

const ORDER_TYPES: { key: OrderType; label: string }[] = [
  { key: 'market',     label: 'Market' },
  { key: 'limit',      label: 'Limit' },
  { key: 'stop',       label: 'Stop' },
  { key: 'stop_limit', label: 'Stop Limit' },
];

function brokerLinks(symbol: string, qty: number, direction: Direction, limit?: number) {
  const action = direction === 'buy' ? 'BUY' : 'SELL';
  return [
    {
      name: 'Robinhood',
      url: `https://robinhood.com/stocks/${symbol}`,
      hint: 'Opens Robinhood stock page',
    },
    {
      name: 'IBKR',
      url: `https://ndcdyn.interactivebrokers.com/Universal/servlet/BasicAccountManagement.formSampleCookieCheck?action=GOTOURL&URL=https://www.ibkr.com/portal/redirect?action=ORDER&conid=${symbol}&orderType=${limit ? 'LMT' : 'MKT'}&quantity=${qty}&side=${action}`,
      hint: 'Pre-fills IBKR order ticket',
    },
    {
      name: 'Fidelity',
      url: `https://digital.fidelity.com/ftgw/digital/easy-order-check?symbol=${symbol}&action=${action}&quantity=${qty}`,
      hint: 'Opens Fidelity order entry',
    },
  ];
}

export default function OrderTicket() {
  const [symbol, setSymbol]     = useState('');
  const [direction, setDir]     = useState<Direction>('buy');
  const [orderType, setOType]   = useState<OrderType>('market');
  const [qty, setQty]           = useState('');
  const [limitPrice, setLimit]  = useState('');
  const [stopPrice, setStop]    = useState('');
  const [quote, setQuote]       = useState<{ last: number; change: number; changePct: number } | null>(null);
  const [quoteLoading, setQL]   = useState(false);

  useEffect(() => bus.on<string>(EVENTS.SYMBOL_SELECTED, s => { setSymbol(s); loadQuote(s); }), []);

  const loadQuote = async (sym: string) => {
    if (!sym) return;
    setQL(true);
    try {
      const r = await fetch(`${API}/api/v1/quotes/${sym}/chart?days=5`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
      });
      const d = await r.json();
      setQuote({ last: d.last_close || 0, change: d.day_change || 0, changePct: d.day_change_pct || 0 });
    } catch { /* ignore */ }
    setQL(false);
  };

  const qtyNum = parseFloat(qty) || 0;
  const limitNum = parseFloat(limitPrice) || undefined;
  const stopNum  = parseFloat(stopPrice)  || undefined;
  const estValue = quote && qtyNum ? quote.last * qtyNum : 0;
  const showLimit = orderType === 'limit' || orderType === 'stop_limit';
  const showStop  = orderType === 'stop'  || orderType === 'stop_limit';

  const sym = symbol.toUpperCase();
  const links = sym && qtyNum ? brokerLinks(sym, qtyNum, direction, limitNum) : [];

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      {/* Direction toggle */}
      <div className="seg" style={{ width: '100%', marginBottom: 14 }}>
        <button className={direction === 'buy' ? 'active' : ''} onClick={() => setDir('buy')}
          style={{ flex: 1, textAlign: 'center', color: direction === 'buy' ? 'var(--pos)' : undefined }}>
          Buy
        </button>
        <button className={direction === 'sell' ? 'active' : ''} onClick={() => setDir('sell')}
          style={{ flex: 1, textAlign: 'center', color: direction === 'sell' ? 'var(--neg)' : undefined }}>
          Sell
        </button>
      </div>

      {/* Symbol + quote */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Symbol</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && loadQuote(symbol)}
            placeholder="e.g. AAPL" className="input" style={{ flex: 1, textTransform: 'uppercase' }} />
          <button onClick={() => loadQuote(symbol)} className="btn btn-sm btn-ghost">↻</button>
        </div>
        {quote && (
          <div style={{ marginTop: 4, fontSize: 'var(--fs-xs)', display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>${quote.last.toFixed(2)}</span>
            <span style={{ color: quote.change >= 0 ? 'var(--pos)' : 'var(--neg)', fontVariantNumeric: 'tabular-nums' }}>
              {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.change >= 0 ? '+' : ''}{quote.changePct.toFixed(2)}%)
            </span>
          </div>
        )}
        {quoteLoading && <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Loading quote…</p>}
      </div>

      {/* Order type */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Order Type</label>
        <div className="seg" style={{ width: '100%' }}>
          {ORDER_TYPES.map(ot => (
            <button key={ot.key} className={orderType === ot.key ? 'active' : ''} onClick={() => setOType(ot.key)}
              style={{ flex: 1, textAlign: 'center', fontSize: 10 }}>
              {ot.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Quantity (shares)</label>
        <input type="number" value={qty} onChange={e => setQty(e.target.value)}
          placeholder="0" min="1" className="input" style={{ width: '100%' }} />
      </div>

      {/* Limit price */}
      {showLimit && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Limit Price ($)</label>
          <input type="number" value={limitPrice} onChange={e => setLimit(e.target.value)}
            placeholder={quote ? quote.last.toFixed(2) : '0.00'} className="input" style={{ width: '100%' }} />
        </div>
      )}

      {/* Stop price */}
      {showStop && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Stop Price ($)</label>
          <input type="number" value={stopPrice} onChange={e => setStop(e.target.value)}
            placeholder={quote ? quote.last.toFixed(2) : '0.00'} className="input" style={{ width: '100%' }} />
        </div>
      )}

      {/* Estimated value */}
      {estValue > 0 && (
        <div style={{ background: direction === 'buy' ? 'rgba(38,166,154,0.08)' : 'rgba(239,83,80,0.08)',
          border: `1px solid ${direction === 'buy' ? 'var(--pos)' : 'var(--neg)'}`,
          borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: 14 }}>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Estimated {direction === 'buy' ? 'cost' : 'proceeds'}</p>
          <p style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', color: direction === 'buy' ? 'var(--pos)' : 'var(--neg)', fontVariantNumeric: 'tabular-nums', margin: 0 }}>
            ${estValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p style={{ fontSize: 9, color: 'var(--text-subtle)', marginTop: 4 }}>
            {qty} shares × ${quote?.last.toFixed(2)} market price · excludes fees
          </p>
        </div>
      )}

      {/* Broker deep-links */}
      {links.length > 0 && (
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>
            Place with broker
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {links.map(l => (
              <a key={l.name} href={l.url} target="_blank" rel="noreferrer"
                className="btn btn-sm"
                style={{
                  textDecoration: 'none', textAlign: 'left', display: 'flex', justifyContent: 'space-between',
                  background: direction === 'buy' ? 'var(--pos)' : 'var(--neg)',
                  color: '#fff', borderColor: 'transparent',
                }}>
                <span>{direction === 'buy' ? '↑' : '↓'} {direction.charAt(0).toUpperCase() + direction.slice(1)} {sym} on {l.name}</span>
                <span style={{ fontSize: 9, opacity: 0.8 }}>↗</span>
              </a>
            ))}
          </div>
          <p style={{ fontSize: 9, color: 'var(--text-subtle)', marginTop: 8 }}>
            Links open your broker's order page. HedgeIQ does not execute trades.
            {stopNum && ` Stop: $${stopNum.toFixed(2)}.`}
          </p>
        </div>
      )}

      {!sym && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>
          <p>Click any position row to auto-fill the symbol,</p>
          <p>or type a ticker and press Enter.</p>
        </div>
      )}
    </div>
  );
}

// Trade Ticket & Order Preview

const TradeScreen = ({ nav, initialSymbol = 'NVDA', initialSide = 'buy' }) => {
  const [symbol, setSymbol] = React.useState(initialSymbol);
  const [side, setSide] = React.useState(initialSide);
  const [qty, setQty] = React.useState(10);
  const [orderType, setOrderType] = React.useState('Limit');
  const [limitPrice, setLimitPrice] = React.useState(TICKERS[initialSymbol]?.price?.toFixed(2) || '0');
  const [tif, setTif] = React.useState('Day');
  const [account, setAccount] = React.useState('TOD');
  const [reviewOpen, setReviewOpen] = React.useState(false);

  const t = TICKERS[symbol] || TICKERS.NVDA;
  const est = qty * parseFloat(limitPrice || 0);
  const candles = genCandles(60, t.price * 0.95, t.price, 0.015, symbol.charCodeAt(0));
  const acct = ACCOUNTS.find(a => a.id === account);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', height: '100%', overflow: 'hidden' }}>
      {/* Left — trade ticket */}
      <aside style={{ overflowY: 'auto', background: 'var(--surface)', borderRight: '1px solid var(--border)' }} className="scroll">
        <div className="flex items-center justify-between" style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', fontFamily: 'var(--font-display)' }}>Trade</div>
          <div className="flex items-center gap-2" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            <span>Help mode</span>
            <label className="flex items-center" style={{ cursor: 'pointer' }}>
              <input type="checkbox" style={{ display: 'none' }}/>
              <span style={{ width: 28, height: 16, background: 'var(--surface-sunken)', borderRadius: 999, position: 'relative', display: 'block', border: '1px solid var(--border)' }}>
                <span style={{ position: 'absolute', top: 1, left: 1, width: 12, height: 12, borderRadius: 999, background: 'var(--text-muted)' }}/>
              </span>
            </label>
          </div>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Action</label>
            <div className="seg" style={{ marginTop: 4, width: '100%' }}>
              <button className={side === 'buy' ? 'active' : ''} onClick={() => setSide('buy')} style={{ flex: 1, color: side === 'buy' ? 'var(--pos)' : 'var(--text-muted)', fontWeight: 600 }}>Buy</button>
              <button className={side === 'sell' ? 'active' : ''} onClick={() => setSide('sell')} style={{ flex: 1, color: side === 'sell' ? 'var(--neg)' : 'var(--text-muted)', fontWeight: 600 }}>Sell</button>
              <button style={{ flex: 1 }}>Sell short</button>
              <button style={{ flex: 1 }}>Buy to cover</button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Trade type</label>
            <select className="input" style={{ marginTop: 4 }}>
              <option>Stocks / ETFs</option><option>Options</option><option>Mutual funds</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Account</label>
            <select className="input" style={{ marginTop: 4 }} value={account} onChange={e => setAccount(e.target.value)}>
              {ACCOUNTS.filter(a => a.type !== 'Retirement (external)').map(a => (
                <option key={a.id} value={a.id}>{a.name} {a.num}</option>
              ))}
            </select>
            <div style={{ marginTop: 10, padding: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <div className="flex justify-between" style={{ fontSize: 'var(--fs-xs)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cash available to trade</span>
                <span className="mono" style={{ fontWeight: 600 }}>{fmtMoney(acct.balance * 0.05, { cents: 2 })}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 'var(--fs-xs)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Buying power (margin)</span>
                <span className="mono" style={{ fontWeight: 600 }}>{fmtMoney(acct.balance * 0.1, { cents: 2 })}</span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 'var(--fs-xs)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Available w/o margin impact</span>
                <span className="mono" style={{ fontWeight: 600 }}>{fmtMoney(acct.balance * 0.05 - 200, { cents: 2 })}</span>
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Symbol</label>
            <div style={{ position: 'relative', marginTop: 4 }}>
              <input className="input" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}/>
              <I.Search className="icon-sm" style={{ position: 'absolute', right: 10, top: 10, color: 'var(--text-muted)' }}/>
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-sm)', marginTop: 6 }}>
              <div className="flex items-baseline gap-2">
                <span style={{ fontWeight: 700 }}>{symbol}</span>
                <span className="mono" style={{ fontSize: 'var(--fs-lg)', fontWeight: 600 }}>{fmtMoney(t.price)}</span>
                <span className="mono" style={{ fontSize: 'var(--fs-xs)', color: t.chg >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{t.chg >= 0 ? '+' : ''}{t.chg.toFixed(2)} ({fmtPct(t.chgPct)})</span>
              </div>
              <div className="flex gap-3" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                <span>Bid <span className="mono">{fmtMoney(t.price - 0.06)}</span> × 4,800</span>
                <span>Ask <span className="mono">{fmtMoney(t.price + 0.06)}</span> × 100</span>
                <span>Vol <span className="mono">{fmtCompact(t.vol)}</span></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Quantity</label>
              <input className="input" style={{ marginTop: 4 }} type="number" value={qty} onChange={e => setQty(parseFloat(e.target.value) || 0)}/>
              <div className="flex gap-1" style={{ marginTop: 4 }}>
                {[10, 25, 50, 100].map(n => (
                  <button key={n} className="btn btn-xs" onClick={() => setQty(n)}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Order type</label>
              <select className="input" style={{ marginTop: 4 }} value={orderType} onChange={e => setOrderType(e.target.value)}>
                <option>Market</option><option>Limit</option><option>Stop</option><option>Stop limit</option><option>Trailing stop $</option><option>Trailing stop %</option>
              </select>
            </div>
          </div>

          {orderType === 'Limit' && (
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Limit price</label>
              <input className="input" style={{ marginTop: 4 }} value={limitPrice} onChange={e => setLimitPrice(e.target.value)}/>
              <div className="flex gap-1" style={{ marginTop: 4 }}>
                {[-0.50, -0.10, +0.10, +0.50].map(d => (
                  <button key={d} className="btn btn-xs" onClick={() => setLimitPrice((parseFloat(limitPrice) + d).toFixed(2))}>{d > 0 ? '+' : ''}{d.toFixed(2)}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Time in force</label>
              <select className="input" style={{ marginTop: 4 }} value={tif} onChange={e => setTif(e.target.value)}>
                <option>Day</option><option>GTC 60 days</option><option>Fill or Kill</option><option>Immediate or Cancel</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Route</label>
              <select className="input" style={{ marginTop: 4 }}>
                <option>Smart (auto)</option><option>ARCA</option><option>NSDQ</option>
              </select>
            </div>
          </div>

          <div style={{ padding: 12, background: 'color-mix(in oklch, var(--accent) 5%, var(--surface))', border: '1px solid color-mix(in oklch, var(--accent) 30%, var(--border))', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>
              <I.Sparkle size={10} style={{ display: 'inline', marginRight: 4 }}/> Copilot check
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', lineHeight: 1.5, color: 'var(--text-muted)' }}>
              This order uses <strong style={{ color: 'var(--text)' }}>{((est / acct.balance) * 100).toFixed(1)}%</strong> of your account. {symbol} is up {fmtPct(t.chgPct)} today — limit may fill below market. Implied cost basis after fill: <strong style={{ color: 'var(--text)' }}>{fmtMoney(parseFloat(limitPrice))}</strong>.
            </div>
          </div>

          <div className="divider"/>
          <div className="flex justify-between" style={{ fontSize: 'var(--fs-sm)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Estimated value</span>
            <span className="mono" style={{ fontWeight: 600, fontSize: 'var(--fs-lg)' }}>{fmtMoney(est)}</span>
          </div>
          <div className="flex justify-between" style={{ fontSize: 'var(--fs-xs)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Estimated commission</span>
            <span className="mono">$0.00</span>
          </div>

          <button className={side === 'buy' ? 'btn btn-pos' : 'btn btn-neg'} style={{ width: '100%', padding: '12px', fontSize: 'var(--fs-md)', fontWeight: 700, letterSpacing: '0.02em' }} onClick={() => setReviewOpen(true)}>
            Preview order
          </button>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', color: 'var(--text-muted)' }}>
            <I.Info size={12}/> Important disclosure information
          </button>
        </div>
      </aside>

      {/* Right — quote + chart + order book */}
      <main className="scroll" style={{ overflowY: 'auto', padding: 'var(--gap)', background: 'var(--bg)' }}>
        <div className="card" style={{ padding: 'var(--card-p)', marginBottom: 'var(--gap)' }}>
          <div className="flex items-baseline gap-3" style={{ marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--chip)', display: 'grid', placeItems: 'center', fontWeight: 700, color: 'var(--accent)', fontSize: 'var(--fs-md)' }}>{symbol.slice(0,2)}</div>
            <div>
              <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, letterSpacing: '-0.01em' }}>{symbol} <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>· {t.name}</span></div>
              <div className="flex gap-3" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                <span>{t.sector}</span><span>NASDAQ</span><span>Real-time</span>
              </div>
            </div>
            <span className="grow"/>
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, letterSpacing: '-0.01em' }}>{fmtMoney(t.price)}</div>
              <div className="mono" style={{ fontSize: 'var(--fs-sm)', color: t.chg >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 600 }}>
                {t.chg >= 0 ? '▲' : '▼'} {Math.abs(t.chg).toFixed(2)} · {fmtPct(t.chgPct)}
              </div>
            </div>
          </div>
          <CandleChart candles={candles} w={900} h={260}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--gap)' }}>
          <div className="card card-p">
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Level II book</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>Bids</div>
                {[[4800,0.06],[2400,0.08],[1200,0.12],[6000,0.18],[3200,0.22]].map(([sz, off], i) => (
                  <div key={i} className="flex justify-between mono" style={{ fontSize: 'var(--fs-xs)', padding: '3px 0', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'var(--pos-bg)', width: `${(sz/6000)*100}%`, borderRadius: 2 }}/>
                    <span style={{ color: 'var(--pos)', zIndex: 1 }}>{fmtMoney(t.price - off)}</span>
                    <span style={{ zIndex: 1 }}>{sz.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 600 }}>Asks</div>
                {[[100,0.06],[800,0.10],[1500,0.14],[4200,0.18],[2800,0.24]].map(([sz, off], i) => (
                  <div key={i} className="flex justify-between mono" style={{ fontSize: 'var(--fs-xs)', padding: '3px 0', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'var(--neg-bg)', width: `${(sz/4200)*100}%`, borderRadius: 2, right: 'auto' }}/>
                    <span style={{ color: 'var(--neg)', zIndex: 1 }}>{fmtMoney(t.price + off)}</span>
                    <span style={{ zIndex: 1 }}>{sz.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card card-p">
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Key stats</div>
            {[
              ['Market cap', fmtCompact(t.mktCap)],
              ['P/E ratio', t.pe ? t.pe.toFixed(2) : '—'],
              ['Dividend yield', t.div ? (t.div / t.price * 100).toFixed(2) + '%' : '—'],
              ['Beta', t.beta],
              ['52w high', fmtMoney(t.high52)],
              ['52w low', fmtMoney(t.low52)],
              ['Avg volume', fmtCompact(t.vol)],
            ].map(([k, v], i) => (
              <div key={i} className="flex justify-between" style={{ fontSize: 'var(--fs-xs)', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span className="mono" style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card card-p">
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Recent activity</div>
            {[
              ['15:58:42', 'Buy', 200, t.price - 0.02],
              ['15:58:39', 'Sell', 100, t.price + 0.01],
              ['15:58:36', 'Buy', 450, t.price],
              ['15:58:32', 'Buy', 50, t.price + 0.02],
              ['15:58:28', 'Sell', 300, t.price - 0.04],
            ].map(([time, dir, sz, px], i) => (
              <div key={i} className="flex mono" style={{ fontSize: 'var(--fs-xs)', padding: '3px 0', gap: 10 }}>
                <span style={{ color: 'var(--text-subtle)', width: 60 }}>{time}</span>
                <span style={{ color: dir === 'Buy' ? 'var(--pos)' : 'var(--neg)', width: 36 }}>{dir}</span>
                <span style={{ width: 50, textAlign: 'right' }}>{sz}</span>
                <span style={{ marginLeft: 'auto' }}>{fmtMoney(px)}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
      {reviewOpen && (
        <OrderPreviewModal onClose={() => setReviewOpen(false)} side={side} symbol={symbol} qty={qty} limitPrice={limitPrice} orderType={orderType} tif={tif} account={acct} onConfirm={() => { setReviewOpen(false); alert('Demo order placed (not real)'); }}/>
      )}
    </div>
  );
};

const OrderPreviewModal = ({ onClose, side, symbol, qty, limitPrice, orderType, tif, account, onConfirm }) => {
  const est = qty * parseFloat(limitPrice || 0);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 200, display: 'grid', placeItems: 'center' }} onClick={onClose}>
      <div className="card" style={{ width: 480, padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-lg)', fontWeight: 700 }}>Review order</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><I.X className="icon-sm"/></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ padding: 12, background: side === 'buy' ? 'var(--pos-bg)' : 'var(--neg-bg)', border: `1px solid ${side === 'buy' ? 'var(--pos)' : 'var(--neg)'}`, borderRadius: 'var(--radius-sm)', color: side === 'buy' ? 'var(--pos)' : 'var(--neg)', fontWeight: 700, fontSize: 'var(--fs-md)', marginBottom: 14 }}>
            {side === 'buy' ? 'BUY' : 'SELL'} {qty} shares of {symbol} @ {orderType} {fmtMoney(parseFloat(limitPrice))} {tif}
          </div>
          {[
            ['Account', `${account.name} ${account.num}`],
            ['Symbol', symbol],
            ['Action', side === 'buy' ? 'Buy' : 'Sell'],
            ['Quantity', qty + ' shares'],
            ['Order type', orderType],
            ['Limit price', fmtMoney(parseFloat(limitPrice))],
            ['Time in force', tif],
            ['Estimated value', fmtMoney(est)],
            ['Estimated commission', '$0.00'],
          ].map(([k, v], i) => (
            <div key={i} className="flex justify-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--fs-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span className="mono" style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div className="flex gap-2" style={{ marginTop: 18 }}>
            <button className="btn" onClick={onClose} style={{ flex: 1 }}>Edit order</button>
            <button className={side === 'buy' ? 'btn btn-pos' : 'btn btn-neg'} onClick={onConfirm} style={{ flex: 1 }}>Place order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// TradeDrawer — right-side slide-in panel (does NOT replace screen)
// Fidelity-style trade ticket with two-step flow: form → preview
// Opens via window.openTrade(symbol, side)
// ============================================================

const TRADE_TYPES = [
  'Stocks/ETFs', 'Options', 'Mutual Funds', 'Crypto',
  'Fixed Income', 'Recurring Investment', 'Conditional', 'Baskets',
];

const ORDER_TYPES_STOCK = [
  'Market', 'Limit', 'Conditional', 'Stop Loss', 'Stop Limit',
  'Trailing Stop Loss ($)', 'Trailing Stop Loss (%)',
  'Trailing Stop Limit ($)', 'Trailing Stop Limit (%)',
];

const TIF_OPTIONS = [
  'Day', 'Good til Canceled', 'Fill or Kill',
  'Immediate or Cancel', 'On the Open', 'On the Close',
];

// Tiny dropdown select that matches the screenshots (expands below the field)
const DrawerDropdown = ({ label, value, options, onChange, renderOption, placeholder, searchable, leadingChildren }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef();
  React.useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 0, padding: '8px 12px 2px' }}>
          {label}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', padding: label ? '0 12px 10px' : '10px 12px',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
          fontSize: 'var(--fs-sm)', color: 'var(--text)', fontWeight: 500,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {leadingChildren}
          {value || <span style={{ color: 'var(--text-subtle)' }}>{placeholder}</span>}
        </span>
        <I.ChevD size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }}/>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-md)', maxHeight: 260, overflowY: 'auto', marginTop: 2,
        }} className="scroll">
          {options.map((opt, i) => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const isSelected = optValue === value;
            return (
              <button key={i}
                onClick={() => { onChange(optValue); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
                  fontSize: 'var(--fs-sm)', background: isSelected ? 'var(--accent)' : 'transparent',
                  color: isSelected ? 'var(--accent-contrast)' : 'var(--text)', cursor: 'pointer',
                  fontWeight: isSelected ? 600 : 400,
                }}>
                {renderOption ? renderOption(opt, isSelected) : optValue}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Compact field group that visually mimics Fidelity's fields
const DrawerField = ({ children, style }) => (
  <div style={{
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)', ...style,
  }}>
    {children}
  </div>
);

const TradeDrawer = ({ open, initial, onClose }) => {
  const [step, setStep] = React.useState('form'); // 'form' | 'preview' | 'placed'
  const [helpMode, setHelpMode] = React.useState(false);
  const [tradeType, setTradeType] = React.useState('Stocks/ETFs');
  const [accountId, setAccountId] = React.useState('IRA1');
  const [accountDetailsOpen, setAccountDetailsOpen] = React.useState(true);
  const [symbol, setSymbol] = React.useState('SNOW');
  const [action, setAction] = React.useState('Buy');
  const [qty, setQty] = React.useState('');
  const [qtyUnit, setQtyUnit] = React.useState('Shares'); // Shares | Dollars
  const [orderType, setOrderType] = React.useState('Limit');
  const [limitPrice, setLimitPrice] = React.useState('');
  const [tif, setTif] = React.useState('Day');
  const [tradeCapacity, setTradeCapacity] = React.useState('Margin'); // Cash | Margin

  // Draggable popup state — position on open
  const getDefaultPos = () => {
    if (typeof window === 'undefined') return { x: 800, y: 80 };
    const w = window.innerWidth;
    return { x: Math.max(24, w - 440), y: 72 };
  };
  const [pos, setPos] = React.useState(getDefaultPos);
  React.useEffect(() => { if (open) setPos(getDefaultPos()); }, [open]);
  const [dragging, setDragging] = React.useState(false);
  const [minimized, setMinimized] = React.useState(false);
  const dragRef = React.useRef({ dx: 0, dy: 0 });
  const popupRef = React.useRef(null);

  const startDrag = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    setDragging(true);
    const rect = popupRef.current?.getBoundingClientRect();
    dragRef.current = { dx: e.clientX - (rect?.left || 0), dy: e.clientY - (rect?.top || 0) };
    e.preventDefault();
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const nx = Math.max(0, Math.min(window.innerWidth - 420, e.clientX - dragRef.current.dx));
      const ny = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragRef.current.dy));
      setPos({ x: nx, y: ny });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  // Reset state when drawer opens with new context
  React.useEffect(() => {
    if (open && initial) {
      setSymbol(initial.symbol || 'SNOW');
      setAction(initial.side === 'sell' ? 'Sell' : 'Buy');
      setStep('form');
      const t = TICKERS[initial.symbol] || TICKERS.SNOW;
      if (t) setLimitPrice(t.price.toFixed(2));
    }
  }, [open, initial]);

  if (!open) return null;

  const t = TICKERS[symbol] || TICKERS.SNOW;
  const acct = ACCOUNTS.find(a => a.id === accountId) || ACCOUNTS[1];
  const buyingPower = acct.balance * 0.10 + 2000; // mock
  const ownedQty = (POSITIONS[accountId] || []).find(p => p.sym === symbol)?.qty || 0;

  const qtyNum = parseFloat(qty) || 0;
  const priceForEst = orderType === 'Limit' ? parseFloat(limitPrice || 0) : t.price;
  const estValue = qtyUnit === 'Shares' ? qtyNum * priceForEst : qtyNum;

  const canPreview = qtyNum > 0 && symbol && (orderType !== 'Limit' || parseFloat(limitPrice) > 0);

  const openResearch = () => {
    const url = `Research.html?symbol=${encodeURIComponent(symbol)}`;
    window.open(url, '_blank', 'width=1280,height=900');
  };
  const openOptionChain = () => {
    const url = `OptionChain.html?symbol=${encodeURIComponent(symbol)}`;
    window.open(url, '_blank', 'width=1400,height=900');
  };

  return (
    <React.Fragment>
      {/* Floating, draggable Trade popup — no backdrop, underlying screen stays interactive */}
      <aside
        ref={popupRef}
        style={{
          position: 'fixed', top: pos.y, left: pos.x, width: 400, maxHeight: 'calc(100vh - 32px)', zIndex: 301,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 20px 60px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column',
          animation: minimized ? 'none' : 'hiq-pop-in 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)',
          height: minimized ? 'auto' : undefined,
        }}>
        {/* Header — drag handle */}
        <div
          onMouseDown={startDrag}
          className="flex items-center"
          style={{ padding: '12px 14px', borderBottom: minimized ? 0 : '1px solid var(--border)', gap: 10, cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--text-subtle)' }}/>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--text-subtle)' }}/>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--text-subtle)' }}/>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--text-subtle)' }}/>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--text-subtle)' }}/>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--text-subtle)' }}/>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-lg)', fontWeight: 700 }}>Trade</div>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginLeft: 4, padding: '2px 8px', borderRadius: 999, background: 'var(--surface-sunken)', fontWeight: 600 }}>{symbol}</span>
          <span className="grow"/>
          <label className="flex items-center gap-2" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <span>Help mode</span>
            <span
              onClick={() => setHelpMode(h => !h)}
              style={{
                width: 32, height: 18, background: helpMode ? 'var(--accent)' : 'var(--surface-sunken)',
                borderRadius: 999, position: 'relative', border: '1px solid var(--border)',
                transition: 'background 0.15s',
              }}>
              <span style={{
                position: 'absolute', top: 1, left: helpMode ? 15 : 1, width: 14, height: 14,
                borderRadius: 999, background: helpMode ? 'var(--accent-contrast)' : 'var(--text-muted)',
                transition: 'left 0.15s',
              }}/>
            </span>
          </label>
          <button className="btn btn-ghost btn-sm" onClick={() => setMinimized(m => !m)} title={minimized ? 'Expand' : 'Minimize'}>
            <I.Minus size={14}/>
          </button>
          <button className="btn btn-ghost btn-sm" title="More"><I.Dots size={14}/></button>
          <button className="btn btn-ghost btn-sm" onClick={onClose} title="Close">
            <I.X size={14} style={{ color: 'var(--pos)' }}/>
          </button>
        </div>

        {!minimized && step === 'form' && (
          <div className="scroll" style={{ flexGrow: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Trade type */}
            <DrawerField>
              <DrawerDropdown
                label="TRADE"
                value={tradeType}
                options={TRADE_TYPES}
                onChange={setTradeType}
              />
            </DrawerField>

            {/* Account + buying power */}
            <DrawerField>
              <DrawerDropdown
                label="ACCOUNT"
                value={`${acct.name.split(' · ')[0]} ${acct.name.includes('·') ? '' : ''}(${acct.num.slice(-4) ? '*' + acct.num.slice(-4) : acct.num})`.replace(/\s+/g, ' ')}
                options={ACCOUNTS.filter(a => a.type !== 'Retirement (external)').map(a => ({
                  value: a.id, label: a.name, num: a.num,
                }))}
                onChange={setAccountId}
                renderOption={(opt, selected) => (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span>{opt.label}</span>
                    <span className="mono" style={{ fontSize: 10, color: selected ? 'var(--accent-contrast)' : 'var(--text-subtle)' }}>{opt.num}</span>
                  </div>
                )}
              />
              {accountDetailsOpen && (
                <div style={{ padding: '4px 12px 12px', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                  <div className="flex justify-between" style={{ padding: '3px 0' }}>
                    <span>Overnight buying power</span>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--text)' }}>{fmtMoney(buyingPower, { cents: 2 })}</span>
                  </div>
                  <div className="flex justify-between" style={{ padding: '3px 0' }}>
                    <span>Intraday buying power</span>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--text)' }}>{fmtMoney(buyingPower, { cents: 2 })}</span>
                  </div>
                  <div className="flex justify-between" style={{ padding: '3px 0' }}>
                    <span>Available without margin impact</span>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--text)' }}>{fmtMoney(buyingPower, { cents: 2 })}</span>
                  </div>
                  <div className="flex items-center" style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 4, gap: 4 }}>
                    <span>As of Apr-19-2026 05:19:20 PM ET</span>
                    <I.Refresh size={10}/>
                  </div>
                </div>
              )}
            </DrawerField>

            {/* Symbol */}
            <DrawerField>
              <div style={{ padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>SYMBOL</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    value={symbol}
                    onChange={e => setSymbol(e.target.value.toUpperCase())}
                    style={{
                      flexGrow: 1, border: 0, background: 'transparent', outline: 'none',
                      fontSize: 'var(--fs-md)', color: 'var(--text)', fontWeight: 600,
                    }}
                  />
                  <I.Search size={14} style={{ color: 'var(--accent)', cursor: 'pointer' }}/>
                </div>
              </div>
              <div style={{ padding: '8px 12px 10px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--accent)', fontWeight: 500, marginBottom: 2, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
                     onClick={openResearch}>
                  {t.name}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="mono" style={{ fontSize: 'var(--fs-xl)', fontWeight: 700 }}>{fmtMoney(t.price)}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>XNYS</span>
                  <span className="mono" style={{ fontSize: 'var(--fs-xs)', color: t.chg >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 600 }}>
                    {t.chg >= 0 ? '+' : ''}{t.chg.toFixed(2)} ({t.chg >= 0 ? '+' : ''}{t.chgPct.toFixed(2)}%)
                  </span>
                  <I.Refresh size={10} style={{ color: 'var(--accent)', cursor: 'pointer' }}/>
                </div>
                <div className="flex items-center" style={{ marginTop: 6, gap: 14, fontSize: 'var(--fs-xs)' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bid <span style={{ color: 'var(--accent)' }}>ARCX</span></div>
                    <div className="mono" style={{ fontWeight: 500 }}>{fmtMoney(t.price - 0.04)} × 200</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ask <span style={{ color: 'var(--accent)' }}>ARCX</span></div>
                    <div className="mono" style={{ fontWeight: 500 }}>{fmtMoney(t.price + 0.04)} × 300</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Volume</div>
                    <div className="mono" style={{ fontWeight: 500 }}>{fmtCompact(t.vol)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 6 }}>AS OF Apr-19-2026 05:20:37 PM ET</div>
              </div>
              {/* Quick links — research, option chain */}
              <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'var(--surface-sunken)' }}>
                <button onClick={openResearch} style={{
                  flex: 1, padding: '8px', background: 'transparent', border: 0, cursor: 'pointer',
                  fontSize: 'var(--fs-xs)', color: 'var(--accent)', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  borderRight: '1px solid var(--border)',
                }}>
                  <I.Search size={11}/> Research <I.ExtLink size={10}/>
                </button>
                <button onClick={openOptionChain} style={{
                  flex: 1, padding: '8px', background: 'transparent', border: 0, cursor: 'pointer',
                  fontSize: 'var(--fs-xs)', color: 'var(--accent)', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}>
                  <I.Chart size={11}/> Option chain <I.ExtLink size={10}/>
                </button>
              </div>
            </DrawerField>

            {/* Action */}
            <DrawerField>
              <DrawerDropdown
                label="ACTION"
                value={action}
                options={['Buy', 'Sell', 'Sell short', 'Buy to cover']}
                onChange={setAction}
              />
            </DrawerField>

            {/* Quantity — with Owned hint, and Shares/Dollars toggle */}
            <DrawerField>
              <div style={{ padding: '8px 12px 10px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>QUANTITY</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                    placeholder=""
                    style={{
                      flexGrow: 1, border: 0, background: 'transparent', outline: 'none',
                      fontSize: 'var(--fs-md)', color: 'var(--text)', fontWeight: 500,
                    }}
                  />
                  <select
                    value={qtyUnit}
                    onChange={e => setQtyUnit(e.target.value)}
                    style={{
                      background: 'transparent', border: 0, fontSize: 'var(--fs-sm)',
                      fontWeight: 500, color: 'var(--text)', cursor: 'pointer', outline: 'none',
                    }}>
                    <option>Shares</option>
                    <option>Dollars</option>
                  </select>
                </div>
                {ownedQty > 0 && action === 'Sell' && (
                  <button
                    onClick={() => { setQty(String(ownedQty)); setQtyUnit('Shares'); }}
                    style={{
                      marginTop: 8, width: '100%', padding: '8px 10px',
                      background: 'var(--surface-sunken)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 'var(--fs-xs)', color: 'var(--text)',
                    }}>
                    <span style={{ color: 'var(--text-muted)' }}>Owned</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{ownedQty} Shares</span>
                  </button>
                )}
              </div>
            </DrawerField>

            {/* Order type */}
            <DrawerField>
              <DrawerDropdown
                label="ORDER TYPE"
                value={orderType}
                options={ORDER_TYPES_STOCK}
                onChange={setOrderType}
                placeholder=" "
              />
              {orderType === 'Limit' && (
                <div style={{ padding: '0 12px 10px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>LIMIT PRICE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-md)' }}>$</span>
                    <input value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
                      style={{ flexGrow: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 'var(--fs-md)', fontWeight: 500 }}/>
                  </div>
                </div>
              )}
            </DrawerField>

            {/* TIF */}
            <DrawerField>
              <DrawerDropdown
                label="TIME IN FORCE"
                value={tif}
                options={TIF_OPTIONS}
                onChange={setTif}
              />
            </DrawerField>

            {/* Trade capacity */}
            <DrawerField>
              <DrawerDropdown
                label="TRADE TYPE"
                value={tradeCapacity}
                options={['Cash', 'Margin']}
                onChange={setTradeCapacity}
              />
            </DrawerField>

            <span className="grow"/>
          </div>
        )}

        {!minimized && step === 'preview' && (
          <div className="scroll" style={{ flexGrow: 1, overflowY: 'auto', padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: 'var(--accent)', fontSize: 'var(--fs-md)', fontWeight: 500, cursor: 'pointer', marginBottom: 2 }} onClick={openResearch}>{t.name}</div>
              <div className="flex items-baseline gap-2">
                <span className="mono" style={{ fontSize: 'var(--fs-xl)', fontWeight: 700 }}>{fmtMoney(t.price)}</span>
                <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>XNYS</span>
                <span className="mono" style={{ fontSize: 'var(--fs-xs)', color: t.chg >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 600 }}>
                  {t.chg >= 0 ? '+' : ''}{t.chg.toFixed(2)} ({t.chg >= 0 ? '+' : ''}{t.chgPct.toFixed(2)}%)
                </span>
              </div>
              <div className="flex items-center" style={{ marginTop: 6, gap: 14, fontSize: 'var(--fs-xs)' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Bid <span style={{ color: 'var(--accent)' }}>ARCX</span></div>
                  <div className="mono">{fmtMoney(t.price - 0.04)} × 200</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Ask <span style={{ color: 'var(--accent)' }}>ARCX</span></div>
                  <div className="mono">{fmtMoney(t.price + 0.04)} × 300</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Volume</div>
                  <div className="mono">{fmtCompact(t.vol)}</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 6 }}>AS OF Apr-19-2026 05:20:37 PM ET</div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
              <div style={{ textAlign: 'center', fontSize: 'var(--fs-lg)', fontWeight: 600, fontFamily: 'var(--font-display)', marginBottom: 14 }}>Preview Order</div>
              {[
                ['Account', `${acct.name.split(' · ')[0]} ${acct.type !== 'Retirement (external)' ? '' : ''}(${acct.num})`],
                ['Symbol', symbol],
                ['Action', action],
                ['Quantity', qtyUnit === 'Shares' ? qtyNum.toFixed(2) : `$${qtyNum.toFixed(2)}`],
                ['Order type', orderType === 'Limit' ? `Limit at $${parseFloat(limitPrice).toFixed(2)}` : orderType],
                ['Time in force', tif],
                ['Trade type', tradeCapacity],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between" style={{ padding: '6px 0', fontSize: 'var(--fs-sm)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 500, color: 'var(--accent)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!minimized && step === 'placed' && (
          <div style={{ flexGrow: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999, background: 'var(--pos-bg)',
              display: 'grid', placeItems: 'center', marginBottom: 16,
              border: '2px solid var(--pos)',
            }}>
              <I.Check size={28} style={{ color: 'var(--pos)' }}/>
            </div>
            <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 6 }}>Order placed</div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 4 }}>
              {action} {qtyNum} {symbol} @ {orderType === 'Limit' ? `Limit $${parseFloat(limitPrice).toFixed(2)}` : orderType}
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>Confirmation #HIQ-{Math.floor(Math.random() * 9000000 + 1000000)}</div>
            <div className="flex gap-2" style={{ marginTop: 24, width: '100%' }}>
              <button className="btn" onClick={() => { setStep('form'); setQty(''); }} style={{ flex: 1 }}>New order</button>
              <button className="btn btn-primary" onClick={onClose} style={{ flex: 1 }}>Done</button>
            </div>
          </div>
        )}

        {/* Footer / CTA */}
        {step === 'form' && (
          <div style={{ padding: 14, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div className="flex justify-between" style={{ marginBottom: 10, fontSize: 'var(--fs-sm)' }}>
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>Estimated value</span>
              <span className="mono" style={{ fontWeight: 700 }}>{estValue > 0 ? fmtMoney(estValue, { cents: 2 }) : '--'}</span>
            </div>
            <button
              onClick={() => canPreview && setStep('preview')}
              disabled={!canPreview}
              style={{
                width: '100%', padding: '14px', border: 0, borderRadius: 999,
                background: canPreview ? 'var(--pos)' : 'color-mix(in oklch, var(--pos) 50%, var(--surface-sunken))',
                color: 'var(--accent-contrast)', fontWeight: 700, fontSize: 'var(--fs-md)',
                cursor: canPreview ? 'pointer' : 'not-allowed',
                letterSpacing: '0.01em',
              }}>
              Preview order
            </button>
            <button style={{
              display: 'block', width: '100%', marginTop: 10, background: 'transparent', border: 0,
              color: 'var(--accent)', fontSize: 'var(--fs-xs)', textDecoration: 'underline',
              textUnderlineOffset: 2, cursor: 'pointer', textAlign: 'center',
            }}>
              Important disclosure information
            </button>
          </div>
        )}

        {!minimized && step === 'preview' && (
          <div style={{ padding: 14, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div className="flex justify-between" style={{ marginBottom: 10, fontSize: 'var(--fs-sm)' }}>
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>Estimated value</span>
              <span className="mono" style={{ fontWeight: 700 }}>{fmtMoney(estValue, { cents: 2 })}</span>
            </div>
            <button
              onClick={() => setStep('placed')}
              style={{
                width: '100%', padding: '14px', border: 0, borderRadius: 999,
                background: 'var(--pos)', color: 'var(--accent-contrast)',
                fontWeight: 700, fontSize: 'var(--fs-md)', cursor: 'pointer',
                boxShadow: '0 0 0 2px var(--surface), 0 0 0 3px var(--pos)',
              }}>
              Place order
            </button>
            <div className="flex gap-2" style={{ marginTop: 10 }}>
              <button onClick={() => setStep('form')} style={{
                flex: 1, padding: '10px', border: '1px solid var(--pos)', borderRadius: 999,
                background: 'transparent', color: 'var(--pos)', fontWeight: 600, cursor: 'pointer',
                fontSize: 'var(--fs-sm)',
              }}>Edit</button>
              <button onClick={onClose} style={{
                flex: 1, padding: '10px', border: '1px solid var(--pos)', borderRadius: 999,
                background: 'transparent', color: 'var(--pos)', fontWeight: 600, cursor: 'pointer',
                fontSize: 'var(--fs-sm)',
              }}>Cancel</button>
            </div>
            <button style={{
              display: 'block', width: '100%', marginTop: 10, background: 'transparent', border: 0,
              color: 'var(--accent)', fontSize: 'var(--fs-xs)', textDecoration: 'underline',
              textUnderlineOffset: 2, cursor: 'pointer', textAlign: 'center',
            }}>
              Important disclosure information
            </button>
          </div>
        )}
      </aside>

      <style>{`
        @keyframes hiq-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes hiq-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes hiq-pop-in { from { opacity: 0; transform: scale(0.96) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </React.Fragment>
  );
};

Object.assign(window, { TradeScreen, OrderPreviewModal, TradeDrawer });

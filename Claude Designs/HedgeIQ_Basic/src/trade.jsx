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

Object.assign(window, { TradeScreen, OrderPreviewModal });

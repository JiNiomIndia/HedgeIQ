// Positions screen — full detailed table with filters & expandable research drawer

const FilterPopover = ({ open, onClose, filters, setFilters }) => {
  if (!open) return null;
  const types = ['Stocks', 'ETFs', 'Options', 'Mutual funds', 'Bonds', 'Cash'];
  const attrs = ['Up today', 'Down today', 'Dividend', 'At 52-week high', 'Near 52-week low'];
  return (
    <div className="card" style={{ position: 'absolute', top: 36, right: 0, width: 340, padding: 16, zIndex: 10, boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontSize: 'var(--fs-md)', fontWeight: 600, marginBottom: 10 }}>Filter positions</div>
      <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Investment types</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
        {types.map(t => (
          <label key={t} className="flex items-center gap-2" style={{ fontSize: 'var(--fs-sm)', cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.types.includes(t)}
              onChange={e => setFilters({...filters, types: e.target.checked ? [...filters.types, t] : filters.types.filter(x => x !== t)})}/>
            {t}
          </label>
        ))}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Attributes</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {attrs.map(a => (
          <label key={a} className="flex items-center gap-2" style={{ fontSize: 'var(--fs-sm)', cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.attrs.includes(a)}
              onChange={e => setFilters({...filters, attrs: e.target.checked ? [...filters.attrs, a] : filters.attrs.filter(x => x !== a)})}/>
            {a}
          </label>
        ))}
      </div>
      <div className="flex gap-2 justify-between">
        <button className="btn btn-sm" onClick={() => setFilters({types: [], attrs: []})}>Reset all</button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Apply</button>
      </div>
    </div>
  );
};

const PositionDrawer = ({ sym, onClose, nav, pos }) => {
  if (!sym) return null;
  const t = TICKERS[sym];
  const candles = genCandles(50, t.price * 0.95, t.price, 0.02, sym.charCodeAt(0));
  const [tab, setTab] = React.useState('purchase');
  return (
    <div style={{ gridColumn: '1 / -1', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 0, marginTop: 6 }}>
      <div className="flex items-center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--chip)', display: 'grid', placeItems: 'center', fontWeight: 700, color: 'var(--accent)', marginRight: 10 }}>{sym.slice(0,2)}</div>
        <div className="flex-col" style={{ marginRight: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>{t.name.toUpperCase()}</div>
          <div className="flex gap-3" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            <span>{sym}</span>
            <span>{t.sector}</span>
            <span>Mkt cap {fmtCompact(t.mktCap)}</span>
          </div>
        </div>
        <div className="grow"/>
        <div className="flex gap-2">
          <button className="btn btn-pos btn-sm" onClick={() => window.openTrade?.(sym, 'buy')}>Buy</button>
          <button className="btn btn-neg btn-sm" onClick={() => window.openTrade?.(sym, 'sell')}>Sell</button>
          <button className="btn btn-sm">Set exit plan</button>
          <button className="btn btn-sm" onClick={() => window.openOptionChain?.(sym)}>Option chain <I.ExtLink size={10}/></button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><I.X className="icon-sm"/></button>
        </div>
      </div>
      <div className="tabs" style={{ padding: '0 16px' }}>
        {[
          { k: 'purchase', lbl: 'Purchase history' },
          { k: 'research', lbl: 'Research' },
          { k: 'news', lbl: 'News' },
          { k: 'fundamentals', lbl: 'Fundamentals' },
          { k: 'chart', lbl: 'Chart' },
        ].map(item => (
          <div key={item.k} className={cls('tab', tab === item.k && 'active')} onClick={() => setTab(item.k)}>
            {item.lbl}
          </div>
        ))}
      </div>

      {tab === 'purchase' && (
        <div style={{ padding: 16 }}>
          <table className="data" style={{ width: '100%', fontSize: 'var(--fs-xs)' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', paddingLeft: 8 }}>Acquired</th>
                <th style={{ textAlign: 'left' }}>Term</th>
                <th style={{ textAlign: 'right' }}>$ Total gain/loss</th>
                <th style={{ textAlign: 'right' }}>% Total gain/loss</th>
                <th style={{ textAlign: 'right' }}>Current value</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Average cost basis</th>
                <th style={{ textAlign: 'right', paddingRight: 8 }}>Cost basis total</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const qty = pos?.qty || 100;
                const cv = pos?.currentValue || (qty * t.price);
                const cb = pos?.cb || (qty * (t.price * 0.83));
                const avgCost = cb / qty;
                const gain = cv - cb;
                const gainPct = (gain / cb) * 100;
                const acq = ['Mar-13-2026', 'Feb-02-2026', 'Jan-18-2026', 'Nov-22-2025'][sym.charCodeAt(0) % 4];
                return (
                  <tr>
                    <td style={{ paddingLeft: 8 }} className="mono">{acq}</td>
                    <td>Short</td>
                    <td className="mono" style={{ textAlign: 'right', color: gain >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{gain >= 0 ? '+' : ''}{fmtMoney(gain)}</td>
                    <td className="mono" style={{ textAlign: 'right', color: gain >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmtPct(gainPct)}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{fmtMoney(cv)}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{qty}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{fmtMoney(avgCost)}</td>
                    <td className="mono" style={{ textAlign: 'right', paddingRight: 8 }}>{fmtMoney(cb)}</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'research' && (
        <div style={{ padding: 16, background: 'var(--bg)' }}>
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 0, padding: 0 }}>
            <div style={{ padding: 16, borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--fs-md)', fontWeight: 700, marginBottom: 4 }}>Quote</div>
              <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginBottom: 10 }}>As of Apr-17-2026 4:10 p.m. ET</div>
              <div className="flex items-baseline gap-2" style={{ marginBottom: 4 }}>
                <span className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{fmtMoney(t.price)}</span>
                <span className="mono" style={{ fontSize: 'var(--fs-xs)', color: t.chg >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                  {t.chg >= 0 ? '+' : ''}{t.chg.toFixed(2)} ({t.chg >= 0 ? '+' : ''}{t.chgPct.toFixed(2)}%)
                </span>
              </div>
              {[
                ['Bid × Size', fmtMoney(t.price - 0.04) + ' × 200'],
                ['Ask × Size', fmtMoney(t.price + 0.06) + ' × 300'],
                ['Volume', fmtCompact(t.vol)],
                ['90 day avg. vol.', fmtCompact(t.vol * 0.9)],
                ['Open', fmtMoney(t.price - t.chg * 0.5)],
                ['Previous close', fmtMoney(t.price - t.chg)],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between" style={{ fontSize: 'var(--fs-xs)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ padding: '8px 0' }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Day range</div>
                <RangeBar low={t.price * 0.99} high={t.price * 1.01} current={t.price} w={220} compact/>
              </div>
              <div className="flex justify-between" style={{ fontSize: 'var(--fs-xs)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>P/E ratio (TTM)</span>
                <span className="mono" style={{ fontWeight: 600 }}>{t.pe ? t.pe.toFixed(2) : '—'}</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Analyst ratings</div>
                <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>As of Apr-19-2026 · LSEG StarMine</div>
                <div style={{ display: 'inline-block', marginTop: 4, padding: '2px 10px', background: 'var(--pos-bg)', color: 'var(--pos)', fontWeight: 700, fontSize: 'var(--fs-xs)', borderRadius: 3 }}>
                  1.3
                </div>
              </div>
            </div>

            <div style={{ padding: 16, borderRight: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 'var(--fs-md)', fontWeight: 700 }}>Chart</div>
                <button className="btn btn-ghost btn-xs" style={{ color: 'var(--accent)' }} onClick={() => window.openResearch?.(sym)}>
                  Advanced chart <I.ExtLink size={10}/>
                </button>
              </div>
              <CandleChart candles={candles} w={380} h={200}/>
              <div className="flex gap-1" style={{ marginTop: 6 }}>
                {['1D','5D','1M','3M','1Y'].map((r, i) => (
                  <button key={r} className={'btn btn-xs' + (i === 0 ? ' btn-pos' : '')} style={i !== 0 ? { color: 'var(--accent)' } : {}}>{r}</button>
                ))}
                <span className="grow"/>
                <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Freq: 1 Minute</span>
              </div>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 'var(--fs-md)', fontWeight: 700, marginBottom: 10 }}>News</div>
              {NEWS.filter(n => n.sym === sym || !n.sym).slice(0, 4).map((n, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 0 }}>
                  <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 500, lineHeight: 1.4, color: 'var(--accent)', cursor: 'pointer' }}>{n.t}</div>
                  <div className="flex justify-between" style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 3 }}>
                    <span>{n.src}</span>
                    <span>Apr-{15 + i}-2026 {6 + i}:01 p.m. ET</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center" style={{ marginTop: 16 }}>
            <button className="btn btn-pos" onClick={() => window.openResearch?.(sym)}>
              Detailed Research <I.ExtLink size={12}/>
            </button>
          </div>
        </div>
      )}

      {tab === 'news' && (
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div>
            {NEWS.filter(n => n.sym === sym || !n.sym).slice(0, 6).map((n, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, lineHeight: 1.4, color: 'var(--accent)', cursor: 'pointer' }}>{n.t}</div>
                <div className="flex justify-between" style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 4 }}>
                  <span>{n.src}</span>
                  <span>Apr-{18 - i}-2026 · {n.time} ago</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: 8 }}>AI takeaway</div>
            <div style={{ fontSize: 'var(--fs-xs)', lineHeight: 1.6, color: 'var(--text-muted)', padding: 12, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-sm)' }}>
              Sentiment on {sym} has turned <b style={{ color: 'var(--pos)' }}>mildly bullish</b> over the past 48 hours. Analysts highlight improving fundamentals; one downgrade remains the outlier.
            </div>
          </div>
        </div>
      )}

      {tab === 'fundamentals' && (
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            ['Market cap', fmtCompact(t.mktCap)],
            ['P/E (TTM)', t.pe ? t.pe.toFixed(2) : '—'],
            ['EPS (TTM)', '$' + (t.price / (t.pe || 30)).toFixed(2)],
            ['Beta', t.beta.toFixed(2)],
            ['Dividend yield', t.div ? ((t.div / t.price) * 100).toFixed(2) + '%' : '—'],
            ['Revenue (TTM)', fmtCompact(t.mktCap * 0.18)],
            ['52-week range', fmtMoney(t.low52) + ' – ' + fmtMoney(t.high52)],
            ['Avg volume', fmtCompact(t.vol)],
          ].map(([k, v], i) => (
            <div key={i} style={{ padding: 12, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4 }}>{k}</div>
              <div className="mono" style={{ fontSize: 'var(--fs-md)', fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'chart' && (
        <div style={{ padding: 16 }}>
          <CandleChart candles={candles} w={800} h={280}/>
        </div>
      )}
    </div>
  );
};

const PositionsScreen = ({ nav, onOpenCopilot }) => {
  const [expanded, setExpanded] = React.useState('NVDA');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({ types: ['Stocks', 'ETFs'], attrs: [] });
  const [selectedAcct, setSelectedAcct] = React.useState('all');

  const accountsToShow = selectedAcct === 'all'
    ? Object.keys(POSITIONS)
    : [selectedAcct];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <DashAccountPanel selectedId={selectedAcct} setSelectedId={setSelectedAcct}/>
      <main className="scroll" style={{ flexGrow: 1, overflowY: 'auto', padding: 'var(--gap)', background: 'var(--bg)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--gap)' }}>
          <h1 style={{ margin: 0, fontSize: 'var(--fs-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Positions</h1>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>Apr 19, 2026 · 3:58 PM ET</div>
        </div>

        <div className="tabs" style={{ marginBottom: 'var(--gap)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 0 }}>
          <div className="tab" onClick={() => nav('dashboard')}>Summary</div>
          <div className="tab active">Positions</div>
          <div className="tab" onClick={() => nav('activity')}>Activity & Orders</div>
          <div className="tab" onClick={() => nav('balances')}>Balances</div>
          <div className="tab">Documents</div>
          <div className="tab">Planning</div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--gap)' }}>
          <div className="flex items-center" style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <button className="btn btn-sm"><I.Grid className="icon-sm"/> Overview <I.ChevD size={12}/></button>
            </div>
            <div className="flex gap-1">
              {filters.types.map(t => (
                <span key={t} className="chip chip-outline">{t} <button onClick={() => setFilters({...filters, types: filters.types.filter(x => x !== t)})}><I.X size={10}/></button></span>
              ))}
            </div>
            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--accent)' }}>+ Add filter</button>
            <span className="grow"/>
            <button className="btn btn-ghost btn-sm"><I.Search className="icon-sm"/></button>
            <div style={{ position: 'relative' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setFilterOpen(!filterOpen)}><I.Filter className="icon-sm"/></button>
              <FilterPopover open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} setFilters={setFilters}/>
            </div>
            <button className="btn btn-ghost btn-sm"><I.Refresh className="icon-sm"/></button>
            <button className="btn btn-ghost btn-sm"><I.Download className="icon-sm"/></button>
            <button className="btn btn-ghost btn-sm"><I.Dots className="icon-sm"/></button>
          </div>

          <div style={{ overflowX: 'auto' }} className="scroll">
            <table className="data" style={{ minWidth: 1200 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingLeft: 16 }}>Symbol</th>
                  <th>Last</th>
                  <th>Chg</th>
                  <th>Today $</th>
                  <th>Today %</th>
                  <th>Total G/L $</th>
                  <th>Total G/L %</th>
                  <th>Current value</th>
                  <th>% of acct</th>
                  <th>Qty</th>
                  <th>Avg cost</th>
                  <th>Cost basis</th>
                  <th style={{ paddingRight: 16 }}>52w range</th>
                </tr>
              </thead>
              <tbody>
                {accountsToShow.map(acctId => {
                  const acct = ACCOUNTS.find(a => a.id === acctId);
                  const positions = POSITIONS[acctId] || [];
                  const acctTotal = positions.reduce((s, p) => s + p.currentValue, 0);
                  const acctCost = positions.reduce((s, p) => s + p.cb, 0);
                  const acctToday = positions.reduce((s, p) => s + p.currentValue * p.todayGainPct / 100, 0);
                  if (!acct) return null;
                  return (
                    <React.Fragment key={acctId}>
                      <tr className="section-head">
                        <td colSpan={13} style={{ paddingLeft: 16 }}>
                          <div className="flex items-center gap-3">
                            <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 'var(--fs-sm)', textTransform: 'none', letterSpacing: 0 }}>{acct.name}</span>
                            <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>{acct.num}</span>
                            <button className="btn btn-ghost btn-xs" style={{ color: 'var(--accent)' }}>Option summary</button>
                            <button className="btn btn-ghost btn-xs" style={{ color: 'var(--accent)' }}>Manage dividends</button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={7} style={{ paddingLeft: 16, color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>
                          Cash <span style={{ color: 'var(--text-subtle)' }}>· Held in money market</span>
                        </td>
                        <td className="mono">{fmtMoney(acct.balance * 0.05)}</td>
                        <td className="mono">4.8%</td>
                        <td colSpan={4}></td>
                      </tr>
                      {positions.map(p => {
                        const t = TICKERS[p.sym];
                        const todayDollar = p.currentValue * p.todayGainPct / 100;
                        const totalGain = p.currentValue - p.cb;
                        const totalGainPct = (totalGain / p.cb) * 100;
                        const pctOfAcct = (p.currentValue / acctTotal) * 100;
                        const isExp = expanded === p.sym + ':' + acctId;
                        return (
                          <React.Fragment key={p.sym + acctId}>
                            <tr onClick={() => setExpanded(isExp ? null : p.sym + ':' + acctId)} style={{ cursor: 'pointer' }} className={isExp ? 'expanded' : ''}>
                              <td style={{ paddingLeft: 16 }}>
                                <div className="flex items-center gap-2">
                                  <I.ChevR className="icon-sm" style={{ transform: isExp ? 'rotate(90deg)' : '', transition: 'transform 0.15s', color: 'var(--text-subtle)' }}/>
                                  <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--chip)', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700, color: 'var(--accent)' }}>{p.sym.slice(0,2)}</div>
                                  <div className="flex-col">
                                    <span style={{ fontWeight: 600 }}>{p.sym}</span>
                                    <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{t.name}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="mono">{fmtMoney(t.price)}</td>
                              <td className="mono" style={{ color: t.chg >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{t.chg >= 0 ? '+' : ''}{t.chg.toFixed(2)}</td>
                              <td className="mono" style={{ color: todayDollar >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{todayDollar >= 0 ? '+' : ''}{fmtMoney(todayDollar)}</td>
                              <td className="mono" style={{ color: p.todayGainPct >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmtPct(p.todayGainPct)}</td>
                              <td className="mono" style={{ color: totalGain >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{totalGain >= 0 ? '+' : ''}{fmtMoney(totalGain)}</td>
                              <td className="mono" style={{ color: totalGain >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmtPct(totalGainPct)}</td>
                              <td className="mono">{fmtMoney(p.currentValue)}</td>
                              <td className="mono">{pctOfAcct.toFixed(2)}%</td>
                              <td className="mono">{p.qty}</td>
                              <td className="mono">{fmtMoney(p.avgCost)}</td>
                              <td className="mono">{fmtMoney(p.cb)}</td>
                              <td style={{ paddingRight: 16 }}><RangeBar low={t.low52} high={t.high52} current={t.price} w={90} compact/></td>
                            </tr>
                            {isExp && (
                              <tr className="expanded">
                                <td colSpan={13} style={{ padding: 0 }}>
                                  <PositionDrawer sym={p.sym} onClose={() => setExpanded(null)} nav={nav} pos={p}/>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      <tr style={{ background: 'var(--surface-sunken)' }}>
                        <td style={{ paddingLeft: 16, fontWeight: 600 }}>Account total</td>
                        <td colSpan={2}></td>
                        <td className="mono" style={{ color: acctToday >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 600 }}>{acctToday >= 0 ? '+' : ''}{fmtMoney(acctToday)}</td>
                        <td className="mono" style={{ color: acctToday >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 600 }}>{fmtPct(acctToday/acctTotal*100)}</td>
                        <td className="mono" style={{ color: 'var(--pos)', fontWeight: 600 }}>+{fmtMoney(acctTotal - acctCost)}</td>
                        <td className="mono" style={{ color: 'var(--pos)', fontWeight: 600 }}>{fmtPct((acctTotal - acctCost) / acctCost * 100)}</td>
                        <td className="mono" style={{ fontWeight: 600 }}>{fmtMoney(acctTotal)}</td>
                        <td colSpan={5}></td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

Object.assign(window, { PositionsScreen, PositionDrawer });

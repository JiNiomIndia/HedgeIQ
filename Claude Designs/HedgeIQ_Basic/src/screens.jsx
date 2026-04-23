// Options chain + Research + Activity + Balances + Watchlists + Transfers + Onboarding

const OptionsScreen = ({ nav, initialSymbol = 'NVDA' }) => {
  const [symbol, setSymbol] = React.useState(initialSymbol);
  const [strategy, setStrategy] = React.useState('Calls & puts');
  const [classes, setClasses] = React.useState('Both');
  const [strikes, setStrikes] = React.useState('20');
  const [expIdx, setExpIdx] = React.useState(0);
  const [showWeekly, setShowWeekly] = React.useState(true);
  const t = TICKERS[symbol] || TICKERS.NVDA;
  const exps = [
    { l: 'Apr 24', w: 'W', days: 5 }, { l: 'May 01', w: 'W', days: 12 }, { l: 'May 08', w: 'W', days: 19 },
    { l: 'May 15', w: 'W', days: 26 }, { l: 'May 22', w: 'W', days: 33 }, { l: 'May 29', w: 'W', days: 40 },
    { l: 'Jun 18', w: '', days: 60 }, { l: 'Sep 18', w: '', days: 152 }, { l: 'Dec 18', w: '', days: 243 },
    { l: 'Jan 15 \'27', w: '', days: 271 }, { l: 'Mar 19 \'27', w: '', days: 334 }, { l: 'Jun 17 \'27', w: '', days: 425 },
  ];
  const atm = Math.round(t.price / 10) * 10;
  const strikeList = Array.from({ length: 20 }, (_, i) => atm + (i - 10) * 10);
  const r = seedRand(symbol.charCodeAt(0) + expIdx);
  const mkChainRow = (strike) => {
    const itm = strike < t.price;
    const call = { last: Math.max(0.01, t.price - strike + r()*3), bid: 0, ask: 0, vol: Math.floor(r()*300), oi: Math.floor(r()*500), iv: (0.3 + r()*0.5)*100, delta: itm ? 0.6 + r()*0.35 : 0.15 + r()*0.35 };
    call.bid = Math.max(0.01, call.last - 0.05); call.ask = call.last + 0.05;
    const put = { last: Math.max(0.01, strike - t.price + r()*3), bid: 0, ask: 0, vol: Math.floor(r()*300), oi: Math.floor(r()*500), iv: (0.3 + r()*0.5)*100, delta: -(itm ? 0.15 + r()*0.35 : 0.6 + r()*0.35) };
    put.bid = Math.max(0.01, put.last - 0.05); put.ask = put.last + 0.05;
    return { call, put };
  };

  return (
    <div className="scroll" style={{ overflowY: 'auto', height: '100%', background: 'var(--bg)', padding: 'var(--gap)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--gap)' }}>
        <div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>Research <span style={{ margin: '0 4px' }}>/</span> <span style={{ color: 'var(--accent)' }}>Option chain</span></div>
          <h1 style={{ margin: 0, fontSize: 'var(--fs-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Options analysis</h1>
        </div>
        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>Delayed 10 min · Apr 19 4:00 PM ET</div>
      </div>

      <div className="card card-p" style={{ marginBottom: 'var(--gap)' }}>
        <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="flex items-center gap-2">
            <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Symbol</label>
            <input className="input" style={{ width: 90 }} value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}/>
          </div>
          <div style={{ width: 1, height: 30, background: 'var(--border)' }}/>
          <div className="flex items-baseline gap-2">
            <span style={{ fontWeight: 700 }}>{symbol}</span>
            <span className="mono" style={{ fontSize: 'var(--fs-lg)', fontWeight: 700 }}>{fmtMoney(t.price)}</span>
            <span className="mono" style={{ fontSize: 'var(--fs-xs)', color: t.chg >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{t.chg >= 0 ? '+' : ''}{t.chg.toFixed(2)} ({fmtPct(t.chgPct)})</span>
          </div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Put/Call ratio <span className="mono" style={{ fontWeight: 600 }}>1.01</span> (bearish)</div>
          <span className="grow"/>
          <div className="flex gap-4" style={{ fontSize: 'var(--fs-xs)' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Bid</span> <span className="mono" style={{ fontWeight: 600 }}>{fmtMoney(t.price-0.04)} × 4,800</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Ask</span> <span className="mono" style={{ fontWeight: 600 }}>{fmtMoney(t.price+0.06)} × 100</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Volume</span> <span className="mono" style={{ fontWeight: 600 }}>{fmtCompact(t.vol)}</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>IV</span> <span className="mono" style={{ fontWeight: 600 }}>38.2%</span></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="tabs" style={{ padding: '0 16px' }}>
          <div className="tab active">Chain</div>
          <div className="tab">Chart</div>
          <div className="tab">Strategy builder</div>
          <div className="tab">Open interest</div>
          <span className="grow"/>
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'center' }}>Full screen <I.Expand size={12}/></button>
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'center' }}><I.Settings size={12}/></button>
        </div>

        <div className="flex items-center gap-3" style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <div className="flex items-center gap-2">
            <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Strategy</label>
            <select className="input" style={{ width: 130 }} value={strategy} onChange={e => setStrategy(e.target.value)}>
              <option>Calls & puts</option><option>Calls</option><option>Puts</option><option>Covered calls</option><option>Vertical spread</option><option>Iron condor</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Class</label>
            <div className="seg"><button className={classes === 'Calls' ? 'active' : ''} onClick={() => setClasses('Calls')}>Calls</button><button className={classes === 'Puts' ? 'active' : ''} onClick={() => setClasses('Puts')}>Puts</button><button className={classes === 'Both' ? 'active' : ''} onClick={() => setClasses('Both')}>Both</button></div>
          </div>
          <div className="flex items-center gap-2">
            <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Strikes</label>
            <select className="input" style={{ width: 70 }} value={strikes} onChange={e => setStrikes(e.target.value)}>
              <option>5</option><option>10</option><option>20</option><option>All</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Weekly</label>
            <button className="seg" style={{ padding: 0 }} onClick={() => setShowWeekly(!showWeekly)}>
              <span style={{ width: 32, height: 16, background: showWeekly ? 'var(--accent)' : 'var(--surface-sunken)', borderRadius: 999, position: 'relative', display: 'block' }}>
                <span style={{ position: 'absolute', top: 2, left: showWeekly ? 18 : 2, width: 12, height: 12, borderRadius: 999, background: 'white', transition: 'left 0.15s' }}/>
              </span>
            </button>
          </div>
          <span className="grow"/>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent)' }}>Collapse expirations</button>
        </div>

        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'center' }} className="scroll">
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 8 }}>Expiration</div>
          {exps.map((e, i) => (
            <button key={i} onClick={() => setExpIdx(i)} style={{
              padding: '5px 10px', borderRadius: 999, border: `1px solid ${expIdx === i ? 'var(--accent)' : 'var(--border)'}`,
              background: expIdx === i ? 'var(--accent)' : 'var(--surface)',
              color: expIdx === i ? 'var(--accent-contrast)' : 'var(--text)',
              fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
              display: 'inline-flex', alignItems: 'center', gap: 4
            }}>
              {e.l} {e.w && <span style={{ fontSize: 9, opacity: 0.7 }}>({e.w})</span>}
              <span style={{ opacity: 0.6, fontSize: 9 }}>{e.days}d</span>
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }} className="scroll">
          <div style={{ padding: '8px 16px', fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'var(--surface-2)', display: 'grid', gridTemplateColumns: classes === 'Both' ? '1fr 90px 1fr' : '1fr', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
            {classes !== 'Puts' && <div style={{ color: 'var(--pos)', fontWeight: 700 }}>Calls</div>}
            {classes === 'Both' && <div>Strike</div>}
            {classes !== 'Calls' && <div style={{ color: 'var(--neg)', fontWeight: 700 }}>Puts</div>}
          </div>
          <table className="data" style={{ minWidth: 1000, fontSize: 'var(--fs-xs)' }}>
            <thead>
              <tr>
                {classes !== 'Puts' && <>
                  <th style={{ paddingLeft: 16, textAlign: 'right' }}>Last</th><th>Chg</th><th>Bid</th><th>Ask</th><th>Vol</th><th>OI</th><th>IV</th><th>Δ</th>
                </>}
                <th style={{ background: 'var(--surface-sunken)', textAlign: 'center' }}>Strike</th>
                {classes !== 'Calls' && <>
                  <th>Last</th><th>Chg</th><th>Bid</th><th>Ask</th><th>Vol</th><th>OI</th><th>IV</th><th style={{ paddingRight: 16 }}>Δ</th>
                </>}
              </tr>
            </thead>
            <tbody>
              {strikeList.map((strike, i) => {
                const row = mkChainRow(strike);
                const atTheMoney = Math.abs(strike - t.price) < 10;
                return (
                  <tr key={i} style={atTheMoney ? { background: 'color-mix(in oklch, var(--accent) 6%, transparent)' } : {}}>
                    {classes !== 'Puts' && <>
                      <td className="mono" style={{ paddingLeft: 16 }}>{row.call.last.toFixed(2)}</td>
                      <td className="mono" style={{ color: 'var(--pos)' }}>+0.02</td>
                      <td><button className="btn btn-xs" style={{ background: 'var(--pos-bg)', color: 'var(--pos)', borderColor: 'var(--pos)' }}>Buy {row.call.ask.toFixed(2)}</button></td>
                      <td><button className="btn btn-xs" style={{ background: 'var(--neg-bg)', color: 'var(--neg)', borderColor: 'var(--neg)' }}>Sell {row.call.bid.toFixed(2)}</button></td>
                      <td className="mono">{row.call.vol}</td>
                      <td className="mono">{row.call.oi}</td>
                      <td className="mono">{row.call.iv.toFixed(1)}%</td>
                      <td className="mono">{row.call.delta.toFixed(2)}</td>
                    </>}
                    <td className="mono" style={{ background: 'var(--surface-sunken)', textAlign: 'center', fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{strike}</td>
                    {classes !== 'Calls' && <>
                      <td className="mono">{row.put.last.toFixed(2)}</td>
                      <td className="mono" style={{ color: 'var(--neg)' }}>−0.01</td>
                      <td><button className="btn btn-xs" style={{ background: 'var(--pos-bg)', color: 'var(--pos)', borderColor: 'var(--pos)' }}>Buy {row.put.ask.toFixed(2)}</button></td>
                      <td><button className="btn btn-xs" style={{ background: 'var(--neg-bg)', color: 'var(--neg)', borderColor: 'var(--neg)' }}>Sell {row.put.bid.toFixed(2)}</button></td>
                      <td className="mono">{row.put.vol}</td>
                      <td className="mono">{row.put.oi}</td>
                      <td className="mono">{row.put.iv.toFixed(1)}%</td>
                      <td className="mono" style={{ paddingRight: 16 }}>{row.put.delta.toFixed(2)}</td>
                    </>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card-p" style={{ marginTop: 'var(--gap)', background: 'linear-gradient(90deg, color-mix(in oklch, var(--accent) 6%, var(--surface)), var(--surface))' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
          <I.Sparkle size={14} style={{ color: 'var(--accent)' }}/>
          <span style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>Copilot strategy insight</span>
          <span className="chip chip-outline">For {symbol}</span>
        </div>
        <div style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.6, color: 'var(--text-muted)' }}>
          You own 45 shares of {symbol}. A <strong style={{ color: 'var(--text)' }}>covered call at $900 May 15</strong> would collect ~$850 premium (1.9% yield) with 0.9% upside capped. Historically similar setups had 78% profit probability. <button className="btn btn-xs btn-primary" style={{ marginLeft: 6 }}>Build strategy</button>
        </div>
      </div>
    </div>
  );
};

// ----- Research -----
const ResearchScreen = ({ nav, initialSymbol = 'NVDA' }) => {
  const [symbol, setSymbol] = React.useState(initialSymbol);
  const [range, setRange] = React.useState('1M');
  const t = TICKERS[symbol] || TICKERS.NVDA;
  const candles = genCandles(80, t.price*0.9, t.price, 0.02, symbol.charCodeAt(0));
  return (
    <div className="scroll" style={{ overflowY: 'auto', height: '100%', padding: 'var(--gap)', background: 'var(--bg)' }}>
      <div className="flex items-baseline gap-3" style={{ marginBottom: 'var(--gap)' }}>
        <input className="input" style={{ width: 130, fontSize: 'var(--fs-xl)', fontWeight: 700, padding: '4px 8px', border: 0, background: 'transparent' }} value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}/>
        <div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{t.name} · {t.sector} · NASDAQ</div>
        </div>
        <span className="grow"/>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 'var(--fs-3xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>{fmtMoney(t.price)}</div>
          <div className="mono" style={{ fontSize: 'var(--fs-md)', color: t.chg >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 600 }}>
            {t.chg >= 0 ? '▲' : '▼'} {Math.abs(t.chg).toFixed(2)} · {fmtPct(t.chgPct)}
          </div>
        </div>
        <button className="btn btn-pos" onClick={() => nav('trade', { symbol, side: 'buy' })}>Buy</button>
        <button className="btn btn-neg" onClick={() => nav('trade', { symbol, side: 'sell' })}>Sell</button>
        <button className="btn"><I.Star className="icon-sm"/> Watch</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--gap)', marginBottom: 'var(--gap)' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="flex items-center gap-2" style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="seg">{['1D','1W','1M','3M','YTD','1Y','5Y'].map(r => <button key={r} className={r===range ? 'active':''} onClick={()=>setRange(r)}>{r}</button>)}</div>
            <span className="grow"/>
            <div className="seg"><button className="active">Candles</button><button>Line</button><button>Area</button></div>
            <button className="btn btn-ghost btn-sm">Indicators <I.ChevD size={10}/></button>
            <button className="btn btn-ghost btn-sm">Compare <I.Plus size={10}/></button>
          </div>
          <div style={{ padding: 16 }}><CandleChart candles={candles} w={760} h={320}/></div>
        </div>
        <div className="card card-p">
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Analyst consensus</div>
          <div className="mono" style={{ fontSize: 40, fontWeight: 700, color: 'var(--pos)', fontFamily: 'var(--font-display)' }}>1.3</div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 12 }}>Strong Buy · 42 analysts</div>
          {[['Strong buy',20,'var(--pos)'],['Buy',16,'var(--pos)'],['Hold',4,'var(--text-muted)'],['Sell',1,'var(--neg)'],['Strong sell',1,'var(--neg)']].map(([k,v,c])=>(
            <div key={k} className="flex items-center gap-2" style={{ fontSize: 'var(--fs-xs)', marginBottom: 4 }}>
              <span style={{ width: 80, color: 'var(--text-muted)' }}>{k}</span>
              <div style={{ flexGrow: 1, height: 8, background: 'var(--surface-sunken)', borderRadius: 4 }}>
                <div style={{ width: `${(v/20)*100}%`, height: '100%', background: c, borderRadius: 4 }}/>
              </div>
              <span className="mono" style={{ width: 16, textAlign: 'right' }}>{v}</span>
            </div>
          ))}
          <div className="divider" style={{ margin: '14px 0' }}/>
          <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 'var(--fs-sm)' }}>12-mo price target</div>
          <div className="mono" style={{ fontSize: 'var(--fs-xl)', fontWeight: 700 }}>{fmtMoney(t.price * 1.18)}</div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--pos)' }}>+18% upside</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap)' }}>
        <div className="card card-p">
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Key statistics</div>
          {[['Market cap',fmtCompact(t.mktCap)],['P/E (TTM)',t.pe?.toFixed(2)||'—'],['EPS',(t.pe ? (t.price/t.pe).toFixed(2) : '—')],['Dividend',t.div?fmtMoney(t.div):'—'],['Dividend yield',t.div?(t.div/t.price*100).toFixed(2)+'%':'—'],['Beta',t.beta],['52w high',fmtMoney(t.high52)],['52w low',fmtMoney(t.low52)],['Avg volume',fmtCompact(t.vol)],['Shares outstanding',fmtCompact(t.mktCap/t.price)]].map(([k,v],i)=>(
            <div key={i} className="flex justify-between" style={{ fontSize: 'var(--fs-xs)', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span className="mono" style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="card card-p">
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Financials</div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Revenue (quarterly)</div>
          <MiniBars data={[25.8, 28.4, 32.1, 35.2, 38.6, 44.1, 48.3, 52.7]} w={240} h={40}/>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '14px 0 6px' }}>Earnings per share</div>
          <MiniBars data={[1.2, 1.4, 1.7, 2.1, 2.8, 3.4, 4.1, 5.2]} w={240} h={40}/>
          <div className="flex justify-between" style={{ fontSize: 'var(--fs-xs)', marginTop: 14 }}>
            <span style={{ color: 'var(--text-muted)' }}>Revenue YoY</span><span className="mono pos">+104%</span>
          </div>
          <div className="flex justify-between" style={{ fontSize: 'var(--fs-xs)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Gross margin</span><span className="mono">78.4%</span>
          </div>
          <div className="flex justify-between" style={{ fontSize: 'var(--fs-xs)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Op. margin</span><span className="mono">62.1%</span>
          </div>
          <div className="flex justify-between" style={{ fontSize: 'var(--fs-xs)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Net margin</span><span className="mono">56.2%</span>
          </div>
        </div>
        <div className="card card-p" style={{ background: 'linear-gradient(135deg, color-mix(in oklch, var(--accent) 10%, var(--surface)), var(--surface))' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
            <I.Sparkle size={14} style={{ color: 'var(--accent)' }}/>
            <div style={{ fontWeight: 600 }}>AI research brief</div>
          </div>
          <div style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.6, color: 'var(--text-muted)' }}>
            <p style={{ margin: '0 0 8px' }}><strong style={{ color: 'var(--text)' }}>Bull case:</strong> AI data-center TAM expanding; Rubin architecture on track; sovereign AI demand accelerating.</p>
            <p style={{ margin: '0 0 8px' }}><strong style={{ color: 'var(--text)' }}>Bear case:</strong> Hyperscaler capex could plateau; competition from AMD MI400 series; China export restrictions.</p>
            <p style={{ margin: '0' }}><strong style={{ color: 'var(--text)' }}>Verdict:</strong> 3/5 risk · Overweight in tech-heavy portfolios, pair with defensive sector.</p>
          </div>
          <button className="btn btn-sm" style={{ width: '100%', marginTop: 12 }}>Ask a follow-up <I.ChevR size={10}/></button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--gap)' }}>
        <div className="flex items-center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 600 }}>Latest news · {symbol}</div>
        </div>
        {NEWS.filter(n => n.sym === symbol || !n.sym).map((n, i) => (
          <div key={i} className="flex gap-3" style={{ padding: '10px 16px', borderBottom: i < 4 ? '1px solid var(--border)' : 0 }}>
            <div style={{ width: 44, height: 44, background: 'var(--surface-sunken)', borderRadius: 4, flexShrink: 0 }}/>
            <div className="flex-col grow">
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 500 }}>{n.t}</div>
              <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2 }}>{n.src} · {n.time} ago</div>
            </div>
            {n.imp === 'high' && <span className="chip chip-neg">High impact</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ----- Activity & Orders -----
const ActivityScreen = ({ nav }) => {
  const [period, setPeriod] = React.useState('Past 30 days');
  const [filter, setFilter] = React.useState('Orders');
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <DashAccountPanel selectedId="all" setSelectedId={()=>{}}/>
      <main className="scroll" style={{ flexGrow: 1, overflowY: 'auto', padding: 'var(--gap)', background: 'var(--bg)' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--fs-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: 'var(--gap)' }}>Activity & orders</h1>
        <div className="tabs" style={{ marginBottom: 'var(--gap)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 0 }}>
          <div className="tab" onClick={() => nav('dashboard')}>Summary</div>
          <div className="tab" onClick={() => nav('positions')}>Positions</div>
          <div className="tab active">Activity & Orders</div>
          <div className="tab" onClick={() => nav('balances')}>Balances</div>
          <div className="tab">Documents</div>
          <div className="tab">Planning</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2" style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', width: 260 }}>
              <I.Search className="icon-sm" style={{ position: 'absolute', left: 8, top: 9, color: 'var(--text-muted)' }}/>
              <input className="input" placeholder="Search activity & orders" style={{ paddingLeft: 28 }}/>
            </div>
            <select className="input" style={{ width: 140 }} value={period} onChange={e=>setPeriod(e.target.value)}>
              <option>Past 30 days</option><option>Past 90 days</option><option>YTD</option><option>All</option>
            </select>
            <div className="seg">
              {['Orders','History','Transfers'].map(f => <button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}
            </div>
            <button className="btn btn-sm"><I.Filter className="icon-sm"/> More filters</button>
            <span className="grow"/>
            <button className="btn btn-ghost btn-sm"><I.Print className="icon-sm"/></button>
            <button className="btn btn-ghost btn-sm"><I.Download className="icon-sm"/></button>
          </div>

          <div style={{ padding: '10px 16px', background: 'var(--surface-sunken)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Pending</div>
          <table className="data">
            <thead>
              <tr><th style={{ paddingLeft: 16 }}>Date</th><th>Account</th><th style={{ textAlign: 'left' }}>Description</th><th>Status</th><th style={{ paddingRight: 16 }}>Amount</th></tr>
            </thead>
            <tbody>
              {ORDERS.filter(o => o.status === 'Pending').map((o, i) => (
                <tr key={i}>
                  <td style={{ paddingLeft: 16 }}>{o.date}</td>
                  <td>{o.account}</td>
                  <td style={{ textAlign: 'left', maxWidth: 300 }}>{o.desc}<div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{o.price}</div></td>
                  <td><span className="chip">{o.state}</span></td>
                  <td style={{ paddingRight: 16 }}>{o.amt}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: '10px 16px', background: 'var(--surface-sunken)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Past 30 days</div>
          <table className="data">
            <thead>
              <tr><th style={{ paddingLeft: 16 }}>Date</th><th>Account</th><th style={{ textAlign: 'left' }}>Description</th><th>Status</th><th style={{ paddingRight: 16 }}>Amount</th></tr>
            </thead>
            <tbody>
              {ORDERS.filter(o => o.status === 'Filled').map((o, i) => (
                <tr key={i}>
                  <td style={{ paddingLeft: 16 }}>{o.date}</td>
                  <td>{o.account}</td>
                  <td style={{ textAlign: 'left', maxWidth: 320 }}>{o.desc}<div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{o.price}</div></td>
                  <td><span className="chip chip-pos">{o.state}</span></td>
                  <td className="mono" style={{ paddingRight: 16, color: o.amt >= 0 ? 'var(--pos)' : 'var(--text)', fontWeight: 600 }}>{o.amt >= 0 ? '+' : ''}{fmtMoney(o.amt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

// ----- Balances -----
const BalancesScreen = ({ nav }) => {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <DashAccountPanel selectedId="all" setSelectedId={()=>{}}/>
      <main className="scroll" style={{ flexGrow: 1, overflowY: 'auto', padding: 'var(--gap)', background: 'var(--bg)' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--fs-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: 'var(--gap)' }}>Balances</h1>
        <div className="tabs" style={{ marginBottom: 'var(--gap)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 0 }}>
          <div className="tab" onClick={() => nav('dashboard')}>Summary</div>
          <div className="tab" onClick={() => nav('positions')}>Positions</div>
          <div className="tab" onClick={() => nav('activity')}>Activity & Orders</div>
          <div className="tab active">Balances</div>
          <div className="tab">Documents</div>
          <div className="tab">Planning</div>
        </div>

        <div className="card">
          <table className="data">
            <thead><tr><th style={{ paddingLeft: 16, textAlign: 'left' }}>Account</th><th>Balance</th><th style={{ paddingRight: 16 }}>Day change</th></tr></thead>
            <tbody>
              {ACCOUNTS.map((a, i) => (
                <React.Fragment key={a.id}>
                  <tr><td style={{ paddingLeft: 16, fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{a.name} <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>{a.num}</span></td>
                  <td className="mono" style={{ fontWeight: 600 }}>{fmtMoney(a.balance)}</td>
                  <td className="mono" style={{ paddingRight: 16, color: a.dayChg >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 600 }}>{a.dayChg >= 0 ? '+' : ''}{fmtMoney(a.dayChg)}</td></tr>
                  <tr style={{ fontSize: 'var(--fs-xs)' }}><td style={{ paddingLeft: 40, color: 'var(--text-muted)' }}>Intraday buying power</td><td className="mono">{fmtMoney(a.balance * 0.85)}</td><td className="mono" style={{ paddingRight: 16, color: 'var(--text-muted)' }}>$0.00</td></tr>
                  <tr style={{ fontSize: 'var(--fs-xs)' }}><td style={{ paddingLeft: 40, color: 'var(--text-muted)' }}>Overnight buying power (all settled)</td><td className="mono">{fmtMoney(a.balance * 0.82)}</td><td className="mono" style={{ paddingRight: 16, color: 'var(--text-muted)' }}>$0.00</td></tr>
                  <tr style={{ fontSize: 'var(--fs-xs)' }}><td style={{ paddingLeft: 40, color: 'var(--text-muted)' }}>Available to withdraw</td><td className="mono">{fmtMoney(a.balance * 0.8)}</td><td className="mono" style={{ paddingRight: 16, color: 'var(--text-muted)' }}></td></tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

// ----- Watchlists -----
const WatchlistsScreen = ({ nav }) => {
  const lists = [
    { name: 'AI names', syms: ['NVDA','MSFT','META','GOOGL','SNOW','AMZN'] },
    { name: 'Core ETFs', syms: ['VOO','VTI','QQQ'] },
    { name: 'Dividend stocks', syms: ['JPM','AAPL','PFE'] },
  ];
  const [sel, setSel] = React.useState(0);
  const list = lists[sel];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100%', overflow: 'hidden' }}>
      <aside style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)', overflowY: 'auto' }} className="scroll">
        <div style={{ padding: 'var(--card-p)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <span style={{ fontWeight: 600 }}>Watchlists</span>
            <button className="btn btn-ghost btn-sm"><I.Plus className="icon-sm"/></button>
          </div>
        </div>
        {lists.map((l, i) => (
          <button key={i} onClick={() => setSel(i)} style={{ width: '100%', padding: '10px 16px', textAlign: 'left', borderLeft: `2px solid ${sel===i?'var(--accent)':'transparent'}`, background: sel===i?'var(--surface-sunken)':'transparent' }}>
            <div className="flex justify-between">
              <span style={{ fontWeight: 500 }}>{l.name}</span>
              <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{l.syms.length}</span>
            </div>
          </button>
        ))}
      </aside>
      <main className="scroll" style={{ overflowY: 'auto', padding: 'var(--gap)', background: 'var(--bg)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--gap)' }}>
          <h1 style={{ margin: 0, fontSize: 'var(--fs-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{list.name}</h1>
          <div className="flex gap-2"><button className="btn btn-sm"><I.Plus className="icon-sm"/> Add symbol</button><button className="btn btn-sm btn-ghost"><I.Dots className="icon-sm"/></button></div>
        </div>
        <div className="card">
          <table className="data">
            <thead><tr><th style={{ paddingLeft: 16, textAlign: 'left' }}>Symbol</th><th>Last</th><th>Chg $</th><th>Chg %</th><th>30d trend</th><th>Volume</th><th>Mkt cap</th><th style={{ paddingRight: 16 }}>52w range</th></tr></thead>
            <tbody>
              {list.syms.map(s => {
                const t = TICKERS[s];
                return (
                  <tr key={s} onClick={() => nav('research', { symbol: s })} style={{ cursor: 'pointer' }}>
                    <td style={{ paddingLeft: 16 }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--chip)', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700, color: 'var(--accent)' }}>{s.slice(0,2)}</div>
                        <div className="flex-col"><span style={{ fontWeight: 600 }}>{s}</span><span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{t.name}</span></div>
                      </div>
                    </td>
                    <td className="mono">{fmtMoney(t.price)}</td>
                    <td className="mono" style={{ color: t.chg>=0?'var(--pos)':'var(--neg)' }}>{t.chg>=0?'+':''}{t.chg.toFixed(2)}</td>
                    <td className="mono" style={{ color: t.chgPct>=0?'var(--pos)':'var(--neg)' }}>{fmtPct(t.chgPct)}</td>
                    <td><Sparkline data={genSeries(30, t.price*0.95, t.price, 0.02, s.charCodeAt(0))} positive={t.chgPct>0} w={100} h={24}/></td>
                    <td className="mono">{fmtCompact(t.vol)}</td>
                    <td className="mono">{fmtCompact(t.mktCap)}</td>
                    <td style={{ paddingRight: 16 }}><RangeBar low={t.low52} high={t.high52} current={t.price} w={100} compact/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

// Transfers and Onboarding — lighter stubs
const TransferScreen = ({ nav }) => (
  <div className="scroll" style={{ overflowY: 'auto', height: '100%', padding: 'var(--gap)', background: 'var(--bg)', display: 'grid', placeItems: 'start center' }}>
    <div className="card" style={{ width: 560, padding: 28 }}>
      <h1 style={{ margin: 0, fontSize: 'var(--fs-xl)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 6 }}>Transfer money</h1>
      <div style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginBottom: 20 }}>Move money between HedgeIQ accounts or to/from your linked bank.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>From</label><select className="input" style={{ marginTop: 4 }}><option>Chase Checking ****4211 · $18,402.55</option>{ACCOUNTS.slice(0,4).map(a=><option key={a.id}>{a.name} {a.num}</option>)}</select></div>
        <div><label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>To</label><select className="input" style={{ marginTop: 4 }}>{ACCOUNTS.slice(0,4).map(a=><option key={a.id}>{a.name} {a.num}</option>)}</select></div>
        <div><label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Amount</label><input className="input" defaultValue="2,500.00" style={{ marginTop: 4, fontSize: 'var(--fs-xl)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}/></div>
        <div className="flex gap-2"><button className="btn btn-sm">$500</button><button className="btn btn-sm">$1,000</button><button className="btn btn-sm">$5,000</button><button className="btn btn-sm">Max</button></div>
        <div><label style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Frequency</label><select className="input" style={{ marginTop: 4 }}><option>One-time</option><option>Weekly</option><option>Monthly</option></select></div>
        <div style={{ padding: 12, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Funds typically arrive <strong style={{ color: 'var(--text)' }}>same business day</strong>. Up to $25,000 instantly available.</div>
        <button className="btn btn-primary" style={{ padding: 12, fontWeight: 700 }}>Review transfer</button>
      </div>
    </div>
  </div>
);

const OnboardingScreen = ({ nav }) => {
  const [step, setStep] = React.useState(1);
  const steps = ['Account type','Personal info','Funding','Review'];
  return (
    <div className="scroll" style={{ overflowY: 'auto', height: '100%', background: 'var(--bg)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 720, padding: 'var(--gap)' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2" style={{ color: i+1 <= step ? 'var(--accent)' : 'var(--text-subtle)' }}>
                <div style={{ width: 24, height: 24, borderRadius: 999, border: `1.5px solid ${i+1<=step?'var(--accent)':'var(--border-strong)'}`, background: i+1<step?'var(--accent)':'transparent', color: i+1<step?'var(--accent-contrast)':'inherit', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>{i+1<step?'✓':i+1}</div>
                <span style={{ fontSize: 'var(--fs-sm)', fontWeight: i+1===step?600:500 }}>{s}</span>
              </div>
              {i < steps.length-1 && <div style={{ flexGrow: 1, height: 1, background: 'var(--border)' }}/>}
            </React.Fragment>
          ))}
        </div>

        <div className="card card-p" style={{ padding: 32 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--fs-xl)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Choose an account type</h1>
          <div style={{ color: 'var(--text-muted)', marginTop: 6, marginBottom: 20, fontSize: 'var(--fs-sm)' }}>Pick what fits your goal. You can always open more later.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { k: 'Individual brokerage', s: 'General investing · Taxable', icon: <I.Chart/> },
              { k: 'Roth IRA', s: 'Tax-free growth · Retirement', icon: <I.Shield/> },
              { k: 'Traditional IRA', s: 'Tax-deferred · Retirement', icon: <I.Briefcase/> },
              { k: '529 plan', s: 'Education savings', icon: <I.Book/> },
              { k: 'Joint brokerage', s: 'Shared investing', icon: <I.User/> },
              { k: 'Custodial (UTMA)', s: 'For a minor', icon: <I.User/> },
            ].map((t, i) => (
              <button key={i} className="card" style={{ padding: 16, textAlign: 'left', borderWidth: 1, borderColor: i===0?'var(--accent)':'var(--border)', background: i===0?'color-mix(in oklch, var(--accent) 5%, var(--surface))':'var(--surface)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--chip)', color: 'var(--accent)', display: 'grid', placeItems: 'center', marginBottom: 10 }}>{t.icon}</div>
                <div style={{ fontWeight: 600 }}>{t.k}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{t.s}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-between" style={{ marginTop: 24 }}>
            <button className="btn">Back</button>
            <button className="btn btn-primary" onClick={() => setStep(step+1)}>Continue <I.ChevR size={12}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { OptionsScreen, ResearchScreen, ActivityScreen, BalancesScreen, WatchlistsScreen, TransferScreen, OnboardingScreen });

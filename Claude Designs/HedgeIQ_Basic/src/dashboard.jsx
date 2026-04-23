// Dashboard screen — portfolio overview with AI insights

const DashAccountPanel = ({ selectedId, setSelectedId }) => {
  const groups = ACCOUNTS.reduce((acc, a) => {
    acc[a.cat] = acc[a.cat] || [];
    acc[a.cat].push(a);
    return acc;
  }, {});
  const total = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const totalDay = ACCOUNTS.reduce((s, a) => s + a.dayChg, 0);

  return (
    <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', overflowY: 'auto', height: '100%' }} className="scroll">
      <div style={{ padding: 'var(--card-p)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div style={{ fontSize: 'var(--fs-md)', fontWeight: 600 }}>Accounts</div>
          <div className="flex gap-1">
            <button className="btn btn-ghost btn-xs"><I.Settings size={12}/></button>
            <button className="btn btn-ghost btn-xs"><I.Sidebar size={12}/></button>
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>As of Apr 19 · 3:42 PM ET</div>

        <button onClick={() => setSelectedId('all')}
          className={selectedId === 'all' ? 'selected-acct' : ''}
          style={{
            width: '100%', marginTop: 14, padding: '10px 12px', textAlign: 'left',
            border: `1px solid ${selectedId === 'all' ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            background: selectedId === 'all' ? 'var(--chip)' : 'var(--surface-2)',
          }}>
          <div className="flex items-center justify-between">
            <span style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>All accounts</span>
            <span className="mono" style={{ fontWeight: 600 }}>{fmtMoney(total, { cents: 0 })}</span>
          </div>
          <div className="flex items-center justify-between" style={{ marginTop: 3 }}>
            <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{ACCOUNTS.length} accounts</span>
            <span className="mono" style={{ fontSize: 10, color: totalDay >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmtPct(totalDay/total*100)}</span>
          </div>
        </button>
      </div>

      {Object.entries(groups).map(([cat, list]) => (
        <div key={cat} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '4px 16px', fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{cat}</div>
          {list.map(a => (
            <button key={a.id} onClick={() => setSelectedId(a.id)} style={{
              width: '100%', padding: '6px 16px', textAlign: 'left',
              background: selectedId === a.id ? 'var(--surface-sunken)' : 'transparent',
              borderLeft: `2px solid ${selectedId === a.id ? 'var(--accent)' : 'transparent'}`
            }}>
              <div className="flex justify-between">
                <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 500 }}>{a.name}</span>
                <span className="mono" style={{ fontSize: 'var(--fs-sm)' }}>{fmtMoney(a.balance, { cents: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{a.num}</span>
                <span className="mono" style={{ fontSize: 10, color: a.dayChg >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                  {a.dayChg > 0 ? '+' : ''}{fmtMoney(a.dayChg, { cents: 0 }).replace('$', '$')}
                </span>
              </div>
            </button>
          ))}
        </div>
      ))}

      <div style={{ padding: 14 }}>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-muted)' }}>
          <I.Plus className="icon-sm"/> Open an account
        </button>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-muted)' }}>
          <I.ArrowUR className="icon-sm"/> Link external account
        </button>
      </div>
    </div>
  );
};

const BalanceHero = () => {
  const [range, setRange] = React.useState('1M');
  const ranges = ['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y', 'ALL'];
  const data = genSeries(60, 198500, 208201, 0.008, 11);
  const bench = genSeries(60, 198500, 204100, 0.007, 23);
  const [hover, setHover] = React.useState(null);

  return (
    <div className="card card-p" style={{ padding: 'var(--card-p)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>Total portfolio value</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 4 }}>
            <div className="mono" style={{ fontSize: 'var(--fs-3xl)', fontWeight: 600, letterSpacing: '-0.02em' }}>
              $839,697.20
            </div>
            <div className="flex items-center gap-3">
              <span className="mono pos" style={{ fontSize: 'var(--fs-lg)', fontWeight: 600 }}>+$4,327.13</span>
              <span className="chip chip-pos" style={{ fontSize: 'var(--fs-sm)' }}>+0.52% today</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="seg">
            {ranges.map(r => (
              <button key={r} className={r === range ? 'active' : ''} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm"><I.Expand className="icon-sm"/></button>
        </div>
      </div>

      <div style={{ position: 'relative' }}
           onMouseMove={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const pct = (e.clientX - rect.left) / rect.width;
             setHover(Math.max(0, Math.min(data.length - 1, Math.floor(pct * data.length))));
           }}
           onMouseLeave={() => setHover(null)}>
        <AreaChart data={data} compareData={bench} w={980} h={220} positive={true} xLabels={['Mar 20', 'Mar 27', 'Apr 3', 'Apr 10', 'Apr 17']} highlight={hover}/>
        <div style={{ width: '100%', height: 220, position: 'absolute', top: 0, left: 0 }}/>
      </div>

      <div className="flex items-center gap-4" style={{ marginTop: 10, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-2"><span style={{ width: 10, height: 2, background: 'var(--accent)' }}/> Portfolio</span>
        <span className="flex items-center gap-2"><span style={{ width: 10, height: 2, background: 'var(--text-subtle)', borderTop: '1px dashed' }}/> S&P 500 benchmark</span>
        <span className="grow"/>
        {hover !== null && (
          <span className="mono">{fmtMoney(data[hover], { cents: 2 })}</span>
        )}
      </div>
    </div>
  );
};

const QuickStats = () => {
  const stats = [
    { k: 'Day change', v: '+$4,327.13', sub: '+0.52%', pos: true },
    { k: 'Total gain', v: '+$127,442', sub: '+17.89% all-time' , pos: true },
    { k: 'Buying power', v: '$32,624', sub: 'Across 3 accounts', pos: null },
    { k: 'Dividend YTD', v: '$2,184', sub: 'Forecast $8.9K/yr', pos: null },
  ];
  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
      {stats.map((s, i) => (
        <div key={i} style={{ padding: 'var(--card-p)', borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 0 }}>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.k}</div>
          <div className="mono" style={{ fontSize: 'var(--fs-xl)', fontWeight: 600, marginTop: 6, color: s.pos === true ? 'var(--pos)' : s.pos === false ? 'var(--neg)' : 'var(--text)' }}>{s.v}</div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
};

const AIInsightCard = ({ onOpenCopilot }) => {
  const insights = [
    { type: 'Opportunity', label: 'Tax-loss harvest', detail: 'TSLA is down $5.8K. Harvesting could save ~$1,400 in tax.' },
    { type: 'Alert', label: 'Earnings tomorrow', detail: 'META reports after close. Consensus EPS $5.17, implied move ±5.8%.' },
    { type: 'Rebalance', label: 'Tech concentration', detail: '58% of holdings in Tech. 5% shift to VTI brings beta 1.28 → 1.15.' },
  ];
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="flex items-center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(90deg, color-mix(in oklch, var(--accent) 8%, var(--surface)), var(--surface))' }}>
        <div style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'var(--accent-contrast)', display: 'grid', placeItems: 'center', marginRight: 8 }}>
          <I.Sparkle size={12}/>
        </div>
        <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>AI insights</div>
        <span className="grow"/>
        <button className="btn btn-ghost btn-xs" onClick={onOpenCopilot}>Open copilot <I.ChevR size={10}/></button>
      </div>
      {insights.map((x, i) => (
        <div key={i} style={{ padding: '10px 16px', borderBottom: i < insights.length - 1 ? '1px solid var(--border)' : 0 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
            <span className="chip" style={{ fontSize: 9, padding: '1px 6px' }}>{x.type}</span>
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{x.label}</span>
          </div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', lineHeight: 1.5 }}>{x.detail}</div>
        </div>
      ))}
    </div>
  );
};

const MoversCard = () => {
  const [tab, setTab] = React.useState('gainers');
  const gainers = [['EFOI','ENERGY FOCUS INC',167155900,210.53],['FMMM','FORUM MARKETS INC',40347400,81.01],['CRMX','TRADER 2X CRML DAILY ETF',2068800,70.74]];
  const losers  = [['LNZA','LANZATECH GLOBAL',100301,-37.13],['JLHL','JULONG HOLDING CO',796100,-34.67],['BMI','BADGER METER INC',4169200,-24.13]];
  const rows = tab === 'gainers' ? gainers : losers;
  return (
    <div className="card">
      <div className="flex items-center justify-between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>Market movers</div>
        <div className="seg">
          <button className={tab === 'gainers' ? 'active' : ''} onClick={() => setTab('gainers')}>Gainers</button>
          <button className={tab === 'losers' ? 'active' : ''} onClick={() => setTab('losers')}>Losers</button>
          <button>Most active</button>
        </div>
      </div>
      <div style={{ padding: '8px 8px 12px' }}>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center" style={{ padding: '6px 10px', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--chip)', marginRight: 10, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>{r[0].slice(0,2)}</div>
            <div className="grow flex-col">
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{r[0]}</div>
              <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{r[1]}</div>
            </div>
            <div style={{ width: 60, marginRight: 12 }}>
              <Sparkline data={genSeries(14, 100, 100 + r[3]/2, 0.03, i*7)} positive={r[3] > 0} w={60} h={18}/>
            </div>
            <div className="mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', width: 72, textAlign: 'right' }}>{fmtCompact(r[2])}</div>
            <div className="mono" style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: r[3] >= 0 ? 'var(--pos)' : 'var(--neg)', width: 72, textAlign: 'right' }}>{fmtPct(r[3])}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TopMoversCard = () => {
  const rows = [
    ['NVDA', 'NVIDIA', +40239.00, 1.62, 892.40],
    ['META', 'Meta Platforms', +8973.15, 1.75, 514.20],
    ['VOO',  'Vanguard S&P', +1618.33, 0.41, 513.87],
    ['TSLA', 'Tesla', -4205.00, -4.47, 179.83],
    ['PFE',  'Pfizer', -487.00, -1.21, 27.65],
    ['AAPL', 'Apple', -253.20, -0.96, 218.64],
  ];
  return (
    <div className="card">
      <div className="flex items-center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>Your top & bottom movers</div>
        <span className="grow"/>
        <button className="btn btn-ghost btn-xs">All positions <I.ChevR size={10}/></button>
      </div>
      <table className="data" style={{ padding: '0 10px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', paddingLeft: 16 }}>Symbol</th>
            <th>Today's G/L $</th>
            <th>Today's %</th>
            <th style={{ paddingRight: 16 }}>Last</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ paddingLeft: 16 }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: 22, height: 22, borderRadius: 4, background: 'var(--chip)', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700, color: 'var(--accent)' }}>{r[0].slice(0,2)}</div>
                  <div className="flex-col">
                    <span style={{ fontWeight: 600 }}>{r[0]}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{r[1]}</span>
                  </div>
                </div>
              </td>
              <td className="mono" style={{ color: r[2] >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{r[2] >= 0 ? '+' : ''}{fmtMoney(r[2], { cents: 2 })}</td>
              <td className="mono" style={{ color: r[3] >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmtPct(r[3])}</td>
              <td className="mono" style={{ paddingRight: 16 }}>{fmtMoney(r[4])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MarketsCard = () => {
  const mkts = [
    { name: 'Dow Jones', v: '49,447.43', c: 1.79, series: genSeries(40, 48600, 49447, 0.003, 5) },
    { name: 'Nasdaq', v: '24,468.48', c: 1.52, series: genSeries(40, 24100, 24468, 0.004, 8) },
    { name: 'S&P 500', v: '7,126.06', c: 1.29, series: genSeries(40, 7030, 7126, 0.003, 12) },
  ];
  const commodities = [
    { k: 'Crude oil', v: '$82.59', c: 0 },
    { k: 'Gold', v: '$4,879.60', c: 0.18 },
    { k: '10Y yield', v: '4.186%', c: -0.34 },
    { k: 'Bitcoin', v: '$75,055', c: 0.65 },
  ];
  return (
    <div className="card">
      <div className="flex items-center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>Markets</div>
        <span style={{ fontSize: 10, color: 'var(--text-subtle)', marginLeft: 8 }}>U.S. markets open</span>
        <span className="grow"/>
        <span className="chip chip-outline"><span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--pos)' }}/> Live</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        {mkts.map((m, i) => (
          <div key={i} style={{ padding: '12px 14px', borderRight: i < 2 ? '1px solid var(--border)' : 0 }}>
            <div style={{ fontSize: 10, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.name}</div>
            <div className="mono" style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, marginTop: 2 }}>{m.v}</div>
            <div className="mono pos" style={{ fontSize: 'var(--fs-xs)' }}>+{m.c.toFixed(2)}%</div>
            <div style={{ marginTop: 6 }}><Sparkline data={m.series} w={110} h={30} positive={true}/></div>
          </div>
        ))}
      </div>
      <div className="divider"/>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {commodities.map((c, i) => (
          <div key={i} className="flex justify-between" style={{ padding: '8px 14px', borderBottom: i < 2 ? '1px solid var(--border)' : 0, borderRight: i % 2 === 0 ? '1px solid var(--border)' : 0 }}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{c.k}</span>
            <div className="flex gap-2">
              <span className="mono" style={{ fontSize: 'var(--fs-xs)', fontWeight: 600 }}>{c.v}</span>
              <span className="mono" style={{ fontSize: 'var(--fs-xs)', color: c.c >= 0 ? 'var(--pos)' : 'var(--neg)', width: 44, textAlign: 'right' }}>{c.c >= 0 ? '+' : ''}{c.c.toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EventsCard = () => (
  <div className="card">
    <div className="flex items-center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>Portfolio events</div>
    </div>
    {EVENTS.map((e, i) => (
      <div key={i} className="flex items-center gap-3" style={{ padding: '10px 16px', borderBottom: i < EVENTS.length - 1 ? '1px solid var(--border)' : 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: e.type === 'Earnings' ? 'var(--pos-bg)' : 'var(--chip)', display: 'grid', placeItems: 'center', color: e.type === 'Earnings' ? 'var(--pos)' : 'var(--accent)' }}>
          {e.type === 'Earnings' ? <I.Chart size={16}/> : <I.Calendar size={16}/>}
        </div>
        <div className="flex-col grow" style={{ lineHeight: 1.3 }}>
          <div className="flex gap-2" style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
            {e.type} · {e.sym}
          </div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{e.detail}</div>
        </div>
        <div className="mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', textAlign: 'right' }}>{e.date}</div>
      </div>
    ))}
  </div>
);

const NewsCard = () => (
  <div className="card">
    <div className="flex items-center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>News</div>
      <span className="grow"/>
      <div className="seg" style={{ fontSize: 10 }}>
        <button className="active">Your holdings</button>
        <button>Market</button>
      </div>
    </div>
    {NEWS.slice(0, 5).map((n, i) => (
      <a href="#" key={i} className="flex gap-3" style={{ padding: '10px 16px', borderBottom: i < 4 ? '1px solid var(--border)' : 0 }}>
        {n.sym && <div style={{ width: 36, height: 36, borderRadius: 4, background: 'var(--chip)', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700, color: 'var(--accent)' }}>{n.sym}</div>}
        <div className="flex-col" style={{ lineHeight: 1.35 }}>
          <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 500 }}>{n.t}</div>
          <div className="flex gap-2" style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2 }}>
            <span>{n.src}</span><span>·</span><span>{n.time} ago</span>
            {n.imp === 'high' && <span className="chip chip-neg" style={{ padding: '0 5px', fontSize: 8 }}>High impact</span>}
          </div>
        </div>
      </a>
    ))}
  </div>
);

const AllocationCard = () => {
  const segs = [
    { k: 'US Equity', v: 58, color: 'var(--accent)' },
    { k: 'Int\'l Equity', v: 12, color: 'var(--accent-2)' },
    { k: 'Fixed Income', v: 18, color: 'var(--text-muted)' },
    { k: 'Cash', v: 8, color: 'var(--text-subtle)' },
    { k: 'Alternative', v: 4, color: 'var(--border-strong)' },
  ];
  return (
    <div className="card card-p">
      <div className="flex items-center" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>Allocation</div>
        <span className="grow"/>
        <button className="btn btn-ghost btn-xs">Details <I.ChevR size={10}/></button>
      </div>
      <div className="flex gap-4 items-center">
        <Donut segments={segs} size={108} thickness={16} center={{ label: 'Risk', value: 'Mod' }}/>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {segs.map((s, i) => (
            <div key={i} className="flex items-center gap-2" style={{ fontSize: 'var(--fs-xs)' }}>
              <span style={{ width: 10, height: 10, background: s.color, borderRadius: 2 }}/>
              <span className="grow" style={{ color: 'var(--text-muted)' }}>{s.k}</span>
              <span className="mono" style={{ fontWeight: 600 }}>{s.v}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ onOpenCopilot, nav }) => {
  const [selectedId, setSelectedId] = React.useState('all');
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <DashAccountPanel selectedId={selectedId} setSelectedId={setSelectedId}/>
      <main className="scroll" style={{ flexGrow: 1, overflowY: 'auto', padding: 'var(--gap)', background: 'var(--bg)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--gap)' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'var(--fs-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>All accounts</h1>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', marginTop: 2 }}>Apr 19, 2026 · 3:42 PM ET · Live</div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-sm" onClick={() => nav('trade')}><I.Bolt className="icon-sm"/> Trade</button>
            <button className="btn btn-sm"><I.ArrowUR className="icon-sm"/> Transfer</button>
            <button className="btn btn-sm"><I.Search className="icon-sm"/> Quote</button>
            <button className="btn btn-sm"><I.Download className="icon-sm"/></button>
            <button className="btn btn-sm"><I.Dots className="icon-sm"/></button>
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: 'var(--gap)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 0 }}>
          <div className="tab active">Summary</div>
          <div className="tab" onClick={() => nav('positions')}>Positions</div>
          <div className="tab" onClick={() => nav('activity')}>Activity & Orders</div>
          <div className="tab" onClick={() => nav('balances')}>Balances</div>
          <div className="tab">Documents</div>
          <div className="tab">Planning</div>
          <div className="tab" style={{ color: 'var(--text-subtle)' }}>More (4)</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 'var(--gap)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)', minWidth: 0 }}>
            <BalanceHero/>
            <QuickStats/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap)' }}>
              <TopMoversCard/>
              <MoversCard/>
            </div>
            <EventsCard/>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)', minWidth: 0 }}>
            <AIInsightCard onOpenCopilot={onOpenCopilot}/>
            <MarketsCard/>
            <AllocationCard/>
            <NewsCard/>
          </div>
        </div>
      </main>
    </div>
  );
};

Object.assign(window, { Dashboard });

// App shell — Topbar, Sidebar, AI Copilot panel, Command Palette

const TopBar = ({ onSearch, density, setDensity, theme, setTheme, colorblind, setColorblind, ai, setAi, sparkOpen, setSparkOpen, current, nav }) => {
  return (
    <header style={{
      height: 52, display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 16px', borderBottom: '1px solid var(--border)',
      background: 'var(--surface)', position: 'relative', zIndex: 10,
    }}>
      <div className="flex items-center gap-2" style={{ width: 220 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent)', display: 'grid', placeItems: 'center', color: 'var(--accent-contrast)', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14 }}>H</div>
        <div className="flex-col" style={{ lineHeight: 1.1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>HedgeIQ</div>
          <div style={{ fontSize: 9, color: 'var(--text-subtle)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Markets · 09:42 ET</div>
        </div>
      </div>

      <nav className="flex items-center gap-1" style={{ fontSize: 'var(--fs-md)' }}>
        {[
          { k: 'dashboard', l: 'Overview' },
          { k: 'positions', l: 'Positions' },
          { k: 'trade', l: 'Trade' },
          { k: 'options', l: 'Options' },
          { k: 'research', l: 'Research' },
          { k: 'activity', l: 'Activity' },
          { k: 'balances', l: 'Balances' },
          { k: 'watchlists', l: 'Watchlists' },
        ].map(item => (
          <button key={item.k} onClick={() => nav(item.k)}
            className={cls('btn btn-ghost btn-sm', current === item.k && 'active-nav')}
            style={{
              color: current === item.k ? 'var(--text)' : 'var(--text-muted)',
              background: current === item.k ? 'var(--surface-sunken)' : 'transparent',
              fontWeight: current === item.k ? 600 : 500,
            }}>
            {item.l}
          </button>
        ))}
      </nav>

      <div className="grow"/>

      <button className="btn btn-ghost btn-sm" onClick={() => setSparkOpen(true)} style={{ color: 'var(--text-muted)', gap: 8, border: '1px solid var(--border)', width: 240, justifyContent: 'flex-start' }}>
        <I.Search className="icon-sm"/>
        <span>Search symbols, accounts…</span>
        <span className="grow"/>
        <span className="mono" style={{ fontSize: 10, padding: '1px 5px', background: 'var(--surface-sunken)', borderRadius: 3 }}>⌘K</span>
      </button>

      <button className="btn btn-ghost btn-sm" title="Notifications"><I.Bell className="icon-sm"/></button>
      <button className="btn btn-ghost btn-sm" onClick={() => setAi(!ai)} title="AI Copilot"
        style={{ background: ai ? 'var(--chip)' : 'transparent', color: ai ? 'var(--accent)' : 'var(--text-muted)' }}>
        <I.Sparkle className="icon-sm"/>
        <span>Copilot</span>
      </button>

      <div style={{ width: 1, height: 24, background: 'var(--border)' }}/>
      <div className="flex items-center gap-2">
        <div style={{ width: 30, height: 30, borderRadius: 999, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'var(--accent-contrast)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>SR</div>
      </div>
    </header>
  );
};

const MarketTape = () => {
  const tape = [
    { s: 'S&P 500', v: '7,126.06', c: 1.29 },
    { s: 'Nasdaq', v: '24,468.48', c: 1.52 },
    { s: 'Dow', v: '49,447.43', c: 1.79 },
    { s: 'VIX', v: '17.48', c: -2.56 },
    { s: '10Y Yield', v: '4.186%', c: -0.34 },
    { s: 'Crude', v: '$82.59', c: 0.00 },
    { s: 'Gold', v: '$4,879.60', c: 0.18 },
    { s: 'BTC', v: '$75,055.55', c: 0.65 },
    { s: 'DXY', v: '104.28', c: -0.12 },
    { s: 'EUR/USD', v: '1.0842', c: 0.08 },
  ];
  return (
    <div style={{
      display: 'flex', gap: 20, padding: '6px 16px',
      borderBottom: '1px solid var(--border)', background: 'var(--surface-2)',
      fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-mono)',
      overflowX: 'auto', whiteSpace: 'nowrap', alignItems: 'center'
    }} className="scroll">
      {tape.map((t, i) => (
        <div key={i} className="flex items-center gap-2" style={{ letterSpacing: '0.02em' }}>
          <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.08em' }}>{t.s}</span>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{t.v}</span>
          <span style={{ color: t.c >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{t.c >= 0 ? '▲' : '▼'} {Math.abs(t.c).toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
};

const AISidebar = ({ open, onClose, context }) => {
  const [input, setInput] = React.useState('');
  const [msgs, setMsgs] = React.useState([
    { role: 'ai', content: 'Hi Sankar. I\'m your HedgeIQ copilot — I see your Traditional IRA is up 0.40% today, led by Snowflake (+$584). Want me to flag anything in particular?', ts: '9:41 AM' }
  ]);
  const [typing, setTyping] = React.useState(false);

  const prompts = [
    { icon: '◆', label: 'Why is NVDA up today?' },
    { icon: '◇', label: 'Explain my portfolio risk' },
    { icon: '▴', label: 'What are covered calls?' },
    { icon: '○', label: 'Rebalance for lower volatility' },
    { icon: '◉', label: 'Tax-loss harvesting ideas' },
  ];

  const send = (text) => {
    if (!text.trim()) return;
    setMsgs(m => [...m, { role: 'user', content: text, ts: 'just now' }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const responses = {
        default: 'Based on your holdings, here\'s what I\'m seeing — your portfolio beta is currently 1.28, slightly above market. NVDA and TSLA contribute most to that. If you\'d like lower volatility, shifting 5–10% from TSLA to VTI would pull beta down to ~1.15. Want me to draft that rebalance?',
        nvda: 'NVDA is up 1.62% on two catalysts: (1) Rubin AI chip launch confirmed for Q3 production, and (2) two analyst upgrades (Morgan Stanley $1,100 PT, Bernstein Outperform). Your position is up $12,597 on unrealized gain since avg cost $612.40.',
        risk: 'Your portfolio: β=1.28, 60% in 5 names (concentrated), tech weight 58%. Key risks — NVDA single-position (>12% of TOD), options exposure on 3 accounts. Sharpe YTD: 1.14, Max DD: −8.2%. Below peers on diversification, above on return.',
        covered: 'A covered call means selling a call option against shares you already own. You collect premium upfront; in exchange you agree to sell at the strike if assigned. Safer than naked calls — the risk is capping upside. Want me to find a candidate in your book?',
      };
      const key = text.toLowerCase();
      let r = responses.default;
      if (key.includes('nvda') || key.includes('why')) r = responses.nvda;
      else if (key.includes('risk')) r = responses.risk;
      else if (key.includes('covered') || key.includes('call')) r = responses.covered;
      setMsgs(m => [...m, { role: 'ai', content: r, ts: 'just now' }]);
      setTyping(false);
    }, 900);
  };

  if (!open) return null;
  return (
    <aside style={{
      width: 360, flexShrink: 0, borderLeft: '1px solid var(--border)',
      background: 'var(--surface)', display: 'flex', flexDirection: 'column',
      height: '100%'
    }}>
      <div className="flex items-center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', gap: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'grid', placeItems: 'center', color: 'var(--accent-contrast)' }}>
          <I.Sparkle className="icon-sm" strokeWidth={2}/>
        </div>
        <div className="flex-col grow" style={{ lineHeight: 1.15 }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>Copilot</div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Grounded in your accounts · Real-time</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><I.X className="icon-sm"/></button>
      </div>

      <div className="grow scroll" style={{ overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            {m.role === 'ai' && (
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--chip)', display: 'grid', placeItems: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                <I.Sparkle size={12}/>
              </div>
            )}
            <div style={{
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: 8,
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface-sunken)',
              color: m.role === 'user' ? 'var(--accent-contrast)' : 'var(--text)',
              fontSize: 'var(--fs-sm)', lineHeight: 1.5,
            }}>
              {m.content}
              <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>{m.ts}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--chip)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
              <I.Sparkle size={12}/>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--surface-sunken)', borderRadius: 8, display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--text-muted)', animation: `blink 1.4s ${i * 0.2}s infinite` }}/>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        <div style={{ fontSize: 9, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Try asking</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          {prompts.slice(0, 3).map((p, i) => (
            <button key={i} onClick={() => send(p.label)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', color: 'var(--text-muted)', padding: '5px 8px', borderRadius: 4 }}>
              <span style={{ color: 'var(--accent)', marginRight: 8 }}>{p.icon}</span>{p.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input className="input" placeholder="Ask about your portfolio…" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}/>
          <button className="btn btn-primary" onClick={() => send(input)} disabled={!input.trim()}><I.Send className="icon-sm"/></button>
        </div>
      </div>

      <style>{`@keyframes blink { 0%, 80% { opacity: 0.3 } 40% { opacity: 1 } }`}</style>
    </aside>
  );
};

const CommandPalette = ({ open, onClose, nav }) => {
  const [q, setQ] = React.useState('');
  if (!open) return null;
  const items = [
    ...SYMBOLS.map(s => ({ label: `${s} — ${TICKERS[s].name}`, kind: 'Symbol', action: () => nav('research', { symbol: s }) })),
    ...['dashboard','positions','trade','options','research','activity','balances','watchlists'].map(k => ({ label: k[0].toUpperCase() + k.slice(1), kind: 'Page', action: () => nav(k) })),
    { label: 'Open a new account', kind: 'Action', action: () => nav('onboarding') },
    { label: 'Transfer money', kind: 'Action', action: () => nav('transfer') },
  ];
  const filtered = items.filter(x => x.label.toLowerCase().includes(q.toLowerCase())).slice(0, 12);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 100, display: 'grid', placeItems: 'start center', paddingTop: '12vh' }} onClick={onClose}>
      <div className="card" style={{ width: 560, maxWidth: '90vw', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <I.Search className="icon-sm" style={{ color: 'var(--text-muted)' }}/>
          <input autoFocus className="input" style={{ border: 0, padding: 0, fontSize: 'var(--fs-lg)' }} placeholder="Search symbols, pages, actions…" value={q} onChange={e => setQ(e.target.value)}/>
          <span className="chip">ESC</span>
        </div>
        <div className="scroll" style={{ maxHeight: 400, overflowY: 'auto' }}>
          {filtered.map((x, i) => (
            <button key={i} onClick={() => { x.action(); onClose(); }} style={{
              width: '100%', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: 'var(--fs-md)'
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 10, width: 56, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{x.kind}</span>
              <span>{x.label}</span>
              <span className="grow"/>
              <I.ChevR className="icon-sm" style={{ color: 'var(--text-subtle)' }}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { TopBar, MarketTape, AISidebar, CommandPalette });

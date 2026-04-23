// App shell — navigation, copilot, tweaks, theme switching

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "meridian",
  "density": "balanced",
  "colorblind": false,
  "showCopilot": false
}/*EDITMODE-END*/;

const Sidebar = ({ nav, current, onOpenCopilot }) => {
  const items = [
    { k: 'dashboard', lbl: 'Dashboard', I: I.Grid },
    { k: 'positions', lbl: 'Positions', I: I.Briefcase },
    { k: 'watchlists', lbl: 'Watchlists', I: I.Star },
    { k: 'trade', lbl: 'Trade', I: I.Bolt },
    { k: 'options', lbl: 'Options', I: I.Chart },
    { k: 'research', lbl: 'Research', I: I.Search },
    { k: 'activity', lbl: 'Activity', I: I.Calendar },
    { k: 'balances', lbl: 'Balances', I: I.Shield },
    { k: 'transfer', lbl: 'Transfer', I: I.ArrowUR },
  ];
  return (
    <nav style={{ width: 66, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 2 }}>
      <div style={{ width: 40, height: 40, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'grid', placeItems: 'center', marginBottom: 10, color: 'var(--accent-contrast)', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 18 }}>H</div>
      {items.map(it => (
        <button key={it.k} onClick={() => nav(it.k)} title={it.lbl}
          style={{ width: 44, height: 44, borderRadius: 8, display: 'grid', placeItems: 'center',
            color: current === it.k ? 'var(--accent)' : 'var(--text-muted)',
            background: current === it.k ? 'var(--chip)' : 'transparent' }}>
          <it.I size={18}/>
        </button>
      ))}
      <span style={{ flexGrow: 1 }}/>
      <button onClick={onOpenCopilot} title="AI Copilot" style={{ width: 44, height: 44, borderRadius: 8, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'var(--accent-contrast)' }}>
        <I.Sparkle size={18}/>
      </button>
      <button title="Settings" style={{ width: 44, height: 44, borderRadius: 8, display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>
        <I.Settings size={18}/>
      </button>
    </nav>
  );
};

const PreferencesPopover = ({ tweaks, setTweaks, onClose }) => {
  const ref = React.useRef();
  React.useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose]);
  const themes = [
    { k: 'meridian', name: 'Meridian', desc: 'Editorial · navy + copper' },
    { k: 'lumen',    name: 'Lumen',    desc: 'Light modern · indigo' },
    { k: 'terminal', name: 'Terminal', desc: 'Pro dark · neon lime' },
  ];
  return (
    <div ref={ref} className="card" style={{
      position: 'absolute', top: 44, right: 16, width: 300, padding: 14, zIndex: 200,
      boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', background: 'var(--surface)'
    }} role="dialog" aria-label="Preferences">
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--fs-md)', fontFamily: 'var(--font-display)' }}>Preferences</div>
        <button className="btn btn-sm btn-ghost" onClick={onClose} style={{ width: 22, height: 22, padding: 0 }}><I.X size={12}/></button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>Aesthetic</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {themes.map(t => (
              <button key={t.k}
                onClick={() => setTweaks({ ...tweaks, theme: t.k })}
                style={{
                  border: tweaks.theme === t.k ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  background: tweaks.theme === t.k ? 'var(--chip)' : 'var(--surface)',
                  borderRadius: 'var(--radius-md)', padding: 8, cursor: 'pointer', textAlign: 'left',
                }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                  {t.k === 'meridian' && <>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: '#1E2A4A' }}/>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: '#B8542A' }}/>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: '#F4F1EC', border: '1px solid var(--border)' }}/>
                  </>}
                  {t.k === 'lumen' && <>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: '#4F46E5' }}/>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: '#22D3EE' }}/>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: '#F7F8FB', border: '1px solid var(--border)' }}/>
                  </>}
                  {t.k === 'terminal' && <>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: '#0A0D12' }}/>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: '#C6F24E' }}/>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: '#22D3EE' }}/>
                  </>}
                </div>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{t.name}</div>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 5 }}>
            {themes.find(t => t.k === tweaks.theme)?.desc}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>Density</div>
          <div className="seg" style={{ width: '100%' }}>
            {['dense','balanced','sparse'].map(v => (
              <button key={v} className={tweaks.density === v ? 'active' : ''} onClick={() => setTweaks({ ...tweaks, density: v })} style={{ flex: 1, textTransform: 'capitalize' }}>{v}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 4 }}>
            {tweaks.density === 'dense' && 'More on screen · tighter rows'}
            {tweaks.density === 'balanced' && 'Default · comfortable reading'}
            {tweaks.density === 'sparse' && 'Airy · easier touch targets'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
          <label className="flex items-center justify-between" style={{ fontSize: 'var(--fs-sm)', cursor: 'pointer', paddingTop: 8 }}>
            <div>
              <div style={{ fontWeight: 500 }}>Colorblind-safe palette</div>
              <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Blue / orange for gains & losses</div>
            </div>
            <input type="checkbox" checked={!!tweaks.colorblind} onChange={e => setTweaks({ ...tweaks, colorblind: e.target.checked })}/>
          </label>
          <label className="flex items-center justify-between" style={{ fontSize: 'var(--fs-sm)', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Copilot open by default</div>
              <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Show AI panel at startup</div>
            </div>
            <input type="checkbox" checked={!!tweaks.showCopilot} onChange={e => setTweaks({ ...tweaks, showCopilot: e.target.checked })}/>
          </label>
        </div>
      </div>
    </div>
  );
};

const TopBar = ({ nav, onOpenCopilot, tweaks, setTweaks }) => {
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  return (
    <header style={{ height: 52, borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0, position: 'relative', zIndex: 20 }}>
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-lg)', fontWeight: 700, letterSpacing: '-0.01em' }}>HedgeIQ</span>
        <span className="chip chip-outline" style={{ fontSize: 9 }}>BETA</span>
      </div>
      <div style={{ position: 'relative', width: 360 }}>
        <I.Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-muted)' }}/>
        <input className="input" placeholder="Search symbols, news, accounts…  ⌘K" style={{ paddingLeft: 30, background: 'var(--surface-sunken)' }}/>
      </div>
      <div className="flex items-center gap-5" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginLeft: 8 }}>
        <div><span className="mono" style={{ fontWeight: 600, color: 'var(--text)' }}>S&P 7,126.06</span> <span className="mono pos" style={{ marginLeft: 4 }}>+1.29%</span></div>
        <div><span className="mono" style={{ fontWeight: 600, color: 'var(--text)' }}>Nasdaq 24,468</span> <span className="mono pos" style={{ marginLeft: 4 }}>+1.52%</span></div>
        <div><span className="mono" style={{ fontWeight: 600, color: 'var(--text)' }}>BTC 75,055</span> <span className="mono pos" style={{ marginLeft: 4 }}>+0.65%</span></div>
      </div>
      <span className="grow"/>
      <button className="btn btn-sm btn-ghost" title="Notifications"><I.Bell size={14}/> <span className="chip chip-neg" style={{ padding: '0 5px', fontSize: 9 }}>3</span></button>
      <button className="btn btn-sm btn-ghost" title="Preferences"
        onClick={() => setPrefsOpen(o => !o)}
        style={{ background: prefsOpen ? 'var(--chip)' : 'transparent' }}>
        <I.Settings size={14}/>
      </button>
      <button className="btn btn-sm btn-primary" onClick={onOpenCopilot}><I.Sparkle size={14}/> Copilot</button>
      <div style={{ width: 32, height: 32, borderRadius: 999, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'var(--accent-contrast)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>JL</div>
      {prefsOpen && <PreferencesPopover tweaks={tweaks} setTweaks={setTweaks} onClose={() => setPrefsOpen(false)}/>}
    </header>
  );
};

const CopilotPanel = ({ open, onClose }) => {
  const [msgs, setMsgs] = React.useState([
    { from: 'ai', text: 'Hi Jordan — looking at your portfolio today, I see 3 things worth your attention. Want me to walk through them?' },
  ]);
  const [input, setInput] = React.useState('');
  const suggestions = [
    'Summarize my portfolio risk',
    'Should I rebalance?',
    'Tax-loss opportunities',
    'Explain today\'s moves',
    'Rebalance to 70/30',
    'What\'s moving NVDA?',
  ];
  const send = (text) => {
    setMsgs([...msgs, { from: 'me', text }, { from: 'ai', text: 'Let me check that for you...', typing: true }]);
    setInput('');
    setTimeout(() => {
      setMsgs(m => [...m.slice(0,-1), { from: 'ai', text: 'Based on your holdings, here\'s what I found: your tech exposure is 58% — above your target of 45%. A 13pp rotation into broad-market VTI would bring beta down from 1.28 to 1.15 and reduce concentration risk significantly.' }]);
    }, 900);
  };

  return (
    <aside style={{ width: open ? 340 : 0, flexShrink: 0, borderLeft: open ? '1px solid var(--border)' : 0, background: 'var(--surface)', transition: 'width 0.22s', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="flex items-center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', minWidth: 340 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'var(--accent-contrast)', display: 'grid', placeItems: 'center', marginRight: 8 }}><I.Sparkle size={14}/></div>
        <div className="flex-col">
          <div style={{ fontWeight: 700, fontSize: 'var(--fs-md)' }}>Copilot</div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Market-aware · private</div>
        </div>
        <span className="grow"/>
        <button className="btn btn-ghost btn-sm"><I.Dots size={14}/></button>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><I.X size={14}/></button>
      </div>

      <div className="scroll" style={{ flexGrow: 1, overflowY: 'auto', padding: 16, minWidth: 340 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            <div style={{
              maxWidth: 300, padding: '9px 12px', borderRadius: m.from === 'me' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
              background: m.from === 'me' ? 'var(--accent)' : 'var(--surface-2)',
              color: m.from === 'me' ? 'var(--accent-contrast)' : 'var(--text)',
              border: m.from === 'ai' ? '1px solid var(--border)' : 0,
              fontSize: 'var(--fs-sm)', lineHeight: 1.5
            }}>{m.text}</div>
          </div>
        ))}

        {msgs.length <= 2 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>Suggested actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => send(s)} className="btn btn-sm" style={{ justifyContent: 'space-between', width: '100%', textAlign: 'left', padding: '8px 12px', fontWeight: 500 }}>
                  <span>{s}</span><I.ChevR size={12} style={{ color: 'var(--text-subtle)' }}/>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: 18, marginBottom: 8 }}>Today's insights</div>
            <div className="card card-p" style={{ padding: 12, marginBottom: 8 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 3 }}><span className="chip chip-pos">Opportunity</span></div>
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>Tax-loss harvest TSLA</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 3 }}>Could save ~$1,400 in tax. Replace with similar exposure via ARKQ to maintain market exposure during the 30-day window.</div>
            </div>
            <div className="card card-p" style={{ padding: 12 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 3 }}><span className="chip chip-neg">Alert</span></div>
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>META earnings tomorrow</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 3 }}>You hold 80 shares. Implied move ±5.8%, which could swing your position by ±$2,387.</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--border)', minWidth: 340 }}>
        <div className="flex items-center gap-2" style={{ padding: '8px 10px', background: 'var(--surface-sunken)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <I.Sparkle size={14} style={{ color: 'var(--accent)' }}/>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&input.trim())send(input)}} placeholder="Ask about your portfolio..." style={{ flexGrow: 1, border: 0, background: 'transparent', outline: 'none', fontSize: 'var(--fs-sm)', color: 'var(--text)' }}/>
          <button onClick={()=>input.trim()&&send(input)} className="btn btn-primary btn-sm"><I.ChevR size={12}/></button>
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-subtle)', marginTop: 6, textAlign: 'center' }}>Copilot may be inaccurate. Verify before acting. Not investment advice.</div>
      </div>
    </aside>
  );
};

const TweaksPanel = ({ open, setTweaks, tweaks }) => {
  if (!open) return null;
  return (
    <div className="card" style={{ position: 'fixed', right: 16, bottom: 16, width: 260, padding: 14, zIndex: 100, boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-display)' }}>Tweaks</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 5 }}>Aesthetic</div>
          <div className="seg" style={{ width: '100%' }}>
            {['meridian','lumen','terminal'].map(v => (
              <button key={v} className={tweaks.theme === v ? 'active' : ''} onClick={() => setTweaks({ ...tweaks, theme: v })} style={{ flex: 1, textTransform: 'capitalize' }}>{v}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 4 }}>
            {tweaks.theme === 'meridian' && 'Editorial · navy + copper'}
            {tweaks.theme === 'lumen' && 'Light modern · indigo'}
            {tweaks.theme === 'terminal' && 'Pro dark · neon lime'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 5 }}>Density</div>
          <div className="seg" style={{ width: '100%' }}>
            {['dense','balanced','sparse'].map(v => (
              <button key={v} className={tweaks.density === v ? 'active' : ''} onClick={() => setTweaks({ ...tweaks, density: v })} style={{ flex: 1, textTransform: 'capitalize' }}>{v}</button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between" style={{ fontSize: 'var(--fs-sm)', cursor: 'pointer' }}>
          <span>Colorblind-safe palette</span>
          <input type="checkbox" checked={tweaks.colorblind} onChange={e => setTweaks({ ...tweaks, colorblind: e.target.checked })}/>
        </label>
        <label className="flex items-center justify-between" style={{ fontSize: 'var(--fs-sm)', cursor: 'pointer' }}>
          <span>Show Copilot by default</span>
          <input type="checkbox" checked={tweaks.showCopilot} onChange={e => setTweaks({ ...tweaks, showCopilot: e.target.checked })}/>
        </label>
      </div>
    </div>
  );
};

const App = () => {
  const [screen, setScreen] = React.useState(() => localStorage.getItem('hedgeiq.screen') || 'dashboard');
  const [navCtx, setNavCtx] = React.useState({});
  const [copilotOpen, setCopilotOpen] = React.useState(true);
  const [tweaks, setTweaksState] = React.useState(() => {
    try { return { ...TWEAK_DEFAULTS, ...JSON.parse(localStorage.getItem('hedgeiq.tweaks') || '{}') }; }
    catch { return TWEAK_DEFAULTS; }
  });
  const [tweaksOpen, setTweaksOpen] = React.useState(false);

  const setTweaks = (t) => {
    setTweaksState(t);
    localStorage.setItem('hedgeiq.tweaks', JSON.stringify(t));
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: t }, '*'); } catch {}
  };

  const nav = (k, ctx = {}) => { setScreen(k); setNavCtx(ctx); localStorage.setItem('hedgeiq.screen', k); };

  React.useEffect(() => {
    const onMsg = e => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      else if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch {}
    return () => window.removeEventListener('message', onMsg);
  }, []);

  React.useEffect(() => {
    document.body.dataset.theme = tweaks.theme;
    document.body.dataset.density = tweaks.density;
    document.body.dataset.colorblind = tweaks.colorblind ? 'true' : 'false';
  }, [tweaks]);

  React.useEffect(() => {
    setCopilotOpen(tweaks.showCopilot);
  }, [tweaks.showCopilot]);

  const Screen = {
    dashboard: () => <Dashboard nav={nav} onOpenCopilot={() => setCopilotOpen(true)}/>,
    positions: () => <PositionsScreen nav={nav} onOpenCopilot={() => setCopilotOpen(true)}/>,
    trade: () => <TradeScreen nav={nav} initialSymbol={navCtx.symbol || 'NVDA'} initialSide={navCtx.side || 'buy'}/>,
    options: () => <OptionsScreen nav={nav} initialSymbol={navCtx.symbol || 'NVDA'}/>,
    research: () => <ResearchScreen nav={nav} initialSymbol={navCtx.symbol || 'NVDA'}/>,
    activity: () => <ActivityScreen nav={nav}/>,
    balances: () => <BalancesScreen nav={nav}/>,
    watchlists: () => <WatchlistsScreen nav={nav}/>,
    transfer: () => <TransferScreen nav={nav}/>,
    onboarding: () => <OnboardingScreen nav={nav}/>,
  }[screen] || (() => <Dashboard nav={nav} onOpenCopilot={() => setCopilotOpen(true)}/>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }} data-screen-label={screen}>
      <TopBar nav={nav} onOpenCopilot={() => setCopilotOpen(true)} tweaks={tweaks} setTweaks={setTweaks}/>
      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Sidebar nav={nav} current={screen} onOpenCopilot={() => setCopilotOpen(true)}/>
        <div style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Screen/>
        </div>
        <CopilotPanel open={copilotOpen} onClose={() => setCopilotOpen(false)}/>
      </div>
      <TweaksPanel open={tweaksOpen} tweaks={tweaks} setTweaks={setTweaks}/>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

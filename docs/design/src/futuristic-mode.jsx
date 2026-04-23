// Futuristic mode — AI-native, intent-driven alternate interface for HedgeIQ.
// Single canvas with a conversational Commander at the center and contextual
// AI "panels" that morph to the user's current intent (trade, research,
// positions, options, activity, balances, transfers, watchlists).

const FM = {
  accent:  '#6B4FFF',
  soft:    '#EFEAFF',
  line:    '#D6CCFF',
  ink:     '#0E1323',
  ink2:    '#3B4256',
  muted:   '#6A7288',
  subtle:  '#9098AB',
  border:  '#E5E8F0',
  borderS: '#EEF1F7',
  surface: '#FFFFFF',
  surf2:   '#FAFBFE',
  sunken:  '#F3F5FA',
  pos:     '#0E9F5E',
  neg:     '#E23B3B',
  warn:    '#C47A10',
  font:    "'Inter Tight','Inter',-apple-system,BlinkMacSystemFont,sans-serif",
  serif:   "'Fraunces',Georgia,serif",
  mono:    "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace",
};

// ── atoms ─────────────────────────────────────────────────
const FMRow = ({ children, style, ...p }) => <div style={{ display:'flex', alignItems:'center', ...style }} {...p}>{children}</div>;
const FMCol = ({ children, style, ...p }) => <div style={{ display:'flex', flexDirection:'column', ...style }} {...p}>{children}</div>;

const FMSpark = ({ size=10, color=FM.accent }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M6 0.5L7.3 4.7L11.5 6L7.3 7.3L6 11.5L4.7 7.3L0.5 6L4.7 4.7L6 0.5Z" fill={color}/>
  </svg>
);

const FMChip = ({ children, tone='default', style, onClick }) => {
  const t = {
    default:{bg:'#EEF1F7',fg:FM.ink2,bd:'transparent'},
    ai:     {bg:FM.soft,fg:FM.accent,bd:FM.line},
    pos:    {bg:'rgba(14,159,94,.08)',fg:FM.pos,bd:'transparent'},
    neg:    {bg:'rgba(226,59,59,.08)',fg:FM.neg,bd:'transparent'},
    warn:   {bg:'rgba(196,122,16,.1)',fg:FM.warn,bd:'transparent'},
    ghost:  {bg:'transparent',fg:FM.muted,bd:FM.border},
  }[tone];
  return <span onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', background:t.bg, color:t.fg, border:`1px solid ${t.bd}`, borderRadius:999, fontSize:10.5, fontWeight:600, letterSpacing:.3, textTransform:'uppercase', cursor:onClick?'pointer':'default', ...style }}>{children}</span>;
};

const FMBadge = ({ style }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 8px', background:FM.soft, color:FM.accent, border:`1px solid ${FM.line}`, borderRadius:999, fontSize:10.5, fontWeight:600, letterSpacing:.3, textTransform:'uppercase', ...style }}>
    <FMSpark/> AI
  </span>
);

const FMIcon = {
  Mic: ({size=14,c='currentColor'}) => <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><rect x="5.5" y="2" width="5" height="8" rx="2.5"/><path d="M3 7.5v1a5 5 0 0 0 10 0v-1M8 13.5v2M5.5 15.5h5"/></svg>,
  Send: ({size=14,c='currentColor'}) => <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 8L3 3l2 5-2 5 11-5z"/></svg>,
  Chev: ({size=10,c='currentColor'}) => <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><path d="M3.5 2L6.5 5L3.5 8"/></svg>,
  Check: ({size=12,c='currentColor'}) => <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6L5 8.5L9.5 3.5"/></svg>,
  Plus: ({size=12,c='currentColor'}) => <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M6 2v8M2 6h8"/></svg>,
  Bolt: ({size=12,c='currentColor'}) => <svg width={size} height={size} viewBox="0 0 12 12" fill="none"><path d="M7 1L2 7h3l-1 4 5-6H6l1-4z" fill={c}/></svg>,
};

const btnPrimary = { padding:'8px 16px', borderRadius:8, border:'none', background:FM.accent, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' };
const btnGhost   = { padding:'8px 14px', borderRadius:8, border:`1px solid ${FM.border}`, background:FM.surface, fontSize:13, color:FM.ink, fontWeight:500, cursor:'pointer' };
const btnDark    = { padding:'8px 16px', borderRadius:8, border:'none', background:FM.ink, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' };

// ── Workspaces ────────────────────────────────────────────

const WORKSPACES = [
  { k:'home',      label:'Home',        sub:'Morning brief' },
  { k:'trade',     label:'Trade',       sub:'NL orders'     },
  { k:'options',   label:'Options',     sub:'Intent studio' },
  { k:'positions', label:'Positions',   sub:'Smart triage'  },
  { k:'research',  label:'Research',    sub:'Ask a stock'   },
  { k:'activity',  label:'Activity',    sub:'NL filter'     },
  { k:'balances',  label:'Balances',    sub:'What changed'  },
  { k:'watchlists',label:'Watchlists',  sub:'Living lists'  },
  { k:'transfers', label:'Transfers',   sub:'One-shot'      },
];

// ── Mode-switch bar (lives at the very top) ──────────────
function FMTopBar({ onBackToClassic }) {
  return (
    <div style={{ height:50, background:'#0B0E18', color:'#fff', display:'flex', alignItems:'center', padding:'0 18px', gap:14, fontFamily:FM.font, borderBottom:`1px solid #1A1F2E` }}>
      <FMRow style={{ gap:8 }}>
        <div style={{ width:24, height:24, borderRadius:6, background:`linear-gradient(135deg, ${FM.accent}, #8F7BFF)`, display:'flex', alignItems:'center', justifyContent:'center' }}><FMSpark size={12} color="#fff"/></div>
        <div style={{ fontWeight:700, fontSize:14, letterSpacing:-.2 }}>HedgeIQ</div>
        <FMChip tone="ai" style={{ background:'rgba(107,79,255,.18)', border:`1px solid rgba(107,79,255,.4)`, color:'#C9BEFF' }}>v3 · Futuristic</FMChip>
      </FMRow>

      <div style={{ flex:1 }}/>

      <FMRow style={{ gap:10, fontSize:12, color:'#9098AB' }}>
        <span>Good morning, <b style={{ color:'#fff' }}>Jordan</b></span>
        <span>·</span>
        <span>Buying power <b style={{ color:'#fff', fontVariantNumeric:'tabular-nums' }}>$48,213</b></span>
      </FMRow>

      <div style={{ flex:1 }}/>

      <FMRow style={{ gap:8 }}>
        <div style={{ padding:'3px', background:'rgba(255,255,255,.08)', borderRadius:8, display:'inline-flex', gap:2 }}>
          <button onClick={onBackToClassic} style={{ padding:'4px 10px', fontSize:11, fontWeight:600, borderRadius:6, background:'transparent', color:'#9098AB', border:'none', cursor:'pointer', letterSpacing:.3 }}>CLASSIC</button>
          <button style={{ padding:'4px 10px', fontSize:11, fontWeight:600, borderRadius:6, background:FM.accent, color:'#fff', border:'none', letterSpacing:.3 }}>FUTURISTIC</button>
        </div>
        <div style={{ width:28, height:28, borderRadius:14, background:'#2A2F3E', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600 }}>JS</div>
      </FMRow>
    </div>
  );
}

// ── Left rail ──────────────────────────────────────────────
function FMRail({ ws, setWs }) {
  return (
    <FMCol style={{ width:180, background:FM.surface, borderRight:`1px solid ${FM.border}`, padding:'18px 10px' }}>
      <div style={{ fontSize:10, color:FM.subtle, textTransform:'uppercase', letterSpacing:.6, fontWeight:700, padding:'4px 10px 10px' }}>Workspaces</div>
      {WORKSPACES.map(w => (
        <button key={w.k} onClick={() => setWs(w.k)} style={{
          textAlign:'left', padding:'8px 10px', background:ws===w.k?FM.soft:'transparent',
          color:ws===w.k?FM.accent:FM.ink2, borderRadius:8, border:'none', marginBottom:2,
          display:'flex', flexDirection:'column', gap:1, cursor:'pointer',
          fontFamily:FM.font, fontWeight:ws===w.k?600:500,
        }}>
          <div style={{ fontSize:13 }}>{w.label}</div>
          <div style={{ fontSize:10, color:ws===w.k?FM.accent:FM.subtle, opacity:ws===w.k?.8:1 }}>{w.sub}</div>
        </button>
      ))}

      <div style={{ flex:1 }}/>

      <div style={{ padding:'10px 10px 4px', fontSize:10, color:FM.subtle, textTransform:'uppercase', letterSpacing:.6, fontWeight:700 }}>Agents</div>
      <FMCol style={{ gap:4, padding:'0 4px' }}>
        {[['Tax-loss', FM.pos], ['Rebalance', FM.accent], ['Earnings', FM.warn]].map(([n,c]) => (
          <FMRow key={n} style={{ padding:'6px 8px', background:FM.surf2, border:`1px solid ${FM.borderS}`, borderRadius:6, gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:3, background:c }}/>
            <span style={{ fontSize:11, color:FM.ink2 }}>{n}</span>
            <div style={{ flex:1 }}/>
            <span style={{ fontSize:10, color:FM.subtle }}>active</span>
          </FMRow>
        ))}
      </FMCol>
    </FMCol>
  );
}

// ── Central Commander (shared prompt bar) ────────────────
function FMCommander({ placeholder, chips=[], onChip, small }) {
  return (
    <FMCol style={{ gap:10, width:'100%' }}>
      <div style={{ background:FM.surface, border:`1.5px solid ${FM.line}`, borderRadius:14,
        boxShadow:`0 10px 40px -12px ${FM.accent}33, 0 0 0 4px ${FM.accent}0D`,
        padding: small ? '10px 12px' : '12px 14px' }}>
        <FMRow style={{ gap:10, alignItems:'flex-start' }}>
          <div style={{ marginTop:3 }}><FMSpark size={13}/></div>
          <div style={{ flex:1, fontSize: small?14:15, color:FM.subtle, lineHeight:1.4, minHeight: small?22:24 }}>
            {placeholder}
          </div>
          <FMRow style={{ gap:6 }}>
            <button style={{ width:30, height:30, borderRadius:7, border:`1px solid ${FM.border}`, background:FM.surface, color:FM.ink2, display:'flex', alignItems:'center', justifyContent:'center' }}><FMIcon.Mic/></button>
            <button style={{ padding:'0 12px', height:30, borderRadius:7, background:FM.accent, color:'#fff', fontSize:12, fontWeight:600, border:'none', display:'flex', alignItems:'center', gap:5 }}><FMIcon.Send c="#fff"/> Send</button>
          </FMRow>
        </FMRow>
      </div>
      {chips.length > 0 && (
        <FMRow style={{ gap:6, flexWrap:'wrap' }}>
          {chips.map(c => (
            <button key={c} onClick={() => onChip?.(c)} style={{ padding:'5px 11px', background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:999, fontSize:12, color:FM.ink2, fontWeight:500, cursor:'pointer' }}>{c}</button>
          ))}
        </FMRow>
      )}
    </FMCol>
  );
}

// ─────────────────────────────────────────────────────────
// Workspace: HOME (morning brief)
// ─────────────────────────────────────────────────────────
function WS_Home() {
  return (
    <FMCol style={{ padding:'32px 40px', gap:24, overflow:'auto', flex:1 }}>
      <FMCol style={{ gap:8 }}>
        <FMBadge style={{ alignSelf:'flex-start' }}/>
        <div style={{ fontFamily:FM.serif, fontSize:40, letterSpacing:-.8, lineHeight:1.1 }}>
          Good morning, Jordan. <span style={{ color:FM.accent, fontStyle:'italic' }}>3 things</span> for you today.
        </div>
        <div style={{ fontSize:14, color:FM.muted }}>Portfolio <b style={{ color:FM.ink }}>$342,180</b> <span style={{ color:FM.pos }}>▲ $2,140 · +0.63%</span> · synced 6s ago</div>
      </FMCol>

      <FMCommander placeholder='Ask anything — "why is my portfolio down", "trim NVDA 20%", "what are my tax losses"…' chips={['Explain today\'s P&L','Rebalance to 70/30','Run tax-loss scan','Morning news for my holdings']}/>

      {/* 3 morning-brief cards */}
      <FMRow style={{ gap:14, alignItems:'stretch' }}>
        <BriefCard
          tone="warn"
          kicker="Earnings in 2 days"
          title="META reports Wed · implied move ±5.8%"
          body="Your 80 shares could swing ±$2,387. Consider defined-risk hedge or close before print."
          actions={['See hedge options','Set alert','Dismiss']}
        />
        <BriefCard
          tone="pos"
          kicker="Rebalance opportunity"
          title="Tech weight drifted to 58% (target 45%)"
          body="I can generate a 3-order swap to bring exposure in line, net-cash-neutral, tax-aware."
          actions={['Preview orders','Customize','Dismiss']}
          featured
        />
        <BriefCard
          tone="ai"
          kicker="Tax-loss harvest"
          title="~$1,410 in realizable losses"
          body="TSLA and RIVN have ST losses that pair against gains. I found 2 correlation-matched replacements."
          actions={['Run in simulator','Ignore']}
        />
      </FMRow>

      {/* At-a-glance */}
      <FMRow style={{ gap:14, alignItems:'stretch' }}>
        <MiniCard title="Buying power" value="$48,213" sub="2 accounts · margin avail." />
        <MiniCard title="Today P&L"    value="+$2,140" valueColor={FM.pos} sub="NVDA +$1,260 · AAPL +$340" />
        <MiniCard title="Open orders"  value="3"       sub="2 limits · 1 stop" />
        <MiniCard title="Watchlist alerts" value="2" valueColor={FM.warn} sub="PLTR broke 50-DMA · AMD +6%" />
      </FMRow>

      {/* Narrative summary */}
      <FMCol style={{ background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:14, padding:18, gap:10 }}>
        <FMRow style={{ gap:8 }}>
          <FMSpark/><b style={{ fontSize:13, color:FM.ink }}>Narrative summary</b>
          <div style={{ flex:1 }}/>
          <FMChip tone="ghost">Generated at 9:42 ET</FMChip>
        </FMRow>
        <div style={{ fontSize:14, color:FM.ink2, lineHeight:1.6, fontFamily:FM.serif, letterSpacing:-.1 }}>
          Your book led by <b>semis</b> — NVDA +1.6% on the Rubin production confirmation, SMH +1.1%. Concentration risk ticked higher (top-5 now 62% of equity). Your hedge from last Tuesday (SPY 560 puts) is <span style={{ color:FM.neg }}>−$340</span>; rolling to May 520 would cut cost by ~40%. Next material event: META earnings Wed post-close.
        </div>
        <FMRow style={{ gap:6, marginTop:4 }}>
          <button style={{ ...btnGhost, fontSize:12 }}>Explain concentration risk</button>
          <button style={{ ...btnGhost, fontSize:12 }}>Roll hedge strikes</button>
          <button style={{ ...btnGhost, fontSize:12 }}>Listen as audio (3:12)</button>
        </FMRow>
      </FMCol>
    </FMCol>
  );
}

function BriefCard({ kicker, title, body, actions, tone, featured }) {
  const accent = tone==='pos'?FM.pos : tone==='warn'?FM.warn : FM.accent;
  return (
    <FMCol style={{ flex:1, background:featured?`linear-gradient(180deg, ${FM.soft} 0%, ${FM.surface} 70px)`:FM.surface, border:`1.5px solid ${featured?FM.accent:FM.border}`, borderRadius:14, padding:16, gap:10, boxShadow:featured?`0 12px 32px -12px ${FM.accent}4D`:'0 1px 2px rgba(14,19,35,.04)' }}>
      <FMRow style={{ gap:6 }}>
        <div style={{ width:6, height:6, borderRadius:3, background:accent }}/>
        <div style={{ fontSize:10, color:accent, textTransform:'uppercase', letterSpacing:.6, fontWeight:700 }}>{kicker}</div>
      </FMRow>
      <div style={{ fontSize:16, fontWeight:600, letterSpacing:-.2, lineHeight:1.3, color:FM.ink }}>{title}</div>
      <div style={{ fontSize:12.5, color:FM.muted, lineHeight:1.5 }}>{body}</div>
      <div style={{ flex:1 }}/>
      <FMRow style={{ gap:6, flexWrap:'wrap' }}>
        {actions.map((a,i) => (
          <button key={a} style={i===0 ? { ...btnPrimary, fontSize:12, padding:'6px 12px', background:featured?FM.accent:FM.ink } : { ...btnGhost, fontSize:12, padding:'6px 12px' }}>{a}</button>
        ))}
      </FMRow>
    </FMCol>
  );
}

function MiniCard({ title, value, valueColor, sub }) {
  return (
    <FMCol style={{ flex:1, background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:12, padding:14, gap:4 }}>
      <div style={{ fontSize:11, color:FM.muted, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>{title}</div>
      <div style={{ fontSize:24, fontWeight:700, letterSpacing:-.5, fontVariantNumeric:'tabular-nums', color:valueColor||FM.ink }}>{value}</div>
      <div style={{ fontSize:11, color:FM.muted }}>{sub}</div>
    </FMCol>
  );
}

// ─────────────────────────────────────────────────────────
// Workspace: TRADE (Commander)
// ─────────────────────────────────────────────────────────
function WS_Trade() {
  return (
    <FMCol style={{ padding:'32px 40px', gap:22, overflow:'auto', flex:1 }}>
      <FMCol style={{ gap:6, alignItems:'center', textAlign:'center' }}>
        <FMBadge/>
        <div style={{ fontFamily:FM.serif, fontSize:36, letterSpacing:-.7, lineHeight:1.1, marginTop:6 }}>
          Tell me what you want to <span style={{ color:FM.accent, fontStyle:'italic' }}>trade</span>.
        </div>
        <div style={{ fontSize:13, color:FM.muted, maxWidth:580 }}>One order or many. Type, speak, paste a thesis. I parse it → you confirm.</div>
      </FMCol>

      <div style={{ alignSelf:'center', width:'100%', maxWidth:860 }}>
        <FMCommander
          placeholder='"Trim 25% of my NVDA above 920, move proceeds into VOO and SMH equal-weight, set a stop on TSLA at 205"'
          chips={['Buy $5k NVDA if dip <890','Sell half my TSLA','Ladder $3k into VOO over 4wks','Cover my AMD short at 160']}
        />
      </div>

      {/* Parsed preview (4 orders) */}
      <FMCol style={{ gap:10 }}>
        <FMRow style={{ gap:10 }}>
          <FMBadge/>
          <div style={{ fontSize:12.5, color:FM.ink2 }}>Parsed <b>3 linked orders + 1 stop</b> · net cash $0 · exposure Δ −3.2% NVDA, +1.6% VOO, +1.6% SMH</div>
          <div style={{ flex:1 }}/>
          <FMChip tone="pos">Guardrails pass</FMChip>
        </FMRow>

        <FMRow style={{ gap:12, alignItems:'stretch' }}>
          <OrderCard i="1" side="SELL" sym="NVDA" qty="37 sh" notional="~$34,040" lines={[['Trigger','Last ≥ $920'],['Type','Limit · Day'],['Tax lot','FIFO · ST $2,180'],['Proceeds','$34,040']]} warn="ST gain — want LT lots instead?"/>
          <OrderCard i="2" side="BUY"  sym="VOO"  qty="36 sh" notional="~$17,020" lines={[['Trigger','After #1 fills'],['Type','Market · Day'],['Alloc Δ','+1.6% → 22.4%'],['Cost','$17,020']]}/>
          <OrderCard i="3" side="BUY"  sym="SMH"  qty="72 sh" notional="~$17,020" lines={[['Trigger','After #1 fills'],['Type','Market · Day'],['Alloc Δ','+1.6% → 4.2%'],['Cost','$17,020']]}/>
        </FMRow>

        <FMRow style={{ background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:12, padding:'10px 14px', gap:16, alignItems:'center' }}>
          <FMChip tone="warn">STOP</FMChip>
          <div style={{ fontFamily:FM.serif, fontSize:20 }}>TSLA</div>
          <div style={{ fontSize:11, color:FM.muted }}>Tesla</div>
          <div style={{ flex:1 }}/>
          <FMRow style={{ gap:16 }}>
            {[['Trigger','Last ≤ $205'],['On trigger','Sell 82 sh · Market'],['Replaces','Stop @ $198'],['Est. loss','−$1,230']].map(([k,v])=>(
              <FMCol key={k} style={{ alignItems:'flex-end' }}>
                <div style={{ fontSize:9.5, color:FM.muted, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>{k}</div>
                <div style={{ fontSize:12, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{v}</div>
              </FMCol>
            ))}
          </FMRow>
        </FMRow>

        <FMRow style={{ background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:12, padding:'14px 16px', gap:14 }}>
          <FMRow style={{ gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:FM.soft, display:'flex', alignItems:'center', justifyContent:'center' }}><FMSpark size={13}/></div>
            <FMCol style={{ gap:1 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>Ready to place 4 orders</div>
              <div style={{ fontSize:11, color:FM.muted }}>Press ⏎ to confirm all · Click any card to edit</div>
            </FMCol>
          </FMRow>
          <div style={{ flex:1 }}/>
          <FMRow style={{ gap:8 }}>
            <button style={btnGhost}>Place one at a time</button>
            <button style={btnGhost}>Save as recipe</button>
            <button style={btnPrimary}>Place all 4 ⏎</button>
          </FMRow>
        </FMRow>
      </FMCol>
    </FMCol>
  );
}

function OrderCard({ i, side, sym, qty, notional, lines, warn }) {
  const c = side==='BUY'?FM.pos:side==='SELL'?FM.neg:FM.warn;
  return (
    <FMCol style={{ flex:1, background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:12, overflow:'hidden' }}>
      <FMRow style={{ padding:'10px 14px', borderBottom:`1px solid ${FM.border}`, gap:10 }}>
        <div style={{ width:20, height:20, borderRadius:10, background:FM.sunken, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:FM.muted }}>{i}</div>
        <FMChip style={{ background: side==='BUY'?'rgba(14,159,94,.08)':'rgba(226,59,59,.08)', color:c }}>{side}</FMChip>
        <div style={{ flex:1 }}/>
        <button style={{ fontSize:11, color:FM.muted, background:'transparent', border:'none', cursor:'pointer' }}>Edit</button>
      </FMRow>
      <FMCol style={{ padding:14, gap:6 }}>
        <div style={{ fontFamily:FM.serif, fontSize:24, lineHeight:1 }}>{sym}</div>
        <FMRow style={{ gap:14, marginTop:2, paddingBottom:8, borderBottom:`1px dashed ${FM.border}` }}>
          <FMCol><div style={{ fontSize:9.5, color:FM.muted, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>Qty</div><div style={{ fontSize:12.5, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{qty}</div></FMCol>
          <FMCol><div style={{ fontSize:9.5, color:FM.muted, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>Notional</div><div style={{ fontSize:12.5, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{notional}</div></FMCol>
        </FMRow>
        <FMCol style={{ gap:4, marginTop:4 }}>
          {lines.map(([k,v])=>(
            <FMRow key={k} style={{ justifyContent:'space-between', fontSize:11 }}>
              <span style={{ color:FM.muted }}>{k}</span>
              <span style={{ color:FM.ink, fontWeight:500, fontVariantNumeric:'tabular-nums' }}>{v}</span>
            </FMRow>
          ))}
        </FMCol>
        {warn && <FMRow style={{ marginTop:6, padding:'6px 8px', background:FM.soft, border:`1px solid ${FM.line}`, borderRadius:6, gap:6, fontSize:11, color:FM.ink2 }}><FMSpark size={10}/>{warn}</FMRow>}
      </FMCol>
    </FMCol>
  );
}

// ─────────────────────────────────────────────────────────
// Workspace: OPTIONS (Intent Studio)
// ─────────────────────────────────────────────────────────
function WS_Options() {
  return (
    <FMRow style={{ flex:1, overflow:'hidden' }}>
      <FMCol style={{ width:380, borderRight:`1px solid ${FM.border}`, background:FM.surface, padding:'26px 22px', gap:14, overflow:'auto' }}>
        <FMBadge style={{ alignSelf:'flex-start' }}/>
        <div style={{ fontFamily:FM.serif, fontSize:28, letterSpacing:-.5, lineHeight:1.1 }}>What's your thesis?</div>
        <div style={{ fontSize:12.5, color:FM.muted, lineHeight:1.5 }}>Skip the chain. Describe direction, timing, risk — I'll propose strategies.</div>

        <div style={{ background:FM.sunken, border:`1px solid ${FM.border}`, borderRadius:12, padding:13, minHeight:92, fontSize:13.5, color:FM.ink2, lineHeight:1.5, marginTop:6 }}>
          "NVDA up about 10% by May earnings. Defined risk. Budget ~$2,000."
        </div>

        <FMRow style={{ gap:6 }}>
          <button style={{ ...btnGhost, fontSize:11 }}>🎙 Voice</button>
          <button style={{ ...btnGhost, fontSize:11 }}>📎 Thesis file</button>
          <div style={{ flex:1 }}/>
          <button style={{ ...btnPrimary, fontSize:11 }}>Find →</button>
        </FMRow>

        <div style={{ fontSize:10.5, color:FM.subtle, textTransform:'uppercase', letterSpacing:.6, fontWeight:600, marginTop:12 }}>Manual intent</div>
        <Knob label="Direction"  opts={['Up','Flat','Down']} active={0}/>
        <Knob label="Horizon"    opts={['1w','2w','1mo','3mo','6mo']} active={2}/>
        <Knob label="Risk"       opts={['Defined','Undefined']} active={0}/>
        <Knob label="Budget"     opts={['$500','$1k','$2k','$5k','$10k']} active={2}/>

        <div style={{ flex:1 }}/>
        <div style={{ fontSize:10.5, color:FM.subtle, lineHeight:1.4 }}>⚡ Ranked by probability × payoff, not volume.</div>
      </FMCol>

      <FMCol style={{ flex:1, padding:'20px 24px', gap:12, overflow:'auto' }}>
        <FMRow style={{ gap:10 }}>
          <FMChip tone="ghost" style={{ background:FM.surface, border:`1px solid ${FM.border}` }}>NVDA · $894.12</FMChip>
          <FMChip tone="pos">IV 38% · rank 42</FMChip>
          <FMChip tone="default">Earnings in 22d</FMChip>
          <div style={{ flex:1 }}/>
          <FMRow style={{ gap:2, padding:2, background:FM.sunken, borderRadius:8, border:`1px solid ${FM.border}` }}>
            {['EV','P(win)','Max gain','Capital'].map((t,i)=>(<button key={t} style={{ padding:'3px 9px', fontSize:11, fontWeight:500, borderRadius:6, background:i===0?FM.surface:'transparent', color:i===0?FM.ink:FM.muted, border:'none', cursor:'pointer', boxShadow:i===0?'0 1px 2px rgba(14,19,35,.06)':'none' }}>{t}</button>))}
          </FMRow>
        </FMRow>

        <FMRow style={{ gap:12, alignItems:'stretch', flex:1, minHeight:0 }}>
          <StratCard rank="1" badge="Best risk-adj" name="Bull call spread" featured
            legs={[{s:'BUY',q:'+2',k:'900C',e:'May 16',p:'$28.40'},{s:'SELL',q:'−2',k:'970C',e:'May 16',p:'$10.20'}]}
            m={{cost:'$3,640',maxG:'+$10,360',maxL:'−$3,640',be:'$918.20',prob:'42%',ev:'+$812'}}/>
          <StratCard rank="2" badge="Lowest cap." name="Call calendar"
            legs={[{s:'SELL',q:'−2',k:'920C',e:'May 02',p:'$14.10'},{s:'BUY',q:'+2',k:'920C',e:'May 16',p:'$22.40'}]}
            m={{cost:'$1,660',maxG:'~+$2,840',maxL:'−$1,660',be:'$892/$948',prob:'38%',ev:'+$544'}}/>
          <StratCard rank="3" badge="Pure directional" name="Long call"
            legs={[{s:'BUY',q:'+1',k:'900C',e:'May 16',p:'$28.40'}]}
            m={{cost:'$2,840',maxG:'Unlimited',maxL:'−$2,840',be:'$928.40',prob:'31%',ev:'+$440'}}
            warn="Theta aggressive past Apr 30"/>
        </FMRow>
      </FMCol>
    </FMRow>
  );
}

function Knob({ label, opts, active }) {
  return (
    <FMCol style={{ gap:5 }}>
      <div style={{ fontSize:10, color:FM.muted, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>{label}</div>
      <FMRow style={{ gap:5, flexWrap:'wrap' }}>
        {opts.map((o,i)=>(
          <button key={o} style={{
            padding:'5px 10px', borderRadius:999, fontSize:11.5, fontWeight:500, cursor:'pointer',
            border:`1px solid ${i===active?FM.accent:FM.border}`,
            background:i===active?FM.soft:FM.surface, color:i===active?FM.accent:FM.ink2,
          }}>{o}</button>
        ))}
      </FMRow>
    </FMCol>
  );
}

function StratCard({ rank, badge, name, legs, m, featured, warn }) {
  return (
    <FMCol style={{ flex:1, background:featured?`linear-gradient(180deg,${FM.soft} 0%,${FM.surface} 70px)`:FM.surface, border:`1.5px solid ${featured?FM.accent:FM.border}`, borderRadius:14, overflow:'hidden', boxShadow:featured?`0 12px 32px -12px ${FM.accent}4D`:'0 1px 2px rgba(14,19,35,.04)' }}>
      <FMRow style={{ padding:'8px 12px', gap:6 }}>
        <div style={{ width:20, height:20, borderRadius:10, background:featured?FM.accent:FM.sunken, color:featured?'#fff':FM.muted, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10.5, fontWeight:700 }}>{rank}</div>
        <FMChip tone={featured?'ai':'default'}>{badge}</FMChip>
      </FMRow>
      <FMCol style={{ padding:'0 14px 12px', gap:8 }}>
        <div style={{ fontFamily:FM.serif, fontSize:19, letterSpacing:-.3 }}>{name}</div>
        <div style={{ height:56, background:featured?'rgba(107,79,255,.06)':FM.surf2, borderRadius:6, position:'relative', border:`1px solid ${FM.borderS}` }}>
          <svg width="100%" height="100%" viewBox="0 0 200 56" preserveAspectRatio="none">
            <line x1="0" x2="200" y1="40" y2="40" stroke={FM.border} strokeDasharray="2 3"/>
            <path d="M0,40 L60,40 L110,16 L200,16" fill="none" stroke={featured?FM.accent:FM.ink2} strokeWidth="2"/>
            <path d="M0,40 L60,40 L110,16 L200,16 L200,56 L0,56 Z" fill={featured?FM.accent:FM.ink2} opacity=".10"/>
          </svg>
        </div>
        <FMCol style={{ gap:3 }}>
          {legs.map((l,i)=>(
            <FMRow key={i} style={{ fontSize:11, fontFamily:FM.mono, background:FM.surf2, padding:'4px 7px', borderRadius:5, gap:8, border:`1px solid ${FM.borderS}` }}>
              <span style={{ color:l.s==='BUY'?FM.pos:FM.neg, fontWeight:700, minWidth:30 }}>{l.s}</span>
              <span style={{ minWidth:24 }}>{l.q}</span>
              <span style={{ color:FM.ink2, flex:1 }}>{l.k} · {l.e}</span>
              <span>{l.p}</span>
            </FMRow>
          ))}
        </FMCol>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px 12px', marginTop:4 }}>
          <M k="Capital" v={m.cost}/><M k="BE" v={m.be}/>
          <M k="Max gain" v={m.maxG} pos/><M k="Max loss" v={m.maxL} neg/>
          <M k="P(win)" v={m.prob}/><M k="EV" v={m.ev} pos/>
        </div>
        {warn && <FMRow style={{ padding:'5px 7px', background:'rgba(196,122,16,.08)', border:'1px solid rgba(196,122,16,.25)', borderRadius:5, fontSize:10.5, color:'#8B5A0F', gap:5 }}>⚠ {warn}</FMRow>}
        <FMRow style={{ gap:5, marginTop:2 }}>
          <button style={{ ...btnGhost, flex:1, fontSize:11, padding:'6px 8px' }}>Tweak</button>
          <button style={{ flex:1.2, padding:'6px 10px', borderRadius:7, background:featured?FM.accent:FM.ink, color:'#fff', fontSize:11.5, fontWeight:600, border:'none', cursor:'pointer' }}>Place →</button>
        </FMRow>
      </FMCol>
    </FMCol>
  );
}

function M({ k, v, pos, neg }) {
  return (
    <FMCol style={{ gap:0 }}>
      <div style={{ fontSize:9.5, color:FM.muted, textTransform:'uppercase', letterSpacing:.4, fontWeight:600 }}>{k}</div>
      <div style={{ fontSize:12, fontWeight:700, color:pos?FM.pos:neg?FM.neg:FM.ink, fontVariantNumeric:'tabular-nums' }}>{v}</div>
    </FMCol>
  );
}

// ─────────────────────────────────────────────────────────
// Workspace: POSITIONS (smart triage)
// ─────────────────────────────────────────────────────────
function WS_Positions() {
  const groups = [
    { label:'Needs attention', tone:'warn', items:[
      { sym:'META', ai:'Earnings Wed · implied ±5.8% · consider hedge', value:'$34,120', day:'+1.2%', cost:'$31,040', dayC:FM.pos },
      { sym:'TSLA', ai:'Near stop at $205 · 1.4% below · −$1,820 YTD',   value:'$16,810', day:'−2.1%', cost:'$22,340', dayC:FM.neg },
    ]},
    { label:'Compounding',     tone:'pos', items:[
      { sym:'NVDA', ai:'Thesis intact · +$12,597 unrealized · 12% of port', value:'$40,318', day:'+1.6%', cost:'$27,721', dayC:FM.pos },
      { sym:'SMH',  ai:'Outperforming benchmark by 4.2% YTD',                value:'$12,460', day:'+1.1%', cost:'$11,820', dayC:FM.pos },
    ]},
    { label:'Drifting / quiet', tone:'default', items:[
      { sym:'VOO',  ai:'Position steady · 20.8% of port · nothing to do', value:'$71,240', day:'+0.4%', cost:'$64,120', dayC:FM.pos },
      { sym:'AAPL', ai:'Flat 30d · consider covered call at $215',        value:'$22,180', day:'+0.0%', cost:'$22,180', dayC:FM.muted },
    ]},
  ];

  return (
    <FMCol style={{ padding:'30px 40px', gap:18, overflow:'auto', flex:1 }}>
      <FMCol style={{ gap:6 }}>
        <FMBadge style={{ alignSelf:'flex-start' }}/>
        <div style={{ fontFamily:FM.serif, fontSize:32, letterSpacing:-.6 }}>Positions, ranked by what matters.</div>
        <div style={{ fontSize:13, color:FM.muted }}>6 positions · $342,180 value · I've organized them by whether they need you today.</div>
      </FMCol>

      <FMCommander small placeholder='Ask: "show me my losers this month", "which positions are near stops", "concentration risk"' />

      {groups.map(g => (
        <FMCol key={g.label} style={{ gap:8 }}>
          <FMRow style={{ gap:8 }}>
            <FMChip tone={g.tone}>{g.label}</FMChip>
            <div style={{ flex:1, height:1, background:FM.border }}/>
            <div style={{ fontSize:11, color:FM.subtle }}>{g.items.length} position{g.items.length>1?'s':''}</div>
          </FMRow>
          {g.items.map(p => <PositionRow key={p.sym} p={p}/>)}
        </FMCol>
      ))}
    </FMCol>
  );
}

function PositionRow({ p }) {
  return (
    <FMRow style={{ background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:12, padding:'14px 16px', gap:16 }}>
      <FMCol style={{ width:84 }}>
        <div style={{ fontFamily:FM.serif, fontSize:22, letterSpacing:-.3 }}>{p.sym}</div>
        <div style={{ fontSize:11, fontWeight:600, color:p.dayC, fontVariantNumeric:'tabular-nums' }}>{p.day}</div>
      </FMCol>
      <FMCol style={{ flex:1, gap:2 }}>
        <FMRow style={{ gap:6 }}><FMSpark size={10}/><span style={{ fontSize:10, color:FM.accent, textTransform:'uppercase', letterSpacing:.5, fontWeight:700 }}>AI note</span></FMRow>
        <div style={{ fontSize:13, color:FM.ink2, lineHeight:1.45 }}>{p.ai}</div>
      </FMCol>
      <FMCol style={{ alignItems:'flex-end' }}>
        <div style={{ fontSize:9.5, color:FM.muted, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>Value</div>
        <div style={{ fontSize:15, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{p.value}</div>
      </FMCol>
      <FMCol style={{ alignItems:'flex-end' }}>
        <div style={{ fontSize:9.5, color:FM.muted, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>Cost</div>
        <div style={{ fontSize:13, fontVariantNumeric:'tabular-nums', color:FM.ink2 }}>{p.cost}</div>
      </FMCol>
      <FMRow style={{ gap:6 }}>
        <button style={{ ...btnGhost, fontSize:11, padding:'6px 10px' }}>Ask</button>
        <button style={{ ...btnGhost, fontSize:11, padding:'6px 10px' }}>Trim</button>
        <button style={{ ...btnDark, fontSize:11, padding:'6px 10px' }}>Act →</button>
      </FMRow>
    </FMRow>
  );
}

// ─────────────────────────────────────────────────────────
// Workspace: RESEARCH (Ask a stock)
// ─────────────────────────────────────────────────────────
function WS_Research() {
  const msgs = [
    { from:'user', text:'Is NVDA still a buy at these levels?' },
    { from:'ai',   kind:'answer' },
  ];
  return (
    <FMRow style={{ flex:1, overflow:'hidden' }}>
      <FMCol style={{ flex:1, padding:'28px 40px', gap:16, overflow:'auto' }}>
        <FMRow style={{ gap:10, alignItems:'baseline' }}>
          <div style={{ fontFamily:FM.serif, fontSize:36, letterSpacing:-.7 }}>NVDA</div>
          <div style={{ fontSize:16, color:FM.muted }}>NVIDIA Corporation · Nasdaq</div>
          <div style={{ flex:1 }}/>
          <div style={{ fontFamily:FM.mono, fontSize:26, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>$894.12</div>
          <div style={{ color:FM.pos, fontWeight:600, fontSize:14 }}>▲ +$14.32 (+1.62%)</div>
        </FMRow>

        {/* Chat-style research */}
        <FMCol style={{ gap:10 }}>
          {msgs.map((m,i) => m.from==='user' ? (
            <FMRow key={i} style={{ justifyContent:'flex-end' }}>
              <div style={{ padding:'10px 14px', background:FM.ink, color:'#fff', borderRadius:'14px 14px 3px 14px', fontSize:13.5, maxWidth:'70%' }}>{m.text}</div>
            </FMRow>
          ) : (
            <FMRow key={i} style={{ gap:10, alignItems:'flex-start' }}>
              <div style={{ width:26, height:26, borderRadius:13, background:FM.soft, display:'flex', alignItems:'center', justifyContent:'center', marginTop:4 }}><FMSpark size={12}/></div>
              <FMCol style={{ flex:1, gap:10, background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:'14px 14px 14px 3px', padding:16 }}>
                <div style={{ fontSize:14, lineHeight:1.6, color:FM.ink2, fontFamily:FM.serif, letterSpacing:-.1 }}>
                  <b style={{ color:FM.ink }}>Short answer: </b> neutral at these levels, constructive into the Rubin production ramp. Consensus PT $1,020 (+14%), but IV is elevated heading into May earnings (22d out) — the risk/reward is better expressed as a <u>bull call spread</u> than fresh long shares.
                </div>

                {/* Inline chart */}
                <InlineChart/>

                {/* Citation / evidence chips */}
                <FMRow style={{ gap:6, flexWrap:'wrap' }}>
                  <FMChip tone="pos">↑ Rubin confirmed Q3</FMChip>
                  <FMChip tone="pos">↑ MS PT $1,100</FMChip>
                  <FMChip tone="pos">↑ Bernstein Outperform</FMChip>
                  <FMChip tone="warn">↕ IV rank 42</FMChip>
                  <FMChip tone="warn">↕ Earnings 22d</FMChip>
                  <FMChip tone="neg">↓ China rev. guidance risk</FMChip>
                </FMRow>

                {/* Stat grid */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginTop:4 }}>
                  <M k="P/E fwd" v="38.2"/><M k="YTD" v="+28.4%" pos/>
                  <M k="Mkt cap" v="$2.2T"/><M k="Analyst" v="BUY 42 · H 6 · S 1"/>
                  <M k="Rev g. ttm" v="+122%" pos/><M k="FCF yield" v="2.4%"/>
                  <M k="IV rank" v="42"/><M k="Next er." v="May 15"/>
                </div>

                <FMRow style={{ gap:6, marginTop:4 }}>
                  <button style={{ ...btnGhost, fontSize:12 }}>Show 10-K excerpts</button>
                  <button style={{ ...btnGhost, fontSize:12 }}>Peer comparison</button>
                  <button style={{ ...btnGhost, fontSize:12 }}>Bear case</button>
                  <button style={{ ...btnGhost, fontSize:12 }}>Set price alert</button>
                  <div style={{ flex:1 }}/>
                  <button style={btnPrimary}>Open options strategy →</button>
                </FMRow>
              </FMCol>
            </FMRow>
          ))}
        </FMCol>

        <FMCommander small placeholder={`Follow up · "what's the bear case", "compare to AMD", "load the latest transcript"`} chips={['Bear case','vs AMD','Latest transcript','Set $950 alert']}/>
      </FMCol>

      <FMCol style={{ width:280, borderLeft:`1px solid ${FM.border}`, background:FM.surface, padding:'20px', gap:14, overflow:'auto' }}>
        <div style={{ fontSize:10, color:FM.subtle, textTransform:'uppercase', letterSpacing:.6, fontWeight:700 }}>Your thesis journal</div>
        {[{ d:'Apr 12', t:'Added to NVDA on Rubin leak', ok:true },{ d:'Mar 28', t:'Set $950 upside target', ok:null },{ d:'Mar 02', t:'Considered trim at $920 — held', ok:null }].map((e,i)=>(
          <FMCol key={i} style={{ background:FM.surf2, border:`1px solid ${FM.borderS}`, borderRadius:8, padding:10, gap:3 }}>
            <FMRow style={{ gap:5, fontSize:10, color:FM.muted }}><span>{e.d}</span>{e.ok && <span style={{ color:FM.pos }}>✓ resolved</span>}</FMRow>
            <div style={{ fontSize:12, color:FM.ink2 }}>{e.t}</div>
          </FMCol>
        ))}
        <button style={{ ...btnGhost, fontSize:12 }}>+ Add thesis entry</button>

        <div style={{ height:1, background:FM.border, margin:'4px 0' }}/>
        <div style={{ fontSize:10, color:FM.subtle, textTransform:'uppercase', letterSpacing:.6, fontWeight:700 }}>Disconfirming checkpoints</div>
        <FMCol style={{ gap:6, fontSize:11.5, color:FM.ink2 }}>
          {['China revenue guidance <15% in next ER','Gross margin compresses below 72%','Rubin delay announced'].map(t=>(
            <FMRow key={t} style={{ gap:6 }}><input type="checkbox"/><span>{t}</span></FMRow>
          ))}
        </FMCol>
      </FMCol>
    </FMRow>
  );
}

function InlineChart() {
  return (
    <div style={{ height:120, background:FM.surf2, borderRadius:10, border:`1px solid ${FM.borderS}`, position:'relative', padding:8 }}>
      <svg width="100%" height="100%" viewBox="0 0 600 110" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rca" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={FM.accent} stopOpacity=".3"/>
            <stop offset="1" stopColor={FM.accent} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d="M0,80 C50,70 80,60 130,55 C180,50 230,62 280,45 C330,28 380,30 440,22 C480,18 520,30 600,15" fill="none" stroke={FM.accent} strokeWidth="2"/>
        <path d="M0,80 C50,70 80,60 130,55 C180,50 230,62 280,45 C330,28 380,30 440,22 C480,18 520,30 600,15 L600,110 L0,110 Z" fill="url(#rca)"/>
        {/* events */}
        <circle cx="280" cy="45" r="4" fill={FM.warn}/>
        <text x="286" y="42" fontSize="9" fill={FM.warn} fontWeight="600">ER beat</text>
        <circle cx="440" cy="22" r="4" fill={FM.pos}/>
        <text x="446" y="18" fontSize="9" fill={FM.pos} fontWeight="600">Rubin leak</text>
      </svg>
      <div style={{ position:'absolute', top:6, left:10, fontSize:9, color:FM.subtle, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>NVDA · 6mo</div>
      <FMRow style={{ position:'absolute', bottom:4, right:10, gap:4 }}>
        {['1D','1W','1M','6M','1Y','ALL'].map((t,i)=>(
          <button key={t} style={{ padding:'1px 6px', fontSize:9.5, fontWeight:600, borderRadius:4, background:i===3?FM.accent:'transparent', color:i===3?'#fff':FM.muted, border:'none', cursor:'pointer' }}>{t}</button>
        ))}
      </FMRow>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Workspace: ACTIVITY (NL filter)
// ─────────────────────────────────────────────────────────
function WS_Activity() {
  return (
    <FMCol style={{ padding:'30px 40px', gap:18, overflow:'auto', flex:1 }}>
      <FMCol style={{ gap:6 }}>
        <FMBadge style={{ alignSelf:'flex-start' }}/>
        <div style={{ fontFamily:FM.serif, fontSize:32, letterSpacing:-.6 }}>Ask what happened.</div>
        <div style={{ fontSize:13, color:FM.muted }}>No filter stack. Describe what you want to see — any account, any asset, any time window.</div>
      </FMCol>

      <FMCommander
        placeholder='"My losing tech trades last quarter" · "all options I closed at a profit" · "anything I bought on a Friday"'
        chips={['Losing trades YTD','Dividends this month','Options closed for >50% profit','Tax-relevant activity 2024']}
      />

      {/* Parsed query chips */}
      <FMRow style={{ gap:6, flexWrap:'wrap', background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:10, padding:'10px 12px' }}>
        <FMChip tone="ai">Showing</FMChip>
        <FMChip tone="default">Losing trades</FMChip>
        <FMChip tone="default">Sector: Tech</FMChip>
        <FMChip tone="default">Period: Q1 2026</FMChip>
        <FMChip tone="default">Realized P&L</FMChip>
        <div style={{ flex:1 }}/>
        <button style={{ ...btnGhost, fontSize:11, padding:'4px 10px' }}>Refine</button>
        <button style={{ ...btnGhost, fontSize:11, padding:'4px 10px' }}>Export CSV</button>
      </FMRow>

      {/* Summary */}
      <FMRow style={{ gap:14 }}>
        <MiniCard title="Trades matched" value="12"/>
        <MiniCard title="Realized loss" value="−$4,820" valueColor={FM.neg} sub="avg hold 42 days"/>
        <MiniCard title="Tax-offset avail." value="$4,820" valueColor={FM.accent}/>
        <MiniCard title="Win rate"      value="17%" sub="2 of 12 trades"/>
      </FMRow>

      {/* Activity list */}
      <FMCol style={{ background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:12, overflow:'hidden' }}>
        {[
          ['Mar 18','Sold','RIVN','240 sh @ $11.40','−$1,340','Broke stop after delivery miss'],
          ['Mar 04','Sold','PLTR','80 sh @ $22.10','−$870','Closed early vs. thesis; see journal'],
          ['Feb 21','Sold','SNOW','40 sh @ $142.40','−$720','Cut on guidance warning'],
          ['Feb 09','Sold','RBLX','110 sh @ $38.90','−$540','Post-ER fade'],
          ['Jan 29','Sold','COIN','30 sh @ $182.00','−$1,350','Hedge miss'],
        ].map((r,i)=>(
          <FMRow key={i} style={{ padding:'10px 14px', borderBottom: i<4?`1px solid ${FM.borderS}`:'none', gap:14, fontSize:12.5 }}>
            <div style={{ width:60, color:FM.muted, fontFamily:FM.mono }}>{r[0]}</div>
            <FMChip tone="neg">{r[1]}</FMChip>
            <div style={{ width:56, fontWeight:700, fontFamily:FM.serif, fontSize:15 }}>{r[2]}</div>
            <div style={{ width:140, color:FM.ink2, fontVariantNumeric:'tabular-nums' }}>{r[3]}</div>
            <div style={{ width:80, color:FM.neg, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{r[4]}</div>
            <div style={{ flex:1, color:FM.muted, fontStyle:'italic' }}>{r[5]}</div>
            <button style={{ fontSize:11, color:FM.accent, background:'transparent', border:'none', cursor:'pointer' }}>Ask →</button>
          </FMRow>
        ))}
      </FMCol>

      <FMCol style={{ background:FM.soft, border:`1px solid ${FM.line}`, borderRadius:12, padding:14, gap:6 }}>
        <FMRow style={{ gap:6 }}><FMSpark/><b style={{ fontSize:12, color:FM.accent, textTransform:'uppercase', letterSpacing:.5 }}>Pattern I noticed</b></FMRow>
        <div style={{ fontSize:13.5, color:FM.ink2, lineHeight:1.5 }}>10 of your 12 losses were in <b>high-beta small-cap growth</b> held less than 60 days. Positions held longer than 6 months have a 68% win rate. Want me to set a 60-day minimum hold reminder?</div>
        <FMRow style={{ gap:6 }}>
          <button style={{ ...btnPrimary, fontSize:12 }}>Yes, set reminder</button>
          <button style={{ ...btnGhost, fontSize:12 }}>Show me the other 2 patterns</button>
        </FMRow>
      </FMCol>
    </FMCol>
  );
}

// ─────────────────────────────────────────────────────────
// Workspace: BALANCES (What changed)
// ─────────────────────────────────────────────────────────
function WS_Balances() {
  return (
    <FMCol style={{ padding:'30px 40px', gap:20, overflow:'auto', flex:1 }}>
      <FMCol style={{ gap:6 }}>
        <FMBadge style={{ alignSelf:'flex-start' }}/>
        <div style={{ fontFamily:FM.serif, fontSize:32, letterSpacing:-.6 }}>$342,180 · narrated.</div>
        <div style={{ fontSize:13, color:FM.muted }}>Your total equity across 3 accounts. I'll tell you what changed.</div>
      </FMCol>

      {/* Value timeline with narrative markers */}
      <FMCol style={{ background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:14, padding:18, gap:10 }}>
        <FMRow style={{ gap:10 }}>
          <div style={{ fontSize:12, color:FM.muted }}>Period</div>
          <FMRow style={{ gap:2, padding:2, background:FM.sunken, borderRadius:6, border:`1px solid ${FM.border}` }}>
            {['1D','1W','1M','3M','YTD','1Y','ALL'].map((t,i)=>(<button key={t} style={{ padding:'3px 9px', fontSize:11, fontWeight:500, borderRadius:4, background:i===4?FM.surface:'transparent', color:i===4?FM.ink:FM.muted, border:'none', cursor:'pointer', boxShadow:i===4?'0 1px 2px rgba(14,19,35,.06)':'none' }}>{t}</button>))}
          </FMRow>
          <div style={{ flex:1 }}/>
          <div style={{ fontSize:12, color:FM.muted }}>YTD <b style={{ color:FM.pos }}>+18.4%</b> · vs SPY <b>+12.1%</b> · alpha <b style={{ color:FM.pos }}>+6.3%</b></div>
        </FMRow>

        <div style={{ height:280, position:'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 1000 280" preserveAspectRatio="none">
            <defs>
              <linearGradient id="bala" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={FM.accent} stopOpacity=".28"/>
                <stop offset="1" stopColor={FM.accent} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,220 C80,210 140,200 200,205 C260,210 320,180 400,170 C480,160 540,185 620,150 C700,115 760,125 830,85 C890,55 950,70 1000,40"
                  fill="none" stroke={FM.accent} strokeWidth="2.5"/>
            <path d="M0,220 C80,210 140,200 200,205 C260,210 320,180 400,170 C480,160 540,185 620,150 C700,115 760,125 830,85 C890,55 950,70 1000,40 L1000,280 L0,280 Z"
                  fill="url(#bala)"/>
            {/* markers */}
            {[
              { x:200, y:205, label:'Added $10k', color:FM.pos },
              { x:420, y:170, label:'NVDA breakout', color:FM.pos },
              { x:620, y:150, label:'Rebalanced to 70/30', color:FM.accent },
              { x:830, y:85,  label:'Rubin news · +$6,200 day', color:FM.pos },
            ].map((m,i)=>(
              <g key={i}>
                <circle cx={m.x} cy={m.y} r="5" fill={m.color} stroke="#fff" strokeWidth="2"/>
                <rect x={m.x-50} y={m.y-26} width="100" height="18" rx="3" fill={m.color}/>
                <text x={m.x} y={m.y-13} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600">{m.label}</text>
              </g>
            ))}
          </svg>
        </div>

        <FMRow style={{ marginTop:4, padding:12, background:FM.soft, border:`1px solid ${FM.line}`, borderRadius:10, gap:10 }}>
          <FMSpark/>
          <div style={{ fontSize:13, color:FM.ink2, lineHeight:1.55, flex:1 }}>
            Your YTD move of <b>+$52,560</b> is <b>56% from semiconductors</b> (NVDA, SMH, AMD). Outside that cluster, you'd be +$18,100 (+6.3%) — roughly benchmark. Three rebalances this quarter reduced volatility by 1.2 vol pts.
          </div>
        </FMRow>
      </FMCol>

      {/* 3 account cards */}
      <FMRow style={{ gap:14 }}>
        <BalCard n="Individual · ··4821" v="$212,480" d="+$1,340" a="+0.63%" c="Brokerage · Margin enabled"/>
        <BalCard n="Roth IRA · ··9102"   v="$96,120"  d="+$580"   a="+0.60%" c="Retirement · 12yrs to 59½"/>
        <BalCard n="Joint · ··3348"      v="$33,580"  d="+$220"   a="+0.66%" c="Cash · High-yield 5.0%"/>
      </FMRow>
    </FMCol>
  );
}

function BalCard({ n, v, d, a, c }) {
  return (
    <FMCol style={{ flex:1, background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:12, padding:14, gap:4 }}>
      <div style={{ fontSize:11, color:FM.muted, fontFamily:FM.mono }}>{n}</div>
      <div style={{ fontSize:24, fontWeight:700, letterSpacing:-.5, fontVariantNumeric:'tabular-nums' }}>{v}</div>
      <div style={{ fontSize:12, color:FM.pos, fontVariantNumeric:'tabular-nums' }}>{d} ({a}) today</div>
      <div style={{ fontSize:11, color:FM.subtle, marginTop:4 }}>{c}</div>
    </FMCol>
  );
}

// ─────────────────────────────────────────────────────────
// Workspace: WATCHLISTS (living lists)
// ─────────────────────────────────────────────────────────
function WS_Watchlists() {
  return (
    <FMRow style={{ flex:1, overflow:'hidden' }}>
      <FMCol style={{ width:260, borderRight:`1px solid ${FM.border}`, background:FM.surface, padding:'20px 14px', gap:8, overflow:'auto' }}>
        <div style={{ fontSize:10, color:FM.subtle, textTransform:'uppercase', letterSpacing:.6, fontWeight:700, padding:'0 6px 4px' }}>Living watchlists</div>
        {[
          { n:'AI infrastructure', c:12, a:true, desc:'Updates itself' },
          { n:'High FCF yield >5%', c:18, a:true },
          { n:'IPO last 12mo',      c:34, a:true },
          { n:'My peers',           c:8,  a:false },
          { n:'Bear watch',         c:6,  a:true, alert:2 },
        ].map((w,i) => (
          <FMCol key={w.n} style={{ padding:10, background:i===0?FM.soft:FM.surf2, border:`1px solid ${i===0?FM.line:FM.borderS}`, borderRadius:8, gap:3, cursor:'pointer' }}>
            <FMRow>
              <span style={{ fontSize:13, fontWeight:600, color:i===0?FM.accent:FM.ink }}>{w.n}</span>
              <div style={{ flex:1 }}/>
              {w.alert && <FMChip tone="warn">{w.alert} alerts</FMChip>}
              <span style={{ fontSize:10, color:FM.muted, marginLeft:6 }}>{w.c}</span>
            </FMRow>
            {w.a && <FMRow style={{ gap:4, fontSize:10, color:FM.subtle }}><FMSpark size={8}/> {w.desc || 'auto-maintained'}</FMRow>}
          </FMCol>
        ))}
        <button style={{ ...btnGhost, fontSize:12, marginTop:6 }}><FMIcon.Plus/> Describe a new list</button>
      </FMCol>

      <FMCol style={{ flex:1, padding:'26px 30px', gap:14, overflow:'auto' }}>
        <FMRow style={{ gap:10, alignItems:'baseline' }}>
          <div style={{ fontFamily:FM.serif, fontSize:28, letterSpacing:-.5 }}>AI infrastructure</div>
          <FMChip tone="ai">Living · refreshed 3m ago</FMChip>
          <div style={{ flex:1 }}/>
          <button style={{ ...btnGhost, fontSize:12 }}>Rules →</button>
        </FMRow>

        <FMCol style={{ padding:12, background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:10, gap:4 }}>
          <div style={{ fontSize:10, color:FM.muted, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>Your rule</div>
          <div style={{ fontSize:13, color:FM.ink2, fontStyle:'italic' }}>"Companies making meaningful revenue from AI model training or inference infrastructure, mkt cap > $5B, EPS growth > 20%"</div>
          <FMRow style={{ gap:6, marginTop:4 }}>
            <FMChip tone="default">12 matches today</FMChip>
            <FMChip tone="pos">2 added this week</FMChip>
            <FMChip tone="neg">1 removed (missed rev threshold)</FMChip>
          </FMRow>
        </FMCol>

        <FMCol style={{ background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:12, overflow:'hidden' }}>
          <FMRow style={{ padding:'8px 14px', background:FM.surf2, borderBottom:`1px solid ${FM.border}`, fontSize:10, color:FM.muted, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>
            <div style={{ width:84 }}>Symbol</div>
            <div style={{ flex:2 }}>Why it's here</div>
            <div style={{ width:80, textAlign:'right' }}>Last</div>
            <div style={{ width:80, textAlign:'right' }}>Today</div>
            <div style={{ width:80, textAlign:'right' }}>In port?</div>
          </FMRow>
          {[
            ['NVDA','GPU tail still ramping · Rubin Q3','$894.12','+1.6%','12%', FM.pos],
            ['AVGO','Custom AI ASIC share taking off',  '$1,640','+0.8%','—',   FM.pos],
            ['SMCI','AI server liquid cool cycle',      '$58.40','+3.2%','—',   FM.pos],
            ['ARM','Mobile AI inference rights',        '$128.44','−0.4%','—',  FM.neg],
            ['MRVL','Optics + AI networking',           '$72.80','+2.1%','—',   FM.pos],
          ].map((r,i)=>(
            <FMRow key={i} style={{ padding:'10px 14px', borderBottom: i<4?`1px solid ${FM.borderS}`:'none', fontSize:12.5 }}>
              <div style={{ width:84, fontFamily:FM.serif, fontSize:17 }}>{r[0]}</div>
              <div style={{ flex:2, color:FM.muted, fontStyle:'italic' }}>{r[1]}</div>
              <div style={{ width:80, textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:600 }}>{r[2]}</div>
              <div style={{ width:80, textAlign:'right', fontVariantNumeric:'tabular-nums', color:r[5], fontWeight:600 }}>{r[3]}</div>
              <div style={{ width:80, textAlign:'right', fontVariantNumeric:'tabular-nums', color: r[4]==='—'?FM.subtle:FM.accent, fontWeight:600 }}>{r[4]}</div>
            </FMRow>
          ))}
        </FMCol>

        <FMCommander small placeholder='Refine this list: "also require insider buying last 90d", "exclude Chinese ADRs"' />
      </FMCol>
    </FMRow>
  );
}

// ─────────────────────────────────────────────────────────
// Workspace: TRANSFERS (one-shot)
// ─────────────────────────────────────────────────────────
function WS_Transfers() {
  return (
    <FMCol style={{ padding:'30px 40px', gap:20, overflow:'auto', flex:1, maxWidth:1080, margin:'0 auto', width:'100%' }}>
      <FMCol style={{ gap:6 }}>
        <FMBadge style={{ alignSelf:'flex-start' }}/>
        <div style={{ fontFamily:FM.serif, fontSize:32, letterSpacing:-.6 }}>Move money by intent.</div>
        <div style={{ fontSize:13, color:FM.muted }}>One sentence → a scheduled multi-step plan. I handle timing, holds, and tax wrappers.</div>
      </FMCol>

      <FMCommander
        placeholder='"Move $10k from savings to margin by Friday, then buy VOO with half" · "Max out my Roth for 2026 over the next 8 months"'
        chips={['Move $10k to brokerage','Max Roth 2026','Fund margin Thu','Sweep idle cash to treasuries']}
      />

      {/* Parsed plan */}
      <FMCol style={{ background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:14, padding:18, gap:14 }}>
        <FMRow style={{ gap:10 }}>
          <FMBadge/>
          <b style={{ fontSize:13 }}>Plan I drafted</b>
          <div style={{ flex:1 }}/>
          <FMChip tone="pos">All clear · no wash sale, no margin call risk</FMChip>
        </FMRow>

        <FMCol style={{ gap:0 }}>
          {[
            { t:'Today',     step:'Initiate ACH pull $10,000', from:'Chase ··2201', to:'Individual ··4821', status:'will submit' },
            { t:'Apr 23',    step:'Funds available (T+3)',      from:'—',            to:'Individual ··4821', status:'auto' },
            { t:'Apr 23',    step:'Buy 11 sh VOO @ market',     from:'$5,000',       to:'Individual ··4821', status:'auto' },
            { t:'Apr 24',    step:'Confirmation email',         from:'—',            to:'You',               status:'auto' },
          ].map((s,i)=>(
            <FMRow key={i} style={{ padding:'10px 0', borderTop: i>0?`1px solid ${FM.borderS}`:'none', gap:14 }}>
              <div style={{ width:80, fontSize:11, color:FM.muted, fontFamily:FM.mono, fontWeight:600 }}>{s.t}</div>
              <div style={{ width:22, height:22, borderRadius:11, background:i===0?FM.accent:FM.sunken, color:i===0?'#fff':FM.muted, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>{i+1}</div>
              <FMCol style={{ flex:1, gap:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:FM.ink }}>{s.step}</div>
                <div style={{ fontSize:11, color:FM.muted, fontFamily:FM.mono }}>{s.from} → {s.to}</div>
              </FMCol>
              <FMChip tone="ghost">{s.status}</FMChip>
            </FMRow>
          ))}
        </FMCol>

        <FMRow style={{ gap:8, marginTop:2 }}>
          <button style={btnGhost}>Edit any step</button>
          <button style={btnGhost}>Run as test</button>
          <div style={{ flex:1 }}/>
          <button style={btnPrimary}>Schedule · approve plan ⏎</button>
        </FMRow>
      </FMCol>

      {/* Standing agents */}
      <FMCol style={{ gap:8 }}>
        <div style={{ fontSize:10, color:FM.subtle, textTransform:'uppercase', letterSpacing:.6, fontWeight:700 }}>Standing agents</div>
        <FMRow style={{ gap:14 }}>
          {[
            ['Paycheck sweep','Every 2nd Fri · 20% → brokerage · invest rest-cash in SGOV','Next: Apr 25'],
            ['Roth max-out','$583/mo until $7,000 hit for 2026','Next: Apr 28'],
            ['Idle cash to treasuries','Any balance > $5k → BIL weekly','Continuous'],
          ].map(([n,d,nx],i)=>(
            <FMCol key={i} style={{ flex:1, background:FM.surface, border:`1px solid ${FM.border}`, borderRadius:12, padding:14, gap:4 }}>
              <FMRow style={{ gap:5 }}><span style={{ width:6, height:6, borderRadius:3, background:FM.pos }}/><b style={{ fontSize:12.5 }}>{n}</b></FMRow>
              <div style={{ fontSize:11.5, color:FM.muted, lineHeight:1.4 }}>{d}</div>
              <div style={{ fontSize:10.5, color:FM.subtle, marginTop:4, fontFamily:FM.mono }}>{nx}</div>
            </FMCol>
          ))}
        </FMRow>
      </FMCol>
    </FMCol>
  );
}

// ─────────────────────────────────────────────────────────
// Futuristic mode root
// ─────────────────────────────────────────────────────────
function FuturisticMode({ onBackToClassic }) {
  const [ws, setWs] = React.useState(() => localStorage.getItem('hedgeiq.ws') || 'home');
  React.useEffect(() => { localStorage.setItem('hedgeiq.ws', ws); }, [ws]);

  const Screen = {
    home:       WS_Home,
    trade:      WS_Trade,
    options:    WS_Options,
    positions:  WS_Positions,
    research:   WS_Research,
    activity:   WS_Activity,
    balances:   WS_Balances,
    watchlists: WS_Watchlists,
    transfers:  WS_Transfers,
  }[ws] || WS_Home;

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:FM.surf2, fontFamily:FM.font, color:FM.ink }} data-screen-label={`futuristic-${ws}`}>
      <style>{`
        @keyframes fmblink{50%{opacity:0}}
        .fm-scroll::-webkit-scrollbar{width:10px;height:10px}
        .fm-scroll::-webkit-scrollbar-thumb{background:${FM.border};border-radius:10px}
      `}</style>
      <FMTopBar onBackToClassic={onBackToClassic}/>
      <FMRow style={{ flex:1, overflow:'hidden' }}>
        <FMRail ws={ws} setWs={setWs}/>
        <FMCol style={{ flex:1, overflow:'hidden' }} className="fm-scroll">
          <Screen/>
        </FMCol>
      </FMRow>
    </div>
  );
}

Object.assign(window, { FuturisticMode });

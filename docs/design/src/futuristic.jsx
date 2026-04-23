// Futuristic concepts — 2 AI-native replacements for Buy/Sell + Options.
// Designed to match HedgeIQ's existing theme tokens. Each artboard is a
// self-contained mock that demonstrates the interaction sequence.

const FX_ACCENT = '#6B4FFF';        // AI surface purple
const FX_ACCENT_SOFT = '#EFEAFF';
const FX_ACCENT_LINE = '#D6CCFF';
const FX_INK = '#0E1323';
const FX_INK_2 = '#3B4256';
const FX_MUTED = '#6A7288';
const FX_SUBTLE = '#9098AB';
const FX_BORDER = '#E5E8F0';
const FX_BORDER_SOFT = '#EEF1F7';
const FX_SURFACE = '#FFFFFF';
const FX_SURFACE_2 = '#FAFBFE';
const FX_SUNKEN = '#F3F5FA';
const FX_POS = '#0E9F5E';
const FX_NEG = '#E23B3B';

const FX_FONT = "'Inter Tight','Inter',-apple-system,BlinkMacSystemFont,sans-serif";
const FX_MONO = "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace";

// ── inline helpers ──────────────────────────────────────────────
const Row = ({ children, style, ...p }) => <div style={{ display:'flex', alignItems:'center', ...style }} {...p}>{children}</div>;
const Col = ({ children, style, ...p }) => <div style={{ display:'flex', flexDirection:'column', ...style }} {...p}>{children}</div>;

const Chip = ({ children, tone='default', style }) => {
  const tones = {
    default: { bg:'#EEF1F7', fg:FX_INK_2, bd:'transparent' },
    ai:      { bg:FX_ACCENT_SOFT, fg:FX_ACCENT, bd:FX_ACCENT_LINE },
    pos:     { bg:'rgba(14,159,94,.08)', fg:FX_POS, bd:'transparent' },
    neg:     { bg:'rgba(226,59,59,.08)', fg:FX_NEG, bd:'transparent' },
    ghost:   { bg:'transparent', fg:FX_MUTED, bd:FX_BORDER },
    dark:    { bg:'#151A22', fg:'#E7ECF3', bd:'transparent' },
  }[tone];
  return <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', background:tones.bg, color:tones.fg, border:`1px solid ${tones.bd}`, borderRadius:999, fontSize:10.5, fontWeight:600, letterSpacing:.3, textTransform:'uppercase', ...style }}>{children}</span>;
};

const AIBadge = ({ style }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 8px', background:FX_ACCENT_SOFT, color:FX_ACCENT, border:`1px solid ${FX_ACCENT_LINE}`, borderRadius:999, fontSize:10.5, fontWeight:600, letterSpacing:.3, textTransform:'uppercase', ...style }}>
    <Sparkle /> AI
  </span>
);

const Sparkle = ({ size=10, color=FX_ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M6 0.5L7.3 4.7L11.5 6L7.3 7.3L6 11.5L4.7 7.3L0.5 6L4.7 4.7L6 0.5Z" fill={color}/>
  </svg>
);

const MicIcon = ({ size=14, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
    <rect x="5.5" y="2" width="5" height="8" rx="2.5"/>
    <path d="M3 7.5v1a5 5 0 0 0 10 0v-1M8 13.5v2M5.5 15.5h5"/>
  </svg>
);

const SendIcon = ({ size=14, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 8L3 3l2 5-2 5 11-5z"/>
  </svg>
);

const ChevRight = ({ size=10, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round"><path d="M3.5 2L6.5 5L3.5 8"/></svg>
);

const Check = ({ size=12, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6L5 8.5L9.5 3.5"/></svg>
);

// ── Concept 1 · NL Trade Commander ──────────────────────────────
// Artboard widths: 1280 x 820 per board (desktop hi-fi)

const W = 1280, H = 820;

// Shared chrome (minimal, to anchor designs in HedgeIQ)
const Chrome = ({ title, children }) => (
  <div style={{ width:W, height:H, background:FX_SURFACE_2, fontFamily:FX_FONT, color:FX_INK, display:'flex', flexDirection:'column' }}>
    <Row style={{ height:44, padding:'0 20px', borderBottom:`1px solid ${FX_BORDER}`, background:FX_SURFACE, gap:16 }}>
      <Row style={{ gap:8 }}>
        <div style={{ width:22, height:22, borderRadius:6, background:`linear-gradient(135deg, ${FX_ACCENT}, #8F7BFF)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Sparkle size={11} color="#fff"/>
        </div>
        <div style={{ fontWeight:700, fontSize:14, letterSpacing:-.2 }}>HedgeIQ</div>
        <Chip tone="ai" style={{ marginLeft:4 }}>Labs</Chip>
      </Row>
      <div style={{ flex:1 }}/>
      <div style={{ fontSize:12, color:FX_MUTED, letterSpacing:.2 }}>{title}</div>
      <div style={{ flex:1 }}/>
      <Row style={{ gap:10, fontSize:12, color:FX_MUTED }}>
        <span>Buying power <b style={{ color:FX_INK, fontVariantNumeric:'tabular-nums' }}>$48,213.44</b></span>
        <div style={{ width:26, height:26, borderRadius:13, background:'#2A2F3E', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600 }}>JS</div>
      </Row>
    </Row>
    {children}
  </div>
);

// === 1A · Empty / Idle prompt  =================================
function C1_Idle() {
  return (
    <Chrome title="Trade Commander · ⌘ K">
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, gap:28 }}>
        <Col style={{ alignItems:'center', gap:10 }}>
          <AIBadge/>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:44, letterSpacing:-1, lineHeight:1.05, textAlign:'center', maxWidth:760 }}>
            Tell me what you want to <span style={{ color:FX_ACCENT, fontStyle:'italic' }}>trade</span>.
          </div>
          <div style={{ fontSize:14, color:FX_MUTED, maxWidth:620, textAlign:'center', lineHeight:1.5 }}>
            Describe it in plain English, speak it, or paste a thesis. I'll assemble the orders — you confirm.
          </div>
        </Col>

        {/* The prompt bar */}
        <PromptBar placeholder="e.g. buy $5k NVDA if it dips under 890, good till canceled" />

        {/* Suggestion grid */}
        <Col style={{ gap:10, width:'100%', maxWidth:820 }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:.6, color:FX_SUBTLE, fontWeight:600 }}>Try</div>
          <Row style={{ gap:10, flexWrap:'wrap' }}>
            {[
              ['Rebalance to 60/40','Redistribute positions to target'],
              ['Buy 10 shares of AAPL at market','Simple buy'],
              ['Sell half my NVDA if it hits 950','Conditional trim'],
              ['Ladder $3k into VOO over 4 weeks','DCA schedule'],
              ['Cover my TSLA short at 220','Close short'],
            ].map(([t,s]) => (
              <div key={t} style={{ padding:'10px 14px', background:FX_SURFACE, border:`1px solid ${FX_BORDER}`, borderRadius:10, cursor:'pointer', boxShadow:'0 1px 0 rgba(14,19,35,.02)' }}>
                <div style={{ fontSize:13, fontWeight:600, color:FX_INK }}>{t}</div>
                <div style={{ fontSize:11, color:FX_MUTED, marginTop:2 }}>{s}</div>
              </div>
            ))}
          </Row>
        </Col>

        <div style={{ fontSize:11, color:FX_SUBTLE, display:'flex', gap:18 }}>
          <span>⌘K opens anywhere</span>
          <span>·</span>
          <span>Hold ⇧⌘ to dictate</span>
          <span>·</span>
          <span>Esc to cancel</span>
        </div>
      </div>
    </Chrome>
  );
}

function PromptBar({ placeholder, value, caret, stage='idle' }) {
  return (
    <div style={{ width:'100%', maxWidth:820, background:FX_SURFACE, border:`1.5px solid ${stage==='idle'?FX_ACCENT_LINE:FX_ACCENT}`, borderRadius:16, boxShadow:`0 10px 40px -8px ${FX_ACCENT}33, 0 0 0 6px ${FX_ACCENT}0D`, padding:'14px 16px' }}>
      <Row style={{ gap:12, alignItems:'flex-start' }}>
        <div style={{ marginTop:2 }}><Sparkle size={14}/></div>
        <div style={{ flex:1, fontSize:16, lineHeight:1.45, minHeight:24, color: value?FX_INK:FX_SUBTLE, fontFamily:FX_FONT }}>
          {value ? <>{value}{caret && <span style={{ display:'inline-block', width:1.5, height:18, background:FX_ACCENT, marginLeft:1, marginBottom:-3, animation:'fxblink 1s step-start infinite' }}/>}</> : placeholder}
        </div>
        <Row style={{ gap:6 }}>
          <button style={{ width:32, height:32, borderRadius:8, border:`1px solid ${FX_BORDER}`, background:FX_SURFACE, color:FX_INK_2, display:'flex', alignItems:'center', justifyContent:'center' }}><MicIcon/></button>
          <button style={{ padding:'0 14px', height:32, borderRadius:8, background:FX_ACCENT, color:'#fff', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}><SendIcon color="#fff"/> Send</button>
        </Row>
      </Row>
      <Row style={{ justifyContent:'space-between', marginTop:10, paddingTop:10, borderTop:`1px solid ${FX_BORDER_SOFT}` }}>
        <Row style={{ gap:14, fontSize:11, color:FX_MUTED }}>
          <Row style={{ gap:5 }}><span style={{ width:6, height:6, borderRadius:3, background:FX_POS }}/> Live market data</Row>
          <Row style={{ gap:5 }}>Account: <b style={{ color:FX_INK }}>Individual ··4821</b> <ChevRight/></Row>
          <Row style={{ gap:5 }}>Guardrails: <b style={{ color:FX_INK }}>Standard</b> <ChevRight/></Row>
        </Row>
        <div style={{ fontSize:11, color:FX_SUBTLE, fontFamily:FX_MONO }}>claude · sonnet</div>
      </Row>
    </div>
  );
}

// === 1B · Parsed preview =========================================
// User typed multi-order prompt; AI parsed it into 3 order cards awaiting confirm.

function C1_Parsed() {
  return (
    <Chrome title="Trade Commander · parsed 3 orders">
      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'28px 40px 24px', gap:20, overflow:'hidden' }}>
        {/* Prompt echo at top */}
        <div style={{ maxWidth:960 }}>
          <PromptBar
            stage="parsed"
            value="Trim 25% of my NVDA above 920, move the proceeds into VOO and SMH equal-weight, and set a stop on TSLA at 205."
          />
        </div>

        <Row style={{ gap:12, alignItems:'center' }}>
          <AIBadge/>
          <div style={{ fontSize:13, color:FX_INK_2 }}>
            I parsed this as <b>3 linked orders</b>. Net cash impact: <b style={{ color:FX_INK }}>$0</b> · Est. new exposure: <b style={{ color:FX_INK }}>-3.2% NVDA, +1.6% VOO, +1.6% SMH</b>
          </div>
          <div style={{ flex:1 }}/>
          <button style={{ fontSize:12, color:FX_MUTED, padding:'4px 10px', borderRadius:6, border:`1px solid ${FX_BORDER}` }}>Revise prompt</button>
        </Row>

        {/* Order cards row */}
        <Row style={{ gap:14, alignItems:'stretch' }}>
          <OrderCard
            idx="1"
            side="SELL"
            sym="NVDA" name="NVIDIA Corporation"
            qty="37 sh" notional="~$34,040"
            lines={[
              ['Trigger','Last ≥ $920.00'],
              ['Order type','Limit, Day'],
              ['Est. proceeds','$34,040'],
              ['Tax lot','FIFO · ST gain $2,180'],
            ]}
            warn="Short-term gain — would you like long-term lots instead?"
          />
          <OrderCard
            idx="2"
            side="BUY"
            sym="VOO" name="Vanguard S&P 500 ETF"
            qty="36 sh" notional="~$17,020"
            lines={[
              ['Trigger','Fills after order 1'],
              ['Order type','Market, Day'],
              ['Est. cost','$17,020'],
              ['Alloc after','+1.6% → 22.4% of port'],
            ]}
          />
          <OrderCard
            idx="3"
            side="BUY"
            sym="SMH" name="VanEck Semiconductor"
            qty="72 sh" notional="~$17,020"
            lines={[
              ['Trigger','Fills after order 1'],
              ['Order type','Market, Day'],
              ['Est. cost','$17,020'],
              ['Alloc after','+1.6% → 4.2% of port'],
            ]}
          />
        </Row>

        {/* Second row: standalone stop */}
        <OrderCardWide
          idx="4"
          side="STOP"
          sym="TSLA" name="Tesla, Inc."
          lines={[
            ['Type','Stop-loss'],
            ['Trigger','Last ≤ $205.00'],
            ['Action on trigger','Sell all 82 sh · Market'],
            ['Replaces','Existing stop @ $198'],
            ['Est. loss if hit','−$1,230 · 2.6% of position'],
          ]}
        />

        <div style={{ flex:1 }}/>

        {/* Footer confirmation bar */}
        <Row style={{ background:FX_SURFACE, border:`1px solid ${FX_BORDER}`, borderRadius:12, padding:'14px 16px', gap:16, boxShadow:'0 4px 16px rgba(14,19,35,.04)' }}>
          <Row style={{ gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:FX_ACCENT_SOFT, display:'flex', alignItems:'center', justifyContent:'center' }}><Sparkle size={14}/></div>
            <Col style={{ gap:2 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>Ready to place 4 orders</div>
              <div style={{ fontSize:11, color:FX_MUTED }}>Review each card · guardrails pass · press ⏎ to confirm all</div>
            </Col>
          </Row>
          <div style={{ flex:1 }}/>
          <Row style={{ gap:8 }}>
            <button style={btnGhost}>Place one at a time</button>
            <button style={btnGhost}>Save as recipe</button>
            <button style={btnPrimary}>Place all 4 orders ⏎</button>
          </Row>
        </Row>
      </div>
    </Chrome>
  );
}

const btnGhost = { padding:'8px 14px', borderRadius:8, border:`1px solid ${FX_BORDER}`, background:FX_SURFACE, fontSize:13, color:FX_INK, fontWeight:500 };
const btnPrimary = { padding:'8px 16px', borderRadius:8, border:'none', background:FX_INK, color:'#fff', fontSize:13, fontWeight:600 };

function OrderCard({ idx, side, sym, name, qty, notional, lines, warn }) {
  const sideColor = side==='BUY' ? FX_POS : side==='SELL' ? FX_NEG : '#C47A10';
  const sideBg    = side==='BUY' ? 'rgba(14,159,94,.08)' : side==='SELL' ? 'rgba(226,59,59,.08)' : 'rgba(196,122,16,.1)';
  return (
    <Col style={{ flex:1, background:FX_SURFACE, border:`1px solid ${FX_BORDER}`, borderRadius:12, overflow:'hidden' }}>
      <Row style={{ padding:'10px 14px', borderBottom:`1px solid ${FX_BORDER}`, gap:10 }}>
        <div style={{ width:22, height:22, borderRadius:11, background:FX_SUNKEN, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:FX_MUTED }}>{idx}</div>
        <Chip tone="default" style={{ background:sideBg, color:sideColor }}>{side}</Chip>
        <div style={{ flex:1 }}/>
        <button style={{ fontSize:11, color:FX_MUTED }}>Edit</button>
      </Row>
      <Col style={{ padding:14, gap:4 }}>
        <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:28, lineHeight:1, letterSpacing:-.5 }}>{sym}</div>
        <div style={{ fontSize:11, color:FX_MUTED }}>{name}</div>
        <Row style={{ gap:16, marginTop:8, paddingBottom:10, borderBottom:`1px dashed ${FX_BORDER}` }}>
          <Col><div style={{ fontSize:10, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.5 }}>Qty</div><div style={{ fontSize:13, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{qty}</div></Col>
          <Col><div style={{ fontSize:10, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.5 }}>Notional</div><div style={{ fontSize:13, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{notional}</div></Col>
        </Row>
        <Col style={{ gap:5, marginTop:8 }}>
          {lines.map(([k,v]) => (
            <Row key={k} style={{ justifyContent:'space-between', fontSize:11.5 }}>
              <span style={{ color:FX_MUTED }}>{k}</span>
              <span style={{ color:FX_INK, fontWeight:500, fontVariantNumeric:'tabular-nums', textAlign:'right' }}>{v}</span>
            </Row>
          ))}
        </Col>
        {warn && (
          <Row style={{ marginTop:10, padding:'8px 10px', background:FX_ACCENT_SOFT, border:`1px solid ${FX_ACCENT_LINE}`, borderRadius:8, gap:8, alignItems:'flex-start' }}>
            <Sparkle size={10}/>
            <div style={{ fontSize:11, color:FX_INK_2, lineHeight:1.4 }}>{warn}</div>
          </Row>
        )}
      </Col>
    </Col>
  );
}

function OrderCardWide({ idx, side, sym, name, lines }) {
  return (
    <Row style={{ background:FX_SURFACE, border:`1px solid ${FX_BORDER}`, borderRadius:12, padding:'12px 16px', gap:20, alignItems:'center' }}>
      <Row style={{ gap:10 }}>
        <div style={{ width:22, height:22, borderRadius:11, background:FX_SUNKEN, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:FX_MUTED }}>{idx}</div>
        <Chip tone="default" style={{ background:'rgba(196,122,16,.1)', color:'#C47A10' }}>{side}</Chip>
      </Row>
      <Col style={{ minWidth:120 }}>
        <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:22, lineHeight:1 }}>{sym}</div>
        <div style={{ fontSize:11, color:FX_MUTED }}>{name}</div>
      </Col>
      <Row style={{ flex:1, gap:24, justifyContent:'flex-end' }}>
        {lines.map(([k,v]) => (
          <Col key={k} style={{ alignItems:'flex-end' }}>
            <div style={{ fontSize:10, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.5 }}>{k}</div>
            <div style={{ fontSize:12.5, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{v}</div>
          </Col>
        ))}
      </Row>
      <button style={{ fontSize:11, color:FX_MUTED }}>Edit</button>
    </Row>
  );
}

// === 1C · Voice / live capture =====================================
function C1_Voice() {
  return (
    <Chrome title="Trade Commander · dictating">
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, gap:24 }}>
        <Row style={{ gap:8 }}>
          <Chip tone="ai">Listening · 0:03</Chip>
          <Chip tone="default">Private · not stored</Chip>
        </Row>

        {/* Waveform bloom */}
        <div style={{ position:'relative', width:480, height:120, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="480" height="120" viewBox="0 0 480 120">
            <defs>
              <linearGradient id="wave" x1="0" x2="1">
                <stop offset="0" stopColor={FX_ACCENT} stopOpacity="0"/>
                <stop offset=".5" stopColor={FX_ACCENT} stopOpacity="1"/>
                <stop offset="1" stopColor={FX_ACCENT} stopOpacity="0"/>
              </linearGradient>
            </defs>
            {Array.from({ length:60 }).map((_,i) => {
              const h = 6 + Math.abs(Math.sin(i*0.6)) * (40 + (i%5)*6) * (0.3 + Math.cos(i*.3)*.7);
              return <rect key={i} x={i*8} y={60 - h/2} width="3" height={h} rx="1.5" fill="url(#wave)"/>;
            })}
          </svg>
          {/* Mic button overlay */}
          <div style={{ position:'absolute', bottom:-20, width:64, height:64, borderRadius:32, background:`linear-gradient(135deg, ${FX_ACCENT}, #8F7BFF)`, boxShadow:`0 12px 40px -8px ${FX_ACCENT}99, 0 0 0 8px ${FX_ACCENT}1A`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <MicIcon size={24} color="#fff"/>
          </div>
        </div>

        <div style={{ marginTop:28, maxWidth:760, textAlign:'center', fontSize:24, lineHeight:1.4, letterSpacing:-.2, color:FX_INK }}>
          "Buy <b style={{ color:FX_ACCENT }}>five thousand dollars</b> of <b style={{ color:FX_ACCENT }}>NVIDIA</b> if it drops under <b style={{ color:FX_ACCENT }}>eight ninety</b>, good <span style={{ color:FX_SUBTLE }}>until cance—</span><span style={{ display:'inline-block', width:2, height:22, background:FX_ACCENT, marginLeft:3, verticalAlign:'-3px', animation:'fxblink 1s step-start infinite' }}/>"
        </div>

        {/* Live parse chips under */}
        <Row style={{ gap:8, flexWrap:'wrap', justifyContent:'center', maxWidth:720 }}>
          <ParseChip k="Side" v="BUY"/>
          <ParseChip k="Notional" v="$5,000"/>
          <ParseChip k="Symbol" v="NVDA"/>
          <ParseChip k="Trigger" v="< $890"/>
          <ParseChip k="Duration" v="GTC" loading/>
        </Row>

        <Row style={{ gap:10, marginTop:10 }}>
          <button style={btnGhost}>Cancel</button>
          <button style={{ ...btnPrimary, background:FX_ACCENT }}>Stop & preview ↵</button>
        </Row>
      </div>
    </Chrome>
  );
}

const ParseChip = ({ k, v, loading }) => (
  <Row style={{ padding:'6px 10px', background:FX_SURFACE, border:`1px solid ${FX_BORDER}`, borderRadius:999, gap:8, boxShadow:'0 1px 2px rgba(14,19,35,.04)' }}>
    <span style={{ fontSize:10, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>{k}</span>
    <span style={{ fontSize:12, color:loading?FX_SUBTLE:FX_INK, fontWeight:600, fontFamily:FX_MONO }}>{loading ? '···' : v}</span>
    {!loading && <Check size={10} color={FX_POS}/>}
  </Row>
);


// === Concept 2 · Options Intent Studio ============================

// === 2A · Describe your thesis (idle) =============================
function C2_Idle() {
  return (
    <Chrome title="Options · Intent Studio">
      <Row style={{ flex:1, overflow:'hidden' }}>
        {/* Left: prompt + thesis builder */}
        <Col style={{ width:440, borderRight:`1px solid ${FX_BORDER}`, background:FX_SURFACE, padding:'24px 24px' }}>
          <AIBadge style={{ alignSelf:'flex-start' }}/>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:30, letterSpacing:-.5, lineHeight:1.1, marginTop:10 }}>What's your thesis?</div>
          <div style={{ fontSize:13, color:FX_MUTED, marginTop:6, lineHeight:1.5 }}>Skip the chain. Describe your view — direction, timing, risk — and I'll propose strategies.</div>

          <div style={{ marginTop:18, background:FX_SUNKEN, border:`1px solid ${FX_BORDER}`, borderRadius:12, padding:14, minHeight:120, fontSize:14, color:FX_SUBTLE, lineHeight:1.5 }}>
            <span>"I think NVDA goes up about 10% by May earnings. Defined risk. Budget around $2,000."</span>
          </div>

          <Row style={{ marginTop:10, gap:6 }}>
            <button style={{ ...btnGhost, fontSize:12 }}>🎙 Voice</button>
            <button style={{ ...btnGhost, fontSize:12 }}>📎 Attach thesis</button>
            <div style={{ flex:1 }}/>
            <button style={{ ...btnPrimary, background:FX_ACCENT }}>Find strategies →</button>
          </Row>

          {/* Quick knobs */}
          <div style={{ marginTop:24, fontSize:11, color:FX_SUBTLE, textTransform:'uppercase', letterSpacing:.6, fontWeight:600 }}>Or set intent manually</div>

          <Col style={{ gap:14, marginTop:12 }}>
            <KnobRow label="Direction"    options={['Up','Neutral','Down']} active={0}/>
            <KnobRow label="Conviction"   options={['Low','Med','High']}    active={1}/>
            <KnobRow label="Time horizon" options={['1w','2w','1mo','3mo','6mo']} active={2}/>
            <KnobRow label="Risk profile" options={['Defined','Undefined']} active={0}/>
            <KnobRow label="Budget"       options={['$500','$1k','$2k','$5k','$10k']} active={2}/>
          </Col>

          <div style={{ flex:1 }}/>
          <div style={{ fontSize:11, color:FX_SUBTLE, marginTop:12 }}>⚡ Results ranked by probability × payoff, not volume.</div>
        </Col>

        {/* Right: starter panel */}
        <Col style={{ flex:1, padding:'28px 32px', gap:16 }}>
          <Row style={{ gap:10 }}>
            <div style={{ fontSize:13, color:FX_MUTED }}>Underlying</div>
            <Chip tone="default" style={{ background:FX_SURFACE, border:`1px solid ${FX_BORDER}` }}>NVDA · $894.12 <ChevRight/></Chip>
            <Chip tone="pos">IV 38% · rank 42</Chip>
            <Chip tone="default">Earnings in 22d</Chip>
          </Row>

          <Col style={{ flex:1, background:FX_SURFACE, border:`1px dashed ${FX_BORDER}`, borderRadius:14, alignItems:'center', justifyContent:'center', gap:14, padding:28 }}>
            <div style={{ width:56, height:56, borderRadius:28, background:FX_ACCENT_SOFT, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Sparkle size={22}/>
            </div>
            <div style={{ fontSize:18, fontWeight:600, textAlign:'center', letterSpacing:-.2 }}>Describe a thesis to see strategies</div>
            <div style={{ fontSize:13, color:FX_MUTED, textAlign:'center', maxWidth:400, lineHeight:1.5 }}>
              I'll rank 3–5 strategies across the chain — calls, spreads, diagonals — ranked by expected value for your view.
            </div>

            <Row style={{ marginTop:8, gap:8, flexWrap:'wrap', justifyContent:'center' }}>
              {['Bullish on NVDA earnings','Pin TSLA through April','Short vol on META','Hedge my AAPL downside','Cheap lottery on AMD'].map(t => (
                <Chip key={t} tone="ghost" style={{ padding:'6px 12px', fontSize:11, textTransform:'none', letterSpacing:0, fontWeight:500, cursor:'pointer' }}>{t}</Chip>
              ))}
            </Row>
          </Col>
        </Col>
      </Row>
    </Chrome>
  );
}

const KnobRow = ({ label, options, active }) => (
  <Col style={{ gap:6 }}>
    <div style={{ fontSize:11, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>{label}</div>
    <Row style={{ gap:6, flexWrap:'wrap' }}>
      {options.map((o,i) => (
        <button key={o} style={{
          padding:'6px 12px', borderRadius:999, fontSize:12, fontWeight:500,
          border:`1px solid ${i===active?FX_ACCENT:FX_BORDER}`,
          background:i===active?FX_ACCENT_SOFT:FX_SURFACE,
          color:i===active?FX_ACCENT:FX_INK_2,
        }}>{o}</button>
      ))}
    </Row>
  </Col>
);

// === 2B · Strategy proposals =======================================
function C2_Proposals() {
  return (
    <Chrome title="Options · 3 strategies for your thesis">
      <Row style={{ flex:1, overflow:'hidden' }}>
        {/* Left thesis recap */}
        <Col style={{ width:340, borderRight:`1px solid ${FX_BORDER}`, background:FX_SURFACE, padding:'24px 22px', gap:14 }}>
          <AIBadge style={{ alignSelf:'flex-start' }}/>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:22, letterSpacing:-.3, lineHeight:1.2 }}>
            "NVDA up ~10% by May earnings. Defined risk. Budget ~$2,000."
          </div>

          <div style={{ fontSize:11, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.5, fontWeight:600, marginTop:8 }}>Parsed</div>
          <Col style={{ gap:6, fontSize:12 }}>
            {[
              ['Underlying','NVDA @ $894.12'],
              ['Direction','Bullish · +10% target'],
              ['Target price','$983'],
              ['Expiry window','May 16 (26d)'],
              ['Risk','Defined loss'],
              ['Max budget','$2,000'],
            ].map(([k,v]) => (
              <Row key={k} style={{ justifyContent:'space-between' }}>
                <span style={{ color:FX_MUTED }}>{k}</span>
                <span style={{ fontWeight:600 }}>{v}</span>
              </Row>
            ))}
          </Col>

          <div style={{ fontSize:11, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.5, fontWeight:600, marginTop:8 }}>AI notes</div>
          <div style={{ fontSize:12, color:FX_INK_2, lineHeight:1.5, padding:10, background:FX_ACCENT_SOFT, border:`1px solid ${FX_ACCENT_LINE}`, borderRadius:8 }}>
            IV rank is elevated (42) heading into earnings — credit spreads look favorable vs. naked long calls. I've flagged the best risk-adjusted path.
          </div>

          <div style={{ flex:1 }}/>
          <button style={{ ...btnGhost, alignSelf:'flex-start', fontSize:12 }}>← Edit thesis</button>
        </Col>

        {/* Right: ranked proposal cards */}
        <Col style={{ flex:1, padding:'20px 24px 24px', gap:12, overflow:'hidden' }}>
          <Row style={{ gap:8, alignItems:'center' }}>
            <div style={{ fontSize:13, color:FX_MUTED }}>Ranked by expected value</div>
            <div style={{ flex:1 }}/>
            <Row style={{ gap:4, padding:2, background:FX_SUNKEN, borderRadius:8, border:`1px solid ${FX_BORDER}` }}>
              {['EV','Probability','Max gain','Capital'].map((t,i) => (
                <button key={t} style={{ padding:'4px 10px', fontSize:11, fontWeight:500, borderRadius:6, background:i===0?FX_SURFACE:'transparent', color:i===0?FX_INK:FX_MUTED, boxShadow:i===0?'0 1px 2px rgba(14,19,35,.06)':'none' }}>{t}</button>
              ))}
            </Row>
          </Row>

          <Row style={{ gap:14, alignItems:'stretch', flex:1 }}>
            <StratCard
              rank="1"
              badge="Best risk-adjusted"
              name="Bull call spread"
              legs={[
                { s:'BUY', qty:'+2', k:'900 C', exp:'May 16', px:'$28.40' },
                { s:'SELL',qty:'−2', k:'970 C', exp:'May 16', px:'$10.20' },
              ]}
              metrics={{
                cost:'$3,640', note:'debit',
                maxGain:'+$10,360', gainPct:'+284%',
                maxLoss:'−$3,640',
                be:'$918.20',
                prob:'42%',
                ev:'+$812',
              }}
              featured
            />
            <StratCard
              rank="2"
              badge="Lowest capital"
              name="Call calendar"
              legs={[
                { s:'SELL', qty:'−2', k:'920 C', exp:'May 02', px:'$14.10' },
                { s:'BUY',  qty:'+2', k:'920 C', exp:'May 16', px:'$22.40' },
              ]}
              metrics={{
                cost:'$1,660', note:'net debit',
                maxGain:'≈ +$2,840', gainPct:'+171%',
                maxLoss:'−$1,660',
                be:'$892 / $948',
                prob:'38%',
                ev:'+$544',
              }}
            />
            <StratCard
              rank="3"
              badge="Pure directional"
              name="Long call"
              legs={[
                { s:'BUY', qty:'+1', k:'900 C', exp:'May 16', px:'$28.40' },
              ]}
              metrics={{
                cost:'$2,840', note:'debit',
                maxGain:'Unlimited', gainPct:'+∞',
                maxLoss:'−$2,840',
                be:'$928.40',
                prob:'31%',
                ev:'+$440',
              }}
              warn="Theta decay is aggressive past April 30"
            />
          </Row>

          {/* Footer strategy-comparison strip */}
          <Row style={{ background:FX_SURFACE, border:`1px solid ${FX_BORDER}`, borderRadius:12, padding:'10px 14px', gap:16, alignItems:'center' }}>
            <div style={{ fontSize:11, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>Compare payoff at May 16</div>
            <div style={{ flex:1, height:38 }}>
              <PayoffCompare/>
            </div>
            <Row style={{ gap:14, fontSize:11 }}>
              <Row style={{ gap:6 }}><span style={{ width:10, height:3, background:FX_ACCENT }}/>Bull spread</Row>
              <Row style={{ gap:6 }}><span style={{ width:10, height:3, background:FX_SUBTLE }}/>Calendar</Row>
              <Row style={{ gap:6 }}><span style={{ width:10, height:3, background:FX_INK_2 }}/>Long call</Row>
            </Row>
          </Row>
        </Col>
      </Row>
    </Chrome>
  );
}

function StratCard({ rank, badge, name, legs, metrics, featured, warn }) {
  return (
    <Col style={{ flex:1, background:featured?`linear-gradient(180deg, ${FX_ACCENT_SOFT} 0%, ${FX_SURFACE} 80px)`:FX_SURFACE, border:`1.5px solid ${featured?FX_ACCENT:FX_BORDER}`, borderRadius:14, overflow:'hidden', boxShadow:featured?`0 12px 32px -12px ${FX_ACCENT}4D`:'0 1px 2px rgba(14,19,35,.04)' }}>
      <Row style={{ padding:'10px 14px', gap:8 }}>
        <div style={{ width:22, height:22, borderRadius:11, background:featured?FX_ACCENT:FX_SUNKEN, color:featured?'#fff':FX_MUTED, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>{rank}</div>
        <Chip tone={featured?'ai':'default'}>{badge}</Chip>
        <div style={{ flex:1 }}/>
        <button style={{ fontSize:10, color:FX_MUTED, padding:'2px 6px', borderRadius:4 }}>·‧·</button>
      </Row>
      <Col style={{ padding:'0 14px 14px', gap:10 }}>
        <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:22, letterSpacing:-.3 }}>{name}</div>

        {/* Payoff sparkline */}
        <div style={{ height:70, background:featured?'rgba(107,79,255,.06)':FX_SURFACE_2, borderRadius:8, padding:6, border:`1px solid ${FX_BORDER_SOFT}`, position:'relative' }}>
          <PayoffSpark color={featured?FX_ACCENT:FX_INK_2}/>
          <div style={{ position:'absolute', top:4, left:8, fontSize:9, color:FX_SUBTLE, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>Payoff at expiry</div>
        </div>

        {/* Legs */}
        <Col style={{ gap:4 }}>
          {legs.map((l,i) => (
            <Row key={i} style={{ fontSize:11.5, fontFamily:FX_MONO, background:FX_SURFACE_2, padding:'5px 8px', borderRadius:6, gap:10, border:`1px solid ${FX_BORDER_SOFT}` }}>
              <span style={{ color:l.s==='BUY'?FX_POS:FX_NEG, fontWeight:700, minWidth:32 }}>{l.s}</span>
              <span style={{ color:FX_INK, minWidth:26 }}>{l.qty}</span>
              <span style={{ color:FX_INK_2, flex:1 }}>{l.k} · {l.exp}</span>
              <span style={{ color:FX_INK }}>{l.px}</span>
            </Row>
          ))}
        </Col>

        {/* Metrics grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 14px', marginTop:2 }}>
          <MetricRow k="Capital at risk" v={metrics.cost} sub={metrics.note}/>
          <MetricRow k="Breakeven" v={metrics.be}/>
          <MetricRow k="Max gain" v={metrics.maxGain} sub={metrics.gainPct} pos/>
          <MetricRow k="Max loss" v={metrics.maxLoss} neg/>
          <MetricRow k="P(profit)" v={metrics.prob} featured={featured}/>
          <MetricRow k="Expected value" v={metrics.ev} pos/>
        </div>

        {warn && (
          <Row style={{ padding:'6px 8px', background:'rgba(196,122,16,.08)', border:'1px solid rgba(196,122,16,.25)', borderRadius:6, fontSize:11, color:'#8B5A0F', gap:6 }}>
            ⚠ {warn}
          </Row>
        )}

        <Row style={{ gap:6, marginTop:2 }}>
          <button style={{ ...btnGhost, flex:1, fontSize:12, padding:'7px 10px' }}>Tweak</button>
          <button style={{ ...btnGhost, flex:1, fontSize:12, padding:'7px 10px' }}>Simulate</button>
          <button style={{ flex:1.2, padding:'7px 10px', borderRadius:8, background:featured?FX_ACCENT:FX_INK, color:'#fff', fontSize:12, fontWeight:600 }}>Place →</button>
        </Row>
      </Col>
    </Col>
  );
}

function MetricRow({ k, v, sub, pos, neg, featured }) {
  const color = pos?FX_POS : neg?FX_NEG : FX_INK;
  return (
    <Col style={{ gap:1 }}>
      <div style={{ fontSize:10, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.4, fontWeight:600 }}>{k}</div>
      <Row style={{ gap:4, alignItems:'baseline' }}>
        <span style={{ fontSize:13.5, fontWeight:700, color, fontVariantNumeric:'tabular-nums' }}>{v}</span>
        {sub && <span style={{ fontSize:10, color:FX_MUTED, fontVariantNumeric:'tabular-nums' }}>{sub}</span>}
        {featured && <Sparkle size={8}/>}
      </Row>
    </Col>
  );
}

// Tiny payoff spark per strategy card
function PayoffSpark({ color }) {
  // Stylized bull-spread-ish payoff curve
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none" style={{ position:'absolute', inset:6, width:'calc(100% - 12px)', height:'calc(100% - 12px)' }}>
      <line x1="0" x2="200" y1="42" y2="42" stroke={FX_BORDER} strokeDasharray="2 3"/>
      <line x1="90" x2="90" y1="0" y2="60" stroke={FX_BORDER_SOFT}/>
      <path d="M0,42 L60,42 L110,18 L200,18" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M0,42 L60,42 L110,18 L200,18 L200,60 L0,60 Z" fill={color} opacity=".10"/>
      <circle cx="90" cy="42" r="2.5" fill={color}/>
    </svg>
  );
}

// Overlaid comparison sparkline (3 curves)
function PayoffCompare() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 600 38" preserveAspectRatio="none">
      <line x1="0" x2="600" y1="26" y2="26" stroke={FX_BORDER} strokeDasharray="2 3"/>
      {/* bull spread */}
      <path d="M0,26 L180,26 L330,8 L600,8" stroke={FX_ACCENT} strokeWidth="2" fill="none"/>
      {/* calendar */}
      <path d="M0,22 Q120,8 270,6 Q420,10 600,22" stroke={FX_SUBTLE} strokeWidth="1.5" fill="none" strokeDasharray="3 3"/>
      {/* long call */}
      <path d="M0,26 L200,26 L600,-6" stroke={FX_INK_2} strokeWidth="1.5" fill="none"/>
      <text x="6" y="35" fontSize="8" fill={FX_SUBTLE} fontFamily={FX_MONO}>$850</text>
      <text x="280" y="35" fontSize="8" fill={FX_SUBTLE} fontFamily={FX_MONO}>$920 (now)</text>
      <text x="550" y="35" fontSize="8" fill={FX_SUBTLE} fontFamily={FX_MONO}>$990</text>
    </svg>
  );
}

// === 2C · One-strategy deep dive with sliders =====================
function C2_Tweak() {
  return (
    <Chrome title="Bull call spread · tweak & simulate">
      <Row style={{ flex:1, overflow:'hidden' }}>
        <Col style={{ flex:1, padding:'22px 28px', gap:16 }}>
          <Row style={{ gap:10, alignItems:'center' }}>
            <button style={{ ...btnGhost, fontSize:12 }}>← All strategies</button>
            <div style={{ flex:1 }}/>
            <Chip tone="ai">Best risk-adjusted</Chip>
          </Row>

          <Row style={{ alignItems:'baseline', gap:10 }}>
            <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:36, letterSpacing:-.8 }}>Bull call spread</div>
            <div style={{ fontSize:14, color:FX_MUTED }}>NVDA · May 16 · 900/970</div>
          </Row>

          {/* Big payoff chart */}
          <div style={{ flex:1, background:FX_SURFACE, border:`1px solid ${FX_BORDER}`, borderRadius:14, padding:18, minHeight:0, position:'relative' }}>
            <Row style={{ gap:14, marginBottom:8 }}>
              <div style={{ fontSize:12, color:FX_MUTED }}>Payoff at</div>
              <Row style={{ gap:4, padding:2, background:FX_SUNKEN, borderRadius:6, border:`1px solid ${FX_BORDER}` }}>
                {['Today','Apr 30','May 10','May 16 (exp)'].map((t,i) => (
                  <button key={t} style={{ padding:'3px 9px', fontSize:11, fontWeight:500, borderRadius:4, background:i===3?FX_SURFACE:'transparent', color:i===3?FX_INK:FX_MUTED, boxShadow:i===3?'0 1px 2px rgba(14,19,35,.06)':'none' }}>{t}</button>
                ))}
              </Row>
              <div style={{ flex:1 }}/>
              <Chip tone="ghost">IV = 38%</Chip>
              <Chip tone="ghost">Monte Carlo · 5k paths</Chip>
            </Row>
            <div style={{ height:'calc(100% - 40px)' }}>
              <BigPayoff/>
            </div>
          </div>
        </Col>

        {/* Right: sliders + what-if + place */}
        <Col style={{ width:360, borderLeft:`1px solid ${FX_BORDER}`, background:FX_SURFACE, padding:'22px 22px', gap:16 }}>
          <div style={{ fontSize:11, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.6, fontWeight:600 }}>Tune strikes & size</div>

          <SliderRow label="Long strike"  value="$900" range={['$840','$960']} pct={.5}/>
          <SliderRow label="Short strike" value="$970" range={['$900','$1040']} pct={.5}/>
          <SliderRow label="Expiry"       value="May 16 · 26d" range={['May 02','Jun 20']} pct={.4}/>
          <SliderRow label="Contracts"    value="×2" range={['×1','×10']} pct={.1}/>

          <div style={{ height:1, background:FX_BORDER, margin:'4px 0' }}/>

          {/* What-if scenarios */}
          <div style={{ fontSize:11, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.6, fontWeight:600 }}>What-if</div>
          <Col style={{ gap:6 }}>
            {[
              ['NVDA flat at $894 on May 16','−$3,640','loss'],
              ['NVDA hits $920 target','+$2,560','win'],
              ['NVDA hits $983 (+10%)','+$10,360','big'],
              ['NVDA drops 15% after earnings','−$3,640','loss'],
            ].map(([sc, val, kind]) => (
              <Row key={sc} style={{ background:FX_SURFACE_2, border:`1px solid ${FX_BORDER_SOFT}`, borderRadius:8, padding:'8px 10px', gap:8 }}>
                <div style={{ fontSize:11.5, flex:1, color:FX_INK_2 }}>{sc}</div>
                <div style={{ fontSize:12, fontWeight:700, color: kind==='loss'?FX_NEG : kind==='big'?FX_ACCENT : FX_POS, fontVariantNumeric:'tabular-nums' }}>{val}</div>
              </Row>
            ))}
          </Col>

          {/* Ask follow-up */}
          <div style={{ marginTop:6, background:FX_ACCENT_SOFT, border:`1px solid ${FX_ACCENT_LINE}`, borderRadius:10, padding:12, gap:6, display:'flex', flexDirection:'column' }}>
            <Row style={{ gap:6 }}><Sparkle size={10}/><span style={{ fontSize:11, fontWeight:600, color:FX_ACCENT, textTransform:'uppercase', letterSpacing:.5 }}>Ask about this strategy</span></Row>
            <Row style={{ gap:6, flexWrap:'wrap' }}>
              {['Why not 890/960?','How does earnings IV crush hit this?','Convert to credit spread'].map(q => (
                <button key={q} style={{ padding:'5px 10px', background:FX_SURFACE, border:`1px solid ${FX_ACCENT_LINE}`, borderRadius:999, fontSize:11, color:FX_ACCENT_LINE, color:FX_INK_2, fontWeight:500 }}>{q}</button>
              ))}
            </Row>
          </div>

          <div style={{ flex:1 }}/>

          {/* Place CTA */}
          <Col style={{ gap:8, padding:14, background:FX_SUNKEN, borderRadius:10, border:`1px solid ${FX_BORDER}` }}>
            <Row style={{ justifyContent:'space-between' }}><span style={{ color:FX_MUTED, fontSize:12 }}>Net debit</span><span style={{ fontWeight:700, fontVariantNumeric:'tabular-nums' }}>$36.40 × 2 = $3,640</span></Row>
            <Row style={{ justifyContent:'space-between' }}><span style={{ color:FX_MUTED, fontSize:12 }}>Buying power used</span><span style={{ fontWeight:600, fontVariantNumeric:'tabular-nums' }}>$3,640</span></Row>
            <Row style={{ justifyContent:'space-between' }}><span style={{ color:FX_MUTED, fontSize:12 }}>Est. max gain</span><span style={{ color:FX_POS, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>+$10,360</span></Row>
            <button style={{ marginTop:4, padding:'10px 14px', borderRadius:10, background:FX_ACCENT, color:'#fff', fontSize:13, fontWeight:700 }}>Review & place → 2-leg ticket</button>
          </Col>
        </Col>
      </Row>
    </Chrome>
  );
}

function SliderRow({ label, value, range, pct }) {
  return (
    <Col style={{ gap:6 }}>
      <Row>
        <div style={{ fontSize:11, color:FX_MUTED, textTransform:'uppercase', letterSpacing:.5, fontWeight:600 }}>{label}</div>
        <div style={{ flex:1 }}/>
        <div style={{ fontSize:13, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{value}</div>
      </Row>
      <div style={{ position:'relative', height:24 }}>
        <div style={{ position:'absolute', top:11, left:0, right:0, height:2, background:FX_BORDER, borderRadius:2 }}/>
        <div style={{ position:'absolute', top:11, left:0, width:`${pct*100}%`, height:2, background:FX_ACCENT, borderRadius:2 }}/>
        <div style={{ position:'absolute', top:6, left:`calc(${pct*100}% - 6px)`, width:14, height:14, borderRadius:7, background:'#fff', border:`2px solid ${FX_ACCENT}`, boxShadow:'0 2px 6px rgba(107,79,255,.3)' }}/>
      </div>
      <Row style={{ fontSize:10, color:FX_SUBTLE, fontFamily:FX_MONO }}>
        <span>{range[0]}</span><div style={{ flex:1 }}/><span>{range[1]}</span>
      </Row>
    </Col>
  );
}

function BigPayoff() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
      <defs>
        <linearGradient id="bppos" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={FX_POS} stopOpacity=".28"/>
          <stop offset="1" stopColor={FX_POS} stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="bpneg" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0" stopColor={FX_NEG} stopOpacity=".22"/>
          <stop offset="1" stopColor={FX_NEG} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* zero line */}
      <line x1="0" x2="800" y1="180" y2="180" stroke={FX_BORDER} strokeWidth="1" strokeDasharray="4 4"/>
      {/* current price marker */}
      <line x1="340" x2="340" y1="10" y2="290" stroke={FX_ACCENT} strokeWidth="1" strokeDasharray="2 4" opacity=".5"/>
      <rect x="310" y="4" width="60" height="18" rx="3" fill={FX_ACCENT}/>
      <text x="340" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600">$894</text>
      {/* breakeven */}
      <line x1="430" x2="430" y1="10" y2="290" stroke={FX_SUBTLE} strokeWidth="1" opacity=".5"/>
      <text x="430" y="298" textAnchor="middle" fontSize="10" fill={FX_SUBTLE} fontFamily={FX_MONO}>BE $918</text>
      {/* strike markers */}
      <line x1="390" x2="390" y1="160" y2="180" stroke={FX_MUTED} strokeWidth="1"/>
      <text x="390" y="200" textAnchor="middle" fontSize="10" fill={FX_MUTED}>$900</text>
      <line x1="630" x2="630" y1="50" y2="180" stroke={FX_MUTED} strokeWidth="1" strokeDasharray="2 3"/>
      <text x="630" y="200" textAnchor="middle" fontSize="10" fill={FX_MUTED}>$970</text>

      {/* Loss region fill */}
      <path d="M0,180 L390,180 L430,180 L430,300 L0,300 Z" fill="url(#bpneg)"/>
      <path d="M0,233 L390,233 L430,180 L430,300 L0,300 Z" fill={FX_NEG} opacity=".08"/>
      {/* Gain region fill */}
      <path d="M430,180 L630,50 L800,50 L800,180 Z" fill="url(#bppos)"/>

      {/* payoff line */}
      <path d="M0,233 L390,233 L630,50 L800,50" stroke={FX_ACCENT} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>

      {/* monte carlo dots */}
      {Array.from({ length:120 }).map((_,i) => {
        const x = 20 + Math.random()*760;
        const y = 180 + (Math.random()-.5) * 180 * Math.exp(-Math.pow((x-340)/220,2));
        return <circle key={i} cx={x} cy={y} r="1.4" fill={FX_ACCENT} opacity=".22"/>;
      })}

      {/* max gain label */}
      <rect x="660" y="30" width="120" height="24" rx="4" fill={FX_POS} opacity=".12"/>
      <text x="720" y="46" textAnchor="middle" fontSize="11" fill={FX_POS} fontWeight="700" fontFamily={FX_MONO}>Max +$10,360</text>
      {/* max loss label */}
      <rect x="20" y="244" width="120" height="24" rx="4" fill={FX_NEG} opacity=".12"/>
      <text x="80" y="260" textAnchor="middle" fontSize="11" fill={FX_NEG} fontWeight="700" fontFamily={FX_MONO}>Max −$3,640</text>

      {/* probability annotation */}
      <rect x="450" y="20" width="170" height="40" rx="6" fill={FX_ACCENT_SOFT} stroke={FX_ACCENT_LINE}/>
      <text x="460" y="35" fontSize="10" fill={FX_ACCENT} fontWeight="700">P(PROFIT) · 42%</text>
      <text x="460" y="50" fontSize="10" fill={FX_INK_2}>based on 5,000 paths</text>
    </svg>
  );
}


// === Canvas shell =================================================

function Futuristic() {
  return (
    <>
      <style>{`@keyframes fxblink{50%{opacity:0}} .fxcanvas{font-family:${FX_FONT}}`}</style>
      <DesignCanvas>

        <DCSection id="intro" title="Futuristic concepts · Agentic & NL UI" subtitle="Two AI-native replacements for dense multi-click flows. Each section is one concept with 3 states.">
          <DCArtboard id="intro-note" label="Context" width={720} height={380}>
            <div style={{ padding:36, fontFamily:FX_FONT, color:FX_INK, height:'100%', display:'flex', flexDirection:'column', gap:14 }}>
              <AIBadge style={{ alignSelf:'flex-start' }}/>
              <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:32, letterSpacing:-.6, lineHeight:1.15 }}>
                Fewer clicks. More intent.
              </div>
              <div style={{ fontSize:13, color:FX_MUTED, lineHeight:1.6 }}>
                Today's Buy / Sell ticket takes 6–9 clicks. Options chain takes even more — scan 20 columns, guess strikes, read greeks, build legs manually. These concepts collapse both into a <b>single natural-language input</b> and a set of <b>AI-proposed, ranked, directly-confirmable</b> actions.
              </div>
              <div style={{ height:1, background:FX_BORDER, margin:'6px 0' }}/>
              <Col style={{ gap:8, fontSize:12.5 }}>
                <Row style={{ gap:8 }}><b style={{ width:180, color:FX_ACCENT }}>1 · Trade Commander</b><span>Replaces Buy/Sell. Type or speak an order (or many). AI parses → you confirm.</span></Row>
                <Row style={{ gap:8 }}><b style={{ width:180, color:FX_ACCENT }}>2 · Options Intent Studio</b><span>Replaces the options chain. Describe a thesis — AI proposes ranked strategies.</span></Row>
              </Col>
              <div style={{ flex:1 }}/>
              <div style={{ fontSize:11, color:FX_SUBTLE }}>Click any artboard ↗ to focus. ← / → to page through.</div>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="c1" title="Concept 1 · Trade Commander" subtitle="Natural-language + voice replacement for the Buy / Sell ticket. One input → multi-order preview → confirm.">
          <DCArtboard id="c1-idle" label="1A · Idle prompt (⌘K)" width={W} height={H}><C1_Idle/></DCArtboard>
          <DCArtboard id="c1-voice" label="1B · Live voice dictation" width={W} height={H}><C1_Voice/></DCArtboard>
          <DCArtboard id="c1-parsed" label="1C · Parsed multi-order preview" width={W} height={H}><C1_Parsed/></DCArtboard>
        </DCSection>

        <DCSection id="c2" title="Concept 2 · Options Intent Studio" subtitle="Skip the 17-column chain. Describe a thesis — AI ranks strategies by EV and lets you tweak with sliders.">
          <DCArtboard id="c2-idle" label="2A · Describe your thesis" width={W} height={H}><C2_Idle/></DCArtboard>
          <DCArtboard id="c2-proposals" label="2B · Ranked strategy cards" width={W} height={H}><C2_Proposals/></DCArtboard>
          <DCArtboard id="c2-tweak" label="2C · Tweak & simulate" width={W} height={H}><C2_Tweak/></DCArtboard>
        </DCSection>

        <DCSection id="more" title="More ideas we didn't build yet" subtitle="A menu of other places agentic / NL UI removes friction in HedgeIQ.">
          <DCArtboard id="more-1" label="Catalog" width={1080} height={520}>
            <div style={{ padding:36, fontFamily:FX_FONT, color:FX_INK, height:'100%' }}>
              <Row style={{ gap:10, alignItems:'center' }}>
                <AIBadge/>
                <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:26, letterSpacing:-.4 }}>Where else agentic UI earns its keep</div>
              </Row>
              <div style={{ height:1, background:FX_BORDER, margin:'16px 0' }}/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  ['Dashboard · "Ask your portfolio"',            'Conversational summary replaces static widgets. "Why did I underperform this week?" → narrative + chart + 2 actions.'],
                  ['Positions · Smart triage',                    'AI ranks positions by "needs attention now" (stops, earnings, drift) instead of a flat alphabetical list.'],
                  ['Research · Thesis Workbench',                 'Type your thesis, AI scores it against 10-Ks, analyst reports, and sets disconfirming checkpoints.'],
                  ['Activity · "Tell me what happened"',          'Natural language filter: "trades I lost money on in tech last quarter" — no filter stack required.'],
                  ['Transfers · One-shot instructions',           '"Move $10k from savings to margin by Friday, then buy QQQ with half" — scheduled multi-step agent.'],
                  ['Tax · Year-end agent',                        'AI proposes specific lots to realize, races short-term deadlines, and drafts the TLH moves for approval.'],
                  ['Alerts · Generative triggers',                '"Alert me if AAPL breaks its 50-DMA while RSI > 70 and guidance changes." — compiled to rules.'],
                  ['Onboarding · Just paste your holdings',       'Paste a brokerage statement or Plaid-link; AI fills in cost basis, categorizes, flags weird lots.'],
                ].map(([t,s]) => (
                  <div key={t} style={{ padding:14, background:FX_SURFACE_2, border:`1px solid ${FX_BORDER}`, borderRadius:10 }}>
                    <Row style={{ gap:8, marginBottom:6 }}><Sparkle size={10}/><b style={{ fontSize:13 }}>{t}</b></Row>
                    <div style={{ fontSize:11.5, color:FX_MUTED, lineHeight:1.5 }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </DCArtboard>
        </DCSection>

      </DesignCanvas>
    </>
  );
}

Object.assign(window, { Futuristic });

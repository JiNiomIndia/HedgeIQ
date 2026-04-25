/**
 * WorkflowShowcase — sticky-scroll workflow with 4 steps.
 * Left column scrolls 4 step descriptions; right column has a sticky visual that
 * updates as the active step changes. Reference: vercel.com/home, stripe.com/payments.
 * @component
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const accent = '#8B5CF6';

const StepConnect = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 600 360" width="100%" height="100%" role="img" aria-label="Connect step visual: brokers piping into HedgeIQ">
    {['Robinhood', 'Fidelity', 'IBKR', 'Public'].map((b, i) => (
      <g key={b} opacity={active ? 1 : 0.3} style={{ transition: `opacity 0.6s ease ${i * 0.12}s` }}>
        <rect x={32} y={50 + i * 64} width="140" height="44" rx="10" fill="#11172A" stroke="#1E293B" />
        <text x={102} y={78 + i * 64} textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="600">{b}</text>
        <line x1="172" y1={72 + i * 64} x2="260" y2="180" stroke={accent} strokeWidth="1.5" strokeDasharray="4 4" opacity={active ? 0.6 : 0} style={{ transition: 'opacity 0.8s ease' }} />
      </g>
    ))}
    <rect x="260" y="155" width="140" height="50" rx="12" fill="#1A1F3A" stroke={accent} strokeWidth="1.5" />
    <text x="330" y="186" textAnchor="middle" fill={accent} fontSize="14" fontWeight="700">SnapTrade</text>
    <line x1="400" y1="180" x2="488" y2="180" stroke={accent} strokeWidth="1.5" strokeDasharray="4 4" opacity={active ? 0.8 : 0} style={{ transition: 'opacity 1s ease' }} />
    <rect x="488" y="155" width="80" height="50" rx="12" fill={accent} />
    <text x="528" y="186" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">HedgeIQ</text>
  </svg>
);

const StepSync = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 600 360" width="100%" height="100%" role="img" aria-label="Sync step visual: positions table populating">
    <rect x="20" y="20" width="560" height="320" rx="14" fill="#0B1120" stroke="#1E293B" />
    {['SYMBOL', 'BROKER', 'QTY', 'PRICE', 'P/L'].map((h, i) => (
      <text key={h} x={42 + i * 110} y={52} fill="#64748B" fontSize="11" letterSpacing="1">{h}</text>
    ))}
    <line x1="40" y1="64" x2="560" y2="64" stroke="#1E293B" />
    {[
      ['AAL', 'Robinhood', '5,000', '$10.97', '-$1,650', '#EF4444'],
      ['AAPL', 'Fidelity', '120', '$226.40', '+$840', '#10B981'],
      ['NVDA', 'IBKR', '50', '$498.20', '+$2,310', '#10B981'],
      ['TSLA', 'Public', '40', '$262.10', '+$420', '#10B981'],
      ['DOGE', 'Robinhood', '8,000', '$0.142', '-$80', '#EF4444'],
    ].map((r, i) => (
      <g key={i} opacity={active ? 1 : 0} style={{ transition: `opacity 0.4s ease ${i * 0.15}s` }}>
        <text x="42" y={92 + i * 36} fill="#E2E8F0" fontSize="13" fontWeight="600">{r[0]}</text>
        <text x="152" y={92 + i * 36} fill="#94A3B8" fontSize="13">{r[1]}</text>
        <text x="262" y={92 + i * 36} fill="#CBD5E1" fontSize="13" fontFamily="monospace">{r[2]}</text>
        <text x="372" y={92 + i * 36} fill="#CBD5E1" fontSize="13" fontFamily="monospace">{r[3]}</text>
        <text x="482" y={92 + i * 36} fill={r[5]} fontSize="13" fontWeight="600" fontFamily="monospace">{r[4]}</text>
      </g>
    ))}
  </svg>
);

const StepHedge = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 600 360" width="100%" height="100%" role="img" aria-label="Hedge step: calculator and recommendations">
    <rect x="20" y="20" width="220" height="320" rx="12" fill="#0B1120" stroke="#1E293B" />
    <text x="40" y="48" fill="#64748B" fontSize="10" letterSpacing="1">CALCULATE HEDGE</text>
    {[['Symbol', 'AAL'], ['Quantity', '5,000'], ['Entry', '$11.30'], ['Current', '$10.97']].map((row, i) => (
      <g key={row[0]}>
        <text x="40" y={80 + i * 50} fill="#64748B" fontSize="11">{row[0]}</text>
        <rect x="40" y={88 + i * 50} width="180" height="26" rx="4" fill="#0A0E1A" stroke="#1E293B" />
        <text x="50" y={106 + i * 50} fill="#E2E8F0" fontSize="12" fontFamily="monospace">{row[1]}</text>
      </g>
    ))}
    {[0, 1, 2].map(i => (
      <g key={i} transform={`translate(${active ? 260 : 620}, ${30 + i * 100})`} style={{ transition: `transform 0.7s ease ${0.4 + i * 0.2}s` }}>
        <rect width="320" height="84" rx="12" fill="#11172A" stroke={i === 0 ? accent : '#1E293B'} strokeWidth={i === 0 ? 1.5 : 1} />
        <text x="16" y="28" fill="#E2E8F0" fontSize="13" fontWeight="700">PUT ${10.5 - i * 0.25} · {30 - i * 7}d</text>
        <text x="16" y="48" fill="#64748B" fontSize="11">Cost ${1200 - i * 200} · Protects {95 - i * 6}% downside</text>
        <text x="16" y="68" fill="#64748B" fontSize="11">IV {38 - i * 2}% · Δ -0.{50 - i * 6}</text>
        <text x="304" y="44" textAnchor="end" fill="#10B981" fontSize="20" fontWeight="700">{(8.2 - i * 0.7).toFixed(1)}</text>
      </g>
    ))}
  </svg>
);

const StepDecide = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 600 360" width="100%" height="100%" role="img" aria-label="Decide step: AI streaming explanation">
    <rect x="20" y="20" width="560" height="320" rx="14" fill="#0B1120" stroke="#1E293B" />
    <circle cx="48" cy="56" r="14" fill={accent} />
    <text x="48" y="61" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">C</text>
    <text x="74" y="60" fill="#E2E8F0" fontSize="14" fontWeight="600">Claude</text>
    <text x="128" y="60" fill="#64748B" fontSize="11">· Anthropic</text>
    {[
      'The $10.50 put expires in 30 days. At $1,200 it costs',
      '4 cents per share to protect 5,000 shares against any',
      'drop below $10.50. Breakeven for the hedge sits at',
      '$10.26. Picked over the $10 strike for better value-',
      'per-dollar given the current 38% implied volatility.',
    ].map((line, i) => (
      <text
        key={i}
        x="40"
        y={110 + i * 32}
        fill="#CBD5E1"
        fontSize="14"
        opacity={active ? 1 : 0}
        style={{ transition: `opacity 0.4s ease ${0.2 + i * 0.4}s` }}
      >
        {line}
      </text>
    ))}
    <rect x="40" y={110 + 5 * 32} width="12" height="16" fill={accent} opacity={active ? 0.8 : 0}>
      <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const STEPS = [
  {
    n: 1,
    title: 'Connect',
    body: 'Link Fidelity, Robinhood, IBKR, or Public via SnapTrade in 30 seconds. Bank-grade OAuth — your broker credentials never touch our servers.',
    Visual: StepConnect,
  },
  {
    n: 2,
    title: 'Sync',
    body: 'Every account, every position, every broker streams into one unified table. Cross-broker exposure, P/L, and risk score refreshed in real time.',
    Visual: StepSync,
  },
  {
    n: 3,
    title: 'Hedge',
    body: 'Click any position to launch the hedge calculator. HedgeIQ scans the chain, filters by liquidity, and ranks the top three protective puts by value-per-dollar.',
    Visual: StepHedge,
  },
  {
    n: 4,
    title: 'Decide',
    body: "Claude explains each recommendation in plain English — why this strike, why this expiry, what it costs, what it protects. Ask follow-ups in natural language.",
    Visual: StepDecide,
  },
];

export default function WorkflowShowcase() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track active step from scroll position (sticky-scroll architecture)
  useEffect(() => {
    if (reduce) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            setActive(idx);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );
    stepRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [reduce]);

  if (reduce) {
    // Reduced motion: stacked, no sticky behavior
    return (
      <section id="how" style={{ padding: 'clamp(64px, 10vw, 120px) 24px', background: 'var(--surface-2)', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <header style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>How it works</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.6vw, 2.8rem)', lineHeight: 1.12, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)', fontWeight: 600 }}>
              From signup to hedge in four steps.
            </h2>
          </header>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {STEPS.map((s) => (
              <article key={s.n} data-testid="workflow-step" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 32 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 700, background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>0{s.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.4vw, 1.9rem)', margin: '12px 0', fontWeight: 600 }}>{s.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-muted)', margin: '0 0 24px' }}>{s.body}</p>
                <div style={{ aspectRatio: '600 / 360', borderRadius: 12, overflow: 'hidden', background: '#0F1424', border: '1px solid #1E293B' }}>
                  <s.Visual active={true} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="how" data-testid="workflow-showcase" style={{ background: 'var(--surface-2)', scrollMarginTop: 80 }}>
      <div style={{ padding: 'clamp(64px, 10vw, 120px) 24px 32px' }}>
        <header style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>How it works</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.6vw, 2.8rem)', lineHeight: 1.12, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)', fontWeight: 600 }}>
            From signup to hedge in four steps.
          </h2>
        </header>
      </div>

      <div ref={containerRef} className="landing-workflow-container" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="landing-workflow-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'flex-start' }}>
          {/* Left: scrolling step blocks */}
          <div>
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                ref={el => { stepRefs.current[i] = el; }}
                data-idx={i}
                data-testid="workflow-step"
                className="landing-workflow-step"
                style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBlock: 24 }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 80, fontWeight: 700, background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>
                  0{s.n}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', margin: '16px 0 12px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0, maxWidth: 520 }}>{s.body}</p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={active >= i ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    marginTop: 24,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 14px',
                    background: 'color-mix(in srgb, var(--accent) 14%, transparent)',
                    border: `1px solid ${accent}`,
                    borderRadius: 999,
                    width: 'fit-content',
                    color: accent,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6L9 17l-5-5"/></svg>
                  Step {s.n} complete
                </motion.div>
              </div>
            ))}
          </div>

          {/* Right: sticky visual */}
          <div className="landing-workflow-sticky" data-testid="workflow-sticky" style={{ position: 'sticky', top: 96, height: '100vh', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', aspectRatio: '600 / 360', background: '#0F1424', border: '1px solid #1E293B', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
              {STEPS.map((s, i) => (
                <div
                  key={s.n}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding: 24,
                    opacity: active === i ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                    pointerEvents: active === i ? 'auto' : 'none',
                  }}
                >
                  <s.Visual active={active === i} />
                </div>
              ))}
              {/* Step indicator pills */}
              <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
                {STEPS.map((_, i) => (
                  <div key={i} style={{ width: active === i ? 24 : 8, height: 6, borderRadius: 3, background: active === i ? accent : '#475569', transition: 'all 200ms ease' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

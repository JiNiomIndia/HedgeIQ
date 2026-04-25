/**
 * How it works — 4 numbered steps with mini-screenshot illustrations.
 * @component
 */
const STEPS = [
  { n: 1, title: 'Sign up & connect your broker', body: 'Free account in 30 seconds. Link Fidelity, IBKR, Robinhood, or Public via SnapTrade.', img: '/landing/dashboard.svg' },
  { n: 2, title: 'See all positions in one dashboard', body: 'Cross-broker exposure, P/L, and risk score. Refreshed in real time.', img: '/landing/position-drawer.svg' },
  { n: 3, title: 'Click "Find best hedge" on any position', body: 'Top 3 protective puts ranked by value-per-dollar, returned in under 60 seconds.', img: '/landing/hedge.svg' },
  { n: 4, title: 'Get explained recommendations', body: 'Claude tells you what each option does in plain English. Ask follow-ups.', img: '/landing/ai-chat.svg' },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{ padding: 'clamp(64px, 10vw, 120px) 24px', background: 'var(--surface-2)', scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>How it works</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.6vw, 2.8rem)', lineHeight: 1.12, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)', fontWeight: 600 }}>
            From signup to hedge in four steps.
          </h2>
        </div>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className="landing-how-row"
              style={{
                display: 'grid',
                gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
                gap: 48,
                alignItems: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: 32,
              }}
            >
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 999,
                  background: 'var(--accent)',
                  color: 'var(--accent-contrast)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 16,
                }}>{s.n}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 2vw, 1.7rem)', margin: '0 0 12px', color: 'var(--text)', fontWeight: 600, letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>{s.body}</p>
              </div>
              <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                <img src={s.img} alt="" loading="lazy" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)', display: 'block', boxShadow: 'var(--shadow-sm)' }} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

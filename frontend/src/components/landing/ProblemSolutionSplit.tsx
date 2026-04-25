/**
 * Two stacked sections: The Problem (editorial split) and The Solution (3 columns).
 * @component
 */
export default function ProblemSolutionSplit() {
  return (
    <>
      {/* Problem */}
      <section style={{ padding: 'clamp(64px, 10vw, 120px) 24px' }}>
        <div className="landing-prob-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16, fontWeight: 600 }}>The problem</p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3.4vw, 2.6rem)',
              lineHeight: 1.18,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
              fontWeight: 600,
              margin: 0,
              fontStyle: 'italic',
            }}>
              "Sunday night. US-Iran peace talks collapse. Oil up 4%."
            </h2>
          </div>
          <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: 32 }}>
            <p style={{ fontSize: 'clamp(1rem, 1.3vw, 1.15rem)', lineHeight: 1.65, color: 'var(--text-muted)', margin: 0 }}>
              5,000 shares of AAL. Entry $11.30. Currently $10.97. Tomorrow could be 10% lower.
              You have 30 minutes before futures open.
            </p>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px', background: 'var(--surface-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16, fontWeight: 600, textAlign: 'center' }}>The solution</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            textAlign: 'center',
            margin: '0 0 56px',
            fontWeight: 600,
            color: 'var(--text)',
          }}>
            Connect, analyze, decide.
          </h2>
          <div className="landing-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { num: '01', title: 'Connect', body: 'Link your brokers via SnapTrade. Fidelity, IBKR, Robinhood, Public supported.' },
              { num: '02', title: 'Analyze', body: 'Pick a position, get the top 3 protective puts ranked by value-per-dollar.' },
              { num: '03', title: 'Decide', body: 'Claude explains every option in 3 sentences. No jargon.' },
            ].map(s => (
              <div key={s.num} style={{ padding: 4 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', marginBottom: 16, letterSpacing: '0.1em' }}>{s.num}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', margin: '0 0 12px', color: 'var(--text)', fontWeight: 600 }}>{s.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

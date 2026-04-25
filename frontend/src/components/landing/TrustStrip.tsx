/**
 * Trust strip — single horizontal row of grayscale text marks.
 * @component
 */
export default function TrustStrip() {
  const marks = ['Anthropic Claude', 'Polygon.io', 'SnapTrade', 'ChromaDB', 'GitHub Actions'];
  return (
    <section style={{ padding: '32px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-subtle)', textAlign: 'center', marginBottom: 16 }}>
          Powered by
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 24, opacity: 0.75 }}>
          {marks.map(m => (
            <span key={m} style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '-0.01em', filter: 'grayscale(100%)' }}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

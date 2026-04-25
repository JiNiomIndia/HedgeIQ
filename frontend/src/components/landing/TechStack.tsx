/**
 * Tech stack badges + mini SVG architecture diagram.
 * @component
 */
const BADGES = [
  'Python 3.12', 'FastAPI', 'React 19', 'TypeScript', 'Vite',
  'Claude Haiku', 'Polygon.io', 'SnapTrade',
];

export default function TechStack() {
  return (
    <section style={{ padding: 'clamp(48px, 8vw, 96px) 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>Tech &amp; trust</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.18, letterSpacing: '-0.01em', margin: '0 0 16px', color: 'var(--text)', fontWeight: 600 }}>
          Built on the same stack as the most rigorous trading platforms.
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, maxWidth: 640, margin: '0 auto 36px' }}>
          Modern, audited, and observable. Every request is logged, every secret is encrypted at rest.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 56 }}>
          {BADGES.map(b => (
            <span key={b} style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 12px',
              border: '1px solid var(--border)',
              borderRadius: 999,
              background: 'var(--surface)',
              color: 'var(--text-muted)',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '-0.01em',
            }}>{b}</span>
          ))}
        </div>

        {/* arch diagram */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 32 }}>
          <svg viewBox="0 0 800 220" width="100%" style={{ maxWidth: 760, margin: '0 auto', display: 'block' }} role="img" aria-label="Architecture diagram: frontend connects to API, API to Anthropic, Polygon, and SnapTrade">
            {/* frontend */}
            <rect x="40" y="80" width="160" height="60" rx="8" fill="var(--surface-2)" stroke="var(--border-strong)"/>
            <text x="120" y="108" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="14" fontWeight="600" fill="var(--text)">Frontend</text>
            <text x="120" y="128" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--text-muted)">React · Vite · TS</text>

            {/* api */}
            <rect x="320" y="80" width="160" height="60" rx="8" fill="color-mix(in srgb, var(--accent) 10%, var(--surface))" stroke="var(--accent)"/>
            <text x="400" y="108" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="14" fontWeight="600" fill="var(--text)">HedgeIQ API</text>
            <text x="400" y="128" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--text-muted)">FastAPI · Python</text>

            {/* services */}
            <rect x="600" y="20" width="160" height="50" rx="8" fill="var(--surface-2)" stroke="var(--border-strong)"/>
            <text x="680" y="50" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="13" fontWeight="600" fill="var(--text)">Anthropic Claude</text>

            <rect x="600" y="85" width="160" height="50" rx="8" fill="var(--surface-2)" stroke="var(--border-strong)"/>
            <text x="680" y="115" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="13" fontWeight="600" fill="var(--text)">Polygon.io</text>

            <rect x="600" y="150" width="160" height="50" rx="8" fill="var(--surface-2)" stroke="var(--border-strong)"/>
            <text x="680" y="180" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="13" fontWeight="600" fill="var(--text)">SnapTrade</text>

            {/* lines */}
            <path d="M200 110 L320 110" stroke="var(--border-strong)" strokeWidth="1.5" fill="none" markerEnd="url(#a)"/>
            <path d="M480 105 C540 100 560 50 600 45" stroke="var(--border-strong)" strokeWidth="1.5" fill="none" markerEnd="url(#a)"/>
            <path d="M480 110 L600 110" stroke="var(--border-strong)" strokeWidth="1.5" fill="none" markerEnd="url(#a)"/>
            <path d="M480 115 C540 120 560 170 600 175" stroke="var(--border-strong)" strokeWidth="1.5" fill="none" markerEnd="url(#a)"/>

            <defs>
              <marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0 0 L6 3 L0 6 z" fill="var(--border-strong)"/>
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}

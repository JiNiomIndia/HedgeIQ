/**
 * 6-card feature grid — uses inline SVG icons (consistent with app's icon set).
 * @component
 */
import type { ReactNode } from 'react';

const Ic = ({ children }: { children: ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

const FEATURES = [
  {
    title: 'Unified portfolio dashboard',
    desc: 'Every account, every position, every broker — one tabular view, refreshed in real time.',
    icon: <Ic><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></Ic>,
  },
  {
    title: 'Smart hedge calculator',
    desc: 'Enter a position, get the top 3 protective puts ranked by value-per-dollar in under 60 seconds.',
    icon: <Ic><path d="M12 2l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></Ic>,
  },
  {
    title: 'Plain-English AI advisor',
    desc: 'Click any option for a 3-sentence Claude explanation. Ask follow-ups in natural language.',
    icon: <Ic><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6 6L4.5 4.5M19.5 19.5L18 18M6 18l-1.5 1.5M19.5 4.5L18 6"/></Ic>,
  },
  {
    title: 'Real-time options chain',
    desc: 'Live Polygon data with bid/ask, delta, IV, OI. Visualized payoff curves at expiry.',
    icon: <Ic><path d="M3 20V5m0 15h18"/><path d="M7 16l4-4 3 3 6-7"/></Ic>,
  },
  {
    title: 'Smart caching',
    desc: '24h Claude responses, 1h Polygon snapshots. Fast pages, low API spend, no stale data.',
    icon: <Ic><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>,
  },
  {
    title: 'Production-grade security',
    desc: 'PBKDF2 password hashing, JWT auth, strict CSP, WCAG 2.1 AA, encrypted at rest.',
    icon: <Ic><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Ic>,
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" style={{ padding: 'clamp(64px, 10vw, 120px) 24px', scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56, maxWidth: 720, marginInline: 'auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>Features</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.6vw, 2.8rem)', lineHeight: 1.12, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)', fontWeight: 600 }}>
            Everything you need to manage downside.
          </h2>
        </div>

        <div className="landing-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {FEATURES.map(f => (
            <article
              key={f.title}
              className="landing-feature-card"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 28,
                transition: 'transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                {f.icon}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--text-muted)' }}>{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

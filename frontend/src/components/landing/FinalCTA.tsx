/**
 * Final CTA band before footer.
 * @component
 */
import { Link } from 'react-router-dom';

export default function FinalCTA() {
  return (
    <section style={{ padding: 'clamp(64px, 10vw, 120px) 24px', background: 'var(--surface-2)' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3.6rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: '0 0 32px',
          color: 'var(--text)',
          fontWeight: 700,
        }}>
          Stop watching positions bleed.
        </h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/login"
            className="landing-cta"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-contrast)',
              padding: '14px 28px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              boxShadow: '0 6px 20px color-mix(in srgb, var(--accent) 30%, transparent)',
              transition: 'transform 120ms ease, filter 120ms ease',
            }}
          >
            Get started — free
          </Link>
          <Link
            to="/wiki"
            className="landing-cta-ghost"
            style={{
              border: '1px solid var(--border-strong)',
              padding: '13px 26px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--text)',
              background: 'transparent',
            }}
          >
            Read the docs
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Live demo invitation card with accent border.
 * @component
 */
import { Link } from 'react-router-dom';

export default function LiveDemoCard() {
  return (
    <section id="try" style={{ padding: 'clamp(48px, 8vw, 96px) 24px', scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{
          position: 'relative',
          padding: 'clamp(36px, 5vw, 56px)',
          borderRadius: 18,
          background: 'var(--surface)',
          border: '1.5px solid var(--accent)',
          boxShadow: '0 24px 60px color-mix(in srgb, var(--accent) 14%, transparent)',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(closest-side at 50% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>Try the live app</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)', lineHeight: 1.15, letterSpacing: '-0.01em', margin: '0 0 12px', color: 'var(--text)', fontWeight: 600 }}>
              Try it now with a free account.
            </h2>
            <p style={{ fontSize: 'clamp(1rem, 1.3vw, 1.15rem)', color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto 28px', lineHeight: 1.55 }}>
              5 AI calls per day, unlimited dashboard access. Upgrade to Pro for unlimited AI usage.
            </p>
            <Link
              to="/login"
              className="landing-cta"
              style={{
                display: 'inline-flex',
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
            <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-subtle)' }}>No credit card required.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

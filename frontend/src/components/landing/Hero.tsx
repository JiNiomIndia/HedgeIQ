/**
 * Hero section — eyebrow, large serif H1, dual CTAs, screenshot carousel.
 * @component
 */
import HeroCarousel from './HeroCarousel';

export default function Hero() {
  return (
    <section id="top" style={{ position: 'relative', padding: 'clamp(48px, 8vw, 96px) 24px 64px', overflow: 'hidden' }}>
      {/* radial glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '-10%',
          transform: 'translateX(-50%)',
          width: 1200,
          height: 700,
          background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, fontWeight: 500 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} />
          AI-powered portfolio hedging
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 6vw, 4.6rem)',
            lineHeight: 1.04,
            letterSpacing: '-0.02em',
            fontWeight: 700,
            color: 'var(--text)',
            margin: '0 auto 20px',
            maxWidth: 920,
          }}
        >
          Hedge your portfolio at midnight — in 60 seconds.
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 1.4vw, 1.25rem)', color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 auto 32px', maxWidth: 680 }}>
          Built from a real $2,355 loss. Now production-ready, with broker sync, options analysis,
          and an AI advisor that explains every decision in plain English.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
          <a
            href="/login"
            className="landing-cta"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-contrast)',
              padding: '13px 24px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              transition: 'transform 120ms ease, filter 120ms ease, box-shadow 120ms ease',
              boxShadow: '0 6px 20px color-mix(in srgb, var(--accent) 30%, transparent)',
            }}
          >
            Get started — free
          </a>
          <a
            href="#features"
            className="landing-cta-ghost"
            style={{
              border: '1px solid var(--border-strong)',
              color: 'var(--text)',
              padding: '12px 22px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
              background: 'transparent',
              transition: 'background 120ms ease, transform 120ms ease',
            }}
          >
            View live demo  →
          </a>
        </div>

        <HeroCarousel />
      </div>
    </section>
  );
}

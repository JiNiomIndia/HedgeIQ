/**
 * Shared layout for legal/info pages: simplified navbar + prose container + minimal footer.
 * @component
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import '../landing/landing.css';

interface Props {
  title: string;
  children: ReactNode;
}

export default function LegalLayout({ title, children }: Props) {
  useEffect(() => {
    document.documentElement.classList.add('landing-html');
    document.body.classList.add('landing-body');
    document.title = `${title} — HedgeIQ`;
    return () => {
      document.documentElement.classList.remove('landing-html');
      document.body.classList.remove('landing-body');
    };
  }, [title]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
      <header
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.01em',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 22,
                height: 22,
                borderRadius: 5,
                background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #000))',
              }}
            />
            HedgeIQ
          </Link>
          <Link to="/" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← Back to home
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 96px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 44px)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            margin: '0 0 32px',
            color: 'var(--text)',
          }}
        >
          {title}
        </h1>
        <div className="legal-prose" style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-muted)' }}>
          {children}
        </div>
      </main>

      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>
          © {new Date().getFullYear()} HedgeIQ ·{' '}
          <Link to="/privacy" style={{ color: 'var(--text-subtle)' }}>Privacy</Link> ·{' '}
          <Link to="/terms" style={{ color: 'var(--text-subtle)' }}>Terms</Link> ·{' '}
          <Link to="/security" style={{ color: 'var(--text-subtle)' }}>Security</Link> ·{' '}
          <Link to="/contact" style={{ color: 'var(--text-subtle)' }}>Contact</Link>
        </p>
      </footer>

      <style>{`
        .legal-prose h2 { color: var(--text); font-family: var(--font-display); font-size: 24px; font-weight: 500; letter-spacing: -0.01em; margin: 48px 0 16px; }
        .legal-prose h3 { color: var(--text); font-size: 18px; font-weight: 600; margin: 32px 0 12px; }
        .legal-prose p { margin: 0 0 16px; }
        .legal-prose ul { padding-left: 20px; margin: 0 0 16px; }
        .legal-prose li { margin-bottom: 8px; }
        .legal-prose a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
        .legal-prose strong { color: var(--text); }
        .legal-prose code { font-family: var(--font-mono, monospace); background: #11172A; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        .legal-prose blockquote { border-left: 3px solid var(--accent); padding: 12px 16px; margin: 16px 0; background: #11172A; border-radius: 0 8px 8px 0; }
      `}</style>
    </div>
  );
}

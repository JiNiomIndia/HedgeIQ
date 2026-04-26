/**
 * Sticky top navbar — transparent at top, blurred surface on scroll.
 * Uses react-router Link for in-app routes so navigation is SPA-fast.
 *
 * Includes a small theme switcher (Midnight / Meridian / Lumen / Terminal)
 * that writes to the unified `hedgeiq_theme` localStorage key and broadcasts
 * via the `hedgeiq:theme` custom event so the dashboard ThemeProvider
 * picks up the change live.
 * @component
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const THEMES = [
  { key: 'midnight', label: 'Midnight' },
  { key: 'meridian', label: 'Meridian' },
  { key: 'lumen', label: 'Lumen' },
  { key: 'terminal', label: 'Terminal' },
] as const;
const THEME_KEYS = THEMES.map(t => t.key) as readonly string[];

function readTheme(): string {
  try {
    const t = localStorage.getItem('hedgeiq_theme');
    if (t && THEME_KEYS.includes(t)) return t;
  } catch {
    /* ignore */
  }
  return 'midnight';
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<string>(readTheme);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cross-tab + cross-component theme sync.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'hedgeiq_theme' && e.newValue && THEME_KEYS.includes(e.newValue)) {
        setTheme(e.newValue);
        document.documentElement.setAttribute('data-theme', e.newValue);
      }
    }
    function onCustom(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (detail && THEME_KEYS.includes(detail)) setTheme(detail);
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('hedgeiq:theme', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hedgeiq:theme', onCustom as EventListener);
    };
  }, []);

  function applyTheme(name: string) {
    setTheme(name);
    try {
      localStorage.setItem('hedgeiq_theme', name);
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute('data-theme', name);
    try {
      window.dispatchEvent(new CustomEvent('hedgeiq:theme', { detail: name }));
    } catch {
      /* ignore */
    }
  }

  const linkStyle: React.CSSProperties = {
    fontSize: 14,
    color: 'var(--text-muted)',
    fontWeight: 500,
    transition: 'color 120ms ease',
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled ? 'color-mix(in srgb, var(--bg) 78%, transparent)' : 'transparent',
        backdropFilter: scrolled ? 'saturate(180%) blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'background 200ms ease, border-color 200ms ease',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          <span style={{ display: 'inline-block', width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #000))' }} />
          HedgeIQ
        </a>

        <nav className="landing-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <a href="#features" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>Features</a>
          <a href="#how" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>How it works</a>
          <a href="#faq" style={linkStyle} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>FAQ</a>
        </nav>

        <div className="landing-nav-cta" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className="landing-theme-switcher"
            role="group"
            aria-label="Theme"
            style={{
              display: 'inline-flex',
              padding: 2,
              background: 'color-mix(in srgb, var(--surface) 60%, transparent)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
          >
            {THEMES.map(t => {
              const active = t.key === theme;
              return (
                <button
                  key={t.key}
                  type="button"
                  data-theme-btn={t.key}
                  aria-pressed={active}
                  title={`${t.label} theme`}
                  onClick={() => applyTheme(t.key)}
                  style={{
                    padding: '4px 9px',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    background: active ? 'var(--surface)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--text-muted)',
                    border: 0,
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <Link to="/login" style={{ ...linkStyle, color: 'var(--text)' }}>Sign in</Link>
          <Link
            to="/login"
            className="landing-cta"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-contrast)',
              padding: '9px 16px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              transition: 'transform 120ms ease, filter 120ms ease',
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            Get started — free
          </Link>
        </div>

        <button
          className="landing-burger"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'none',
            width: 40,
            height: 40,
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6 L18 18 M6 18 L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="landing-mobile-menu" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a href="#features" onClick={() => setOpen(false)} style={{ color: 'var(--text)', padding: '8px 0' }}>Features</a>
          <a href="#how" onClick={() => setOpen(false)} style={{ color: 'var(--text)', padding: '8px 0' }}>How it works</a>
          <a href="#faq" onClick={() => setOpen(false)} style={{ color: 'var(--text)', padding: '8px 0' }}>FAQ</a>
          <div style={{ height: 1, background: 'var(--border)' }} />
          <Link to="/login" onClick={() => setOpen(false)} style={{ color: 'var(--text)', padding: '8px 0' }}>Sign in</Link>
          <Link to="/login" onClick={() => setOpen(false)} style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', padding: '11px 16px', borderRadius: 6, fontWeight: 600, textAlign: 'center' }}>Get started — free</Link>
        </div>
      )}
    </header>
  );
}

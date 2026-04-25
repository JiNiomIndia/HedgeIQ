/**
 * Trust & Security section — three blocks explaining where data lives.
 * Inline SVG icons (lucide-style: ShieldCheck, Database, Brain).
 * @component
 */

const ShieldCheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14a9 3 0 0 0 18 0V5" />
    <path d="M3 12a9 3 0 0 0 18 0" />
  </svg>
);

const BrainIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
  </svg>
);

const BLOCKS = [
  {
    Icon: ShieldCheckIcon,
    heading: 'Your broker credentials never touch our servers',
    body: (
      <>
        When you connect Robinhood, Fidelity, IBKR, or Public, OAuth tokens are held by{' '}
        <strong>SnapTrade</strong> — a SOC 2-certified broker connectivity platform used by Wealthsimple, Stake, Sharesies, and dozens of other consumer trading apps. HedgeIQ only ever sees a per-user opaque secret that lets SnapTrade fetch your positions on demand.
      </>
    ),
  },
  {
    Icon: DatabaseIcon,
    heading: 'Only public market data is stored',
    body: (
      <>
        Options chains, price history, and news headlines come from <strong>Polygon.io</strong> — the same market data backbone trusted by Robinhood, Webull, eToro, and Interactive Brokers. We cache responses in ChromaDB for 1–24 hours to keep the app fast. None of this data is yours; it's the same prices everyone else sees.
      </>
    ),
  },
  {
    Icon: BrainIcon,
    heading: 'AI prompts are sanitized and cached, never trained on',
    body: (
      <>
        Position context sent to <strong>Anthropic Claude</strong> is the contract details (symbol, strike, expiry) — not your account number, not your full holdings. Anthropic's API does not train on customer data by default, and HedgeIQ's prompts cache responses in ChromaDB so identical questions hit cache, not Claude.
      </>
    ),
  },
] as const;

const POWERED_BY = [
  { label: 'SnapTrade powers', items: ['Wealthsimple', 'Public', 'Stake', 'Sharesies', 'Stockal', 'M1 Finance partners'] },
  { label: 'Polygon.io powers', items: ['Robinhood', 'Webull', 'eToro', 'Interactive Brokers', 'TradingView'] },
  { label: 'Anthropic Claude powers', items: ['Notion AI', 'Slack AI', 'DuckDuckGo AI', 'Quora Poe'] },
];

export default function TrustSecurity() {
  return (
    <section
      id="trust"
      style={{
        padding: 'clamp(96px, 12vw, 160px) 24px',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
            Trust & Security
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.5vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontWeight: 500,
              margin: 0,
              color: 'var(--text)',
            }}
          >
            Your data stays{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent), #c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              where it belongs
            </span>
          </h2>
        </header>

        <div
          className="trust-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {BLOCKS.map(({ Icon, heading, body }) => (
            <article
              key={heading}
              className="trust-card"
              style={{
                background: '#11172A',
                border: '1px solid #1E293B',
                borderRadius: 12,
                padding: 24,
                transition: 'transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
              }}
            >
              <div style={{ color: '#8B5CF6', marginBottom: 16 }}>
                <Icon />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: '0 0 12px', lineHeight: 1.3 }}>
                {heading}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{body}</p>
            </article>
          ))}
        </div>

        <div style={{ marginTop: 64 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-subtle)',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            The same infrastructure powers
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {POWERED_BY.map(row => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {row.label}:
                </span>
                {row.items.map((item, i) => (
                  <span key={item} className="trust-platform" style={{ color: 'var(--text-subtle)', fontVariant: 'small-caps', letterSpacing: '0.04em', transition: 'color 150ms ease' }}>
                    {item}
                    {i < row.items.length - 1 && <span style={{ margin: '0 6px', color: 'var(--text-subtle)' }}>·</span>}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <p style={{ marginTop: 40, textAlign: 'center', fontSize: 12, fontStyle: 'italic', color: 'var(--text-subtle)', maxWidth: 720, marginInline: 'auto' }}>
          References based on public customer announcements and documentation. HedgeIQ is independent and not endorsed by any of these platforms or their customers.
        </p>
      </div>

      <style>{`
        .trust-card:hover {
          transform: translateY(-2px);
          border-color: #8B5CF6 !important;
          box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.25), 0 12px 32px rgba(139, 92, 246, 0.08);
        }
        .trust-platform:hover {
          color: var(--text) !important;
        }
      `}</style>
    </section>
  );
}

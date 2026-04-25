/**
 * 8-item FAQ accordion using native <details> element for accessibility.
 * @component
 */
const QA = [
  {
    q: 'Is my broker data secure?',
    a: 'Brokerage connections use SnapTrade, an SEC-compliant aggregator. We never see your broker password — you authenticate directly with the broker. On our side, every secret is encrypted at rest, passwords use PBKDF2-HMAC-SHA256 with 600k iterations, sessions use signed JWTs, and a strict CSP blocks third-party scripts.',
  },
  {
    q: 'How accurate is the AI advisor?',
    a: 'The advisor (Claude Haiku) reasons over real-time market data from Polygon.io and your actual position sizes — it doesn\'t hallucinate prices. Every recommendation cites a specific contract, strike, expiry, and cost. Numbers like value-per-dollar and break-even are computed deterministically; only the explanatory copy is generated.',
  },
  {
    q: 'Which brokers are supported?',
    a: 'Fidelity, Interactive Brokers (IBKR), Robinhood, and Public.com today via SnapTrade. Schwab and E*TRADE are on the roadmap. You can also enter positions manually if your broker isn\'t connected.',
  },
  {
    q: 'What\'s the daily AI limit?',
    a: 'Free accounts get 5 Claude calls per day (more than enough to run hedge analyses on a few positions). Pro removes the cap. Polygon market data and dashboard refreshes are always unlimited.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. HedgeIQ is a decision-support tool. We don\'t take custody of your assets, we don\'t place orders on your behalf, and we are not a registered investment advisor. Every recommendation is a starting point — review with your broker or RIA before trading.',
  },
  {
    q: 'How is options data sourced?',
    a: 'Polygon.io provides the live options chains, with bid/ask, IV, delta, gamma, and OI. Quotes are cached for up to 1 hour to keep latency low and API spend predictable. Spot prices refresh continuously during market hours.',
  },
  {
    q: 'Can I see the source code?',
    a: 'Yes — HedgeIQ is open source on GitHub. The frontend (React/TypeScript), the FastAPI backend, the test suite, and the deployment configs are all there. Pull requests welcome.',
  },
  {
    q: 'Where is data stored?',
    a: 'Application data lives on Railway (US-East) in an encrypted SQLite volume — user records, sessions, AI conversation history. Polygon and SnapTrade data is fetched on demand and cached briefly in memory. We never persist your full broker credentials.',
  },
];

export default function FAQAccordion() {
  return (
    <section id="faq" style={{ padding: 'clamp(64px, 10vw, 120px) 24px', scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>FAQ</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)', lineHeight: 1.12, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)', fontWeight: 600 }}>
            Common questions.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {QA.map((item) => (
            <details key={item.q} className="landing-faq-item" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 0' }}>
              <summary style={{
                listStyle: 'none',
                cursor: 'pointer',
                padding: '18px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                fontWeight: 600,
                fontSize: 15,
                color: 'var(--text)',
              }}>
                <span>{item.q}</span>
                <span className="landing-faq-chev" aria-hidden style={{ color: 'var(--text-subtle)', transition: 'transform 200ms ease', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </summary>
              <div style={{ padding: '0 22px 20px', color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.65 }}>
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

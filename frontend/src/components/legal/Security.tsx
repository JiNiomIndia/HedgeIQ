/**
 * Security at HedgeIQ — architecture, controls, testing.
 * @component
 */
import LegalLayout from './LegalLayout';

export default function Security() {
  return (
    <LegalLayout title="Security at HedgeIQ">
      <p>
        Security is not a feature; it's the foundation. This page describes the controls in place at v0.1 and the ones planned for the road to v1.
      </p>

      <h2>Architecture summary</h2>
      <p>
        HedgeIQ is a three-tier app: a React/Vite frontend on Vercel, a FastAPI/Python backend on Railway, and a SQLite database scoped to a writable persistent volume. Broker connectivity flows through SnapTrade; market data flows through Polygon.io; AI inference flows through Anthropic Claude. No customer-private data ever transits Polygon or stays at Anthropic.
      </p>
      <pre style={{ background: '#11172A', padding: 16, borderRadius: 8, overflowX: 'auto', fontSize: 12, lineHeight: 1.5, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{`Browser  ──HTTPS──>  Vercel (CDN + frontend)
                              │
                              └──HTTPS──>  Railway (FastAPI + SQLite)
                                                │
                                                ├──> SnapTrade (broker OAuth)
                                                ├──> Polygon.io (market data)
                                                └──> Anthropic (AI inference)`}</pre>

      <h2>Authentication</h2>
      <ul>
        <li>Passwords hashed with <strong>PBKDF2-HMAC-SHA256</strong>, <strong>100,000 iterations</strong>, per-user random 16-byte salt</li>
        <li>Verification uses <code>hmac.compare_digest</code> for timing-safe comparison</li>
        <li>No plaintext password is ever logged or returned in any API response</li>
      </ul>

      <h2>Tokens</h2>
      <ul>
        <li><strong>JWT HS256</strong> bearer tokens, signed with a server-side secret rotated quarterly</li>
        <li><strong>24-hour expiry</strong>; no refresh tokens at v0.1 — re-authenticate after expiry</li>
        <li>Bearer tokens are stored in <code>localStorage</code> (Pro tier may move to <code>HttpOnly</code> cookies once CSRF middleware is finalized)</li>
      </ul>

      <h2>Transport</h2>
      <ul>
        <li>HTTPS-only — both Vercel and Railway enforce TLS 1.2+ with modern ciphers</li>
        <li>HSTS enabled via Vercel and Railway defaults</li>
      </ul>

      <h2>Security headers</h2>
      <ul>
        <li><code>X-Content-Type-Options: nosniff</code></li>
        <li><code>X-Frame-Options: DENY</code></li>
        <li><code>Content-Security-Policy</code> — strict; explicit allow-list for Polygon, Anthropic, and inline styles required by the dashboard</li>
        <li><code>Permissions-Policy</code> — camera, microphone, geolocation all denied</li>
        <li><code>Referrer-Policy: strict-origin-when-cross-origin</code></li>
      </ul>

      <h2>CORS</h2>
      <p>Backend CORS is scoped to the production frontend origin and localhost for development. Wildcard origins are never used.</p>

      <h2>Data isolation</h2>
      <p>
        Every authenticated request validates the JWT, extracts the user ID, and the database query is scoped by that user ID at the SQLAlchemy layer. Integration tests verify zero cross-user data leak by constructing user A's JWT and attempting to read user B's positions — the test asserts a 404, not a 200 with empty data.
      </p>

      <h2>Rate limiting</h2>
      <ul>
        <li>Per-user daily AI call limit enforced server-side (5/day free, unlimited Pro)</li>
        <li>Generic rate-limiting middleware scaffolded; per-IP limits rolling out in v0.2</li>
      </ul>

      <h2>Testing</h2>
      <ul>
        <li><strong>226 backend tests</strong> covering auth, isolation, hedge analytics, SnapTrade integration</li>
        <li><strong>87 frontend tests</strong> covering components and routing</li>
        <li><strong>axe-core WCAG 2.1 AA</strong> automated a11y checks in CI</li>
        <li>p95 latency SLAs measured per endpoint; build fails if regressions exceed 20%</li>
      </ul>

      <h2>Vulnerability reporting</h2>
      <p>
        If you find a security issue, please email <a href="mailto:security@hedgeiq.app">security@hedgeiq.app</a>. We'll acknowledge within 48 hours and aim to patch critical issues within 7 days. Responsible disclosure is appreciated; please don't publicly disclose before we've patched.
      </p>

      <h2>Compliance status</h2>
      <p>
        HedgeIQ at v0.1 has not pursued formal SOC 2 certification. Our upstream processors — <strong>SnapTrade</strong> (SOC 2), <strong>Vercel</strong> (SOC 2), and <strong>Railway</strong> (SOC 2 in progress) — carry their own certifications. As HedgeIQ grows, we'll evaluate the cost-benefit of independent certification.
      </p>
    </LegalLayout>
  );
}

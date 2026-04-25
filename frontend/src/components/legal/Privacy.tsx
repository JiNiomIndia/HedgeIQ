/**
 * Privacy Policy — GDPR-aligned structure.
 * @component
 */
import LegalLayout from './LegalLayout';

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p><strong>Effective date:</strong> April 25, 2026</p>
      <p>
        This policy describes what data HedgeIQ collects, why we collect it, how it's protected, and your rights over it. We've structured it for GDPR alignment and we've kept the language plain on purpose.
      </p>

      <h2>1. Data we collect</h2>
      <h3>Account data</h3>
      <ul>
        <li><strong>Email address</strong> — provided at sign-up; used as your account identifier</li>
        <li><strong>Hashed password</strong> — PBKDF2-HMAC-SHA256 with 100,000 iterations and a per-user random salt; the original password is never stored or logged</li>
        <li><strong>Pro tier flag</strong> — boolean indicating subscription status</li>
        <li><strong>Daily AI call counter</strong> — per-day usage count for rate limiting (resets at UTC midnight)</li>
      </ul>
      <h3>SnapTrade reference</h3>
      <ul>
        <li><strong>Per-user opaque secret</strong> — issued by SnapTrade at sign-up, stored encrypted at rest. Allows SnapTrade to fetch your positions on your behalf when you trigger a sync. We cannot use it to log into your broker.</li>
      </ul>
      <h3>Usage data</h3>
      <ul>
        <li>API request logs (90 day retention) — method, path, status code, latency, anonymized IP</li>
        <li>AI prompt hashes — SHA-256 of normalized prompts, kept 24 hours for cache lookups</li>
      </ul>

      <h2>2. Data we do NOT collect</h2>
      <ul>
        <li><strong>Broker passwords or OAuth tokens.</strong> Held by SnapTrade. HedgeIQ never sees them.</li>
        <li><strong>Account numbers.</strong> HedgeIQ sees normalized positions (symbol, quantity, cost basis) — not the underlying account ID.</li>
        <li><strong>Real-time trades.</strong> HedgeIQ uses read-only broker access. We cannot place trades on your behalf.</li>
        <li><strong>Personal financial info beyond email.</strong> No SSN, no phone, no address, no payment details on the free tier.</li>
      </ul>

      <h2>3. Why we collect it</h2>
      <ul>
        <li><strong>Email</strong> — account identity and recovery</li>
        <li><strong>Hashed password</strong> — authentication</li>
        <li><strong>SnapTrade secret</strong> — enables your "connect broker" flow</li>
        <li><strong>Usage logs</strong> — rate limiting, abuse prevention, performance monitoring</li>
        <li><strong>AI prompt hashes</strong> — cache identical prompts so we hit cache, not Claude (cheaper for us, faster for you)</li>
      </ul>

      <h2>4. Third parties</h2>
      <p>HedgeIQ shares data with the following processors:</p>
      <ul>
        <li><strong>SnapTrade</strong> — broker connectivity. Their privacy policy governs OAuth tokens and broker data.</li>
        <li><strong>Polygon.io</strong> — market data. We send no user data; only ticker symbols.</li>
        <li><strong>Anthropic</strong> — AI inference. We send position context (symbol, strike, expiry) but no PII. Anthropic's API does not train on customer data by default.</li>
        <li><strong>Vercel</strong> — frontend hosting. Standard request analytics.</li>
        <li><strong>Railway</strong> — backend hosting. Infrastructure logs.</li>
      </ul>

      <h2>5. Your rights</h2>
      <ul>
        <li><strong>Access</strong> — your account email and Pro flag are returned by <code>GET /api/v1/auth/me</code> (full export endpoint planned)</li>
        <li><strong>Deletion</strong> — email contact@hedgeiq.app and we'll delete your account, hashed credentials, and SnapTrade reference within 30 days</li>
        <li><strong>Portability</strong> — your positions data lives at SnapTrade and can be exported directly via their dashboard</li>
        <li><strong>Correction</strong> — email us to update your account email</li>
        <li><strong>Objection</strong> — you can disconnect your broker at any time, which stops all SnapTrade data flow</li>
      </ul>

      <h2>6. Security</h2>
      <p>
        We use PBKDF2 password hashing, JWT bearer tokens with 24-hour expiry, strict CSP and security headers (X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy), GZip compression, HTTPS-only transport, and per-user data isolation verified by integration tests. We do not store anything in plaintext that should be hashed.
      </p>
      <p>
        See the <a href="/security">Security page</a> for the full architecture.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions, deletion requests, or concerns: <a href="mailto:contact@hedgeiq.app">contact@hedgeiq.app</a>.
      </p>

      <h2>8. Changes</h2>
      <p>
        We post any updates to this policy on this page with a revised effective date. Material changes will be announced by email.
      </p>
    </LegalLayout>
  );
}

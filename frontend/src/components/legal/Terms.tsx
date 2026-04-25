/**
 * Terms of Service.
 * @component
 */
import LegalLayout from './LegalLayout';

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service">
      <p><strong>Effective date:</strong> April 25, 2026</p>

      <h2>1. Service description</h2>
      <p>
        HedgeIQ is a hedging analytics tool. We help you analyze options-based hedges for equity positions, primarily protective puts. <strong>HedgeIQ is not a broker, not a registered investment advisor, and not a source of financial advice.</strong>
      </p>

      <h2>2. Not financial advice</h2>
      <blockquote>
        <strong>Important.</strong> HedgeIQ recommendations are educational. Options trading involves substantial risk of loss, including the possibility of losing more than your initial investment. Consult a licensed advisor before acting on any HedgeIQ output. Past performance does not predict future results.
      </blockquote>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Scrape, crawl, or programmatically extract data outside the documented API</li>
        <li>Abuse the AI call quota by automated requests or sharing accounts</li>
        <li>Reverse engineer, decompile, or attempt to extract our model prompts or business logic</li>
        <li>Use HedgeIQ to violate any law or any third party's rights</li>
        <li>Resell or redistribute HedgeIQ output as part of a commercial advisory service</li>
      </ul>

      <h2>4. Account responsibility</h2>
      <p>
        You're responsible for keeping your credentials safe. You're responsible for any actions taken on your account. If you suspect unauthorized access, contact us immediately at <a href="mailto:contact@hedgeiq.app">contact@hedgeiq.app</a>.
      </p>

      <h2>5. Free vs Pro tier</h2>
      <ul>
        <li><strong>Free</strong> — full hedge analytics, broker connection, 5 AI explanations per day. Permanent.</li>
        <li><strong>Pro</strong> — unlimited AI calls, advanced features. Pro pricing announced separately; this section will be updated when finalized.</li>
      </ul>

      <h2>6. AI limits</h2>
      <p>
        Free tier accounts are limited to <strong>5 AI calls per day</strong>, where one "call" is one prompt to Claude. Pro tier accounts have no per-day call limit, subject to fair use. Quota resets at UTC midnight.
      </p>

      <h2>7. Broker connections</h2>
      <p>
        Broker connections are powered by <strong>SnapTrade</strong>. By connecting a broker, you agree to SnapTrade's terms of service in addition to these terms. HedgeIQ has read-only access; we cannot place trades on your behalf.
      </p>

      <h2>8. Termination</h2>
      <p>
        Either party can terminate at any time. We may suspend accounts that violate these terms. Upon termination, your account and SnapTrade reference are deleted within 30 days. Logs may persist longer per our retention policy.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        HedgeIQ is provided <strong>"as is"</strong> with no warranty, express or implied. We are not liable for any trading losses, missed opportunities, broker downtime, or third-party data errors. Your maximum recoverable damages from us are limited to the total fees you've paid HedgeIQ in the 12 months preceding the claim, which on the free tier is zero.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-laws principles. (Placeholder — finalized jurisdiction announced when HedgeIQ incorporates.)
      </p>

      <h2>11. Disputes</h2>
      <p>
        Any dispute is first attempted in good-faith negotiation, then in binding arbitration under AAA Commercial Rules, then — if both prior steps fail — in courts of competent jurisdiction in Delaware.
      </p>

      <h2>12. Changes</h2>
      <p>
        Updates are posted on this page with a revised effective date. Material changes will be announced by email. Continued use after changes constitutes acceptance.
      </p>
    </LegalLayout>
  );
}

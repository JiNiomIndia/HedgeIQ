/**
 * Contact page.
 * @component
 */
import LegalLayout from './LegalLayout';

export default function Contact() {
  return (
    <LegalLayout title="Contact">
      <p>
        We're a small team. Expect 24–48 hour response on weekdays.
      </p>

      <h2>General</h2>
      <p>
        <a href="mailto:contact@hedgeiq.app">contact@hedgeiq.app</a> — questions, account help, partnership inquiries, deletion requests
      </p>

      <h2>Security disclosure</h2>
      <p>
        <a href="mailto:security@hedgeiq.app">security@hedgeiq.app</a> — vulnerability reports. We acknowledge within 48 hours. See the <a href="/security">Security page</a> for our disclosure policy.
      </p>

      <h2>GitHub</h2>
      <p>
        Bug reports, feature requests, and discussions live in the open at{' '}
        <a href="https://github.com/JiNiomIndia/HedgeIQ" target="_blank" rel="noreferrer">github.com/JiNiomIndia/HedgeIQ</a>.
      </p>
      <p>
        File a bug:{' '}
        <a href="https://github.com/JiNiomIndia/HedgeIQ/issues/new" target="_blank" rel="noreferrer">github.com/JiNiomIndia/HedgeIQ/issues/new</a>
      </p>

      <h2>Press</h2>
      <p>
        We don't have a press kit yet. If you're writing about HedgeIQ, email contact@hedgeiq.app and we'll send what we have.
      </p>
    </LegalLayout>
  );
}

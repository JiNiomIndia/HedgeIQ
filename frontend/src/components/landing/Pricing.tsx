/**
 * Pricing — three-tier pricing section. Pro tier emphasized.
 * Reference: stripe.com/pricing.
 * @component
 */
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

type Tier = {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  emphasized?: boolean;
  cta: { label: string; to: string };
  features: { label: string; included: boolean }[];
};

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    tagline: 'Get started',
    cta: { label: 'Get started', to: '/login' },
    features: [
      { label: '5 AI calls / day', included: true },
      { label: '1 broker connection', included: true },
      { label: 'Real-time data', included: true },
      { label: 'Position alerts', included: false },
      { label: 'Multi-account', included: false },
      { label: 'API access', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$19',
    cadence: '/ month',
    tagline: 'For active hedgers',
    emphasized: true,
    cta: { label: 'Start Pro trial', to: '/login' },
    features: [
      { label: 'Unlimited AI calls', included: true },
      { label: 'All 4 brokers', included: true },
      { label: 'Real-time data', included: true },
      { label: 'Position alerts', included: true },
      { label: 'Multi-account', included: false },
      { label: 'API access', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    name: 'Team',
    price: '$99',
    cadence: '/ month',
    tagline: 'For trading desks',
    cta: { label: 'Contact sales', to: '/contact' },
    features: [
      { label: 'Unlimited AI calls', included: true },
      { label: 'All 4 brokers', included: true },
      { label: 'Real-time data', included: true },
      { label: 'Position alerts', included: true },
      { label: 'Multi-account (5 seats)', included: true },
      { label: 'API access', included: true },
      { label: 'Priority support', included: true },
    ],
  },
];

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6L9 17l-5-5"/></svg>
);
const Dash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" aria-hidden><path d="M5 12h14"/></svg>
);

export default function Pricing() {
  const reduce = useReducedMotion();

  return (
    <section id="pricing" style={{ padding: 'clamp(64px, 10vw, 120px) 24px', scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 56, maxWidth: 720, marginInline: 'auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>Pricing</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.6vw, 2.8rem)', lineHeight: 1.12, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)', fontWeight: 600 }}>
            Choose{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              your plan
            </span>
          </h2>
        </header>

        <div className="landing-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 360px))', gap: 24, justifyContent: 'center', alignItems: 'stretch' }}>
          {TIERS.map((t, i) => (
            <motion.article
              key={t.name}
              data-testid="pricing-tier"
              data-emphasized={t.emphasized ? 'true' : 'false'}
              className={`landing-pricing-card${t.emphasized ? ' is-emphasized' : ''}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: t.emphasized ? -8 : 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.1 }}
              style={{
                position: 'relative',
                background: t.emphasized ? '#151D33' : 'var(--surface)',
                border: `1px solid ${t.emphasized ? 'transparent' : 'var(--border)'}`,
                borderRadius: 16,
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              {t.emphasized && (
                <span
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)',
                    padding: '6px 10px',
                    borderRadius: 999,
                  }}
                >
                  Most popular
                </span>
              )}

              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, margin: 0, color: 'var(--text)' }}>{t.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{t.tagline}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{t.price}</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{t.cadence}</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {t.features.map(f => (
                  <li key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: f.included ? 'var(--text)' : 'var(--text-subtle)' }}>
                    {f.included ? <Check /> : <Dash />}
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={t.cta.to}
                className={t.emphasized ? 'landing-cta' : 'landing-cta-ghost'}
                style={{
                  textDecoration: 'none',
                  textAlign: 'center',
                  padding: '12px 18px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  background: t.emphasized ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'transparent',
                  color: t.emphasized ? '#fff' : 'var(--text)',
                  border: t.emphasized ? '1px solid transparent' : '1px solid var(--border-strong)',
                }}
              >
                {t.cta.label}
              </Link>
            </motion.article>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, fontStyle: 'italic', color: 'var(--text-subtle)' }}>
          Pro and Team pricing finalized at GA. Free tier permanent.
        </p>
      </div>
    </section>
  );
}

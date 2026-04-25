/**
 * BentoGrid — modern bento-style feature grid with varying card sizes.
 * Reference: linear.app/features. Replaces the uniform FeatureGrid.
 * @component
 */
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const Ic = ({ children }: { children: ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

// ----- Mini visuals (hand-coded, app-data-driven) -----

const VisUnifiedPortfolio = () => (
  <svg viewBox="0 0 360 200" width="100%" height="100%" role="img" aria-label="Unified portfolio table preview">
    <rect x="8" y="8" width="344" height="184" rx="10" fill="#0B1120" stroke="#1E293B" />
    <text x="22" y="32" fill="#64748B" fontSize="10" letterSpacing="1">SYMBOL</text>
    <text x="120" y="32" fill="#64748B" fontSize="10" letterSpacing="1">QTY</text>
    <text x="200" y="32" fill="#64748B" fontSize="10" letterSpacing="1">PRICE</text>
    <text x="280" y="32" fill="#64748B" fontSize="10" letterSpacing="1">P/L</text>
    <line x1="20" y1="40" x2="340" y2="40" stroke="#1E293B" />
    {[
      ['AAL', '5,000', '$10.97', '-$1,650', '#EF4444'],
      ['AAPL', '120', '$226.40', '+$840', '#10B981'],
      ['DOGE', '8,000', '$0.142', '-$80', '#EF4444'],
      ['NVDA', '50', '$498.20', '+$2,310', '#10B981'],
    ].map((row, i) => (
      <g key={i} transform={`translate(0 ${56 + i * 32})`}>
        <text x="22" y="0" fill="#E2E8F0" fontSize="12" fontWeight="600">{row[0]}</text>
        <text x="120" y="0" fill="#94A3B8" fontSize="12" fontFamily="monospace">{row[1]}</text>
        <text x="200" y="0" fill="#CBD5E1" fontSize="12" fontFamily="monospace">{row[2]}</text>
        <text x="280" y="0" fill={row[4]} fontSize="12" fontWeight="600" fontFamily="monospace">{row[3]}</text>
      </g>
    ))}
  </svg>
);

const VisAIChat = () => (
  <svg viewBox="0 0 320 140" width="100%" height="100%" role="img" aria-label="Claude AI chat preview">
    <rect x="8" y="8" width="304" height="124" rx="10" fill="#0B1120" stroke="#1E293B" />
    <circle cx="28" cy="32" r="10" fill="#8B5CF6" />
    <text x="28" y="36" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">C</text>
    <text x="46" y="36" fill="#E2E8F0" fontSize="11" fontWeight="600">Claude</text>
    <rect x="46" y="46" width="244" height="68" rx="8" fill="#11172A" stroke="#1E293B" />
    <text x="58" y="66" fill="#CBD5E1" fontSize="11">The $10.50 put protects 95% of your</text>
    <text x="58" y="82" fill="#CBD5E1" fontSize="11">downside for $1,200. Best value-per-</text>
    <text x="58" y="98" fill="#CBD5E1" fontSize="11">dollar at current 38% IV.</text>
  </svg>
);

const VisHedgeRanked = () => (
  <svg viewBox="0 0 360 220" width="100%" height="100%" role="img" aria-label="Ranked hedge recommendations">
    {[
      ['PUT $10.50', '30d', '$1,200', '8.2', '#10B981', true],
      ['PUT $10.00', '30d', '$760', '7.4', '#10B981', false],
      ['PUT $11.00', '14d', '$1,940', '6.1', '#F59E0B', false],
    ].map((row, i) => (
      <g key={i} transform={`translate(8 ${10 + i * 64})`}>
        <rect width="344" height="56" rx="10" fill="#0B1120" stroke={row[5] ? '#8B5CF6' : '#1E293B'} strokeWidth={row[5] ? 1.5 : 1} />
        <text x="14" y="22" fill="#E2E8F0" fontSize="12" fontWeight="700">{row[0] as string}</text>
        <text x="14" y="42" fill="#64748B" fontSize="11">{row[1]} · {row[2]} · cost</text>
        <text x="332" y="34" textAnchor="end" fill={row[4] as string} fontSize="20" fontWeight="700" fontFamily="monospace">{row[3]}</text>
      </g>
    ))}
  </svg>
);

const VisCache = () => (
  <svg viewBox="0 0 200 140" width="100%" height="100%" role="img" aria-label="Cache hit and miss illustration">
    <circle cx="100" cy="70" r="44" fill="none" stroke="#1E293B" strokeWidth="2" />
    <path d="M 100 70 L 100 26 A 44 44 0 0 1 138 92 Z" fill="#10B981" opacity="0.7" />
    <text x="100" y="68" textAnchor="middle" fill="#E2E8F0" fontSize="22" fontWeight="700" fontFamily="monospace">87%</text>
    <text x="100" y="84" textAnchor="middle" fill="#94A3B8" fontSize="9" letterSpacing="1">CACHE HIT</text>
  </svg>
);

const VisOptionsLadder = () => (
  <svg viewBox="0 0 220 140" width="100%" height="100%" role="img" aria-label="Options chain ladder">
    {[10, 10.5, 11, 11.5, 12].map((strike, i) => (
      <g key={i} transform={`translate(0 ${10 + i * 24})`}>
        <text x="14" y="14" fill="#94A3B8" fontSize="10" fontFamily="monospace">${strike.toFixed(2)}</text>
        <rect x="60" y="4" width={40 + i * 12} height="14" rx="2" fill="#10B981" opacity={0.2 + i * 0.12} />
        <rect x={150} y="4" width={70 - i * 10} height="14" rx="2" fill="#EF4444" opacity={0.5 - i * 0.08} />
      </g>
    ))}
  </svg>
);

const VisSecurity = () => (
  <svg viewBox="0 0 460 130" width="100%" height="100%" role="img" aria-label="Security badges">
    {['PBKDF2', 'JWT auth', 'CSP strict', 'WCAG AA', 'TLS 1.3'].map((t, i) => (
      <g key={t} transform={`translate(${10 + i * 90}, 50)`}>
        <rect width="80" height="32" rx="16" fill="#0B1120" stroke="#8B5CF6" strokeOpacity="0.4" />
        <circle cx="14" cy="16" r="3" fill="#10B981" />
        <text x="40" y="20" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="500">{t}</text>
      </g>
    ))}
  </svg>
);

// ----- Cards -----

type Card = {
  title: string;
  desc: string;
  icon: ReactNode;
  visual: ReactNode;
  area: string; // grid-area shorthand for desktop
};

const CARDS: Card[] = [
  {
    title: 'Unified portfolio',
    desc: 'Every account, every position, every broker — one tabular view, refreshed in real time.',
    icon: <Ic><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></Ic>,
    visual: <VisUnifiedPortfolio />,
    area: '1 / 1 / 3 / 3',
  },
  {
    title: 'AI advisor',
    desc: 'Claude explains every recommendation in plain English. Ask follow-ups in natural language.',
    icon: <Ic><circle cx="12" cy="12" r="9"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></Ic>,
    visual: <VisAIChat />,
    area: '1 / 3 / 2 / 5',
  },
  {
    title: 'Smart hedge',
    desc: 'Top 3 protective puts ranked by value-per-dollar. Returned in under 60 seconds.',
    icon: <Ic><path d="M12 2l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></Ic>,
    visual: <VisHedgeRanked />,
    area: '2 / 3 / 4 / 5',
  },
  {
    title: 'Smart caching',
    desc: '24h Claude responses, 1h Polygon snapshots. Fast pages, low API spend.',
    icon: <Ic><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>,
    visual: <VisCache />,
    area: '3 / 1 / 4 / 2',
  },
  {
    title: 'Real-time chains',
    desc: 'Polygon live data: bid, ask, delta, IV, OI. Ladder visualization at a glance.',
    icon: <Ic><path d="M3 20V5m0 15h18"/><path d="M7 16l4-4 3 3 6-7"/></Ic>,
    visual: <VisOptionsLadder />,
    area: '3 / 2 / 4 / 3',
  },
  {
    title: 'Production security',
    desc: 'PBKDF2 hashing, JWT auth, strict CSP, WCAG 2.1 AA, encrypted at rest.',
    icon: <Ic><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Ic>,
    visual: <VisSecurity />,
    area: '4 / 1 / 5 / 5',
  },
];

export default function BentoGrid() {
  const reduce = useReducedMotion();

  return (
    <section id="features" style={{ padding: 'clamp(64px, 10vw, 120px) 24px', scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56, maxWidth: 720, marginInline: 'auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 14 }}>Features</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.6vw, 2.8rem)', lineHeight: 1.12, letterSpacing: '-0.01em', margin: 0, color: 'var(--text)', fontWeight: 600 }}>
            Everything you need to manage downside.
          </h2>
        </div>

        <div
          className="landing-bento-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, minmax(140px, auto))',
            gap: 16,
          }}
        >
          {CARDS.map((c, i) => (
            <motion.article
              key={c.title}
              className="landing-bento-card"
              data-testid="bento-card"
              style={{ gridArea: c.area }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: reduce ? 0.2 : 0.5, delay: reduce ? 0 : i * 0.08 }}
            >
              <div className="landing-bento-card-inner">
                <div className="landing-bento-head">
                  <div className="landing-bento-icon">{c.icon}</div>
                  <div>
                    <h3 className="landing-bento-title">{c.title}</h3>
                    <p className="landing-bento-desc">{c.desc}</p>
                  </div>
                </div>
                <div className="landing-bento-visual">{c.visual}</div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

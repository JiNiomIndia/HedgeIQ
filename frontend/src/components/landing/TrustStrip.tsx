/**
 * Trust strip — single horizontal row of grayscale text marks.
 * @component
 */
import { motion, useReducedMotion } from 'framer-motion';

export default function TrustStrip() {
  const marks = ['Anthropic Claude', 'Polygon.io', 'SnapTrade', 'ChromaDB', 'GitHub Actions'];
  const reduce = useReducedMotion();
  return (
    <section style={{ padding: '32px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-subtle)', textAlign: 'center', marginBottom: 16 }}>
          Powered by
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 24, opacity: 0.75 }}>
          {marks.map((m, i) => (
            <motion.span
              key={m}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -10 }}
              whileInView={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: reduce ? 0.2 : 0.4, delay: reduce ? 0 : i * 0.08 }}
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '-0.01em', filter: 'grayscale(100%)' }}
            >
              {m}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

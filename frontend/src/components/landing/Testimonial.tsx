/**
 * Single large founder quote in serif.
 * @component
 */
import { motion, useReducedMotion } from 'framer-motion';

export default function Testimonial() {
  const reduce = useReducedMotion();
  return (
    <section style={{ padding: 'clamp(64px, 10vw, 120px) 24px', background: 'var(--surface-2)' }}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: reduce ? 0.2 : 0.6 }}
        style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1" style={{ margin: '0 auto 24px', opacity: 0.7 }}>
          <path d="M7 7h4v4H7c0 3 1 5 4 5v2c-5 0-7-3-7-7V7zM15 7h4v4h-4c0 3 1 5 4 5v2c-5 0-7-3-7-7V7z"/>
        </svg>
        <blockquote style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
          lineHeight: 1.3,
          fontStyle: 'italic',
          color: 'var(--text)',
          margin: '0 0 28px',
          fontWeight: 500,
          letterSpacing: '-0.005em',
        }}>
          I lost $2,355 in one Sunday night because I couldn't price a hedge in time.
          So I built the tool I wish I'd had.
        </blockquote>
        <p style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 40, fontWeight: 600 }}>
          — the founder
        </p>
        <div style={{ height: 1, background: 'var(--border)', margin: '0 auto 32px', maxWidth: 200 }} />
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)', lineHeight: 1.4, color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
          What if you'd had 60 seconds to find the right hedge?
        </p>
      </motion.div>
    </section>
  );
}

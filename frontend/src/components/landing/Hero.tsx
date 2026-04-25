/**
 * Hero — dark, cinematic, demo-forward.
 * Two-column on desktop: copy left, animated LiveDemoWidget right.
 * @component
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

import LiveDemoWidget from './LiveDemoWidget';
import VideoModal from './VideoModal';

export default function Hero() {
  const [modalOpen, setModalOpen] = useState(false);
  const reduce = useReducedMotion();
  const baseT = (delay: number) => reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay } };

  return (
    <section
      id="top"
      className="hero-v2"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#0A0E1A',
        color: '#F8FAFC',
      }}
    >
      {/* Radial gradient overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.18), transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Noise texture (inline SVG) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          mixBlendMode: 'overlay',
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        className="hero-v2-inner"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1280,
          margin: '0 auto',
          padding: '24px',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="hero-v2-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 48,
            alignItems: 'center',
            width: '100%',
            paddingTop: 80,
            paddingBottom: 80,
          }}
        >
          <div className="hero-v2-copy" style={{ maxWidth: 560 }}>
            <motion.p
              {...baseT(0)}
              style={{
                fontSize: 12,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#A78BFA',
                fontWeight: 600,
                margin: '0 0 24px',
              }}
            >
              AI-Powered Portfolio Hedging
            </motion.p>

            <motion.h1
              {...baseT(0.1)}
              style={{
                fontFamily: 'var(--font-display, Fraunces, Georgia, serif)',
                fontSize: 'clamp(3rem, 7vw, 6rem)',
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                color: '#F8FAFC',
                margin: 0,
              }}
            >
              Hedge your portfolio at midnight — in{' '}
              <span
                className="grad"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                60 seconds
              </span>
              .
            </motion.h1>

            <motion.p
              {...baseT(0.2)}
              style={{
                fontFamily: 'var(--font-sans, Inter Tight, Inter, sans-serif)',
                fontSize: 18,
                lineHeight: 1.55,
                color: '#94A3B8',
                maxWidth: '60ch',
                margin: '24px 0 0',
              }}
            >
              Built from a real $2,355 loss. Production-ready, with broker sync, options analysis,
              and an AI advisor that explains every decision in plain English.
            </motion.p>

            <motion.div
              {...baseT(0.3)}
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 32,
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/login"
                className="landing-cta"
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  boxShadow: '0 8px 24px rgba(139,92,246,0.35)',
                  transition: 'transform 120ms ease, filter 120ms ease',
                }}
              >
                Get started — free
              </Link>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="landing-cta-ghost"
                style={{
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#F8FAFC',
                  padding: '13px 26px',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 120ms ease, transform 120ms ease',
                }}
              >
                Watch demo
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0.2 : 0.6, delay: reduce ? 0 : 0.4 }}
            className="hero-v2-demo"
            style={{
              width: '100%',
              maxWidth: 640,
              justifySelf: 'start',
            }}
          >
            <LiveDemoWidget />
          </motion.div>
        </div>
      </div>

      <VideoModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <style>{`
        @media (min-width: 1024px) {
          .hero-v2 .hero-v2-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }
          .hero-v2 .hero-v2-demo {
            justify-self: end !important;
          }
        }
        @media (max-width: 1023px) {
          .hero-v2 .hero-v2-inner {
            min-height: auto !important;
          }
          .hero-v2 .hero-v2-grid {
            padding-top: 80px !important;
            padding-bottom: 64px !important;
          }
          .hero-v2 .hero-v2-demo {
            justify-self: center !important;
          }
        }
      `}</style>
    </section>
  );
}

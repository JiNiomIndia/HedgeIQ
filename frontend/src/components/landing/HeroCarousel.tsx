/**
 * Auto-advancing carousel showing 5 product screenshots.
 * Pauses on hover; respects prefers-reduced-motion.
 * @component
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const SLIDES = [
  { src: '/landing/dashboard.svg',       alt: 'Unified portfolio dashboard',   caption: 'Unified dashboard' },
  { src: '/landing/hedge.svg',           alt: 'Hedge calculator results',      caption: 'Hedge calculator' },
  { src: '/landing/ai-chat.svg',         alt: 'AI advisor chat',               caption: 'Plain-English AI advisor' },
  { src: '/landing/options-chain.svg',   alt: 'Live options chain with payoff',caption: 'Real-time options chain' },
  { src: '/landing/position-drawer.svg', alt: 'Per-position drawer',           caption: 'Position deep-dive' },
];

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const next = useCallback(() => setI(p => (p + 1) % SLIDES.length), []);
  const prev = useCallback(() => setI(p => (p - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused || reduced.current) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto',
        borderRadius: 14,
        overflow: 'hidden',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 30px 80px rgba(20,27,45,0.18), 0 4px 16px rgba(20,27,45,0.06)',
        aspectRatio: '16 / 10',
      }}
      role="region"
      aria-label="Product screenshot carousel"
              aria-live="polite"
    >
      {SLIDES.map((s, idx) => (
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: idx === i ? 1 : 0,
            transition: 'opacity 700ms ease',
            pointerEvents: idx === i ? 'auto' : 'none',
          }}
        />
      ))}

      {/* caption */}
      <div style={{ position: 'absolute', left: 20, bottom: 20, padding: '6px 12px', background: 'color-mix(in srgb, var(--bg) 85%, transparent)', backdropFilter: 'blur(10px)', borderRadius: 999, fontSize: 12, fontWeight: 500, color: 'var(--text)', border: '1px solid var(--border)' }}>
        {SLIDES[i].caption}
      </div>

      {/* arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        style={arrowBtn('left')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        style={arrowBtn('right')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
      </button>

      {/* dots */}
      <div style={{ position: 'absolute', right: 20, bottom: 20, display: 'flex', gap: 6 }}>
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === i}
            onClick={() => setI(idx)}
            style={{
              width: idx === i ? 22 : 8,
              height: 8,
              borderRadius: 999,
              background: idx === i ? 'var(--accent)' : 'color-mix(in srgb, var(--text) 30%, transparent)',
              transition: 'all 250ms ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function arrowBtn(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 16,
    width: 40,
    height: 40,
    borderRadius: 999,
    background: 'color-mix(in srgb, var(--bg) 85%, transparent)',
    backdropFilter: 'blur(10px)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  } as React.CSSProperties;
}

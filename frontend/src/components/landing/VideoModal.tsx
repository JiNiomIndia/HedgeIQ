/**
 * VideoModal — placeholder modal for the "Watch demo" CTA.
 * Real Playwright recording is deferred; for now we show an honest message
 * and re-render the LiveDemoWidget at larger scale for full effect.
 * Closes on click-outside, Escape, or X button.
 * @component
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import LiveDemoWidget from './LiveDemoWidget';

export default function VideoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="HedgeIQ product demo"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(5, 8, 16, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'hedgeiq-modal-fade 200ms ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1100,
          background: '#0A0E1A',
          border: '1px solid #1E293B',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: '1px solid #1E293B',
            background: '#11172A',
            color: '#F8FAFC',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: 16, paddingRight: 40 }}>
          <p style={{
            margin: 0,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#A78BFA',
            fontWeight: 600,
          }}>
            Live demo
          </p>
          <h3 style={{
            margin: '6px 0 6px',
            fontFamily: 'var(--font-display, Fraunces, serif)',
            fontSize: 22,
            color: '#F8FAFC',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}>
            Interactive product walkthrough
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>
            Full product walkthrough video coming soon. Try the interactive demo widget below,
            or <Link to="/login" style={{ color: '#A78BFA' }}>start the free trial</Link> for the real thing.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LiveDemoWidget scale={1.4} />
        </div>
      </div>

      <style>{`
        @keyframes hedgeiq-modal-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

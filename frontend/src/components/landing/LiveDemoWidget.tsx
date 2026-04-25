/**
 * LiveDemoWidget — self-running 30s loop showing the HedgeIQ flow.
 * Pure CSS keyframes + React useState/setTimeout. No animation libraries.
 *
 * Scene timing (ms, cumulative):
 *   0       form fill begins
 *   6000    computing
 *   9000    recommendations slide in
 *   18000   AI explanation panel
 *   28000   fade
 *   30000   loop reset
 *
 * Honors prefers-reduced-motion: freezes on scene 3 (recommendations).
 * @component
 */
import { useEffect, useRef, useState } from 'react';

type Scene = 1 | 2 | 3 | 4 | 5;

const SCENE_TIMINGS: { scene: Scene; at: number }[] = [
  { scene: 1, at: 0 },
  { scene: 2, at: 6000 },
  { scene: 3, at: 9000 },
  { scene: 4, at: 18000 },
  { scene: 5, at: 28000 },
];

const FORM_VALUES = {
  symbol: 'AAL',
  shares: '5000',
  entry: '11.30',
  current: '10.97',
};

const AI_TEXT =
  'This put protects 5,000 AAL shares against further drops below $10. ' +
  'For $245 total, you cap losses at $385 — a 23x payoff if AAL hits $9 by June 19.';

function useTypedValue(target: string, active: boolean, charMs = 80, startDelay = 0) {
  const [value, setValue] = useState('');
  useEffect(() => {
    if (!active) {
      setValue('');
      return;
    }
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    timeouts.push(
      setTimeout(() => {
        for (let i = 1; i <= target.length; i++) {
          timeouts.push(
            setTimeout(() => {
              if (!cancelled) setValue(target.slice(0, i));
            }, i * charMs),
          );
        }
      }, startDelay),
    );
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [target, active, charMs, startDelay]);
  return value;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}

export default function LiveDemoWidget({ scale = 1 }: { scale?: number }) {
  const reduced = useReducedMotion();
  const [scene, setScene] = useState<Scene>(1);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (reduced) {
      setScene(3);
      return;
    }
    const start = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      SCENE_TIMINGS.forEach(({ scene: s, at }) => {
        timersRef.current.push(
          setTimeout(() => setScene(s), at),
        );
      });
      timersRef.current.push(
        setTimeout(() => {
          setScene(1);
          start();
        }, 30000),
      );
    };
    start();
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [reduced]);

  // Per-field typing (only during scene 1 or beyond — values persist)
  const showSymbol = scene >= 1;
  const showShares = scene >= 1;
  const showEntry = scene >= 1;
  const showCurrent = scene >= 1;

  const symbolVal = useTypedValue(FORM_VALUES.symbol, showSymbol, 120, 200);
  const sharesVal = useTypedValue(FORM_VALUES.shares, showShares, 100, 1400);
  const entryVal = useTypedValue(FORM_VALUES.entry, showEntry, 100, 2800);
  const currentVal = useTypedValue(FORM_VALUES.current, showCurrent, 100, 4200);

  // AI text typing (scene 4)
  const aiText = useTypedValue(AI_TEXT, scene === 4, 35, 200);

  const fade = scene === 5 ? 0.2 : 1;

  return (
    <div
      className="hedgeiq-demo-widget"
      data-scene={scene}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 640 * scale,
        aspectRatio: '640 / 400',
        borderRadius: 12,
        background: '#0F172A',
        border: '1px solid #1E293B',
        boxShadow:
          '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.08), 0 0 60px rgba(139,92,246,0.18)',
        overflow: 'hidden',
        opacity: fade,
        transition: 'opacity 600ms ease',
        fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
      }}
      aria-label="Interactive product demo"
      role="img"
    >
      {/* Browser chrome */}
      <div
        style={{
          height: 32,
          padding: '0 12px',
          background: '#0B1220',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#FF5F57' }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#FEBC2E' }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#28C840' }} />
        </div>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 11,
            color: '#64748B',
            fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
          }}
        >
          hedgeiq.app/dashboard
        </div>
        <span
          style={{
            fontSize: 9,
            letterSpacing: '0.14em',
            color: '#A78BFA',
            border: '1px solid rgba(167,139,250,0.4)',
            padding: '2px 6px',
            borderRadius: 4,
            fontWeight: 600,
          }}
        >
          DEMO
        </span>
      </div>

      {/* App body */}
      <div style={{ position: 'relative', padding: 18, height: 'calc(100% - 32px)' }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#F8FAFC',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: '#8B5CF6',
              boxShadow: '0 0 10px #8B5CF6',
            }}
          />
          Hedge Calculator
        </div>

        {/* Form grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {[
            { label: 'Symbol', val: symbolVal, full: FORM_VALUES.symbol, idx: 0 },
            { label: 'Shares', val: sharesVal, full: FORM_VALUES.shares, idx: 1 },
            { label: 'Entry', val: entryVal, full: FORM_VALUES.entry, idx: 2 },
            { label: 'Current', val: currentVal, full: FORM_VALUES.current, idx: 3 },
          ].map(f => {
            const isComplete = f.val === f.full;
            const isActive = scene === 1 && !isComplete && (f.idx === 0
              ? f.val.length < FORM_VALUES.symbol.length
              : true);
            return (
              <div
                key={f.label}
                style={{
                  background: '#0B1220',
                  border: '1px solid #1E293B',
                  borderRadius: 6,
                  padding: '6px 8px',
                  minHeight: 42,
                }}
              >
                <div style={{ fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                  {f.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isComplete ? '#A78BFA' : '#F8FAFC',
                    fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                    transition: 'color 240ms ease',
                    minHeight: 18,
                    textShadow: isComplete ? '0 0 12px rgba(167,139,250,0.5)' : 'none',
                  }}
                >
                  {f.val || ''}
                  {isActive && (
                    <span className="hedgeiq-caret" style={{ display: 'inline-block', width: 1, height: 13, background: '#A78BFA', marginLeft: 1, verticalAlign: 'middle' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Find Best Hedge button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: scene >= 2 ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#1E293B',
              color: scene >= 2 ? '#fff' : '#94A3B8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 240ms ease, color 240ms ease',
            }}
          >
            {scene === 2 && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: '#fff',
                  animation: 'hedgeiq-pulse 900ms ease-in-out infinite',
                }}
              />
            )}
            Find Best Hedge
          </div>
          {scene === 2 && (
            <span style={{ fontSize: 11, color: '#94A3B8' }}>Computing…</span>
          )}
        </div>

        {/* Recommendations area */}
        <div style={{ position: 'relative' }}>
          {scene === 2 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, transparent, rgba(139,92,246,0.18), transparent)',
                backgroundSize: '200% 100%',
                animation: 'hedgeiq-shimmer 1400ms linear infinite',
                borderRadius: 6,
              }}
            />
          )}
          {scene >= 3 && scene !== 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { rank: 1, exp: '2026-06-19', strike: '10.00', ask: '0.49', cost: '245', best: true },
                { rank: 2, exp: '2026-06-19', strike: '9.50', ask: '0.32', cost: '160' },
                { rank: 3, exp: '2026-07-17', strike: '10.00', ask: '0.61', cost: '305' },
              ].map((r, i) => (
                <div
                  key={r.rank}
                  style={{
                    background: '#0B1220',
                    border: r.best ? '1px solid transparent' : '1px solid #1E293B',
                    backgroundImage: r.best
                      ? 'linear-gradient(#0B1220, #0B1220), linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)'
                      : 'none',
                    backgroundOrigin: r.best ? 'border-box' : 'padding-box',
                    backgroundClip: r.best ? 'padding-box, border-box' : 'border-box',
                    boxShadow: r.best ? '0 0 24px rgba(139,92,246,0.25)' : 'none',
                    borderRadius: 6,
                    padding: '8px 10px',
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr 1fr 1fr 1fr',
                    gap: 8,
                    alignItems: 'center',
                    fontSize: 12,
                    color: '#F8FAFC',
                    animation: `hedgeiq-slide-up 360ms ${i * 300}ms both ease-out`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: r.best ? '#A78BFA' : '#64748B',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    #{r.rank}
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: 11 }}>{r.exp}</span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>${r.strike}</span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>${r.ask}</span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>${r.cost}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI explanation panel — slides in from right at scene 4 */}
        <div
          style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            width: '62%',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.10))',
            border: '1px solid rgba(139,92,246,0.35)',
            borderRadius: 8,
            padding: '10px 12px',
            transform: scene === 4 ? 'translateX(0)' : 'translateX(110%)',
            opacity: scene === 4 ? 1 : 0,
            transition: 'transform 480ms ease, opacity 480ms ease',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: '#A78BFA' }} />
            <span style={{ fontSize: 10, color: '#A78BFA', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              AI advisor
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 11.5,
              lineHeight: 1.5,
              color: '#E2E8F0',
            }}
          >
            {aiText}
            {scene === 4 && aiText.length < AI_TEXT.length && (
              <span className="hedgeiq-caret" style={{ display: 'inline-block', width: 1, height: 11, background: '#A78BFA', marginLeft: 1, verticalAlign: 'middle' }} />
            )}
          </p>
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes hedgeiq-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
        @keyframes hedgeiq-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes hedgeiq-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hedgeiq-caret { animation: hedgeiq-blink 1s steps(2) infinite; }
        @keyframes hedgeiq-blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .hedgeiq-demo-widget *, .hedgeiq-caret {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

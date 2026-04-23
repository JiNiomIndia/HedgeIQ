import { useState } from 'react';

const STORAGE_KEY = 'hedgeiq_onboarded';

interface Step {
  title: string;
  body: string;
  icon: string;
}

const STEPS: Step[] = [
  {
    icon: '📊',
    title: 'Your live portfolio in one view',
    body: 'HedgeIQ aggregates positions from all your connected brokers into a single dashboard. Click any position row to see a full detail drawer with chart and recent news.',
  },
  {
    icon: '🎛️',
    title: 'Drag, resize, and customise',
    body: 'Click "Edit Layout" in the top bar to rearrange and resize any widget. Choose from 4 preset layouts (Day Trader, Long-Term, Hedger, Minimal) or build your own.',
  },
  {
    icon: '⚡',
    title: 'AI advisor that knows your portfolio',
    body: 'The AI Advisor widget has full context of your positions. Ask it anything: hedging ideas, risk analysis, options strategies in plain English. Streaming responses, no waiting.',
  },
  {
    icon: '🛡️',
    title: 'One-click hedge recommendations',
    body: 'The Hedge Calculator suggests protective puts sized to your position. The Order Ticket widget generates broker deep-links so you can place the trade with one click.',
  },
];

export function useOnboarding() {
  const done = typeof localStorage !== 'undefined' && !!localStorage.getItem(STORAGE_KEY);
  const dismiss = () => localStorage.setItem(STORAGE_KEY, '1');
  return { shouldShow: !done, dismiss };
}

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const s = STEPS[step];

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    onDone();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={finish} />

      {/* Card */}
      <div style={{
        position: 'relative', width: 420, background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)', padding: 32, zIndex: 1,
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 3,
              background: i === step ? 'var(--accent)' : 'var(--border)',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{s.icon}</div>
          <h2 style={{ fontWeight: 800, fontSize: 'var(--fs-xl)', color: 'var(--text)', fontFamily: 'var(--font-display)', margin: '0 0 12px' }}>
            {s.title}
          </h2>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{s.body}</p>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn btn-sm btn-ghost" style={{ flex: 1 }}>
              Back
            </button>
          )}
          {isLast ? (
            <button onClick={finish} className="btn btn-primary" style={{ flex: 1 }}>
              Get started →
            </button>
          ) : (
            <button onClick={() => setStep(s => s + 1)} className="btn btn-primary" style={{ flex: step === 0 ? 1 : undefined, minWidth: 120 }}>
              Next →
            </button>
          )}
        </div>

        <button onClick={finish}
          style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: 4 }}>
          ×
        </button>

        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-subtle)', marginTop: 14 }}>
          {step + 1} of {STEPS.length} · Click anywhere outside to skip
        </p>
      </div>
    </div>
  );
}

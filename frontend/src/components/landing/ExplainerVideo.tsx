/**
 * ExplainerVideo — 5-scene narrated walkthrough using browser TTS.
 * Falls back to timed advance if speechSynthesis is unavailable.
 * Captions always visible. Respects prefers-reduced-motion.
 * @component
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';

type Scene = {
  id: number;
  caption: string;
  narration: string;
  duration: number; // ms (fallback when no TTS)
  visual: (active: boolean) => ReactElement;
};

const accent = '#8B5CF6';

const SceneOne = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 600 320" width="100%" height="100%" role="img" aria-label="A stock chart line dropping sharply">
    <defs>
      <linearGradient id="ch1" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
      </linearGradient>
    </defs>
    <text x="32" y="40" fill="#94A3B8" fontSize="12" fontFamily="monospace">SUNDAY · 22:47 ET</text>
    <text x="32" y="70" fill="#FFFFFF" fontSize="22" fontWeight="600">AAL</text>
    <text x="80" y="70" fill="#EF4444" fontSize="22" fontWeight="600">$11.30 → $10.97</text>
    <path
      d={active
        ? 'M 32 180 L 120 165 L 200 175 L 280 160 L 360 195 L 440 240 L 540 270'
        : 'M 32 180 L 120 165 L 200 175 L 280 160 L 360 195 L 360 195 L 360 195'}
      fill="none"
      stroke="#EF4444"
      strokeWidth="2.5"
      style={{ transition: 'all 1.5s ease' }}
    />
    <path
      d="M 32 180 L 120 165 L 200 175 L 280 160 L 360 195 L 440 240 L 540 270 L 540 290 L 32 290 Z"
      fill="url(#ch1)"
      opacity={active ? 1 : 0}
      style={{ transition: 'opacity 1.5s ease' }}
    />
    <circle cx={active ? 540 : 360} cy={active ? 270 : 195} r="6" fill="#EF4444">
      <animate attributeName="r" values="6;9;6" dur="1.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const SceneTwo = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 600 320" width="100%" height="100%" role="img" aria-label="Brokers connecting via SnapTrade">
    {['Robinhood', 'Fidelity', 'IBKR', 'Public'].map((b, i) => (
      <g key={b} opacity={active ? 1 : 0.3} style={{ transition: `opacity 0.6s ease ${i * 0.15}s` }}>
        <rect x={32} y={50 + i * 56} width="120" height="40" rx="8" fill="#11172A" stroke="#1E293B" />
        <text x={92} y={75 + i * 56} textAnchor="middle" fill="#E2E8F0" fontSize="13" fontWeight="600">{b}</text>
        <line x1="152" y1={70 + i * 56} x2="240" y2="160" stroke={accent} strokeWidth="1.5" strokeDasharray="4 4" opacity={active ? 0.6 : 0} style={{ transition: 'opacity 1s ease' }} />
      </g>
    ))}
    <rect x="240" y="135" width="120" height="50" rx="10" fill="#1A1F3A" stroke={accent} strokeWidth="1.5" />
    <text x="300" y="166" textAnchor="middle" fill={accent} fontSize="14" fontWeight="700">SnapTrade</text>
    <line x1="360" y1="160" x2="448" y2="160" stroke={accent} strokeWidth="1.5" strokeDasharray="4 4" opacity={active ? 0.8 : 0} style={{ transition: 'opacity 1s ease' }} />
    <rect x="448" y="135" width="120" height="50" rx="10" fill={accent} />
    <text x="508" y="166" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700">HedgeIQ</text>
  </svg>
);

const SceneThree = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 600 320" width="100%" height="100%" role="img" aria-label="Form filled in and recommendation cards sliding in">
    <rect x="32" y="32" width="220" height="240" rx="12" fill="#11172A" stroke="#1E293B" />
    <text x="48" y="60" fill="#94A3B8" fontSize="11" letterSpacing="1">ENTER POSITION</text>
    {[
      ['Symbol', 'AAL'],
      ['Quantity', '5,000'],
      ['Entry price', '$11.30'],
      ['Current price', '$10.97'],
    ].map((row, i) => (
      <g key={row[0]}>
        <text x="48" y={92 + i * 36} fill="#64748B" fontSize="11">{row[0]}</text>
        <rect x="48" y={98 + i * 36} width="180" height="22" rx="4" fill="#0A0E1A" stroke="#1E293B" />
        <text x="56" y={114 + i * 36} fill="#E2E8F0" fontSize="12" fontFamily="monospace" opacity={active ? 1 : 0} style={{ transition: `opacity 0.6s ease ${0.2 + i * 0.2}s` }}>
          {row[1]}
        </text>
      </g>
    ))}
    {[0, 1, 2].map(i => (
      <g key={i} transform={`translate(${active ? 280 : 600}, ${48 + i * 76})`} style={{ transition: `transform 0.7s ease ${0.5 + i * 0.2}s` }}>
        <rect width="280" height="60" rx="10" fill="#11172A" stroke={i === 0 ? accent : '#1E293B'} />
        <text x="14" y="22" fill="#E2E8F0" fontSize="12" fontWeight="600">PUT $10.50 · 30d</text>
        <text x="14" y="42" fill="#64748B" fontSize="11">Cost $1,200 · Protects 95% downside</text>
        <text x="266" y="32" textAnchor="end" fill="#10B981" fontSize="14" fontWeight="700">8.2/10</text>
      </g>
    ))}
  </svg>
);

const SceneFour = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 600 320" width="100%" height="100%" role="img" aria-label="Claude AI explaining the recommendation">
    <rect x="32" y="32" width="536" height="256" rx="12" fill="#11172A" stroke="#1E293B" />
    <circle cx="60" cy="60" r="14" fill={accent} />
    <text x="60" y="65" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="700">C</text>
    <text x="86" y="65" fill="#E2E8F0" fontSize="13" fontWeight="600">Claude</text>
    <text x="130" y="65" fill="#64748B" fontSize="11">· Anthropic</text>
    {[
      'This $10.50 put expires in 30 days. At $1,200 it costs',
      '4¢ per share to protect 5,000 shares against a drop',
      'below $10.50. Breakeven on the hedge at $10.26.',
      'Picked over the $10 strike: better value-per-dollar',
      'given current implied volatility of 38%.',
    ].map((line, i) => (
      <text
        key={i}
        x="48"
        y={110 + i * 26}
        fill="#CBD5E1"
        fontSize="13"
        opacity={active ? 1 : 0}
        style={{ transition: `opacity 0.5s ease ${0.3 + i * 0.4}s` }}
      >
        {line}
      </text>
    ))}
  </svg>
);

const SceneFive = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 600 320" width="100%" height="100%" role="img" aria-label="Security and trust badges">
    <g transform="translate(300 130)" opacity={active ? 1 : 0} style={{ transition: 'opacity 0.6s ease' }}>
      <circle r="50" fill="none" stroke={accent} strokeWidth="2" />
      <path d="M -18 0 L -6 14 L 20 -14" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    {['PBKDF2 hashing', 'JWT auth', 'WCAG 2.1 AA', '226 backend tests'].map((item, i) => (
      <g key={item} transform={`translate(${120 + (i % 2) * 240}, ${230 + Math.floor(i / 2) * 36})`} opacity={active ? 1 : 0} style={{ transition: `opacity 0.5s ease ${0.4 + i * 0.2}s` }}>
        <rect width="220" height="28" rx="14" fill="#11172A" stroke={accent} strokeOpacity="0.4" />
        <circle cx="14" cy="14" r="3" fill="#10B981" />
        <text x="28" y="18" fill="#E2E8F0" fontSize="12">{item}</text>
      </g>
    ))}
  </svg>
);

const SCENES: Scene[] = [
  {
    id: 1,
    caption: "It's Sunday night. Your 5,000 shares of AAL just dropped 3% on news from the Middle East. Markets open in 12 hours. You need to hedge — fast.",
    narration: "It's Sunday night. Your 5,000 shares of AAL just dropped 3 percent on news from the Middle East. Markets open in 12 hours. You need to hedge — fast.",
    duration: 10000,
    visual: (active) => <SceneOne active={active} />,
  },
  {
    id: 2,
    caption: 'HedgeIQ connects to your brokers via SnapTrade — the same secure layer used by Wealthsimple and Public. Your credentials never touch our servers.',
    narration: 'HedgeIQ connects to your brokers via SnapTrade — the same secure layer used by Wealthsimple and Public. Your credentials never touch our servers.',
    duration: 10000,
    visual: (active) => <SceneTwo active={active} />,
  },
  {
    id: 3,
    caption: 'Enter your position. HedgeIQ scans the options chain, filters by liquidity and time-to-expiry, and ranks the top three protective puts by value-per-dollar.',
    narration: 'Enter your position. HedgeIQ scans the options chain, filters by liquidity and time-to-expiry, and ranks the top three protective puts by value-per-dollar.',
    duration: 15000,
    visual: (active) => <SceneThree active={active} />,
  },
  {
    id: 4,
    caption: "Claude — Anthropic's AI — explains each recommendation in plain English. No jargon. Why this strike, why this expiry, what it costs, what it protects.",
    narration: "Claude — Anthropic's AI — explains each recommendation in plain English. No jargon. Why this strike, why this expiry, what it costs, what it protects.",
    duration: 15000,
    visual: (active) => <SceneFour active={active} />,
  },
  {
    id: 5,
    caption: 'Production-grade security. Full WCAG accessibility. Open source on GitHub. Built from a real loss — so it works the night you actually need it.',
    narration: 'Production-grade security. Full WCAG accessibility. Open source on GitHub. Built from a real loss — so it works the night you actually need it.',
    duration: 10000,
    visual: (active) => <SceneFive active={active} />,
  },
];

export default function ExplainerVideo() {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<number | null>(null);
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const cancelAll = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const advance = useCallback(() => {
    const next = sceneRef.current + 1;
    if (next >= SCENES.length) {
      setPlaying(false);
      setDone(true);
      return;
    }
    setScene(next);
  }, []);

  const playScene = useCallback(
    (idx: number) => {
      const s = SCENES[idx];
      if (!s) return;
      cancelAll();
      const fallback = () => {
        timerRef.current = window.setTimeout(advance, s.duration);
      };
      if (muted || typeof window === 'undefined' || !window.speechSynthesis) {
        fallback();
        return;
      }
      try {
        const utter = new SpeechSynthesisUtterance(s.narration);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          v => v.lang?.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Aria') || v.name.includes('Google US English') || v.name.includes('Samantha'))
        );
        if (preferred) utter.voice = preferred;
        utter.onend = advance;
        utter.onerror = fallback;
        window.speechSynthesis.speak(utter);
        // safety net: advance even if onend never fires
        timerRef.current = window.setTimeout(advance, s.duration + 4000);
      } catch {
        fallback();
      }
    },
    [advance, cancelAll, muted]
  );

  // Drive playback when scene/playing changes
  useEffect(() => {
    if (!playing) return;
    playScene(scene);
    return cancelAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, playing]);

  const start = () => {
    if (reducedMotion) {
      // Show captions only — no auto-advance
      setPlaying(false);
      setScene(0);
      return;
    }
    setDone(false);
    setScene(0);
    setPlaying(true);
  };

  const togglePlay = () => {
    if (done) {
      start();
      return;
    }
    if (playing) {
      setPlaying(false);
      cancelAll();
    } else {
      setPlaying(true);
    }
  };

  const restart = () => {
    cancelAll();
    setDone(false);
    setScene(0);
    setPlaying(true);
  };

  const toggleMute = () => {
    setMuted(m => {
      if (!m && window.speechSynthesis) window.speechSynthesis.cancel();
      return !m;
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'r' || e.key === 'R') {
        restart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, muted, done]);

  // Pre-load voices on some browsers
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const current = SCENES[scene];

  return (
    <section
      id="explainer"
      style={{
        padding: 'clamp(80px, 10vw, 140px) 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
            Walkthrough
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 44px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontWeight: 500,
              margin: 0,
            }}
          >
            See how it works in 60 seconds
          </h2>
        </header>

        <div
          role="region"
          aria-label="Product explainer video"
          style={{
            position: 'relative',
            background: '#0F1424',
            border: '1px solid #1E293B',
            borderRadius: 16,
            overflow: 'hidden',
            aspectRatio: '720 / 420',
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          {/* Visual */}
          <div style={{ position: 'absolute', inset: 0, padding: 24 }}>
            {current.visual(playing)}
          </div>

          {/* Play overlay */}
          {!playing && !done && (
            <button
              type="button"
              onClick={start}
              aria-label="Play explainer video"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(10, 14, 26, 0.55)',
                border: 0,
                cursor: 'pointer',
                color: '#FFF',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: accent,
                  boxShadow: `0 0 0 8px rgba(139, 92, 246, 0.2)`,
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}

          {/* Restart at end */}
          {done && (
            <button
              type="button"
              onClick={restart}
              aria-label="Restart video"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(10, 14, 26, 0.7)',
                border: 0,
                cursor: 'pointer',
                color: '#FFF',
                fontSize: 14,
                gap: 12,
                flexDirection: 'column',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 600 }}>Watch again</span>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>Press R to restart</span>
            </button>
          )}

          {/* Captions */}
          <div
            aria-live="polite"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 56,
              padding: '0 32px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                display: 'inline-block',
                background: 'rgba(10, 14, 26, 0.85)',
                color: '#F8FAFC',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 14,
                lineHeight: 1.5,
                margin: 0,
                maxWidth: '100%',
              }}
            >
              {current.caption}
            </p>
          </div>

          {/* Controls bar */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, transparent, rgba(10, 14, 26, 0.85))',
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? 'Pause' : 'Play'}
                style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', padding: 6 }}
              >
                {playing ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
                style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', padding: 6 }}
              >
                {muted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16.5 12 19 14.5 21.5 12 19 9.5zM12 4 8 8H4v8h4l4 4z" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" /></svg>
                )}
              </button>
              <button
                type="button"
                onClick={restart}
                aria-label="Restart"
                style={{ background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', padding: 6 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 5V2L7 7l5 5V8c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z" /></svg>
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6 }} role="tablist" aria-label="Scene progress">
              {SCENES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === scene}
                  aria-label={`Scene ${i + 1}`}
                  onClick={() => {
                    setDone(false);
                    setScene(i);
                    setPlaying(true);
                  }}
                  style={{
                    width: i === scene ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === scene ? accent : '#475569',
                    border: 0,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width 200ms ease, background 200ms ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <p
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: 12,
            fontStyle: 'italic',
            color: 'var(--text-subtle)',
          }}
        >
          Voice narration uses your browser's text-to-speech. For a richer walkthrough, watch the live demo video [coming soon].
        </p>
      </div>
    </section>
  );
}

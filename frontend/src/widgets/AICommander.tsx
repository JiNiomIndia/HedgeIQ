import { useState, useEffect, useRef, useCallback } from 'react';
import { API } from '../lib/api';
import { Markdown } from '../lib/markdown';
import { bus, EVENTS } from '../lib/event-bus';

type Tab = 'recommend' | 'options' | 'risk';

const SYSTEM_PROMPTS: Record<Tab, string> = {
  recommend: `You are an AI trade commander. Given the user's portfolio, suggest 1-3 specific trades (buy/sell/hedge) with:
- Ticker and action (BUY/SELL/HEDGE)
- Rationale in 1 sentence
- Risk rating: LOW / MEDIUM / HIGH
Format each trade as: **ACTION TICKER** — rationale (Risk: X)
Keep total response under 150 words. End with one key risk to watch.`,
  options: `You are an options strategy AI. Interpret the user's natural language intent and suggest:
1. The specific options strategy (e.g., "Buy 1x AAPL $170 Put expiring June")
2. Why this matches their intent
3. Estimated cost range
Keep it under 120 words. Be specific about strike, expiry, and contract count.`,
  risk: `You are a portfolio risk analyst. Analyze the given portfolio and provide:
- Overall risk score 1-10
- Top 3 risk concentrations (sector/position)
- One sentence on correlation risk
- One actionable de-risk step
Format with **bold** for key metrics. Under 150 words total.`,
};

const TAB_STARTERS: Record<Tab, string[]> = {
  recommend: [
    'What trades do you recommend today?',
    'Should I trim any positions?',
    'Any strong buy signals given my portfolio?',
  ],
  options: [
    'I want to protect my NVDA gains',
    'I think TSLA drops next month',
    'Generate income on my AAPL position',
    'Hedge my whole portfolio cheaply',
  ],
  risk: [
    'How concentrated is my portfolio?',
    'What sectors am I overweight in?',
    'Run a full risk analysis',
  ],
};

export default function AICommander() {
  const [tab, setTab]           = useState<Tab>('recommend');
  const [input, setInput]       = useState('');
  const [reply, setReply]       = useState('');
  const [streaming, setStreaming] = useState(false);
  const [positions, setPositions] = useState<unknown[]>([]);
  const [symbol, setSymbol]     = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch(`${API}/api/v1/positions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
    }).then(r => r.json()).then(d => setPositions(d.positions || [])).catch(() => {});
  }, []);

  useEffect(() => bus.on<string>(EVENTS.SYMBOL_SELECTED, s => setSymbol(s)), []);

  const run = useCallback(async (prompt?: string) => {
    const msg = (prompt || input).trim();
    if (!msg || streaming) return;
    setInput('');
    setReply('');
    setStreaming(true);

    const portfolioContext = positions.length ? { positions } : null;
    const systemExtra = SYSTEM_PROMPTS[tab];
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`${API}/api/v1/ai/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
        body: JSON.stringify({
          message: `[${tab.toUpperCase()} MODE]\n\n${systemExtra}\n\nUser: ${msg}`,
          history: [],
          portfolio_context: portfolioContext,
          symbol_context: symbol,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) throw new Error('API error');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try { content += JSON.parse(data) as string; setReply(content); } catch { /* skip */ }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') setReply('Error reaching AI. Please try again.');
    }
    setStreaming(false);
    abortRef.current = null;
  }, [input, streaming, tab, positions, symbol]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'recommend', label: 'Trade Recs', icon: '↗' },
    { key: 'options',   label: 'Options Intent', icon: '⚙' },
    { key: 'risk',      label: 'Risk Analysis', icon: '⚠' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setReply(''); }}
            style={{
              flex: 1, padding: '8px 4px', fontSize: 10, fontWeight: 600,
              border: 'none', borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              background: 'none', color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Reply */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px' }}>
        {!reply && !streaming && (
          <div>
            <p style={{ fontSize: 10, color: 'var(--text-subtle)', marginBottom: 8 }}>
              {tab === 'recommend' && 'AI-powered trade recommendations based on your portfolio'}
              {tab === 'options' && 'Describe your market view → get an options strategy'}
              {tab === 'risk' && 'Portfolio risk concentration and correlation analysis'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {TAB_STARTERS[tab].map(s => (
                <button key={s} onClick={() => run(s)}
                  style={{ textAlign: 'left', padding: '7px 10px', fontSize: 10, background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {(reply || streaming) && (
          <div style={{ fontSize: 'var(--fs-xs)' }}>
            <Markdown text={reply} />
            {streaming && <span style={{ color: 'var(--text-subtle)' }}> ···</span>}
          </div>
        )}
      </div>

      {/* Input */}
      {symbol && (
        <div style={{ padding: '4px 14px', background: 'var(--accent-bg)', fontSize: 10, color: 'var(--accent)' }}>
          Context: {symbol}
        </div>
      )}
      <div style={{ padding: '8px 12px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder={tab === 'options' ? 'e.g. I want to protect NVDA gains…' : 'Ask AI commander…'}
          className="input" style={{ flex: 1, fontSize: 10 }} />
        {streaming
          ? <button onClick={() => abortRef.current?.abort()} className="btn btn-sm" style={{ background: 'var(--neg)', color: '#fff', border: 'none', fontSize: 10 }}>Stop</button>
          : <button onClick={() => run()} disabled={!input.trim()} className="btn btn-sm btn-primary" style={{ fontSize: 10, opacity: !input.trim() ? 0.4 : 1 }}>Run</button>
        }
      </div>
    </div>
  );
}

/**
 * AIChat — natural language trading advisor powered by Claude.
 * Multi-turn conversation with portfolio context injected into every request.
 * @component
 */
import { useState, useRef, useEffect } from 'react';
import { Markdown } from '../lib/markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Position {
  broker: string; symbol: string; quantity: number;
  entryPrice: number; currentPrice: number;
  marketValue: number; unrealisedPnl: number;
}

import { API } from '../lib/api';

const STARTERS = [
  'What positions are most exposed right now?',
  'How do I hedge my AAL position?',
  'Explain what a protective put is',
  'What happens to my puts if volatility spikes?',
  'How much would it cost to hedge my whole portfolio?',
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your HedgeIQ AI advisor. Ask me anything about your portfolio, hedging strategies, or how options work. I can see your current positions and give you specific analysis.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch positions once so Claude has portfolio context
  useEffect(() => {
    fetch(`${API}/api/v1/positions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
    })
      .then(r => r.json())
      .then(d => setPositions(d.positions || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      // Always refresh positions on send so Claude has the latest snapshot,
      // even if the positions fetch hadn't completed before this first message.
      let livePositions = positions;
      if (!livePositions.length) {
        try {
          const pr = await fetch(`${API}/api/v1/positions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
          });
          const pd = await pr.json();
          livePositions = pd.positions || [];
          setPositions(livePositions);
        } catch { /* fall through — chat works without context */ }
      }
      const portfolioContext = livePositions.length
        ? {
            positions: livePositions.map(p => ({
              broker: p.broker,
              symbol: p.symbol,
              quantity: p.quantity,
              entryPrice: p.entryPrice,
              currentPrice: p.currentPrice,
              marketValue: p.marketValue,
              unrealisedPnl: p.unrealisedPnl,
            })),
          }
        : null;

      const res = await fetch(`${API}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}`,
        },
        body: JSON.stringify({
          message: msg,
          history: history.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          portfolio_context: portfolioContext,
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't reach the server. Please try again." },
      ]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <h2 style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'var(--text)', margin: 0 }}>AI Trading Advisor</h2>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', margin: 0 }}>Powered by Claude · knows your portfolio · not investment advice</p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', borderRadius: 'var(--radius-lg)', padding: '10px 14px',
              fontSize: 'var(--fs-md)',
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface)',
              color: m.role === 'user' ? 'var(--accent-contrast)' : 'var(--text)',
              border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
            }}>
              {m.role === 'assistant' ? <Markdown text={m.content} /> : m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '10px 14px', fontSize: 'var(--fs-md)', color: 'var(--text-muted)' }}>
              Claude is thinking <span style={{ animation: 'pulse 1s infinite' }}>···</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts */}
      {messages.length === 1 && (
        <div style={{ padding: '0 24px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {STARTERS.map(s => (
            <button key={s} onClick={() => send(s)} className="chip chip-outline"
              style={{ cursor: 'pointer', fontSize: 'var(--fs-xs)' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 24px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your portfolio or options…"
            rows={2}
            className="input"
            style={{ flex: 1, resize: 'none' }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} className="btn btn-primary"
            style={{ opacity: loading || !input.trim() ? 0.4 : 1 }}>
            Send
          </button>
        </div>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', marginTop: 6 }}>Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

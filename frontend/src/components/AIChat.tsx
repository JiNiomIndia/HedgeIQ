import { useState, useRef, useEffect, useCallback } from 'react';
import { Markdown } from '../lib/markdown';
import { API } from '../lib/api';
import { bus, EVENTS } from '../lib/event-bus';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Position {
  broker: string; symbol: string; quantity: number;
  entryPrice: number; currentPrice: number;
  marketValue: number; unrealisedPnl: number;
}

const STORAGE_KEY = 'hedgeiq_chat_history';

const STARTERS = [
  'What positions are most exposed right now?',
  'How do I hedge my largest position?',
  'Explain what a protective put is',
  'What happens to my puts if volatility spikes?',
  'How much would it cost to hedge my whole portfolio?',
];

function loadHistory(): Message[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [{ role: 'assistant', content: "Hi! I'm your HedgeIQ AI advisor. Ask me anything about your portfolio, hedging strategies, or how options work. I can see your current positions and give you specific analysis." }];
}

function saveHistory(msgs: Message[]) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-40))); } catch { /* ignore */ }
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>(loadHistory);
  const [input, setInput]       = useState('');
  const [streaming, setStreaming] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [symbol, setSymbol]     = useState<string | null>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch(`${API}/api/v1/positions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
    }).then(r => r.json()).then(d => setPositions(d.positions || [])).catch(() => {});
  }, []);

  useEffect(() => bus.on<string>(EVENTS.SYMBOL_SELECTED, s => setSymbol(s)), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  const portfolioContext = positions.length ? {
    positions: positions.map(p => ({
      broker: p.broker, symbol: p.symbol, quantity: p.quantity,
      entryPrice: p.entryPrice, currentPrice: p.currentPrice,
      marketValue: p.marketValue, unrealisedPnl: p.unrealisedPnl,
    })),
  } : null;

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || streaming) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`${API}/api/v1/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}`,
        },
        body: JSON.stringify({
          message: msg,
          history: nextHistory.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          portfolio_context: portfolioContext,
          symbol_context: symbol,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'API error');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const text = JSON.parse(data) as string;
            assistantContent += text;
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: assistantContent },
            ]);
          } catch { /* skip malformed chunk */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't reach the server. Please try again." },
      ]);
    }
    setStreaming(false);
    abortRef.current = null;
  }, [input, messages, streaming, portfolioContext, symbol]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Chat cleared. Ask me anything about your portfolio!" }]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const copyMsg = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--text)', margin: 0 }}>AI Trading Advisor</p>
          <p style={{ fontSize: 10, color: 'var(--text-subtle)', margin: 0 }}>Claude · portfolio-aware · not investment advice</p>
        </div>
        {symbol && (
          <span style={{ fontSize: 10, background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 'var(--radius-pill)', padding: '2px 8px', fontWeight: 600 }}>
            Viewing {symbol}
          </span>
        )}
        <button onClick={clearChat} className="btn btn-sm btn-ghost" style={{ fontSize: 10 }}>Clear</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>
            {m.role === 'assistant' && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                display: 'grid', placeItems: 'center', color: 'var(--accent-contrast)', fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>
                H
              </div>
            )}
            <div style={{
              maxWidth: '82%', borderRadius: 'var(--radius-lg)', padding: '8px 12px',
              fontSize: 'var(--fs-xs)',
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface)',
              color: m.role === 'user' ? 'var(--accent-contrast)' : 'var(--text)',
              border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
              position: 'relative',
            }}>
              {m.role === 'assistant' ? <Markdown text={m.content} /> : m.content}
              {m.role === 'assistant' && m.content && (
                <button onClick={() => copyMsg(m.content)}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-subtle)', fontSize: 10, opacity: 0.6, padding: 2 }}
                  title="Copy">⎘</button>
              )}
            </div>
          </div>
        ))}

        {streaming && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'grid', placeItems: 'center', color: 'var(--accent-contrast)', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>H</div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              padding: '8px 12px', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
              ···
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts */}
      {messages.length === 1 && (
        <div style={{ padding: '0 16px 8px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {STARTERS.map(s => (
            <button key={s} onClick={() => send(s)} className="chip chip-outline"
              style={{ cursor: 'pointer', fontSize: 10, padding: '3px 8px' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your portfolio or options…"
            rows={2}
            className="input"
            style={{ flex: 1, resize: 'none', fontSize: 'var(--fs-xs)' }}
          />
          {streaming
            ? <button onClick={() => abortRef.current?.abort()} className="btn btn-sm" style={{ background: 'var(--neg)', color: '#fff', border: 'none' }}>Stop</button>
            : <button onClick={() => send()} disabled={!input.trim()} className="btn btn-sm btn-primary" style={{ opacity: !input.trim() ? 0.4 : 1 }}>Send</button>
          }
        </div>
        <p style={{ fontSize: 9, color: 'var(--text-subtle)', marginTop: 4 }}>Enter ↵ send · Shift+Enter new line · history persists in session</p>
      </div>
    </div>
  );
}

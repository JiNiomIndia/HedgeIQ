/**
 * AIChat — natural language trading advisor powered by Claude.
 * Multi-turn conversation with portfolio context injected into every request.
 * @component
 */
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Position {
  broker: string; symbol: string; quantity: number;
  entryPrice: number; currentPrice: number;
  marketValue: number; unrealisedPnl: number;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
      const portfolioContext = positions.length
        ? {
            positions: positions.map(p => ({
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
    <div className="flex flex-col h-full" style={{ backgroundColor: '#0A0E1A' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800" style={{ backgroundColor: '#131929' }}>
        <h2 className="font-bold text-lg" style={{ color: '#E8EAF0' }}>🤖 AI Trading Advisor</h2>
        <p className="text-xs text-gray-500">Powered by Claude · knows your portfolio · not investment advice</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={
                m.role === 'user'
                  ? { backgroundColor: '#00D4FF', color: '#0A0E1A' }
                  : { backgroundColor: '#131929', color: '#E8EAF0', border: '1px solid #1F2937' }
              }
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: '#131929', border: '1px solid #1F2937' }}>
              <span className="text-gray-400">Claude is thinking</span>
              <span className="animate-pulse text-gray-400"> ···</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts — only show at start */}
      {messages.length === 1 && (
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {STARTERS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-2 border-t border-gray-800">
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your portfolio or options…"
            rows={2}
            className="flex-1 rounded-xl px-4 py-3 text-sm border border-gray-700 resize-none outline-none"
            style={{ backgroundColor: '#131929', color: '#E8EAF0' }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl font-bold text-sm disabled:opacity-40"
            style={{ backgroundColor: '#00D4FF', color: '#0A0E1A' }}
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-700 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

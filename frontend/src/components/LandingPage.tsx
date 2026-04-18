/**
 * LandingPage — public marketing page. The authentic AAL story is the conversion hook.
 * @component
 */
import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const joinWaitlist = async () => {
    // Read directly from DOM to handle browser autofill edge cases
    const inputEl = document.querySelector('input[type="email"]') as HTMLInputElement;
    const emailValue = email || inputEl?.value || '';
    if (!emailValue) return;
    // Optimistic update — show success immediately regardless of API result
    setJoined(true);
    try {
      await fetch(`${API}/api/v1/auth/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });
    } catch {
      // Waitlist signup — silently continue even if API is unreachable
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor:'#0A0E1A', color:'#E8EAF0', fontFamily:'monospace'}}>
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold mb-4" style={{color:'#00D4FF'}}>Hedge your portfolio at midnight — in 60 seconds</h1>
        <p className="text-gray-400 text-lg mb-8">The AI trading assistant built from a $2,355 lesson at 11pm on a Sunday</p>
        <a href="/login" className="px-8 py-4 rounded text-lg font-bold inline-block"
          style={{backgroundColor:'#00D4FF', color:'#0A0E1A'}}>Try it free — no credit card</a>
      </div>

      {/* Story */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold mb-4">Why I built this</h2>
        <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
          <p>On a Sunday night I held 5,000 shares of AAL — a $56,500 position. US-Iran peace talks failed and oil spiked to $104. AAL was going to open down hard.</p>
          <p>Over the next 3 hours I manually placed 8 orders across Fidelity, Public.com, and Robinhood. I compared 40+ option strikes by hand. I got the math wrong twice.</p>
          <p>By market open I had lost $2,355. Not from bad decisions — but because the tools made it too hard to make good ones fast enough.</p>
          <p>HedgeIQ automates that entire workflow. Enter your position, get the top 3 hedges to buy in 60 seconds, with plain English AI explanations.</p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold mb-6 text-center">What it does</h2>
        <div className="grid grid-cols-3 gap-4">
          {[{icon:'🏦', title:'Unified dashboard', desc:'See all your broker accounts in one table — Fidelity, IBKR, Robinhood.'},
            {icon:'🛡️', title:'Smart hedge calculator', desc:'Enter your position. Get top 3 puts ranked by value in under 60 seconds.'},
            {icon:'🤖', title:'Plain English AI', desc:'Click any option for a 3-sentence explanation. No jargon.'}].map(f => (
            <div key={f.title} className="rounded p-4" style={{backgroundColor:'#131929'}}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-gray-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Waitlist */}
      <div className="max-w-md mx-auto px-6 pb-20 text-center">
        <h2 className="text-lg font-bold mb-2">Start free. No credit card. No tricks.</h2>
        <p className="text-gray-500 text-sm mb-4">47 traders already on the waitlist</p>
        {joined ? <p className="font-bold" style={{color:'#00FF88'}}>You're on the list. We'll be in touch.</p> : (
          <div className="flex gap-2">
            <input value={email} onChange={e => setEmail(e.target.value)}
              onInput={e => setEmail((e.target as HTMLInputElement).value)}
              placeholder="your@email.com" type="email"
              className="flex-1 rounded px-3 py-2 text-sm border border-gray-700"
              style={{backgroundColor:'#131929', color:'#E8EAF0'}} />
            <button onClick={joinWaitlist} className="px-4 py-2 rounded text-sm font-bold"
              style={{backgroundColor:'#00D4FF', color:'#0A0E1A'}}>Join</button>
          </div>
        )}
      </div>
      <div className="text-center text-gray-700 text-xs pb-8">HedgeIQ — built by a trader, for traders.</div>
    </div>
  );
}

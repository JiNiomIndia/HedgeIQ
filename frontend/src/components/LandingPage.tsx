/**
 * LandingPage — public marketing page. The authentic AAL story is the conversion hook.
 * @component
 */
import { useState } from 'react';

import { API } from '../lib/api';

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)', overflowY: 'auto' }}>
      {/* Hero */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--fs-3xl)', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 16, lineHeight: 1.2 }}>
          Hedge your portfolio at midnight — in 60 seconds
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-lg)', marginBottom: 32 }}>
          The AI trading assistant built from a $2,355 lesson at 11pm on a Sunday
        </p>
        <a href="/login" className="btn btn-primary" style={{ fontSize: 'var(--fs-lg)', padding: '12px 32px' }}>
          Try it free — no credit card
        </a>
      </div>

      {/* Story */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Why I built this</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-muted)', fontSize: 'var(--fs-md)', lineHeight: 1.6 }}>
          <p>On a Sunday night I held 5,000 shares of AAL — a $56,500 position. US-Iran peace talks failed and oil spiked to $104. AAL was going to open down hard.</p>
          <p>Over the next 3 hours I manually placed 8 orders across Fidelity, Public.com, and Robinhood. I compared 40+ option strikes by hand. I got the math wrong twice.</p>
          <p>By market open I had lost $2,355. Not from bad decisions — but because the tools made it too hard to make good ones fast enough.</p>
          <p>HedgeIQ automates that entire workflow. Enter your position, get the top 3 hedges to buy in 60 seconds, with plain English AI explanations.</p>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, marginBottom: 24, textAlign: 'center', color: 'var(--text)' }}>What it does</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[{icon:'🏦', title:'Unified dashboard', desc:'See all your broker accounts in one table — Fidelity, IBKR, Robinhood.'},
            {icon:'🛡️', title:'Smart hedge calculator', desc:'Enter your position. Get top 3 puts ranked by value in under 60 seconds.'},
            {icon:'🤖', title:'Plain English AI', desc:'Click any option for a 3-sentence explanation. No jargon.'}].map(f => (
            <div key={f.title} className="card card-p">
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 'var(--fs-md)', marginBottom: 4, color: 'var(--text)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Waitlist */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Start free. No credit card. No tricks.</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginBottom: 16 }}>47 traders already on the waitlist</p>
        {joined
          ? <p style={{ fontWeight: 700, color: 'var(--pos)' }}>You're on the list. We'll be in touch.</p>
          : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={email} onChange={e => setEmail(e.target.value)}
                onInput={e => setEmail((e.target as HTMLInputElement).value)}
                placeholder="your@email.com" type="email" className="input" />
              <button onClick={joinWaitlist} className="btn btn-primary">Join</button>
            </div>
          )}
      </div>
      <div style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: 'var(--fs-xs)', paddingBottom: 32 }}>
        HedgeIQ — built by a trader, for traders.
      </div>
    </div>
  );
}

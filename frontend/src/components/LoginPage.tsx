/**
 * LoginPage — email/password login form.
 * POSTs to /api/v1/auth/login, stores JWT, redirects to dashboard.
 * @component
 */
import { useState } from 'react';

import { API } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem('hedgeiq_token', data.access_token);
      window.location.href = '/dashboard';
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#0A0E1A', fontFamily: 'monospace' }}>
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#00D4FF' }}>HedgeIQ</h1>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Hedge your portfolio in 60 seconds</p>
        </div>

        {/* Card */}
        <form onSubmit={login} className="rounded-lg p-6 space-y-4"
          style={{ backgroundColor: '#131929' }}>
          <h2 className="text-lg font-bold mb-2" style={{ color: '#E8EAF0' }}>Sign in</h2>

          <div>
            <label className="text-xs block mb-1" style={{ color: '#9CA3AF' }}>EMAIL</label>
            <input
              type="email" value={email} required autoFocus
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded px-3 py-2 text-sm border border-gray-700 outline-none"
              style={{ backgroundColor: '#0A0E1A', color: '#E8EAF0' }}
            />
          </div>

          <div>
            <label className="text-xs block mb-1" style={{ color: '#9CA3AF' }}>PASSWORD</label>
            <input
              type="password" value={password} required
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded px-3 py-2 text-sm border border-gray-700 outline-none"
              style={{ backgroundColor: '#0A0E1A', color: '#E8EAF0' }}
            />
          </div>

          {error && (
            <p className="text-xs rounded px-3 py-2"
              style={{ color: '#FF4466', backgroundColor: 'rgba(255,68,102,0.1)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded font-bold text-sm disabled:opacity-50"
            style={{ backgroundColor: '#00D4FF', color: '#0A0E1A' }}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="text-center text-xs mt-4" style={{ color: '#9CA3AF' }}>
          <a href="/" style={{ color: '#00D4FF' }}>← Back to home</a>
        </p>
      </div>
    </div>
  );
}

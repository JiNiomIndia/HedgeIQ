import { useState } from 'react';
import { API } from '../lib/api';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const endpoint = mode === 'login' ? 'login' : 'register';
    try {
      const res = await fetch(`${API}/api/v1/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.detail || (mode === 'login' ? 'Invalid email or password.' : 'Registration failed.'));
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>HedgeIQ</h1>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>Hedge your portfolio in 60 seconds</p>
        </div>

        <form onSubmit={submit} className="card card-p" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>

          <div>
            <label htmlFor="login-email" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <input id="login-email" type="email" value={email} required autoFocus onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" className="input" aria-required="true" />
          </div>

          <div>
            <label htmlFor="login-password" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
            <input id="login-password" type="password" value={password} required minLength={8} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="input" aria-required="true" />
          </div>

          {error && (
            <p role="alert" aria-live="assertive" style={{ fontSize: 'var(--fs-xs)', color: 'var(--neg)', background: 'var(--neg-bg)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.5 : 1 }}>
            {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign in →' : 'Create account →')}
          </button>

          <p style={{ textAlign: 'center', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: 0 }}>
            {mode === 'login' ? (
              <>No account? <button type="button" onClick={() => { setMode('register'); setError(''); }} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}>Create one</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); }} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}>Sign in</button></>
            )}
          </p>
        </form>

        <p style={{ textAlign: 'center', fontSize: 'var(--fs-xs)', marginTop: 16 }}>
          <a href="/" style={{ color: 'var(--accent)' }}>← Back to home</a>
        </p>
      </div>
    </div>
  );
}

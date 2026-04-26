/**
 * @file BrokerPicker.tsx
 * @description Modal/dropdown that lists supported brokers as clickable
 * cards. Clicking a card calls `GET /api/v1/auth/connect-broker?broker={NAME}`
 * with the bearer token and redirects the user to the returned SnapTrade
 * connection URL.
 *
 * Closes on:
 *  - X button
 *  - Click outside the dialog surface
 *  - Escape key
 *
 * Theme-aware via CSS variables.
 */
import { useEffect, useRef, useState } from 'react';
import { API } from '../lib/api';

export interface BrokerOption {
  id: string;       // Sent to backend as ?broker=ID (uppercased server-side)
  name: string;     // Human-readable label
  region: string;   // e.g. "US", "Global"
}

export const SUPPORTED_BROKERS: readonly BrokerOption[] = [
  { id: 'ROBINHOOD',  name: 'Robinhood',           region: 'US' },
  { id: 'FIDELITY',   name: 'Fidelity',            region: 'US' },
  { id: 'IBKR',       name: 'Interactive Brokers', region: 'Global' },
  { id: 'PUBLIC',     name: 'Public',              region: 'US' },
  { id: 'WEBULL',     name: 'Webull',              region: 'US' },
  { id: 'ETRADE',     name: 'E*TRADE',             region: 'US' },
  { id: 'TASTYTRADE', name: 'TastyTrade',          region: 'US' },
  { id: 'SCHWAB',     name: 'Charles Schwab',      region: 'US' },
] as const;

interface Props {
  onClose: () => void;
}

export default function BrokerPicker({ onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Close on Escape and outside click.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onMouse = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onMouse);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onMouse);
    };
  }, [onClose]);

  async function connect(broker: BrokerOption) {
    setError(null);
    setBusyId(broker.id);
    try {
      const res = await fetch(`${API}/api/v1/auth/connect-broker?broker=${encodeURIComponent(broker.id)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.connection_url) throw new Error('No connection URL returned');
      window.location.href = data.connection_url;
    } catch (e) {
      setBusyId(null);
      setError(`Could not start ${broker.name} connection. Try again.`);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Connect a broker"
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.45)',
        display: 'grid', placeItems: 'center',
        padding: 16,
      }}
    >
      <div
        ref={dialogRef}
        className="card"
        style={{
          width: 'min(560px, 100%)',
          maxHeight: 'calc(100vh - 32px)', overflow: 'auto',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md, 10px)',
          boxShadow: 'var(--shadow-md, 0 12px 40px rgba(0,0,0,0.35))',
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            Connect a broker via SnapTrade
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: 0, background: 'transparent', cursor: 'pointer',
              fontSize: 18, color: 'var(--text-muted)', padding: 4, lineHeight: 1,
            }}
          >×</button>
        </div>
        <p style={{ margin: '4px 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>
          Your credentials never touch HedgeIQ servers.
        </p>

        {error && (
          <div role="alert" style={{
            marginBottom: 12, padding: '8px 12px',
            background: 'var(--warn-bg, #3a1c1c)', border: '1px solid var(--warn, #c0392b)',
            color: 'var(--warn, #c0392b)', borderRadius: 6, fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <div
          role="list"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 10,
          }}
        >
          {SUPPORTED_BROKERS.map(b => {
            const busy = busyId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                role="listitem"
                disabled={busyId !== null}
                onClick={() => connect(b)}
                aria-label={`Connect ${b.name}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                  padding: 12, textAlign: 'left',
                  background: 'var(--surface-2, var(--surface))',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text)',
                  cursor: busyId ? 'wait' : 'pointer',
                  opacity: busyId && !busy ? 0.55 : 1,
                  transition: 'border-color 120ms ease, transform 120ms ease',
                }}
                onMouseEnter={e => { if (!busyId) e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <span aria-hidden style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #000))',
                  color: 'var(--accent-contrast, #fff)',
                  display: 'grid', placeItems: 'center',
                  fontWeight: 700, fontSize: 13,
                }}>
                  {b.name.slice(0, 1)}
                </span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-subtle, var(--text-muted))' }}>
                  {busy ? 'Opening…' : b.region}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 13 }}>
          <a
            href="/help/10-supported-brokers"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            Don&apos;t see your broker? See the full list →
          </a>
        </div>
      </div>
    </div>
  );
}

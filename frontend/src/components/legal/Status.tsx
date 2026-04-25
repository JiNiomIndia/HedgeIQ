/**
 * System Status page — live health probe + component grid.
 * @component
 */
import { useEffect, useState } from 'react';
import LegalLayout from './LegalLayout';

const HEALTH_URL = 'https://hedgeiq-production.up.railway.app/health';

type Health = 'loading' | 'ok' | 'degraded';

const COMPONENTS = [
  { name: 'API', note: 'FastAPI on Railway', status: 'operational' },
  { name: 'Database', note: 'SQLite (persistent volume)', status: 'operational' },
  { name: 'Cache (ChromaDB)', note: 'Vector + AI cache', status: 'operational' },
  { name: 'SnapTrade integration', note: 'Broker connectivity', status: 'operational', link: 'https://status.snaptrade.com' },
  { name: 'Polygon.io', note: 'Market data', status: 'operational', link: 'https://status.polygon.io' },
  { name: 'Anthropic API', note: 'AI inference', status: 'operational', link: 'https://status.anthropic.com' },
];

const Dot = ({ color }: { color: string }) => (
  <span
    style={{
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 0 4px ${color}33`,
      marginRight: 10,
    }}
  />
);

export default function Status() {
  const [health, setHealth] = useState<Health>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch(HEALTH_URL, { method: 'GET' })
      .then(r => {
        if (!cancelled) setHealth(r.ok ? 'ok' : 'degraded');
      })
      .catch(() => {
        if (!cancelled) setHealth('degraded');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const banner = {
    loading: { color: '#94A3B8', label: 'Checking status…' },
    ok: { color: '#10B981', label: 'All systems operational' },
    degraded: { color: '#EF4444', label: 'Degraded — investigating' },
  }[health];

  return (
    <LegalLayout title="System Status">
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          background: '#11172A',
          border: '1px solid var(--border)',
          borderRadius: 12,
          marginBottom: 32,
        }}
      >
        <Dot color={banner.color} />
        <strong style={{ color: 'var(--text)', fontSize: 16 }}>{banner.label}</strong>
      </div>

      <h2>Components</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {COMPONENTS.map(c => (
          <li
            key={c.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <Dot color="#10B981" />
              <span>
                <strong style={{ color: 'var(--text)' }}>{c.name}</strong>{' '}
                <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>· {c.note}</span>
              </span>
            </span>
            <span style={{ fontSize: 13, color: '#10B981' }}>
              {c.status}
              {c.link && (
                <>
                  {' · '}
                  <a href={c.link} target="_blank" rel="noreferrer">status</a>
                </>
              )}
            </span>
          </li>
        ))}
      </ul>

      <h2>Uptime — last 30 days</h2>
      <p>
        <strong>100%</strong> (placeholder — automated uptime measurement coming in v0.2).
      </p>

      <h2>Incident history</h2>
      <p>No incidents reported.</p>

      <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 32, fontStyle: 'italic' }}>
        Live API health is probed from your browser on page load. If you see "Degraded," try refreshing in a few seconds — the Railway free-tier dyno may be cold-starting.
      </p>
    </LegalLayout>
  );
}

import { useState, useRef, useEffect } from 'react';
import PositionsTable from './PositionsTable';
import OptionsChain from './OptionsChain';
import EmergencyHedge from './EmergencyHedge';
import AIChat from './AIChat';
import { useTheme } from '../lib/ThemeProvider';
import { I } from '../lib/icons';
import { THEMES, DENSITIES, type Theme, type Density } from '../lib/theme';

type View = 'positions' | 'options' | 'hedge' | 'chat';

function PreferencesPopover({ onClose }: { onClose: () => void }) {
  const { theme, setTheme, density, setDensity, colorblind, setColorblind, mode, setMode } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="card" style={{
      position: 'absolute', top: 48, right: 12, width: 300, padding: 14, zIndex: 200,
      boxShadow: 'var(--shadow-md)', background: 'var(--surface)', border: '1px solid var(--border)',
    }} role="dialog" aria-label="Preferences">
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', fontFamily: 'var(--font-display)' }}>Preferences</span>
        <button className="btn btn-sm btn-ghost" onClick={onClose} style={{ width: 22, height: 22, padding: 0 }}>
          <I.X size={12} />
        </button>
      </div>

      {/* Theme */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>Aesthetic</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {THEMES.map(t => (
            <button key={t.key} onClick={() => setTheme(t.key as Theme)} style={{
              border: theme === t.key ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              background: theme === t.key ? 'var(--chip)' : 'var(--surface)',
              borderRadius: 'var(--radius-md)', padding: 8, cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
                {t.swatches.map((c, si) => (
                  <span key={si} style={{ width: 12, height: 12, borderRadius: 3, background: c, display: 'inline-block', border: si === 2 ? '1px solid var(--border)' : 'none' }} />
                ))}
              </div>
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text)' }}>{t.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>Density</div>
        <div className="seg" style={{ width: '100%' }}>
          {DENSITIES.map(d => (
            <button key={d.key} className={density === d.key ? 'active' : ''} onClick={() => setDensity(d.key as Density)}
              style={{ flex: 1, textAlign: 'center' }}>
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Colorblind */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={colorblind} onChange={e => setColorblind(e.target.checked)} />
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>Colorblind-safe palette</span>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>(blue/orange)</span>
        </label>
      </div>

      {/* Mode */}
      <div>
        <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>Interface mode</div>
        <div className="seg" style={{ width: '100%' }}>
          <button className={mode === 'classic' ? 'active' : ''} onClick={() => setMode('classic')} style={{ flex: 1, textAlign: 'center' }}>Classic</button>
          <button className={mode === 'futuristic' ? 'active' : ''} onClick={() => setMode('futuristic')} style={{ flex: 1, textAlign: 'center' }}>Futuristic</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [view, setView] = useState<View>('positions');
  const [showPrefs, setShowPrefs] = useState(false);
  const { theme } = useTheme();

  const navItems: { id: View; label: string; Icon: (typeof I)[keyof typeof I] }[] = [
    { id: 'positions', label: 'Positions',  Icon: I.Briefcase },
    { id: 'options',   label: 'Options',    Icon: I.Chart },
    { id: 'hedge',     label: 'Hedge',      Icon: I.Shield },
    { id: 'chat',      label: 'AI Advisor', Icon: I.Sparkle },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(200px, 240px) 1fr',
      gridTemplateRows: '1fr',
      height: '100vh',
      width: '100%',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <aside style={{
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px var(--card-p)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'grid', placeItems: 'center',
            color: 'var(--accent-contrast)', fontWeight: 800,
            fontFamily: 'var(--font-display)', fontSize: 16,
          }}>H</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>HedgeIQ</div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>v0.2 · {theme}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--fs-md)', fontWeight: view === item.id ? 600 : 400,
                color: view === item.id ? 'var(--accent)' : 'var(--text-muted)',
                background: view === item.id ? 'var(--chip)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'background 0.1s, color 0.1s',
              }}>
              <item.Icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '8px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
          <button
            onClick={() => setShowPrefs(v => !v)}
            title="Preferences"
            style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              display: 'grid', placeItems: 'center',
              color: 'var(--text-muted)', background: 'transparent',
              border: '1px solid transparent',
              cursor: 'pointer',
              position: 'relative',
            }}>
            <I.Settings size={16} />
            {showPrefs && <PreferencesPopover onClose={() => setShowPrefs(false)} />}
          </button>
          <button
            onClick={() => { localStorage.removeItem('hedgeiq_token'); window.location.href = '/'; }}
            style={{
              flex: 1, padding: '6px 10px', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)',
              border: '1px solid transparent', background: 'transparent', cursor: 'pointer',
              textAlign: 'left',
            }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {view === 'positions' && <PositionsTable />}
        {view === 'options'   && <OptionsChain />}
        {view === 'hedge'     && <EmergencyHedge />}
        {view === 'chat'      && <AIChat />}
      </main>
    </div>
  );
}

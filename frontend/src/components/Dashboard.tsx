/**
 * @file Dashboard.tsx
 * @description Top-level orchestrator for the authenticated HedgeIQ
 * application. Renders the persistent header (logo, market tape,
 * preferences popover, sign-out), the resizable widget grid powered by
 * `react-grid-layout`, and the position-detail side drawer.
 *
 * Responsibilities:
 *  - Load the saved widget layout from `localStorage` (via
 *    `layout-store`) and persist it on every change.
 *  - Provide the `LayoutContext` so child widgets can add / remove /
 *    reorder themselves without prop-drilling.
 *  - Coordinate the onboarding flow for first-time users.
 *  - Host the in-app preferences popover (theme, density, colour-blind
 *    mode, market mode).
 *
 * Exported components:
 *  - `Dashboard` (default) — the page-level component, mounted at `/app`.
 *  - `PreferencesPopover` (internal) — popover triggered from the header
 *    cog icon.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { GridLayout } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { useTheme } from '../lib/ThemeProvider';
import { I } from '../lib/icons';
import { THEMES, DENSITIES, type Theme, type Density } from '../lib/theme';
import {
  PRESETS, loadLayoutState, saveLayoutState,
  LayoutContext, type WidgetLayout,
} from '../lib/layout-store';
import { WIDGET_REGISTRY } from '../widgets/WidgetRegistry';
import Widget from '../widgets/Widget';
import PositionDrawer from './PositionDrawer';
import MarketTape from './MarketTape';
import Onboarding, { useOnboarding } from './Onboarding';
import BrokerPicker from './BrokerPicker';

function PreferencesPopover({ onClose, onConnectBroker }: { onClose: () => void; onConnectBroker: () => void }) {
  const { theme, setTheme, density, setDensity, colorblind, setColorblind, mode, setMode } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} className="card" style={{
      position: 'absolute', top: 44, right: 0, width: 300, padding: 14, zIndex: 300,
      boxShadow: 'var(--shadow-md)', background: 'var(--surface)', border: '1px solid var(--border)',
    }} role="dialog" aria-modal="true" aria-label="Preferences">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', fontFamily: 'var(--font-display)' }}>Preferences</span>
        <button className="btn btn-sm btn-ghost" onClick={onClose} aria-label="Close preferences" style={{ width: 22, height: 22, padding: 0 }}><I.X size={12} /></button>
      </div>

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

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>Density</div>
        <div className="seg" style={{ width: '100%' }}>
          {DENSITIES.map(d => (
            <button key={d.key} className={density === d.key ? 'active' : ''} onClick={() => setDensity(d.key as Density)} style={{ flex: 1, textAlign: 'center' }}>{d.name}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={colorblind} onChange={e => setColorblind(e.target.checked)} />
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>Colorblind-safe palette</span>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>(blue/orange)</span>
        </label>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>Interface mode</div>
        <div className="seg" style={{ width: '100%' }}>
          <button className={mode === 'classic' ? 'active' : ''} onClick={() => setMode('classic')} style={{ flex: 1, textAlign: 'center' }}>Classic</button>
          <button className={mode === 'futuristic' ? 'active' : ''} onClick={() => setMode('futuristic')} style={{ flex: 1, textAlign: 'center' }}>Futuristic</button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>Connected brokers</div>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => { onConnectBroker(); onClose(); }}
          style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-xs)' }}
        >
          + Connect a broker
        </button>
      </div>
    </div>
  );
}

function AddWidgetDropdown({ currentWidgetIds, onAdd, onClose }: {
  currentWidgetIds: Set<string>;
  onAdd: (widgetId: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const available = Object.entries(WIDGET_REGISTRY).filter(([id]) => !currentWidgetIds.has(id));

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 40, right: 0, width: 200, zIndex: 300,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
      padding: 6,
    }}>
      {available.length === 0
        ? <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', padding: '6px 8px' }}>All widgets are visible</p>
        : available.map(([id, def]) => (
          <button key={id} onClick={() => { onAdd(id); onClose(); }}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', fontSize: 'var(--fs-sm)', color: 'var(--text)', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--chip)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
            {def.title}
          </button>
        ))
      }
    </div>
  );
}

export default function Dashboard() {
  const saved = loadLayoutState();
  const [activePresetId, setActivePresetIdState] = useState(saved.activePresetId);
  const [customLayouts, setCustomLayouts] = useState(saved.customLayouts);
  const [editMode, setEditMode] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showBrokerPicker, setShowBrokerPicker] = useState(false);
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const onboarding = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(onboarding.shouldShow);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const currentLayout: WidgetLayout[] = customLayouts[activePresetId]
    ?? PRESETS.find(p => p.id === activePresetId)?.layout
    ?? PRESETS[0].layout;

  const setActivePreset = useCallback((id: string) => {
    setActivePresetIdState(id);
    saveLayoutState({ activePresetId: id, customLayouts });
  }, [customLayouts]);

  const updateLayout = useCallback((newLayout: WidgetLayout[]) => {
    const next = { ...customLayouts, [activePresetId]: newLayout };
    setCustomLayouts(next);
    saveLayoutState({ activePresetId, customLayouts: next });
  }, [activePresetId, customLayouts]);

  const toggleEditMode = useCallback(() => setEditMode(v => !v), []);

  const removeWidget = (widgetKey: string) => {
    updateLayout(currentLayout.filter(w => w.i !== widgetKey));
  };

  const addWidget = (widgetId: string) => {
    const def = WIDGET_REGISTRY[widgetId];
    if (!def) return;
    const newItem: WidgetLayout = {
      i: `w-${widgetId}-${Date.now()}`,
      widgetId,
      x: 0, y: Infinity,
      w: def.defaultSize.w,
      h: def.defaultSize.h,
    };
    updateLayout([...currentLayout, newItem]);
  };

  const onLayoutChange = (newLayout: Layout) => {
    const merged: WidgetLayout[] = newLayout.map(l => {
      const orig = currentLayout.find(w => w.i === l.i);
      return { i: l.i, x: l.x, y: l.y, w: l.w, h: l.h, widgetId: orig?.widgetId ?? '' };
    });
    updateLayout(merged);
  };

  const currentWidgetIds = new Set(currentLayout.map(w => w.widgetId));
  const ROW_HEIGHT = 40;
  const COLS = 12;

  return (
    <LayoutContext.Provider value={{ activePresetId, setActivePreset, currentLayout, updateLayout, editMode, toggleEditMode }}>
      {/* Skip navigation for keyboard users */}
      <a href="#grid-main" style={{
        position: 'absolute', top: -40, left: 8, zIndex: 9999, padding: '6px 12px',
        background: 'var(--accent)', color: 'var(--accent-contrast)', borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--fs-xs)', fontWeight: 700, textDecoration: 'none',
        transition: 'top 0.1s',
      }}
        onFocus={e => (e.currentTarget.style.top = '8px')}
        onBlur={e => (e.currentTarget.style.top = '-40px')}>
        Skip to dashboard
      </a>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 44, background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'grid', placeItems: 'center', color: 'var(--accent-contrast)', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 14 }}>H</div>
            <span style={{ fontWeight: 700, fontSize: 'var(--fs-md)', fontFamily: 'var(--font-display)', color: 'var(--text)' }}>HedgeIQ</span>
          </div>

          {/* Layout presets */}
          <div style={{ display: 'flex', gap: 4 }}>
            {PRESETS.map(p => (
              <button key={p.id} onClick={() => setActivePreset(p.id)}
                className={activePresetId === p.id ? 'chip' : 'chip chip-outline'}
                style={{ cursor: 'pointer', ...(activePresetId === p.id ? { background: 'var(--accent-bg)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}) }}>
                {p.name}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Edit mode toggle */}
          <button onClick={toggleEditMode}
            className={editMode ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}
            style={{ fontSize: 'var(--fs-xs)' }}>
            <I.Grid size={12} />
            {editMode ? 'Done' : 'Edit Layout'}
          </button>

          {/* Add widget (only in edit mode) */}
          {editMode && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowAddWidget(v => !v)} className="btn btn-sm"
                style={{ fontSize: 'var(--fs-xs)' }}>
                <I.Plus size={12} /> Add Widget
              </button>
              {showAddWidget && (
                <AddWidgetDropdown
                  currentWidgetIds={currentWidgetIds}
                  onAdd={addWidget}
                  onClose={() => setShowAddWidget(false)}
                />
              )}
            </div>
          )}

          {/* Preferences */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowPrefs(v => !v)} className="btn btn-sm btn-ghost" title="Preferences" aria-label="Preferences" aria-haspopup="dialog" aria-expanded={showPrefs}>
              <I.Settings size={14} />
            </button>
            {showPrefs && (
              <PreferencesPopover
                onClose={() => setShowPrefs(false)}
                onConnectBroker={() => setShowBrokerPicker(true)}
              />
            )}
          </div>

          {/* Theme chip */}
          <span className="chip" style={{ fontSize: 10 }}>{theme}</span>

          {/* Sign out */}
          <button onClick={() => { localStorage.removeItem('hedgeiq_token'); window.location.href = '/'; }}
            className="btn btn-sm btn-ghost" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>
            Sign out
          </button>
        </header>

        {/* Market tape */}
        <MarketTape />

        {/* Grid area — <main> landmark for screen reader navigation */}
        <main id="grid-main" ref={containerRef} style={{ flex: 1, overflow: 'auto', padding: 8 }}>
          <GridLayout
            layout={currentLayout}
            width={containerWidth - 16}
            onLayoutChange={onLayoutChange}
            gridConfig={{ cols: COLS, rowHeight: ROW_HEIGHT, margin: [8, 8] as const, containerPadding: [0, 0] as const }}
            dragConfig={{ enabled: editMode, handle: '.widget-drag-handle' }}
            resizeConfig={{ enabled: editMode }}
          >
            {currentLayout.map(item => {
              const def = WIDGET_REGISTRY[item.widgetId];
              if (!def) return null;
              const Comp = def.component;
              return (
                <div key={item.i}>
                  <Widget title={def.title} widgetKey={item.i} onRemove={() => removeWidget(item.i)}>
                    <Comp />
                  </Widget>
                </div>
              );
            })}
          </GridLayout>
        </main>
      </div>
      <PositionDrawer />
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
      {showBrokerPicker && <BrokerPicker onClose={() => setShowBrokerPicker(false)} />}
    </LayoutContext.Provider>
  );
}

import { type ReactNode } from 'react';
import { I } from '../lib/icons';
import { useLayout } from '../lib/layout-store';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface WidgetProps {
  title: string;
  widgetKey: string;
  onRemove?: () => void;
  children: ReactNode;
}

export default function Widget({ title, widgetKey, onRemove, children }: WidgetProps) {
  const { editMode } = useLayout();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header / drag handle */}
      <div
        className={editMode ? 'widget-drag-handle' : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 10px', borderBottom: '1px solid var(--border)',
          background: 'var(--surface)', flexShrink: 0,
          cursor: editMode ? 'grab' : 'default',
          userSelect: 'none',
        }}
        aria-label={title}
      >
        {editMode && (
          <I.Grid size={12} stroke={2} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
        )}
        <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--text)', flex: 1, letterSpacing: '0.01em' }}>
          {title}
        </span>
        {editMode && onRemove && (
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{ padding: 2, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title={`Remove ${title}`}
            aria-label={`Remove ${title} widget`}
          >
            <I.X size={12} stroke={2} />
          </button>
        )}
      </div>
      {/* Body — wrapped in error boundary per widget */}
      <div
        data-widget-id={widgetKey}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
      >
        <ErrorBoundary label={title}>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
}

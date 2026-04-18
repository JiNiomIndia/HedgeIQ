/**
 * Dashboard — main authenticated layout.
 * Left sidebar nav + main content area.
 * @component
 */
import { useState } from 'react';
import PositionsTable from './PositionsTable';
import OptionsChain from './OptionsChain';
import EmergencyHedge from './EmergencyHedge';

type View = 'positions' | 'options' | 'hedge';

export default function Dashboard() {
  const [view, setView] = useState<View>('positions');
  const navItems = [
    { id: 'positions' as View, label: 'Positions', icon: '📊' },
    { id: 'options' as View, label: 'Options Chain', icon: '⛓️' },
    { id: 'hedge' as View, label: 'Emergency Hedge', icon: '🛡️' },
  ];
  return (
    <div className="flex h-screen" style={{backgroundColor: '#0A0E1A', color: '#E8EAF0', fontFamily: 'monospace'}}>
      <div className="w-56 border-r border-gray-800" style={{backgroundColor: '#131929'}}>
        <div className="p-4 border-b border-gray-800">
          <h1 className="font-bold text-lg" style={{color: '#00D4FF'}}>HedgeIQ</h1>
          <p className="text-xs text-gray-500">v0.1</p>
        </div>
        <nav className="p-3">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className="w-full text-left px-3 py-2 rounded mb-1 text-sm transition-colors"
              style={view === item.id
                ? {backgroundColor: '#00D4FF', color: '#0A0E1A', fontWeight: 'bold'}
                : {color: '#9CA3AF'}}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800 mt-auto">
          <button onClick={() => { localStorage.removeItem('hedgeiq_token'); window.location.href = '/'; }}
            className="text-xs text-gray-500 hover:text-red-400">Sign out</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {view === 'positions' && <PositionsTable />}
        {view === 'options' && <OptionsChain />}
        {view === 'hedge' && <EmergencyHedge />}
      </div>
    </div>
  );
}

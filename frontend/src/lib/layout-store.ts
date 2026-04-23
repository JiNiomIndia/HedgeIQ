import { createContext, useContext } from 'react';

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  widgetId: string;
}

export interface Preset {
  id: string;
  name: string;
  layout: WidgetLayout[];
}

export const PRESETS: Preset[] = [
  {
    id: 'dayTrader',
    name: 'Day Trader',
    layout: [
      { i: 'w-positions',     widgetId: 'positions',     x: 0,  y: 0, w: 6, h: 8 },
      { i: 'w-chart',         widgetId: 'chart',         x: 6,  y: 0, w: 6, h: 8 },
      { i: 'w-optionsChain',  widgetId: 'optionsChain',  x: 0,  y: 8, w: 9, h: 9 },
      { i: 'w-aiAdvisor',     widgetId: 'aiAdvisor',     x: 9,  y: 8, w: 3, h: 9 },
    ],
  },
  {
    id: 'longTerm',
    name: 'Long-Term',
    layout: [
      { i: 'w-accountSummary', widgetId: 'accountSummary', x: 0,  y: 0, w: 12, h: 4 },
      { i: 'w-positions',      widgetId: 'positions',      x: 0,  y: 4, w: 12, h: 7 },
      { i: 'w-chart',          widgetId: 'chart',          x: 0,  y: 11, w: 8, h: 8 },
      { i: 'w-aiAdvisor',      widgetId: 'aiAdvisor',      x: 8,  y: 11, w: 4, h: 8 },
    ],
  },
  {
    id: 'hedger',
    name: 'Hedger',
    layout: [
      { i: 'w-positions',  widgetId: 'positions',  x: 0, y: 0, w: 6,  h: 10 },
      { i: 'w-hedge',      widgetId: 'hedge',      x: 6, y: 0, w: 6,  h: 10 },
      { i: 'w-aiAdvisor',  widgetId: 'aiAdvisor',  x: 0, y: 10, w: 12, h: 7 },
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    layout: [
      { i: 'w-positions',  widgetId: 'positions',  x: 0, y: 0, w: 8, h: 17 },
      { i: 'w-aiAdvisor',  widgetId: 'aiAdvisor',  x: 8, y: 0, w: 4, h: 17 },
    ],
  },
];

const STORAGE_KEY = 'hedgeiq_layouts';

export interface LayoutState {
  activePresetId: string;
  customLayouts: Record<string, WidgetLayout[]>;
}

export function loadLayoutState(): LayoutState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { activePresetId: 'dayTrader', customLayouts: {} };
}

export function saveLayoutState(state: LayoutState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export interface LayoutCtx {
  activePresetId: string;
  setActivePreset: (id: string) => void;
  currentLayout: WidgetLayout[];
  updateLayout: (layout: WidgetLayout[]) => void;
  editMode: boolean;
  toggleEditMode: () => void;
}

export const LayoutContext = createContext<LayoutCtx>({
  activePresetId: 'dayTrader',
  setActivePreset: () => {},
  currentLayout: PRESETS[0].layout,
  updateLayout: () => {},
  editMode: false,
  toggleEditMode: () => {},
});

export const useLayout = () => useContext(LayoutContext);

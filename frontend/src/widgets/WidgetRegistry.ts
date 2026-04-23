import type { ComponentType } from 'react';
import PositionsTable from '../components/PositionsTable';
import ChartWidget from './ChartWidget';
import OptionsChain from '../components/OptionsChain';
import EmergencyHedge from '../components/EmergencyHedge';
import AIChat from '../components/AIChat';
import AccountSummary from './AccountSummary';

export interface WidgetDef {
  title: string;
  component: ComponentType<Record<string, never>>;
  defaultSize: { w: number; h: number };
}

export const WIDGET_REGISTRY: Record<string, WidgetDef> = {
  positions:      { title: 'Positions',         component: PositionsTable as ComponentType<Record<string, never>>,  defaultSize: { w: 6, h: 9 } },
  chart:          { title: 'Price Chart',        component: ChartWidget as ComponentType<Record<string, never>>,     defaultSize: { w: 6, h: 8 } },
  optionsChain:   { title: 'Options Chain',      component: OptionsChain as ComponentType<Record<string, never>>,    defaultSize: { w: 8, h: 9 } },
  hedge:          { title: 'Hedge Calculator',   component: EmergencyHedge as ComponentType<Record<string, never>>,  defaultSize: { w: 6, h: 10 } },
  aiAdvisor:      { title: 'AI Advisor',         component: AIChat as ComponentType<Record<string, never>>,          defaultSize: { w: 4, h: 9 } },
  accountSummary: { title: 'Account Summary',    component: AccountSummary,                                          defaultSize: { w: 12, h: 4 } },
};

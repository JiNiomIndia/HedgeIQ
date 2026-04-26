export type Theme = 'midnight' | 'meridian' | 'lumen' | 'terminal';
export type Density = 'balanced' | 'dense' | 'sparse';
export type Mode = 'classic' | 'futuristic';

export const THEMES: { key: Theme; name: string; desc: string; swatches: [string, string, string] }[] = [
  { key: 'midnight', name: 'Midnight', desc: 'Dark · indigo + violet',      swatches: ['#0A0E1A', '#8B5CF6', '#EC4899'] },
  { key: 'meridian', name: 'Meridian', desc: 'Editorial · navy + copper',   swatches: ['#1E2A4A', '#B8542A', '#F4F1EC'] },
  { key: 'lumen',    name: 'Lumen',    desc: 'Light modern · indigo',       swatches: ['#4F46E5', '#22D3EE', '#F7F8FB'] },
  { key: 'terminal', name: 'Terminal', desc: 'Pro dark · neon lime',        swatches: ['#0A0D12', '#C6F24E', '#22D3EE'] },
];

export const DENSITIES: { key: Density; name: string }[] = [
  { key: 'dense',    name: 'Dense' },
  { key: 'balanced', name: 'Balanced' },
  { key: 'sparse',   name: 'Spacious' },
];

export const tokens = {
  color: {
    brand: {
      copper: '#B8542A', navy: '#1E2A4A',
      indigo: '#4F46E5', indigo2: '#6366F1',
      lime: '#C6F24E', cyan: '#22D3EE',
    },
  },
  space: {
    1: '2px', 2: '4px', 3: '8px', 4: '12px',
    5: '16px', 6: '20px', 7: '24px', 8: '32px',
    9: '40px', 10: '56px',
  },
  radius: { sm: '4px', md: '6px', lg: '10px', pill: '999px' },
  type: {
    family: {
      sans: "'Inter Tight', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      serif: "'Fraunces', 'Source Serif Pro', Georgia, serif",
      mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    },
    size: {
      xs: '11px', sm: '12px', md: '13px', lg: '15px',
      xl: '20px', '2xl': '28px', '3xl': '40px', hero: '56px',
    },
  },
} as const;

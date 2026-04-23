import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Theme, Density, Mode } from './theme';

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  density: Density;
  setDensity: (d: Density) => void;
  colorblind: boolean;
  setColorblind: (v: boolean) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('hedgeiq_theme') as Theme) ?? 'meridian'
  );
  const [density, setDensityState] = useState<Density>(
    () => (localStorage.getItem('hedgeiq_density') as Density) ?? 'balanced'
  );
  const [colorblind, setColorblindState] = useState<boolean>(
    () => localStorage.getItem('hedgeiq_colorblind') === 'true'
  );
  const [mode, setModeState] = useState<Mode>(
    () => (localStorage.getItem('hedgeiq_mode') as Mode) ?? 'classic'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('hedgeiq_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    document.body.setAttribute('data-density', density);
    localStorage.setItem('hedgeiq_density', density);
  }, [density]);

  useEffect(() => {
    document.documentElement.setAttribute('data-colorblind', String(colorblind));
    document.body.setAttribute('data-colorblind', String(colorblind));
    localStorage.setItem('hedgeiq_colorblind', String(colorblind));
  }, [colorblind]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    document.body.setAttribute('data-mode', mode);
    localStorage.setItem('hedgeiq_mode', mode);
  }, [mode]);

  const setTheme = (t: Theme) => setThemeState(t);
  const setDensity = (d: Density) => setDensityState(d);
  const setColorblind = (v: boolean) => setColorblindState(v);
  const setMode = (m: Mode) => setModeState(m);

  return (
    <Ctx.Provider value={{ theme, setTheme, density, setDensity, colorblind, setColorblind, mode, setMode }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

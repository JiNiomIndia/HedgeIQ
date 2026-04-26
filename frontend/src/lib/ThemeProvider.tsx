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

const VALID_THEMES: readonly Theme[] = ['midnight', 'meridian', 'lumen', 'terminal'];

/**
 * Read the unified theme from localStorage.
 * Performs a one-shot migration from the legacy `hedgeiq_wiki_theme` key:
 *   if `hedgeiq_theme` is empty but `hedgeiq_wiki_theme` exists, copy the value
 *   over and remove the legacy key.
 * Falls back to 'midnight' (the new app-wide default).
 */
function loadInitialTheme(): Theme {
  try {
    let stored = localStorage.getItem('hedgeiq_theme');
    if (!stored) {
      const legacy = localStorage.getItem('hedgeiq_wiki_theme');
      if (legacy) {
        localStorage.setItem('hedgeiq_theme', legacy);
        localStorage.removeItem('hedgeiq_wiki_theme');
        stored = legacy;
      }
    }
    if (stored && (VALID_THEMES as readonly string[]).includes(stored)) {
      return stored as Theme;
    }
  } catch {
    /* ignore */
  }
  return 'midnight';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(loadInitialTheme);
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

  // Cross-tab sync: react to localStorage changes from another tab.
  // Same-tab sync: react to a custom 'hedgeiq:theme' event so the navbar /
  // landing theme switcher can update the dashboard provider live.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== 'hedgeiq_theme' || !e.newValue) return;
      if ((VALID_THEMES as readonly string[]).includes(e.newValue)) {
        setThemeState(e.newValue as Theme);
      }
    }
    function onCustom(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (detail && (VALID_THEMES as readonly string[]).includes(detail)) {
        setThemeState(detail as Theme);
      }
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('hedgeiq:theme', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hedgeiq:theme', onCustom as EventListener);
    };
  }, []);

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

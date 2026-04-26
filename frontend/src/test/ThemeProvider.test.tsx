/**
 * Unit tests for ThemeProvider and useTheme hook.
 *
 * Contract: ThemeProvider reads/writes localStorage, applies data-theme / data-density /
 * data-mode / data-colorblind to both <html> and <body>, and exposes setters via context.
 */
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '../lib/ThemeProvider';

// ---------------------------------------------------------------------------
// Test component that exposes the theme context
// ---------------------------------------------------------------------------

function ThemeConsumer() {
  const { theme, setTheme, density, setDensity, colorblind, setColorblind, mode, setMode } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="density">{density}</span>
      <span data-testid="mode">{mode}</span>
      <span data-testid="colorblind">{String(colorblind)}</span>
      <button onClick={() => setTheme('terminal')}>set-terminal</button>
      <button onClick={() => setTheme('lumen')}>set-lumen</button>
      <button onClick={() => setTheme('meridian')}>set-meridian</button>
      <button onClick={() => setTheme('midnight')}>set-midnight</button>
      <button onClick={() => setDensity('dense')}>set-dense</button>
      <button onClick={() => setDensity('balanced')}>set-balanced</button>
      <button onClick={() => setMode('futuristic')}>set-futuristic</button>
      <button onClick={() => setMode('classic')}>set-classic</button>
      <button onClick={() => setColorblind(true)}>set-colorblind-true</button>
      <button onClick={() => setColorblind(false)}>set-colorblind-false</button>
    </div>
  );
}

function Wrapper() {
  return (
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  // Reset data attributes
  document.documentElement.removeAttribute('data-theme');
  document.body.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-density');
  document.body.removeAttribute('data-density');
  document.documentElement.removeAttribute('data-mode');
  document.body.removeAttribute('data-mode');
  document.documentElement.removeAttribute('data-colorblind');
  document.body.removeAttribute('data-colorblind');
});

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

describe('ThemeProvider — defaults', () => {
  it('default theme is "midnight" when localStorage is empty', () => {
    render(<Wrapper />);
    expect(screen.getByTestId('theme').textContent).toBe('midnight');
  });

  it('migrates legacy "hedgeiq_wiki_theme" to "hedgeiq_theme" on first load', () => {
    localStorage.setItem('hedgeiq_wiki_theme', 'terminal');
    render(<Wrapper />);
    expect(screen.getByTestId('theme').textContent).toBe('terminal');
    expect(localStorage.getItem('hedgeiq_theme')).toBe('terminal');
    expect(localStorage.getItem('hedgeiq_wiki_theme')).toBeNull();
  });

  it('prefers "hedgeiq_theme" when both keys exist (no migration overwrite)', () => {
    localStorage.setItem('hedgeiq_theme', 'lumen');
    localStorage.setItem('hedgeiq_wiki_theme', 'terminal');
    render(<Wrapper />);
    expect(screen.getByTestId('theme').textContent).toBe('lumen');
  });

  it('default density is "balanced"', () => {
    render(<Wrapper />);
    expect(screen.getByTestId('density').textContent).toBe('balanced');
  });

  it('default mode is "classic"', () => {
    render(<Wrapper />);
    expect(screen.getByTestId('mode').textContent).toBe('classic');
  });

  it('default colorblind is false', () => {
    render(<Wrapper />);
    expect(screen.getByTestId('colorblind').textContent).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

describe('ThemeProvider — theme', () => {
  it('setting "terminal" updates data-theme on html and body', () => {
    render(<Wrapper />);
    act(() => screen.getByText('set-terminal').click());
    expect(document.documentElement.getAttribute('data-theme')).toBe('terminal');
    expect(document.body.getAttribute('data-theme')).toBe('terminal');
  });

  it('setting "lumen" updates data-theme on html and body', () => {
    render(<Wrapper />);
    act(() => screen.getByText('set-lumen').click());
    expect(document.documentElement.getAttribute('data-theme')).toBe('lumen');
    expect(document.body.getAttribute('data-theme')).toBe('lumen');
  });

  it('theme is persisted to localStorage as "hedgeiq_theme"', () => {
    render(<Wrapper />);
    act(() => screen.getByText('set-terminal').click());
    expect(localStorage.getItem('hedgeiq_theme')).toBe('terminal');
  });

  it('restores theme from localStorage on mount', () => {
    localStorage.setItem('hedgeiq_theme', 'lumen');
    render(<Wrapper />);
    expect(screen.getByTestId('theme').textContent).toBe('lumen');
  });
});

// ---------------------------------------------------------------------------
// Density
// ---------------------------------------------------------------------------

describe('ThemeProvider — density', () => {
  it('setting "dense" updates data-density on html and body', () => {
    render(<Wrapper />);
    act(() => screen.getByText('set-dense').click());
    expect(document.documentElement.getAttribute('data-density')).toBe('dense');
    expect(document.body.getAttribute('data-density')).toBe('dense');
  });

  it('density is persisted to localStorage as "hedgeiq_density"', () => {
    render(<Wrapper />);
    act(() => screen.getByText('set-dense').click());
    expect(localStorage.getItem('hedgeiq_density')).toBe('dense');
  });
});

// ---------------------------------------------------------------------------
// Mode
// ---------------------------------------------------------------------------

describe('ThemeProvider — mode', () => {
  it('setting "futuristic" updates data-mode on html and body', () => {
    render(<Wrapper />);
    act(() => screen.getByText('set-futuristic').click());
    expect(document.documentElement.getAttribute('data-mode')).toBe('futuristic');
    expect(document.body.getAttribute('data-mode')).toBe('futuristic');
  });

  it('mode is persisted to localStorage as "hedgeiq_mode"', () => {
    render(<Wrapper />);
    act(() => screen.getByText('set-futuristic').click());
    expect(localStorage.getItem('hedgeiq_mode')).toBe('futuristic');
  });

  it('restores mode from localStorage on mount', () => {
    localStorage.setItem('hedgeiq_mode', 'futuristic');
    render(<Wrapper />);
    expect(screen.getByTestId('mode').textContent).toBe('futuristic');
  });
});

// ---------------------------------------------------------------------------
// Colorblind
// ---------------------------------------------------------------------------

describe('ThemeProvider — colorblind', () => {
  it('setting colorblind=true updates data-colorblind="true" on html and body', () => {
    render(<Wrapper />);
    act(() => screen.getByText('set-colorblind-true').click());
    expect(document.documentElement.getAttribute('data-colorblind')).toBe('true');
    expect(document.body.getAttribute('data-colorblind')).toBe('true');
  });

  it('colorblind state is persisted to localStorage', () => {
    render(<Wrapper />);
    act(() => screen.getByText('set-colorblind-true').click());
    expect(localStorage.getItem('hedgeiq_colorblind')).toBe('true');
  });

  it('setting colorblind=false updates data-colorblind="false"', () => {
    render(<Wrapper />);
    act(() => screen.getByText('set-colorblind-true').click());
    act(() => screen.getByText('set-colorblind-false').click());
    expect(document.body.getAttribute('data-colorblind')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// useTheme outside provider
// ---------------------------------------------------------------------------

describe('useTheme — error boundary', () => {
  it('throws when used outside ThemeProvider', () => {
    // Silence the React error boundary console output during this test
    const originalError = console.error;
    console.error = () => {};

    function BadConsumer() {
      useTheme();
      return null;
    }

    expect(() => render(<BadConsumer />)).toThrow();
    console.error = originalError;
  });
});

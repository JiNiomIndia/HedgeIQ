import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import ExplainerVideo from '../components/landing/ExplainerVideo';

beforeAll(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (q: string) => ({
        matches: false, media: q, onchange: null,
        addListener: () => {}, removeListener: () => {},
        addEventListener: () => {}, removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
});

describe('ExplainerVideo', () => {
  it('renders heading and play button', () => {
    render(<ExplainerVideo />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/See how it works in 60 seconds/i);
    expect(screen.getByRole('button', { name: /Play explainer video/i })).toBeInTheDocument();
  });

  it('shows scene 1 caption initially with progress controls for all 5 scenes', () => {
    render(<ExplainerVideo />);
    // Caption for scene 1
    expect(screen.getByText(/Sunday night/i)).toBeInTheDocument();
    // 5 scene tab buttons
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(5);
  });
});

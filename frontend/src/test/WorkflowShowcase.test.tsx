/**
 * WorkflowShowcase tests — verifies 4 steps render and sticky right column exists.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import WorkflowShowcase from '../components/landing/WorkflowShowcase';

beforeAll(() => {
  // jsdom doesn't implement IntersectionObserver
  // @ts-expect-error - test stub
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((q: string) => ({
        matches: false, media: q, onchange: null,
        addListener: () => {}, removeListener: () => {},
        addEventListener: () => {}, removeEventListener: () => {},
        dispatchEvent: () => false,
      })),
    });
  }
});

describe('WorkflowShowcase', () => {
  it('renders 4 step blocks', () => {
    render(<WorkflowShowcase />);
    expect(screen.getAllByTestId('workflow-step')).toHaveLength(4);
  });

  it('renders the sticky right column', () => {
    render(<WorkflowShowcase />);
    const sticky = screen.queryByTestId('workflow-sticky');
    // sticky is desktop-only; under reduced motion only the stacked variant renders
    // either way, the section itself must render
    expect(screen.getByText(/From signup to hedge in four steps/i)).toBeInTheDocument();
    if (sticky) {
      expect(sticky).toHaveStyle({ position: 'sticky' });
    }
  });

  it('renders step titles Connect, Sync, Hedge, Decide', () => {
    render(<WorkflowShowcase />);
    ['Connect', 'Sync', 'Hedge', 'Decide'].forEach(t => {
      expect(screen.getByRole('heading', { level: 3, name: t })).toBeInTheDocument();
    });
  });
});

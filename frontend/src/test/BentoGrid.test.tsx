/**
 * BentoGrid tests — verifies 6 cards render with varying grid areas.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BentoGrid from '../components/landing/BentoGrid';

describe('BentoGrid', () => {
  it('renders 6 bento cards', () => {
    render(<BentoGrid />);
    const cards = screen.getAllByTestId('bento-card');
    expect(cards).toHaveLength(6);
  });

  it('cards have varying grid areas (bento layout, not uniform)', () => {
    render(<BentoGrid />);
    const cards = screen.getAllByTestId('bento-card');
    const areas = cards.map(c => (c as HTMLElement).style.gridArea);
    // Must have at least 3 distinct grid-area values to qualify as bento
    const unique = new Set(areas);
    expect(unique.size).toBeGreaterThanOrEqual(3);
  });

  it('renders all 6 expected feature titles', () => {
    render(<BentoGrid />);
    ['Unified portfolio', 'AI advisor', 'Smart hedge', 'Smart caching', 'Real-time chains', 'Production security']
      .forEach(t => expect(screen.getByText(t)).toBeInTheDocument());
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import About from '../components/legal/About';

describe('About', () => {
  it('renders origin story with AAL mention', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 1, name: /About HedgeIQ/i })).toBeInTheDocument();
    expect(screen.getAllByText(/AAL/).length).toBeGreaterThan(0);
  });
});

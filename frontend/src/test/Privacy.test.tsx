import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Privacy from '../components/legal/Privacy';

describe('Privacy', () => {
  it('renders with Effective date', () => {
    render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Effective/i).length).toBeGreaterThan(0);
  });
});

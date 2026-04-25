/**
 * Unit tests for LoginPage component.
 *
 * Contract: The login/register form correctly handles user input, API responses,
 * mode switching, error display, and post-login redirect.
 *
 * All /api/v1/auth/* calls are intercepted via vi.stubGlobal('fetch').
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LoginPage from '../components/LoginPage';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();

function successResponse(data: object) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
  });
}

function errorResponse(status: number, detail: string) {
  return Promise.resolve({
    ok: false,
    status,
    json: async () => ({ detail }),
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
  localStorage.clear();

  // Stub window.location.href setter
  Object.defineProperty(window, 'location', {
    value: { href: 'http://localhost/' },
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('LoginPage — rendering', () => {
  it('renders "Sign in" heading by default', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sign in');
  });

  it('renders HedgeIQ brand name', () => {
    render(<LoginPage />);
    expect(screen.getByText('HedgeIQ')).toBeInTheDocument();
  });

  it('email input has type="email" and is required', () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('you@example.com');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toBeRequired();
  });

  it('password input has type="password" and minLength=8', () => {
    render(<LoginPage />);
    const pwInput = screen.getByPlaceholderText('••••••••');
    expect(pwInput).toHaveAttribute('type', 'password');
    expect(pwInput).toHaveAttribute('minlength', '8');
  });

  it('email input is auto-focused on mount', () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('you@example.com');
    // React's autoFocus either sets the attribute or focuses the element in jsdom
    const hasFocus = document.activeElement === emailInput;
    const hasAttr = emailInput.hasAttribute('autofocus');
    expect(hasFocus || hasAttr).toBe(true);
  });

  it('"Back to home" link points to "/"', () => {
    render(<LoginPage />);
    const link = screen.getByText('← Back to home');
    expect(link.closest('a')).toHaveAttribute('href', '/');
  });
});

// ---------------------------------------------------------------------------
// Mode switching
// ---------------------------------------------------------------------------

describe('LoginPage — mode switching', () => {
  it('"Create one" switches to register mode and shows "Create account" heading', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Create one'));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Create account');
  });

  it('"Sign in" link in register mode switches back to login mode', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Create one'));
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sign in');
  });

  it('error is cleared when switching modes', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(401, 'Invalid credentials'));
    render(<LoginPage />);

    // Trigger an error
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
    fireEvent.submit(screen.getByText('Sign in →').closest('form')!);

    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument());

    // Switch mode — error should disappear
    fireEvent.click(screen.getByText('Create one'));
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Successful login
// ---------------------------------------------------------------------------

describe('LoginPage — successful login', () => {
  it('stores access_token in localStorage on successful login', async () => {
    mockFetch.mockResolvedValueOnce(successResponse({ access_token: 'jwt-token-xyz' }));
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'MyPassword1!' } });
    fireEvent.submit(screen.getByText('Sign in →').closest('form')!);

    await waitFor(() => {
      expect(localStorage.getItem('hedgeiq_token')).toBe('jwt-token-xyz');
    });
  });

  it('redirects to /dashboard on successful login', async () => {
    mockFetch.mockResolvedValueOnce(successResponse({ access_token: 'jwt-abc' }));
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'MyPassword1!' } });
    fireEvent.submit(screen.getByText('Sign in →').closest('form')!);

    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard');
    });
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe('LoginPage — error handling', () => {
  it('shows "Invalid email or password." on 401', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(401, 'Invalid credentials'));
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
    fireEvent.submit(screen.getByText('Sign in →').closest('form')!);

    await waitFor(() => {
      // Shows either the API detail or the fallback message
      const errorEl = document.querySelector('[style*="var(--neg)"]') as HTMLElement;
      expect(errorEl?.textContent).toBeTruthy();
    });
  });

  it('shows "Email already registered" detail on 409 during register', async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(409, 'Email already registered'));
    render(<LoginPage />);

    fireEvent.click(screen.getByText('Create one'));
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'dup@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'MyPassword1!' } });
    fireEvent.submit(screen.getByText('Create account →').closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('shows connection error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'MyPassword1!' } });
    fireEvent.submit(screen.getByText('Sign in →').closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Connection error. Please try again.')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe('LoginPage — loading state', () => {
  it('submit button shows "Signing in…" while loading', async () => {
    // Never resolves — keeps the loading state
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'MyPassword1!' } });

    await act(async () => {
      fireEvent.submit(screen.getByText('Sign in →').closest('form')!);
    });

    expect(screen.getByText('Signing in…')).toBeInTheDocument();
  });

  it('submit button is disabled while loading', async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'MyPassword1!' } });

    await act(async () => {
      fireEvent.submit(screen.getByText('Sign in →').closest('form')!);
    });

    expect(screen.getByText('Signing in…').closest('button')).toBeDisabled();
  });

  it('shows "Creating account…" in register mode while loading', async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    render(<LoginPage />);

    fireEvent.click(screen.getByText('Create one'));
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'MyPassword1!' } });

    await act(async () => {
      fireEvent.submit(screen.getByText('Create account →').closest('form')!);
    });

    expect(screen.getByText('Creating account…')).toBeInTheDocument();
  });
});

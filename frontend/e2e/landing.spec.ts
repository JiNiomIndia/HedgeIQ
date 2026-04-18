/**
 * E2E: Landing page — public marketing page.
 *
 * These tests run against the real Vite dev server.
 * No auth token is set so we land on the public page.
 */
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Ensure no stale auth token
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('hedgeiq_token'));
  await page.goto('/');
});

test('shows hero headline', async ({ page }) => {
  await expect(page.getByText(/Hedge your portfolio at midnight/i)).toBeVisible();
});

test('shows all three feature cards', async ({ page }) => {
  await expect(page.getByText('Unified dashboard')).toBeVisible();
  await expect(page.getByText('Smart hedge calculator')).toBeVisible();
  // 'Plain English AI' appears in both a feature heading and the story body — target the heading
  await expect(page.getByRole('heading', { name: 'Plain English AI' })).toBeVisible();
});

test('shows the AAL origin story section', async ({ page }) => {
  await expect(page.getByText(/5,000 shares of AAL/i)).toBeVisible();
});

test('waitlist form submits and shows confirmation', async ({ page }) => {
  // Mock the API call so test is hermetic
  await page.route('**/api/v1/auth/waitlist', route =>
    route.fulfill({ status: 200, body: JSON.stringify({ message: 'ok', position: 48 }) })
  );

  await page.fill('input[placeholder="your@email.com"]', 'e2e@hedgeiq.com');
  await page.click('button:has-text("Join")');
  await expect(page.getByText(/You're on the list/i)).toBeVisible();
});

test('CTA navigates to dashboard', async ({ page }) => {
  await page.click('text=Try it free');
  // Without a token, we'd land on dashboard (App.tsx has no guard for this path)
  await expect(page).toHaveURL(/\/dashboard/);
});

/**
 * E2E: Dashboard — authenticated main app.
 *
 * We inject a mock JWT into localStorage to simulate being logged in.
 * All API calls are intercepted with route mocking so tests run offline.
 */
import { test, expect } from '@playwright/test';

// Mock positions payload
const MOCK_POSITIONS = {
  positions: [
    {
      broker: 'Robinhood',
      accountName: 'Robinhood Individual',
      symbol: 'DOGE',
      quantity: 100,
      entryPrice: 0.1795,
      currentPrice: 0.17,
      marketValue: 17.0,
      unrealisedPnl: -0.95,
      unrealisedPnlPct: -5.29,
    },
  ],
  total_value: 17.0,
  total_unrealised_pnl: -0.95,
};

const MOCK_HEDGE = {
  recommendations: [
    {
      expiry_date: '2026-06-18',
      strike: 10.0,
      ask: 0.51,
      total_cost: 51.0,
      breakeven_price: 9.49,
      open_interest: 75310,
      value_score: 0.92,
      ai_explanation: 'This put protects you if AAL falls below $9.49.',
    },
  ],
};

test.beforeEach(async ({ page }) => {
  // Inject a fake token so App.tsx routes us to Dashboard
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('hedgeiq_token', 'fake-e2e-token'));

  // Mock all API routes
  await page.route('**/api/v1/positions', route =>
    route.fulfill({ status: 200, body: JSON.stringify(MOCK_POSITIONS) })
  );
  await page.route('**/api/v1/hedge/recommend', route =>
    route.fulfill({ status: 200, body: JSON.stringify(MOCK_HEDGE) })
  );
  await page.route('**/api/v1/options**', route =>
    route.fulfill({ status: 200, body: JSON.stringify({ contracts: [] }) })
  );

  await page.goto('/dashboard');
});

test('renders HedgeIQ brand in sidebar', async ({ page }) => {
  await expect(page.getByText('HedgeIQ')).toBeVisible();
});

test('sidebar shows all three nav items', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Positions/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Options Chain/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Emergency Hedge/i })).toBeVisible();
});

test('positions tab shows DOGE from Robinhood', async ({ page }) => {
  await expect(page.getByText('DOGE')).toBeVisible();
  // 'Robinhood' appears as both section heading and part of 'Robinhood Individual' cell — target heading
  await expect(page.getByRole('heading', { name: 'Robinhood' })).toBeVisible();
  await expect(page.getByText('Robinhood Individual')).toBeVisible();
});

test('switching to Emergency Hedge shows calculator', async ({ page }) => {
  await page.click('button:has-text("Emergency Hedge")');
  await expect(page.getByText('Emergency Hedge Calculator')).toBeVisible();
  await expect(page.getByPlaceholder('AAL')).toBeVisible();
});

test('hedge calculator returns recommendations', async ({ page }) => {
  await page.click('button:has-text("Emergency Hedge")');

  await page.fill('input[placeholder="AAL"]', 'AAL');
  await page.fill('input[placeholder="5000"]', '100');
  await page.fill('input[placeholder="11.30"]', '11.30');
  await page.fill('input[placeholder="10.97"]', '10.97');

  await page.click('button:has-text("Find Best Hedge")');

  await expect(page.getByText(/2026-06-18/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/This put protects/i)).toBeVisible();
});

test('sign out clears token and shows landing page', async ({ page }) => {
  await page.click('text=Sign out');
  await expect(page).toHaveURL('/');
  await expect(page.getByText(/Hedge your portfolio at midnight/i)).toBeVisible();
});

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config for HedgeIQ.
 *
 * Runs against the Vite dev server (port 3000).
 * Backend must be running on port 8000 for login/API tests.
 *
 * Usage:
 *   npm run test:e2e            – headless Chromium
 *   npx playwright test --ui   – interactive UI mode
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Spin up the Vite dev server automatically before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});

/**
 * Playwright config for LIVE PRODUCTION E2E run.
 *
 * Targets the deployed Vercel frontend + Railway backend. Does NOT
 * spin up a local web server. Use:
 *   npx playwright test -c playwright.live.config.ts
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /live-production-e2e\.spec\.ts/,
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/live-prod/results.json' }],
    ['html', { outputFolder: 'playwright-report-live', open: 'never' }],
  ],
  outputDir: 'test-results/live-prod',
  use: {
    baseURL: 'https://hedge-iq-five.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    ignoreHTTPSErrors: true,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

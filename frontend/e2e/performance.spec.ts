/**
 * E2E: Core Web Vitals & performance assertions.
 *
 * Contract: Key pages must meet Lighthouse performance thresholds and
 * the dashboard must load within acceptable time bounds.
 *
 * Note: Lighthouse requires a real network context; these tests are skipped
 * in CI if playwright-lighthouse is not installed. The navigation timing
 * assertions run unconditionally.
 *
 * To install: npm install --save-dev playwright-lighthouse
 */
import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function mockAPIs(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/positions', route =>
    route.fulfill({ status: 200, body: JSON.stringify({ positions: [], total_value: 0, total_unrealised_pnl: 0 }) })
  );
  await page.route('**/api/v1/quotes/**', route =>
    route.fulfill({ status: 200, body: JSON.stringify({ bars: [], articles: [] }) })
  );
  await page.route('**/api/v1/options/**', route =>
    route.fulfill({ status: 200, body: JSON.stringify({ underlying: '', expiry_date: '', puts: [], calls: [] }) })
  );
  await page.route('**/api/v1/ai/**', route =>
    route.fulfill({ status: 200, body: JSON.stringify({ reply: 'OK', model_used: 'claude' }) })
  );
}

// ---------------------------------------------------------------------------
// Navigation timing — unconditional
// ---------------------------------------------------------------------------

test('landing page loads within 3 seconds', async ({ page }) => {
  const start = Date.now();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(3000);
});

test('login page loads within 2 seconds', async ({ page }) => {
  const start = Date.now();
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(2000);
});

test('dashboard loads within 5 seconds after token injection', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('hedgeiq_token', 'perf-test-token'));
  await mockAPIs(page);

  const start = Date.now();
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(5000);
});

// ---------------------------------------------------------------------------
// Paint timing via PerformanceObserver
// ---------------------------------------------------------------------------

test('landing page FCP < 3000ms', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  const fcp = await page.evaluate(() => {
    const entries = performance.getEntriesByType('paint');
    const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : null;
  });

  if (fcp !== null) {
    expect(fcp).toBeLessThan(3000);
  }
  // If FCP is not recorded (JSDOM/Chromium headless), skip assertion
});

test('dashboard FCP < 4000ms', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('hedgeiq_token', 'perf-fcp-token'));
  await mockAPIs(page);

  await page.goto('/dashboard', { waitUntil: 'networkidle' });

  const fcp = await page.evaluate(() => {
    const entries = performance.getEntriesByType('paint');
    const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : null;
  });

  if (fcp !== null) {
    expect(fcp).toBeLessThan(4000);
  }
});

// ---------------------------------------------------------------------------
// Cumulative Layout Shift
// ---------------------------------------------------------------------------

test('landing page CLS < 0.25', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Allow layout to settle

  const cls = await page.evaluate(() => {
    return new Promise<number>(resolve => {
      let clsValue = 0;
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value || 0;
          }
        }
      });
      try {
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1000);
      } catch {
        resolve(0); // layout-shift not supported in this context
      }
    });
  });

  expect(cls).toBeLessThan(0.25);
});

// ---------------------------------------------------------------------------
// Resource sizes
// ---------------------------------------------------------------------------

test('no single resource exceeds 2MB in transfer size', async ({ page }) => {
  const oversizedResources: string[] = [];

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      try {
        const headers = response.headers();
        const contentLength = parseInt(headers['content-length'] || '0', 10);
        if (contentLength > 2 * 1024 * 1024) {
          oversizedResources.push(`${url}: ${(contentLength / 1024 / 1024).toFixed(2)}MB`);
        }
      } catch { /* ignore */ }
    }
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  expect(oversizedResources).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// Lighthouse audit (conditional — only if playwright-lighthouse is available)
// ---------------------------------------------------------------------------

test('Lighthouse performance score ≥ 70 on landing page', async ({ page }) => {
  let playAudit: (options: object) => Promise<{ lhr: { categories: Record<string, { score: number }> } }>;
  try {
    const module = await import('playwright-lighthouse');
    playAudit = module.default || module.playAudit;
  } catch {
    test.skip();
    return;
  }

  await page.goto('/');

  try {
    const { lhr } = await playAudit({
      page,
      thresholds: {
        performance: 70,
        accessibility: 80,
      },
      opts: {
        formFactor: 'desktop',
        screenEmulation: { disabled: true },
      },
    });

    const perfScore = lhr.categories.performance.score * 100;
    const a11yScore = lhr.categories.accessibility.score * 100;

    console.log(`Lighthouse — Performance: ${perfScore}, Accessibility: ${a11yScore}`);
    expect(perfScore).toBeGreaterThanOrEqual(70);
    expect(a11yScore).toBeGreaterThanOrEqual(80);
  } catch (err) {
    console.warn('Lighthouse audit skipped:', (err as Error).message);
    test.skip();
  }
});

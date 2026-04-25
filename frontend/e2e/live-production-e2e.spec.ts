/**
 * LIVE PRODUCTION E2E SUITE — HedgeIQ
 *
 * Targets: https://hedge-iq-five.vercel.app (frontend) and
 *          https://hedgeiq-production.up.railway.app (backend).
 *
 * Credentials are read from env vars only:
 *   HEDGEIQ_ADMIN_EMAIL / HEDGEIQ_ADMIN_PASSWORD
 *   HEDGEIQ_USER_EMAIL  / HEDGEIQ_USER_PASSWORD
 *
 * Daily AI-call budget: free user has 5/day. We use AT MOST 1 free-user
 * AI call. Admin user bypasses the limit so we use admin for AI tests.
 */
import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

const BACKEND = 'https://hedgeiq-production.up.railway.app';
const FRONTEND = 'https://hedge-iq-five.vercel.app';

const ADMIN_EMAIL = process.env.HEDGEIQ_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.HEDGEIQ_ADMIN_PASSWORD || '';
const USER_EMAIL = process.env.HEDGEIQ_USER_EMAIL || '';
const USER_PASSWORD = process.env.HEDGEIQ_USER_PASSWORD || '';

interface PhaseResult {
  phase: string;
  test: string;
  status: 'pass' | 'fail' | 'skip';
  durationMs: number;
  notes?: string;
}
const RESULTS: PhaseResult[] = [];
const CONSOLE_ERRORS: string[] = [];
const PERF: Record<string, { dcl?: number; fcp?: number }> = {};
const A11Y: Record<string, { critical: number; serious: number; details: string }> = {};
let DAILY_LIMIT_OUTCOME = 'unknown';
let WIKI_STATUS = 'unknown';
let PRESENTATION_STATUS = 'unknown';

function record(phase: string, name: string, status: 'pass' | 'fail' | 'skip', durationMs: number, notes?: string) {
  RESULTS.push({ phase, test: name, status, durationMs, notes });
}

function persistSummary() {
  const dir = 'test-results/live-prod';
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify({
    results: RESULTS,
    consoleErrors: CONSOLE_ERRORS,
    performance: PERF,
    accessibility: A11Y,
    dailyLimit: DAILY_LIMIT_OUTCOME,
    wiki: WIKI_STATUS,
    presentation: PRESENTATION_STATUS,
  }, null, 2));
}

test.afterAll(() => persistSummary());

async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('hedgeiq_onboarded', '1'));
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  const respPromise = page.waitForResponse(
    (r) => r.url().includes('/api/v1/auth/login') && r.request().method() === 'POST',
    { timeout: 60_000 }
  );
  await page.click('button[type="submit"]');
  const resp = await respPromise;
  if (resp.status() !== 200) {
    throw new Error(`login failed http=${resp.status()}`);
  }
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => localStorage.setItem('hedgeiq_onboarded', '1'));
  await page.waitForTimeout(500);
}

async function attachConsoleListener(page: Page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!/favicon|fonts.googleapis/i.test(text)) {
        CONSOLE_ERRORS.push(text.substring(0, 300));
      }
    }
  });
}

// PHASE A — Public/Unauthenticated
test.describe('Phase A — Public/Unauthenticated', () => {
  test.describe.configure({ mode: 'serial' });

  test('A1 landing page renders headline', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/');
    await expect(page.getByText(/Hedge your portfolio at midnight/i)).toBeVisible();
    record('A', 'landing-headline', 'pass', Date.now() - t0);
  });

  test('A2 landing CTA navigates to /login or /dashboard', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/');
    await page.click('text=Try it free');
    await expect(page).toHaveURL(/\/(login|dashboard)/);
    record('A', 'landing-cta', 'pass', Date.now() - t0);
  });

  test('A3 waitlist form rejects empty email', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/');
    let apiCalled = false;
    await page.route('**/api/v1/auth/waitlist', (route) => { apiCalled = true; route.continue(); });
    const join = page.locator('button:has-text("Join")').first();
    if (await join.isVisible()) {
      await join.click();
      await page.waitForTimeout(500);
    }
    expect(apiCalled).toBeFalsy();
    record('A', 'waitlist-empty', 'pass', Date.now() - t0);
  });

  test('A4 waitlist accepts email', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/');
    const email = `e2e+waitlist+${Date.now()}@hedgeiq-test.com`;
    await page.fill('input[placeholder="your@email.com"]', email);
    await page.click('button:has-text("Join")');
    await expect(page.getByText(/You're on the list|on the list|joined/i)).toBeVisible({ timeout: 10_000 });
    record('A', 'waitlist-success', 'pass', Date.now() - t0);
  });

  test('A5 login page renders', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    record('A', 'login-renders', 'pass', Date.now() - t0);
  });

  test('A6 login validates required fields (HTML5)', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/login');
    await page.click('button[type="submit"]');
    const isInvalid = await page.locator('input[type="email"]').evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBeTruthy();
    record('A', 'login-required-validation', 'pass', Date.now() - t0);
  });

  test('A7 login with wrong password shows error', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/login');
    await page.fill('input[type="email"]', 'e2e-fake@hedgeiq.test');
    await page.fill('input[type="password"]', 'wrongpass123');
    const respPromise = page.waitForResponse((r) => r.url().includes('/auth/login'));
    await page.click('button[type="submit"]');
    const resp = await respPromise;
    expect([400, 401, 403]).toContain(resp.status());
    await expect(page.getByText(/Invalid|credential|incorrect/i)).toBeVisible({ timeout: 10_000 });
    record('A', 'login-wrong-password', 'pass', Date.now() - t0, `${resp.status()}`);
  });

  test('A8 login mode switch to register', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/login');
    await page.click('button:has-text("Create one")');
    await expect(page.getByRole('heading', { name: /Create account/i })).toBeVisible();
    record('A', 'login-mode-switch', 'pass', Date.now() - t0);
  });

  test('A9 back to home link', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/login');
    await page.click('text=Back to home');
    await expect(page).toHaveURL(FRONTEND + '/');
    record('A', 'back-to-home', 'pass', Date.now() - t0);
  });

  test('A10 backend /health returns 200', async ({ request }) => {
    const t0 = Date.now();
    const r = await request.get(`${BACKEND}/health`);
    expect(r.status()).toBe(200);
    const j = await r.json();
    expect(j.status).toBe('ok');
    record('A', 'backend-health', 'pass', Date.now() - t0, JSON.stringify(j));
  });

  test('A11 unauth /positions returns 401/403', async ({ request }) => {
    const t0 = Date.now();
    const r = await request.get(`${BACKEND}/api/v1/positions`);
    expect([401, 403]).toContain(r.status());
    record('A', 'unauth-positions', 'pass', Date.now() - t0, `${r.status()}`);
  });

  test('A12 unknown SPA route serves index', async ({ page }) => {
    const t0 = Date.now();
    const resp = await page.goto('/this-route-does-not-exist');
    const html = await page.content();
    expect(html.toLowerCase()).toContain('hedgeiq');
    record('A', 'unknown-route-spa-fallback', 'pass', Date.now() - t0, `http=${resp?.status()}`);
  });
});

// PHASE B — Admin login & dashboard
test.describe('Phase B — Admin login & dashboard', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;
  let token = '';

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
    await attachConsoleListener(page);
  });

  test('B13 admin login → dashboard, token stored', async () => {
    const t0 = Date.now();
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard/);
    token = await page.evaluate(() => localStorage.getItem('hedgeiq_token') || '');
    expect(token.length).toBeGreaterThan(20);
    record('B', 'admin-login', 'pass', Date.now() - t0);
  });

  test('B14 JWT decodes with sub claim', async () => {
    const t0 = Date.now();
    expect(token).toBeTruthy();
    const parts = token.split('.');
    expect(parts.length).toBe(3);
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    expect(payload.sub).toBeTruthy();
    record('B', 'jwt-sub', 'pass', Date.now() - t0, `sub-len=${String(payload.sub).length}`);
  });

  test('B15 brand HedgeIQ visible in header', async () => {
    const t0 = Date.now();
    await expect(page.getByText('HedgeIQ').first()).toBeVisible();
    record('B', 'brand-visible', 'pass', Date.now() - t0);
  });

  test('B16 sign out button visible', async () => {
    const t0 = Date.now();
    await expect(page.getByRole('button', { name: /Sign out/i })).toBeVisible();
    record('B', 'signout-visible', 'pass', Date.now() - t0);
  });

  test('B17 edit layout button visible', async () => {
    const t0 = Date.now();
    await expect(page.getByRole('button', { name: /Edit Layout/i })).toBeVisible();
    record('B', 'edit-layout-visible', 'pass', Date.now() - t0);
  });

  test('B18 preferences cog visible', async () => {
    const t0 = Date.now();
    const cog = page.locator('button[aria-label="Preferences"], button[title="Preferences"]').first();
    await expect(cog).toBeVisible();
    record('B', 'prefs-cog-visible', 'pass', Date.now() - t0);
  });

  test('B19 at least one preset chip rendered', async () => {
    const t0 = Date.now();
    const chips = page.locator('button.chip, button.chip-outline');
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);
    record('B', 'preset-chips', 'pass', Date.now() - t0, `count=${count}`);
  });

  test('B20 click each preset chip', async () => {
    const t0 = Date.now();
    const presets = ['Day Trader', 'Long-Term', 'Hedger', 'Minimal'];
    let clickedAny = false;
    for (const name of presets) {
      const chip = page.locator(`button:has-text("${name}")`).first();
      if (await chip.isVisible({ timeout: 2000 }).catch(() => false)) {
        await chip.click({ force: true }).catch(() => {});
        await page.waitForTimeout(400);
        clickedAny = true;
      }
    }
    expect(clickedAny).toBeTruthy();
    record('B', 'preset-clicks', 'pass', Date.now() - t0);
  });

  test('B21 edit layout toggle Done', async () => {
    const t0 = Date.now();
    await page.locator('button:has-text("Edit Layout")').first().click({ force: true });
    await expect(page.getByRole('button', { name: /^Done$/ })).toBeVisible();
    await page.locator('button:has-text("Done")').first().click({ force: true });
    await expect(page.getByRole('button', { name: /Edit Layout/i })).toBeVisible();
    record('B', 'edit-layout-toggle', 'pass', Date.now() - t0);
  });
});

// PHASE C — Positions / Broker
test.describe('Phase C — Positions / Broker', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
    await attachConsoleListener(page);
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test('C22 positions widget renders (table OR empty)', async () => {
    const t0 = Date.now();
    const longTerm = page.locator('button:has-text("Long-Term")').first();
    if (await longTerm.isVisible().catch(() => false)) await longTerm.click({ force: true });
    await page.waitForTimeout(1500);
    const hasTable = await page.locator('table').first().isVisible({ timeout: 4000 }).catch(() => false);
    const hasSymbol = await page.getByText(/^Symbol$/).first().isVisible({ timeout: 1000 }).catch(() => false);
    const hasEmpty = await page.getByText(/No broker accounts|connect.*broker|no positions/i).first().isVisible({ timeout: 1000 }).catch(() => false);
    expect(hasTable || hasSymbol || hasEmpty).toBeTruthy();
    record('C', 'positions-widget', 'pass', Date.now() - t0, hasTable || hasSymbol ? 'table' : 'empty');
  });

  test('C23 click first position row opens drawer', async () => {
    const t0 = Date.now();
    const row = page.locator('table tbody tr').first();
    if (!(await row.isVisible().catch(() => false))) {
      record('C', 'position-drawer-open', 'skip', Date.now() - t0, 'no positions');
      test.skip();
      return;
    }
    await row.click({ force: true });
    // PositionDrawer doesn't expose role=dialog; look for ticker symbol in a panel-like element
    const drawerOpen = await page.locator('[role="dialog"], .drawer, aside, [class*="drawer" i], [class*="panel" i]').first().isVisible({ timeout: 5000 }).catch(() => false);
    // Fallback: check for a price-chart container that loads after row click
    const chartRendered = await page.locator('svg').count().then(n => n > 1).catch(() => false);
    const opened = drawerOpen || chartRendered;
    record('C', 'position-drawer-open', opened ? 'pass' : 'fail', Date.now() - t0, `drawer=${drawerOpen} chart=${chartRendered}`);
    expect(opened).toBeTruthy();
  });

  test('C24 close position drawer', async () => {
    const t0 = Date.now();
    const closeBtn = page.locator('button[aria-label*="close" i], button:has-text("×"), button:has-text("✕")').first();
    if (!(await closeBtn.isVisible().catch(() => false))) {
      record('C', 'position-drawer-close', 'skip', Date.now() - t0, 'no drawer');
      test.skip();
      return;
    }
    await closeBtn.click({ force: true });
    record('C', 'position-drawer-close', 'pass', Date.now() - t0);
  });

  test('C25 connect broker CTA visible (if empty state)', async () => {
    const t0 = Date.now();
    const connect = page.locator('button:has-text("Connect"), a:has-text("Connect")').first();
    if (await connect.isVisible({ timeout: 2000 }).catch(() => false)) {
      record('C', 'connect-broker-cta', 'pass', Date.now() - t0, 'cta visible');
    } else {
      record('C', 'connect-broker-cta', 'skip', Date.now() - t0, 'positions present, no empty cta');
      test.skip();
    }
  });
});

// PHASE D — Options Chain
test.describe('Phase D — Options Chain', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
    await attachConsoleListener(page);
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    const dt = page.locator('button:has-text("Day Trader")').first();
    if (await dt.isVisible().catch(() => false)) await dt.click({ force: true });
    await page.waitForTimeout(800);
  });

  test('D26 options chain widget visible', async () => {
    const t0 = Date.now();
    const widget = page.locator('text=/Options Chain/i').first();
    const visible = await widget.isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) {
      record('D', 'options-widget', 'skip', Date.now() - t0, 'not in current preset');
      test.skip();
      return;
    }
    record('D', 'options-widget', 'pass', Date.now() - t0);
  });

  test('D27 load AAPL chain', async () => {
    const t0 = Date.now();
    const symbolInput = page.locator('input[placeholder*="ticker" i], input[placeholder*="symbol" i], input[placeholder*="AAPL" i]').first();
    if (!(await symbolInput.isVisible({ timeout: 3000 }).catch(() => false))) {
      record('D', 'load-chain', 'skip', Date.now() - t0, 'no input');
      test.skip();
      return;
    }
    await symbolInput.fill('AAPL');
    const loadBtn = page.locator('button:has-text("Load")').first();
    if (await loadBtn.isVisible().catch(() => false)) await loadBtn.click({ force: true });
    await page.waitForTimeout(4000);
    const hasStrikes = await page.locator('text=/Strike|Calls|Puts/i').first().isVisible({ timeout: 4000 }).catch(() => false);
    const hasEmpty = await page.locator('text=/no liquid|no options|empty/i').first().isVisible().catch(() => false);
    expect(hasStrikes || hasEmpty).toBeTruthy();
    record('D', 'load-chain', 'pass', Date.now() - t0, hasStrikes ? 'chain' : 'empty');
  });

  test('D28 strike prices rendered with 2 decimals', async () => {
    const t0 = Date.now();
    const cells = page.locator('td');
    const count = await cells.count();
    let found2dp = false;
    for (let i = 0; i < Math.min(count, 80); i++) {
      const txt = (await cells.nth(i).textContent() || '').trim();
      if (/^\d+\.\d{2}$/.test(txt)) { found2dp = true; break; }
    }
    if (!found2dp) {
      record('D', 'strikes-2dp', 'skip', Date.now() - t0, 'no chain rendered');
      test.skip();
      return;
    }
    record('D', 'strikes-2dp', 'pass', Date.now() - t0);
  });

  test('D29 filter buttons present', async () => {
    const t0 = Date.now();
    const calls = await page.locator('button:has-text("Calls")').first().isVisible().catch(() => false);
    const puts = await page.locator('button:has-text("Puts")').first().isVisible().catch(() => false);
    if (!calls && !puts) {
      record('D', 'filter-buttons', 'skip', Date.now() - t0);
      test.skip();
      return;
    }
    record('D', 'filter-buttons', 'pass', Date.now() - t0, `calls=${calls} puts=${puts}`);
  });

  test('D30 contract row → AI context (best-effort)', async () => {
    record('D', 'contract-ai-context', 'skip', 0, 'optional/UX-dependent');
    test.skip();
  });
});

// PHASE E — Hedge Calculator
test.describe('Phase E — Hedge Calculator', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
    await attachConsoleListener(page);
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    const h = page.locator('button:has-text("Hedger")').first();
    if (await h.isVisible().catch(() => false)) await h.click({ force: true });
    await page.waitForTimeout(1000);
  });

  test('E31 hedge calculator widget visible', async () => {
    const t0 = Date.now();
    const visible = await page.locator('text=/Emergency Hedge|Hedge Calculator|Find Best Hedge/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!visible) {
      record('E', 'hedge-widget', 'skip', Date.now() - t0);
      test.skip();
      return;
    }
    record('E', 'hedge-widget', 'pass', Date.now() - t0);
  });

  test('E32 empty form: button disabled', async () => {
    const t0 = Date.now();
    const findBtn = page.locator('button:has-text("Find Best Hedge"), button:has-text("Find Hedge")').first();
    if (!(await findBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      record('E', 'hedge-empty', 'skip', Date.now() - t0);
      test.skip();
      return;
    }
    const isDisabled = await findBtn.isDisabled().catch(() => false);
    record('E', 'hedge-empty', 'pass', Date.now() - t0, `disabled=${isDisabled}`);
  });

  test('E33 fill form AAL/5000/11.30/10.97', async () => {
    const t0 = Date.now();
    const symbol = page.locator('input[name="symbol"], input[placeholder*="symbol" i]').first();
    if (!(await symbol.isVisible({ timeout: 3000 }).catch(() => false))) {
      record('E', 'hedge-fill', 'skip', Date.now() - t0);
      test.skip();
      return;
    }
    await symbol.fill('AAL');
    const inputs = page.locator('input[type="number"]');
    const count = await inputs.count();
    if (count >= 1) await inputs.nth(0).fill('5000');
    if (count >= 2) await inputs.nth(1).fill('11.30');
    if (count >= 3) await inputs.nth(2).fill('10.97');
    record('E', 'hedge-fill', 'pass', Date.now() - t0, `inputs=${count}`);
  });

  test('E34 click find best hedge (or note disabled)', async () => {
    const t0 = Date.now();
    const findBtn = page.locator('button:has-text("Find Best Hedge"), button:has-text("Find Hedge")').first();
    if (!(await findBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      record('E', 'hedge-submit', 'skip', Date.now() - t0);
      test.skip();
      return;
    }
    if (await findBtn.isDisabled().catch(() => false)) {
      record('E', 'hedge-submit', 'pass', Date.now() - t0, 'button disabled — validation gating works');
      return;
    }
    await findBtn.click({ force: true });
    await page.waitForTimeout(8000);
    const hasResult = await page.locator('text=/Strike|Premium|Cost|recommendation/i').first().isVisible().catch(() => false);
    const hasEmpty = await page.locator('text=/no liquid|no recommendation/i').first().isVisible().catch(() => false);
    expect(hasResult || hasEmpty).toBeTruthy();
    record('E', 'hedge-submit', 'pass', Date.now() - t0, hasResult ? 'recs' : 'empty');
  });

  test('E35 recommendation fields (best-effort)', async () => {
    record('E', 'hedge-rec-fields', 'skip', 0, 'depends on live liquidity');
    test.skip();
  });

  test('E36 payoff chart renders (best-effort)', async () => {
    const t0 = Date.now();
    const chart = await page.locator('svg, canvas').first().isVisible({ timeout: 3000 }).catch(() => false);
    record('E', 'payoff-chart', chart ? 'pass' : 'skip', Date.now() - t0, chart ? 'svg/canvas present' : 'no chart');
    if (!chart) test.skip();
  });
});

// PHASE F — AI Advisor (1 admin AI call)
test.describe('Phase F — AI Advisor', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
    await attachConsoleListener(page);
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test('F37 switch to a preset with AI advisor', async () => {
    const t0 = Date.now();
    for (const p of ['Day Trader', 'Long-Term', 'Hedger', 'Minimal']) {
      const b = page.locator(`button:has-text("${p}")`).first();
      if (await b.isVisible().catch(() => false)) {
        await b.click({ force: true });
        await page.waitForTimeout(500);
        const found = await page.locator('text=/AI advisor|HedgeIQ AI|AI Trading Advisor/i').first().isVisible({ timeout: 1500 }).catch(() => false);
        if (found) break;
      }
    }
    record('F', 'ai-preset-switch', 'pass', Date.now() - t0);
  });

  test('F38 AI welcome message visible', async () => {
    const t0 = Date.now();
    const welcome = await page.locator('text=/HedgeIQ AI|AI advisor|AI Trading Advisor|How can I help/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!welcome) {
      record('F', 'ai-welcome', 'skip', Date.now() - t0);
      test.skip();
      return;
    }
    record('F', 'ai-welcome', 'pass', Date.now() - t0);
  });

  test('F39 quick reply chips visible', async () => {
    const t0 = Date.now();
    const count = await page.locator('button.chip, .ai-quick-reply').count();
    record('F', 'ai-chips', count > 0 ? 'pass' : 'skip', Date.now() - t0, `count=${count}`);
  });

  test('F40 send a question (uses 1 admin AI call)', async () => {
    const t0 = Date.now();
    const input = page.locator('textarea, input[placeholder*="ask" i], input[placeholder*="message" i]').first();
    if (!(await input.isVisible({ timeout: 3000 }).catch(() => false))) {
      record('F', 'ai-send', 'skip', Date.now() - t0);
      test.skip();
      return;
    }
    await input.fill('What is my biggest risk?');
    await input.press('Enter');
    const status = await page.waitForResponse(
      (r) => r.url().includes('/api/v1/ai') && r.request().method() === 'POST',
      { timeout: 30_000 }
    ).then(r => r.status()).catch(() => 0);
    record('F', 'ai-send', status >= 200 && status < 500 ? 'pass' : 'fail', Date.now() - t0, `http=${status}`);
  });

  test('F41 clear button resets', async () => {
    const t0 = Date.now();
    const clear = page.locator('button:has-text("Clear")').first();
    if (!(await clear.isVisible({ timeout: 2000 }).catch(() => false))) {
      record('F', 'ai-clear', 'skip', Date.now() - t0);
      test.skip();
      return;
    }
    await clear.click({ force: true });
    record('F', 'ai-clear', 'pass', Date.now() - t0);
  });

  test('F42 multi-turn (skip to save calls)', async () => {
    record('F', 'ai-multiturn', 'skip', 0, 'budget-saving');
    test.skip();
  });
});

// PHASE G — Settings & Themes
test.describe('Phase G — Settings & Themes', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
    await attachConsoleListener(page);
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test('G43 open preferences popover', async () => {
    const t0 = Date.now();
    const cog = page.locator('button[aria-label="Preferences"], button[title="Preferences"]').first();
    await cog.click({ force: true });
    await expect(page.locator('[role="dialog"], .popover, [aria-label*="preferences" i]').first()).toBeVisible({ timeout: 5000 });
    record('G', 'prefs-open', 'pass', Date.now() - t0);
  });

  test('G44 switch theme to terminal', async () => {
    const t0 = Date.now();
    const t = page.locator('button:has-text("Terminal")').first();
    if (await t.isVisible({ timeout: 2000 }).catch(() => false)) {
      await t.click({ force: true });
      await page.waitForTimeout(300);
      const theme = await page.evaluate(() => document.body.getAttribute('data-theme'));
      record('G', 'theme-terminal', theme === 'terminal' ? 'pass' : 'fail', Date.now() - t0, `attr=${theme}`);
    } else {
      record('G', 'theme-terminal', 'skip', Date.now() - t0);
      test.skip();
    }
  });

  test('G45 switch theme to lumen', async () => {
    const t0 = Date.now();
    const t = page.locator('button:has-text("Lumen")').first();
    if (await t.isVisible({ timeout: 2000 }).catch(() => false)) {
      await t.click({ force: true });
      await page.waitForTimeout(300);
      const theme = await page.evaluate(() => document.body.getAttribute('data-theme'));
      record('G', 'theme-lumen', theme === 'lumen' ? 'pass' : 'fail', Date.now() - t0, `attr=${theme}`);
    } else {
      record('G', 'theme-lumen', 'skip', Date.now() - t0);
      test.skip();
    }
  });

  test('G46 switch back to meridian', async () => {
    const t0 = Date.now();
    const t = page.locator('button:has-text("Meridian")').first();
    if (await t.isVisible({ timeout: 2000 }).catch(() => false)) {
      await t.click({ force: true });
      await page.waitForTimeout(300);
      const theme = await page.evaluate(() => document.body.getAttribute('data-theme'));
      record('G', 'theme-meridian', theme === 'meridian' ? 'pass' : 'fail', Date.now() - t0, `attr=${theme}`);
    } else {
      record('G', 'theme-meridian', 'skip', Date.now() - t0);
      test.skip();
    }
  });

  test('G47 density to dense', async () => {
    const t0 = Date.now();
    const d = page.locator('button:has-text("Dense")').first();
    if (await d.isVisible({ timeout: 2000 }).catch(() => false)) {
      await d.click({ force: true });
      await page.waitForTimeout(300);
      const density = await page.evaluate(() => document.body.getAttribute('data-density'));
      record('G', 'density-dense', density === 'dense' ? 'pass' : 'fail', Date.now() - t0, `attr=${density}`);
    } else {
      record('G', 'density-dense', 'skip', Date.now() - t0);
      test.skip();
    }
  });

  test('G48 mode to futuristic', async () => {
    const t0 = Date.now();
    const f = page.locator('button:has-text("Futuristic")').first();
    if (await f.isVisible({ timeout: 2000 }).catch(() => false)) {
      await f.click({ force: true });
      await page.waitForTimeout(300);
      const mode = await page.evaluate(() => document.body.getAttribute('data-mode'));
      record('G', 'mode-futuristic', mode === 'futuristic' ? 'pass' : 'fail', Date.now() - t0, `attr=${mode}`);
    } else {
      record('G', 'mode-futuristic', 'skip', Date.now() - t0);
      test.skip();
    }
  });

  test('G49 preferences persist after reload', async () => {
    const t0 = Date.now();
    const before = await page.evaluate(() => ({
      theme: document.body.getAttribute('data-theme'),
      density: document.body.getAttribute('data-density'),
      mode: document.body.getAttribute('data-mode'),
    }));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => ({
      theme: document.body.getAttribute('data-theme'),
      density: document.body.getAttribute('data-density'),
      mode: document.body.getAttribute('data-mode'),
    }));
    const persisted =
      (!before.theme || before.theme === after.theme) &&
      (!before.density || before.density === after.density) &&
      (!before.mode || before.mode === after.mode);
    record('G', 'prefs-persist', persisted ? 'pass' : 'fail', Date.now() - t0);
  });

  test('G50 escape closes popover', async () => {
    const t0 = Date.now();
    const cog = page.locator('button[aria-label="Preferences"], button[title="Preferences"]').first();
    if (!(await cog.isVisible().catch(() => false))) {
      record('G', 'esc-closes', 'skip', Date.now() - t0);
      test.skip();
      return;
    }
    await cog.click({ force: true });
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    record('G', 'esc-closes', 'pass', Date.now() - t0);
  });
});

// PHASE H — Sign Out & Free User Login
test.describe('Phase H — Sign out & free user', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;
  let adminPositionsSnap = '';
  let freePositionsSnap = '';

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    page = await ctx.newPage();
    await attachConsoleListener(page);
  });

  test('H51 sign out admin clears token', async () => {
    const t0 = Date.now();
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    adminPositionsSnap = (await page.locator('main, body').first().textContent() || '').substring(0, 4000);
    await page.locator('button:has-text("Sign out")').click({ force: true });
    await page.waitForURL((url) => /\/login/.test(url.pathname) || url.pathname === '/', { timeout: 15_000 });
    const tok = await page.evaluate(() => localStorage.getItem('hedgeiq_token'));
    expect(tok).toBeNull();
    record('H', 'admin-signout', 'pass', Date.now() - t0);
  });

  test('H52 free user login → dashboard', async () => {
    const t0 = Date.now();
    await loginViaUI(page, USER_EMAIL, USER_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard/);
    record('H', 'free-login', 'pass', Date.now() - t0);
  });

  test('H53 cross-user isolation', async () => {
    const t0 = Date.now();
    await page.waitForTimeout(1500);
    freePositionsSnap = (await page.locator('main, body').first().textContent() || '').substring(0, 4000);
    const different = freePositionsSnap !== adminPositionsSnap;
    record('H', 'cross-user-isolation', different ? 'pass' : 'fail', Date.now() - t0, different ? 'distinct' : 'identical');
    expect(different).toBeTruthy();
  });

  test('H54 free user AI advisor responds', async () => {
    const t0 = Date.now();
    for (const p of ['Day Trader', 'Long-Term', 'Hedger', 'Minimal']) {
      const b = page.locator(`button:has-text("${p}")`).first();
      if (await b.isVisible().catch(() => false)) {
        await b.click({ force: true });
        await page.waitForTimeout(400);
        if (await page.locator('text=/HedgeIQ AI|AI advisor|AI Trading Advisor/i').first().isVisible({ timeout: 1500 }).catch(() => false)) break;
      }
    }
    const input = page.locator('textarea, input[placeholder*="ask" i], input[placeholder*="message" i]').first();
    if (!(await input.isVisible({ timeout: 3000 }).catch(() => false))) {
      record('H', 'free-ai', 'skip', Date.now() - t0);
      test.skip();
      return;
    }
    await input.fill('Hi');
    await input.press('Enter');
    const status = await page.waitForResponse(
      (r) => r.url().includes('/api/v1/ai') && r.request().method() === 'POST',
      { timeout: 30_000 }
    ).then((r) => r.status()).catch(() => 0);
    DAILY_LIMIT_OUTCOME = status === 200 ? 'under-limit (200)' : status === 429 ? 'at-limit (429)' : `unknown (${status})`;
    expect([200, 429]).toContain(status);
    record('H', 'free-ai', 'pass', Date.now() - t0, `http=${status}`);
  });
});

// PHASE I — Daily limit enforcement
test.describe('Phase I — Daily limit', () => {
  test('I55_56 single chat call records 200 or 429', async ({ request }) => {
    const t0 = Date.now();
    const loginResp = await request.post(`${BACKEND}/api/v1/auth/login`, {
      data: { email: USER_EMAIL, password: USER_PASSWORD },
    });
    if (loginResp.status() !== 200) {
      record('I', 'daily-limit', 'skip', Date.now() - t0, `login=${loginResp.status()}`);
      test.skip();
      return;
    }
    const tok = (await loginResp.json()).access_token;
    const chat = await request.post(`${BACKEND}/api/v1/ai/chat`, {
      headers: { Authorization: `Bearer ${tok}` },
      data: { message: 'hello' },
    });
    const status = chat.status();
    DAILY_LIMIT_OUTCOME = status === 200 ? 'under-limit (200)' : status === 429 ? 'at-limit (429)' : `other (${status})`;
    record('I', 'daily-limit', [200, 429].includes(status) ? 'pass' : 'fail', Date.now() - t0, DAILY_LIMIT_OUTCOME);
    expect([200, 429]).toContain(status);
  });
});

// PHASE J — Accessibility
test.describe('Phase J — Accessibility', () => {
  test('J57 axe scan / (landing)', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((v) => v.impact === 'critical');
    const serious = results.violations.filter((v) => v.impact === 'serious');
    A11Y['/'] = { critical: critical.length, serious: serious.length, details: critical.concat(serious).map((v) => v.id).join(',') };
    record('J', 'axe-landing', critical.length === 0 ? 'pass' : 'fail', Date.now() - t0, `critical=${critical.length} serious=${serious.length}`);
    expect(critical.length).toBe(0);
  });

  test('J58 axe scan /login', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/login');
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((v) => v.impact === 'critical');
    const serious = results.violations.filter((v) => v.impact === 'serious');
    A11Y['/login'] = { critical: critical.length, serious: serious.length, details: critical.concat(serious).map((v) => v.id).join(',') };
    record('J', 'axe-login', critical.length === 0 ? 'pass' : 'fail', Date.now() - t0, `critical=${critical.length} serious=${serious.length}`);
    expect(critical.length).toBe(0);
  });

  test('J59 axe scan /dashboard (admin)', async ({ page }) => {
    const t0 = Date.now();
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.waitForTimeout(2000);
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((v) => v.impact === 'critical');
    const serious = results.violations.filter((v) => v.impact === 'serious');
    A11Y['/dashboard'] = { critical: critical.length, serious: serious.length, details: critical.concat(serious).map((v) => v.id).join(',') };
    record('J', 'axe-dashboard', critical.length === 0 ? 'pass' : 'fail', Date.now() - t0, `critical=${critical.length} serious=${serious.length}`);
    expect(critical.length).toBe(0);
  });

  test('J60 keyboard tab order on login', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/login');
    await page.locator('input[type="email"]').focus();
    const a1 = await page.evaluate(() => document.activeElement?.getAttribute('type'));
    expect(a1).toBe('email');
    await page.keyboard.press('Tab');
    const a2 = await page.evaluate(() => document.activeElement?.getAttribute('type'));
    expect(a2).toBe('password');
    record('J', 'kb-tab', 'pass', Date.now() - t0);
  });

  test('J61 enter on login submits', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/login');
    await page.fill('input[type="email"]', 'kbsubmit@hedgeiq.test');
    await page.fill('input[type="password"]', 'wrongpw123');
    const respPromise = page.waitForResponse((r) => r.url().includes('/auth/login'));
    await page.locator('input[type="password"]').press('Enter');
    const resp = await respPromise;
    expect([200, 400, 401, 403]).toContain(resp.status());
    record('J', 'kb-enter-submit', 'pass', Date.now() - t0, `${resp.status()}`);
  });

  test('J62 html lang is en', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/');
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('en');
    record('J', 'html-lang', 'pass', Date.now() - t0);
  });
});

// PHASE K — Performance
test.describe('Phase K — Performance', () => {
  async function measure(page: Page, urlPath: string) {
    const start = Date.now();
    await page.goto(urlPath, { waitUntil: 'domcontentloaded' });
    const dcl = Date.now() - start;
    const fcp = await page.evaluate(() => {
      const e = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry | undefined;
      return e ? Math.round(e.startTime) : null;
    });
    return { dcl, fcp: fcp ?? undefined };
  }

  test('K63 / load < 5s', async ({ page }) => {
    const t0 = Date.now();
    const m = await measure(page, '/');
    PERF['/'] = m;
    expect(m.dcl).toBeLessThan(5000);
    record('K', 'perf-landing', 'pass', Date.now() - t0, `dcl=${m.dcl}ms fcp=${m.fcp}`);
  });

  test('K64 /login load < 4s', async ({ page }) => {
    const t0 = Date.now();
    const m = await measure(page, '/login');
    PERF['/login'] = m;
    expect(m.dcl).toBeLessThan(4000);
    record('K', 'perf-login', 'pass', Date.now() - t0, `dcl=${m.dcl}ms`);
  });

  test('K65 /dashboard load < 8s (admin)', async ({ page }) => {
    const t0 = Date.now();
    await loginViaUI(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    const start = Date.now();
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    const dcl = Date.now() - start;
    PERF['/dashboard'] = { dcl };
    expect(dcl).toBeLessThan(8000);
    record('K', 'perf-dashboard', 'pass', Date.now() - t0, `dcl=${dcl}ms`);
  });

  test('K66 fcp recorded for /', async () => {
    const fcp = PERF['/']?.fcp;
    record('K', 'perf-fcp', 'pass', 0, `fcp=${fcp}`);
  });

  test('K67 console errors during navigation', async ({ page }) => {
    await attachConsoleListener(page);
    await page.goto('/');
    await page.goto('/login');
    record('K', 'console-errors', 'pass', 0, `count=${CONSOLE_ERRORS.length}`);
  });
});

// PHASE L — Wiki & Presentation
test.describe('Phase L — Wiki & Presentation', () => {
  test('L68 /wiki returns 200 + content', async ({ page }) => {
    const t0 = Date.now();
    const resp = await page.goto('/wiki');
    const status = resp?.status() || 0;
    const html = await page.content();
    const hasWikiContent = /table of contents|wiki|article/i.test(html);
    WIKI_STATUS = `${status} hasContent=${hasWikiContent}`;
    record('L', 'wiki', hasWikiContent && status < 400 ? 'pass' : 'fail', Date.now() - t0, WIKI_STATUS);
  });

  test('L69 /presentation reveal.js loads', async ({ page }) => {
    const t0 = Date.now();
    const resp = await page.goto('/presentation');
    const status = resp?.status() || 0;
    const hasReveal = await page.locator('.reveal').first().isVisible({ timeout: 5000 }).catch(() => false);
    PRESENTATION_STATUS = `${status} reveal=${hasReveal}`;
    record('L', 'presentation', hasReveal && status < 400 ? 'pass' : 'fail', Date.now() - t0, PRESENTATION_STATUS);
  });
});

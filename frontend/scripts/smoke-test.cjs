#!/usr/bin/env node
/**
 * Smoke test for HedgeIQ production deployment.
 * Probes:
 *   - SPA routes (root, /login, /about, /privacy, /terms, /security, /contact, /status)
 *   - Wiki static pages
 *   - Backend health endpoint
 *
 * Notes:
 *   - SPA routes share one HTML shell. The route handlers + components live
 *     in the JS bundle referenced by <script src="/assets/...">. We download
 *     the bundle once and grep for the component names instead of expecting
 *     route-specific HTML markup.
 *
 * Output: writes SMOKE_TEST_REPORT.md to repo root.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FRONTEND = process.env.SMOKE_FRONTEND || 'https://hedge-iq-five.vercel.app';
const BACKEND = 'https://hedgeiq-production.up.railway.app';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers: { 'User-Agent': 'HedgeIQ-SmokeTest/1.0' } },
      res => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () =>
          resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8'), headers: res.headers })
        );
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error('timeout'));
    });
    req.end();
  });
}

async function getBundleUrl() {
  const root = await fetchUrl(FRONTEND + '/');
  const m = root.body.match(/src="(\/assets\/[^"]+\.js)"/);
  if (!m) throw new Error('Could not find JS bundle in root HTML');
  return { url: FRONTEND + m[1], rootBody: root.body, rootStatus: root.status };
}

(async () => {
  const results = [];
  const record = (name, ok, detail) => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail}`);
  };

  let bundleBody = '';
  let rootBody = '';
  let rootStatus = 0;
  try {
    const bundle = await getBundleUrl();
    rootBody = bundle.rootBody;
    rootStatus = bundle.rootStatus;
    const b = await fetchUrl(bundle.url);
    bundleBody = b.body;
    record('GET /assets bundle', b.status === 200, `status=${b.status}, size=${b.body.length}`);
  } catch (e) {
    record('GET /assets bundle', false, `error: ${e.message}`);
  }

  // Root HTML — must include "midnight" (rendered later by JS, but the bundle has it)
  record(
    'GET /',
    rootStatus === 200 && (rootBody.includes('HedgeIQ') || rootBody.includes('<div id="root"')),
    `status=${rootStatus}`
  );
  record('JS bundle contains "midnight" (hero copy)', /midnight/i.test(bundleBody), '');
  record('JS bundle contains "Sign in" (login)', /Sign in/i.test(bundleBody), '');

  // SPA routes return the same shell with status 200
  const spaRoutes = ['/login', '/about', '/privacy', '/terms', '/security', '/contact', '/status'];
  for (const r of spaRoutes) {
    try {
      const res = await fetchUrl(FRONTEND + r);
      record(`GET ${r}`, res.status === 200, `status=${res.status}`);
    } catch (e) {
      record(`GET ${r}`, false, `error: ${e.message}`);
    }
  }

  // Bundle should contain component / content strings for the new routes
  const bundleChecks = [
    ['About component string', /About HedgeIQ/i],
    ['Privacy component string', /Privacy Policy/i],
    ['Terms component string', /Terms of Service/i],
    ['Security component string', /PBKDF2/i],
    ['Contact component string', /contact@hedgeiq/i],
    ['Status component string', /All systems operational/i],
    ['TrustSecurity component', /where it belongs/i],
    ['ExplainerVideo component', /60 seconds/i],
    ['Terms financial-advice disclaimer', /Not financial advice|HedgeIQ recommendations are educational/i],
    ['Privacy effective date marker', /Effective date/i],
  ];
  for (const [name, re] of bundleChecks) {
    record(`Bundle: ${name}`, re.test(bundleBody), '');
  }

  // Wiki — server-rendered static HTML
  for (const p of ['/wiki', '/wiki/01-overview', '/wiki/02-architecture']) {
    try {
      const res = await fetchUrl(FRONTEND + p);
      let extra = '';
      if (p === '/wiki') extra = res.body.includes('<aside') ? ' (has <aside>)' : ' (no <aside>!)';
      record(`GET ${p}`, res.status === 200 && (p !== '/wiki' || res.body.includes('<aside')), `status=${res.status}${extra}`);
    } catch (e) {
      record(`GET ${p}`, false, `error: ${e.message}`);
    }
  }

  // Backend /health — JSON
  try {
    const res = await fetchUrl(BACKEND + '/health');
    let valid = false;
    try { JSON.parse(res.body); valid = true; } catch {}
    record('GET backend /health', res.status === 200 && valid, `status=${res.status}, json=${valid}`);
  } catch (e) {
    record('GET backend /health', false, `error: ${e.message}`);
  }

  // Build the markdown report
  const passed = results.filter(r => r.ok).length;
  const failed = results.length - passed;
  const lines = [];
  lines.push('# HedgeIQ Smoke Test Report');
  lines.push('');
  lines.push(`**Run:** ${new Date().toISOString()}`);
  lines.push(`**Frontend:** ${FRONTEND}`);
  lines.push(`**Backend:** ${BACKEND}`);
  lines.push('');
  lines.push(`**Result:** ${passed} passed, ${failed} failed`);
  lines.push('');
  lines.push('| # | Check | Status | Detail |');
  lines.push('|---|-------|--------|--------|');
  results.forEach((r, i) => {
    lines.push(`| ${i + 1} | ${r.name} | ${r.ok ? 'PASS' : 'FAIL'} | ${r.detail || ''} |`);
  });

  const out = path.join(__dirname, '..', '..', 'SMOKE_TEST_REPORT.md');
  fs.writeFileSync(out, lines.join('\n') + '\n');
  console.log('\nReport written to', out);

  process.exit(failed === 0 ? 0 : 1);
})();

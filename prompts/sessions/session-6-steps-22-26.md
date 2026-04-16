# HedgeIQ v0.1 — Session 6 of 6 (Steps 22–26)
# Frontend Jest Tests · Playwright E2E · Docker · Railway + Vercel · README

> **How to use:** Paste this entire file into the Claude Code tab.
> Sessions 1–5 must be complete with all tests passing before starting this session.
> This is the FINAL session. When Step 26 is complete, HedgeIQ v0.1 is ready to deploy.

---

## CONTEXT

Sessions 1–5 are complete:
- All backend layers: domain, infrastructure, adapters, API routes, auth (Sessions 1–4)
- Integration tests, ADRs, React frontend with 5 components (Session 5)

This final session adds frontend unit tests, Playwright E2E, Docker, deployment configs, and README.

---

## STEP 22 — Frontend Jest Unit Tests

Install test dependencies:
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### frontend/tests/unit/Dashboard.test.tsx
```typescript
/**
 * Dashboard component unit tests.
 * Tests navigation between views and layout rendering.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../src/components/Dashboard';

jest.mock('../../src/components/PositionsTable', () => () => <div data-testid="positions-table">Positions</div>);
jest.mock('../../src/components/OptionsChain', () => () => <div data-testid="options-chain">Options</div>);
jest.mock('../../src/components/EmergencyHedge', () => () => <div data-testid="emergency-hedge">Hedge</div>);

describe('Dashboard', () => {
  it('renders all sidebar navigation items', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/Positions/)).toBeInTheDocument();
    expect(screen.getByText(/Options Chain/)).toBeInTheDocument();
    expect(screen.getByText(/Emergency Hedge/)).toBeInTheDocument();
  });

  it('shows HedgeIQ brand name', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('HedgeIQ')).toBeInTheDocument();
  });

  it('shows PositionsTable by default', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByTestId('positions-table')).toBeInTheDocument();
  });

  it('switches to OptionsChain on click', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    fireEvent.click(screen.getByText(/Options Chain/));
    expect(screen.getByTestId('options-chain')).toBeInTheDocument();
  });

  it('switches to EmergencyHedge on click', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    fireEvent.click(screen.getByText(/Emergency Hedge/));
    expect(screen.getByTestId('emergency-hedge')).toBeInTheDocument();
  });

  it('contains sign out button', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/Sign out/i)).toBeInTheDocument();
  });
});
```

### frontend/tests/unit/EmergencyHedge.test.tsx
```typescript
/**
 * EmergencyHedge unit tests — form inputs, submission, results.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmergencyHedge from '../../src/components/EmergencyHedge';

const mockFetch = jest.fn();
global.fetch = mockFetch;
beforeEach(() => { mockFetch.mockClear(); localStorage.setItem('hedgeiq_token', 'test'); });

describe('EmergencyHedge', () => {
  it('renders form with all inputs', () => {
    render(<EmergencyHedge />);
    expect(screen.getByPlaceholderText('AAL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('5000')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('11.30')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('10.97')).toBeInTheDocument();
  });

  it('Find Best Hedge button is disabled when inputs empty', () => {
    render(<EmergencyHedge />);
    expect(screen.getByText(/Find Best Hedge/i)).toBeDisabled();
  });

  it('shows recommendation cards on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({
      recommendations: [{ expiry_date: '2026-06-18', strike: 10, ask: 0.51,
        total_cost: 2550, breakeven_price: 9.49, open_interest: 75310, value_score: 0.755 }]
    })});
    render(<EmergencyHedge />);
    await userEvent.type(screen.getByPlaceholderText('AAL'), 'AAL');
    await userEvent.type(screen.getByPlaceholderText('5000'), '5000');
    await userEvent.type(screen.getByPlaceholderText('11.30'), '11.30');
    await userEvent.type(screen.getByPlaceholderText('10.97'), '10.97');
    fireEvent.click(screen.getByText(/Find Best Hedge/i));
    await waitFor(() => expect(screen.getByText(/2026-06-18/)).toBeInTheDocument());
  });

  it('shows error on 422', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ detail: 'No liquid options found.' })});
    render(<EmergencyHedge />);
    await userEvent.type(screen.getByPlaceholderText('AAL'), 'ZZZ');
    await userEvent.type(screen.getByPlaceholderText('5000'), '100');
    await userEvent.type(screen.getByPlaceholderText('11.30'), '5.00');
    await userEvent.type(screen.getByPlaceholderText('10.97'), '4.00');
    fireEvent.click(screen.getByText(/Find Best Hedge/i));
    await waitFor(() => expect(screen.getByText(/No liquid options found/i)).toBeInTheDocument());
  });

  it('shows position value when shares and price entered', async () => {
    render(<EmergencyHedge />);
    await userEvent.type(screen.getByPlaceholderText('5000'), '5000');
    await userEvent.type(screen.getByPlaceholderText('10.97'), '10.97');
    await waitFor(() => expect(screen.getByText(/54,850/)).toBeInTheDocument());
  });
});
```

### frontend/tests/unit/LandingPage.test.tsx
```typescript
/**
 * LandingPage unit tests — hero, story, waitlist.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LandingPage from '../../src/components/LandingPage';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('LandingPage', () => {
  it('shows headline', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Hedge your portfolio at midnight/i)).toBeInTheDocument();
  });

  it('mentions the $2,355 story', () => {
    render(<LandingPage />);
    expect(screen.getByText(/2,355/)).toBeInTheDocument();
  });

  it('shows Try it free CTA', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Try it free/i)).toBeInTheDocument();
  });

  it('shows all three feature cards', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Unified dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Smart hedge calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/Plain English AI/i)).toBeInTheDocument();
  });

  it('shows waitlist form', () => {
    render(<LandingPage />);
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
  });

  it('shows success after joining', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<LandingPage />);
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'trader@example.com');
    fireEvent.click(screen.getByText('Join'));
    await waitFor(() => expect(screen.getByText(/You're on the list/i)).toBeInTheDocument());
  });

  it('shows 47 traders social proof', () => {
    render(<LandingPage />);
    expect(screen.getByText(/47 traders/i)).toBeInTheDocument();
  });
});
```

**Gate:** `cd frontend && npm test -- --watchAll=false` — all Jest tests pass.

---

## STEP 23 — Playwright E2E Tests

```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install chromium
```

### frontend/playwright.config.ts
```typescript
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: { baseURL: 'http://localhost:3000', headless: true, screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: { command: 'npm start', port: 3000, reuseExistingServer: true }
});
```

### frontend/tests/e2e/hedge_calculator.spec.ts
```typescript
/**
 * E2E: Emergency Hedge calculator — midnight AAL workflow.
 * Requires app on http://localhost:3000 + backend on http://localhost:8000
 */
import { test, expect } from '@playwright/test';

test.describe('Emergency Hedge Calculator', () => {
  test('midnight AAL scenario — full workflow', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('hedgeiq_token', 'e2e-token'));
    await page.goto('http://localhost:3000/dashboard');
    await page.click('text=Emergency Hedge');
    await page.fill('input[placeholder="AAL"]', 'AAL');
    await page.fill('input[placeholder="5000"]', '5000');
    await page.fill('input[placeholder="11.30"]', '11.30');
    await page.fill('input[placeholder="10.97"]', '10.97');
    await expect(page.locator('text=/54,850/')).toBeVisible();
    await page.click('text=Find Best Hedge');
    await expect(page.locator('text=/2026|PUT/')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/Breakeven/')).toBeVisible();
  });

  test('shows error for illiquid symbol', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('hedgeiq_token', 'e2e-token'));
    await page.goto('http://localhost:3000/dashboard');
    await page.click('text=Emergency Hedge');
    await page.fill('input[placeholder="AAL"]', 'ZZZZZ');
    await page.fill('input[placeholder="5000"]', '100');
    await page.fill('input[placeholder="11.30"]', '5.00');
    await page.fill('input[placeholder="10.97"]', '4.00');
    await page.click('text=Find Best Hedge');
    await expect(page.locator('text=/No liquid|not found|error/i')).toBeVisible({ timeout: 10000 });
  });
});
```

### frontend/tests/e2e/positions_dashboard.spec.ts
```typescript
/**
 * E2E: Positions dashboard — morning check workflow.
 */
import { test, expect } from '@playwright/test';

test.describe('Positions Dashboard', () => {
  test('dashboard shows navigation', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('hedgeiq_token', 'e2e-token'));
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('text=HedgeIQ')).toBeVisible();
    await expect(page.locator('text=Positions')).toBeVisible();
    await expect(page.locator('text=Options Chain')).toBeVisible();
    await expect(page.locator('text=Emergency Hedge')).toBeVisible();
  });

  test('landing page for unauthenticated users', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('text=/Hedge your portfolio at midnight/i')).toBeVisible();
    await expect(page.locator('text=/2,355/')).toBeVisible();
  });

  test('waitlist form submits', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[placeholder="your@email.com"]', 'test@trader.com');
    await page.click('text=Join');
    await expect(page.locator("text=/You're on the list/i")).toBeVisible({ timeout: 5000 });
  });

  test('navigation switches between views', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('hedgeiq_token', 'e2e-token'));
    await page.goto('http://localhost:3000/dashboard');
    await page.click('text=Options Chain');
    await expect(page.locator('input[placeholder*="ticker"]')).toBeVisible();
    await page.click('text=Emergency Hedge');
    await expect(page.locator('text=Find Best Hedge')).toBeVisible();
  });
});
```

**Gate:** `npx playwright test` — navigation and landing page tests pass.

---

## STEP 24 — Docker Compose

### Dockerfile (backend)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc curl && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY .env.example .env
RUN mkdir -p /app/data/chroma_cache
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Dockerfile.frontend
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### docker-compose.yml (final production version)
```yaml
version: "3.9"
services:
  backend:
    build: { context: ., dockerfile: Dockerfile }
    ports: ["8000:8000"]
    volumes: ["./data:/app/data"]
    env_file: [.env]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    build: { context: ., dockerfile: Dockerfile.frontend }
    ports: ["3000:80"]
    depends_on:
      backend: { condition: service_healthy }
    restart: unless-stopped
```

**Gate:** `docker-compose build && docker-compose up` — both services start. `curl http://localhost:8000/health` returns 200.

---

## STEP 25 — Railway + Vercel Configs

### railway.toml
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "uvicorn backend.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[[services]]
name = "hedgeiq-api"
```

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {"src": "frontend/package.json", "use": "@vercel/static-build", "config": {"distDir": "build"}}
  ],
  "routes": [{"src": "/(.*)", "dest": "/frontend/build/$1"}],
  "env": {"REACT_APP_API_URL": "@hedgeiq_api_url"}
}
```

**Deploy steps:**

Backend (Railway):
1. Create account at railway.app
2. New project → Deploy from GitHub
3. Add all env vars from .env.example in Railway dashboard
4. Railway auto-detects Dockerfile → deploys
5. Copy the Railway URL for Vercel

Frontend (Vercel):
1. Create account at vercel.com
2. Import GitHub repo → set root to `frontend`
3. Set env var: `REACT_APP_API_URL` = your Railway backend URL
4. Deploy

**Gate:** Both config files created and valid.

---

## STEP 26 — README.md

```markdown
# HedgeIQ v0.1

**Hedge your portfolio at midnight — in 60 seconds.**

---

## Why This Exists

On a Sunday night I held 5,000 shares of AAL — a $56,500 position. US-Iran peace talks failed and oil spiked to $104 overnight. Over 3 hours I manually placed 8 orders across Fidelity, Public.com, and Robinhood, compared 40+ option strikes by hand, and got the math wrong twice.

By market open I had lost $2,355 — not from bad decisions, but because the tools made it too hard to make good ones fast enough.

HedgeIQ automates that entire workflow.

---

## Features

- **Unified portfolio dashboard** — see all accounts in one view
- **Emergency Hedge calculator** — top 3 put recommendations in 60 seconds
- **Options chain browser** — OI, IV, Delta, Theta
- **AI plain English explainer** — 3-sentence explanations, no jargon
- **Landing page with waitlist** — collect early users

---

## Free vs Pro

| Feature | Free | Pro ($79/mo) |
|---------|------|-------------|
| Broker connections | 2 | Unlimited |
| Options data | End-of-day | Real-time |
| AI explanations/day | 5 | Unlimited |
| Order placement | No | Yes |
| Emergency hedge calc | Unlimited | Unlimited |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 + FastAPI |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Database | SQLite → PostgreSQL |
| Cache | ChromaDB |
| AI | Claude Haiku (anthropic) |
| Market data | Polygon.io free tier |
| Broker connectivity | SnapTrade |
| Hosting | Railway + Vercel |

---

## Design Patterns

DDD, Repository, Adapter, Facade, Strategy, API Gateway, BFF (web active / desktop + mobile scaffolded)

---

## Quick Start

```bash
git clone https://github.com/yourusername/hedgeiq && cd hedgeiq
pip install -r requirements.txt
cd frontend && npm install && cd ..
cp .env.example .env
# Add your free API keys to .env
make dev
# Backend: http://localhost:8000/docs
# Frontend: http://localhost:3000
```

---

## API Keys (all free)

| Provider | URL | Cost |
|---------|-----|------|
| Polygon.io | polygon.io | $0 free tier |
| SnapTrade | snaptrade.com/developers | $0 dev |
| Anthropic | console.anthropic.com | ~$5 starter |

---

## Run Tests

```bash
make test                    # All backend tests + coverage
cd frontend && npm test      # Jest component tests
npx playwright test          # E2E browser tests
```

---

## Cost at Scale

| Users | Infra | Revenue | Margin |
|-------|-------|---------|--------|
| Personal | ~$5/mo | $0 | — |
| 5 Pro users | ~$50/mo | $395/mo | 87% |
| 50 Pro users | ~$200/mo | $3,950/mo | 95% |

---

## Disclaimer

AI-generated analysis for informational purposes only — not investment advice. Options involve risk.

---

*Built by a trader who lost $2,355 so you don't have to.*
```

**Gate:** README.md renders on GitHub.

---

## SESSION 6 COMPLETE CHECKLIST

- [ ] `cd frontend && npm test -- --watchAll=false` — all Jest tests pass
- [ ] `npx playwright test` — E2E tests run
- [ ] `docker-compose build` — no errors
- [ ] `docker-compose up` — both services start
- [ ] `curl http://localhost:8000/health` returns `{"status": "ok"}`
- [ ] `railway.toml` created
- [ ] `vercel.json` created
- [ ] README.md complete

**FINAL commit:**
```bash
git add .
git commit -m "feat: HedgeIQ v0.1 complete — all 26 steps done, tests passing, ready for deployment"
```

---

## FULL BUILD SUMMARY

| Session | Steps | Built |
|---------|-------|-------|
| 1 | 1–4 | Skeleton, domain models, interfaces, ChromaDB cache |
| 2 | 5–8 | Claude, Polygon, SnapTrade facades + broker adapters |
| 3 | 9–13 | Repositories, services, strategies, gateway, BFF |
| 4 | 14–17 | FastAPI routes, JWT auth, database, 80%+ coverage |
| 5 | 18–21 | Integration tests, ADRs, React frontend (5 components) |
| 6 | 22–26 | Jest tests, Playwright, Docker, Railway + Vercel, README |

**HedgeIQ v0.1 is ready to deploy.**

Get your 3 free API keys → run `make dev` → connect Fidelity via SnapTrade → use the app yourself for 30 days → then open to users.
- polygon.io (no credit card)
- snaptrade.com/developers
- console.anthropic.com (~$5 starter credit)

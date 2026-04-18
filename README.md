# HedgeIQ

> **Hedge your portfolio at midnight — in 60 seconds.**

AI-powered trading assistant that scans your broker accounts, finds the best put options to protect your positions, and explains them in plain English.

Built from a real $2,355 loss — 5,000 shares of AAL, oil at $104, US-Iran peace talks collapsed on a Sunday night.

---

## What it does

| Feature | Description |
|---|---|
| **Unified dashboard** | See all broker accounts (Fidelity, IBKR, Robinhood, Public) in one table |
| **Emergency Hedge Calculator** | Enter ticker + shares → top 3 puts ranked by value, in under 60 seconds |
| **Plain-English AI** | Claude Haiku explains every option in 3 sentences. No jargon. |
| **Smart caching** | ChromaDB caches AI responses (24h) and options chains (1h) — fast on repeat queries |

---

## Architecture

```
frontend/          React 19 + Vite + Tailwind CSS v4
backend/
  api/v1/          FastAPI routers (auth, positions, hedge, options, ai)
  domain/          Domain models and services (DDD)
  adapters/        Broker adapters (Fidelity, IBKR, Robinhood, Public)
  infrastructure/  Facades: SnapTrade, Polygon, Claude, yFinance, ChromaDB
```

**Patterns:** Facade, Adapter Registry, Domain-Driven Design, Repository  
**Brokers:** SnapTrade OAuth (Fidelity, IBKR, Schwab, Robinhood, Public, E*TRADE)  
**Options data:** Polygon.io (live on Starter plan; mock chain on free tier)  
**AI:** Anthropic Claude Haiku (~$0.01/call, 24h cache)

---

## Quick start (local)

### Prerequisites
- Python 3.12+
- Node 20+
- Git

### 1. Clone and configure

```bash
git clone https://github.com/JiNiomIndia/HedgeIQ.git
cd HedgeIQ
cp .env.example .env
# Fill in API keys (see .env.example for instructions)
```

### 2. Backend

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
# API at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# App at http://localhost:3000
```

### Login
Default credentials from `.env`:
- **Email:** your `ADMIN_EMAIL`
- **Password:** your `ADMIN_PASSWORD`

---

## Run with Docker

```bash
# Build and start both services
docker compose up --build

# App: http://localhost:3000
# API: http://localhost:8000
```

---

## Testing

### Backend (pytest)
```bash
# All tests
pytest

# With coverage
pytest --cov=backend --cov-report=term-missing

# Integration tests only
pytest backend/tests/integration/
```

### Frontend (Vitest)
```bash
cd frontend

# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### E2E (Playwright)
```bash
cd frontend

# Install browsers (first time only)
npx playwright install chromium

# Run E2E tests (requires backend running on :8000)
npm run test:e2e

# Interactive UI mode
npx playwright test --ui
```

---

## Deploy

### Backend → Railway

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Set environment variables in the Railway dashboard (copy from `.env.example`)
3. Railway auto-detects `railway.toml` — deploys from `Dockerfile.backend`
4. Note your Railway public URL (e.g. `https://hedgeiq-api.railway.app`)

### Frontend → Vercel

1. Import repo at [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-railway-url.railway.app`
4. Deploy — Vercel detects `vercel.json` and `vite` automatically

---

## API keys needed

| Service | Free tier | Paid needed for |
|---|---|---|
| [Anthropic](https://console.anthropic.com) | Pay-per-use (~$0.01/call) | — |
| [Polygon.io](https://polygon.io) | Free (basic) | Live options chain (Starter $29/mo) |
| [SnapTrade](https://app.snaptrade.com/developers) | Free personal plan | Multi-user (Business plan) |

---

## Project structure

```
HedgeIQ/
├── backend/
│   ├── api/v1/              # FastAPI routers
│   ├── adapters/            # Broker normalisers (Fidelity, IBKR, Robinhood, Public)
│   ├── domain/              # Models, services, errors
│   └── infrastructure/      # External service facades
│       ├── snaptrade/       # Broker OAuth + positions
│       ├── polygon/         # Options chain + rate limiter
│       ├── claude/          # AI explanations + daily limit
│       ├── yfinance/        # Stock price fallback
│       └── cache/           # ChromaDB wrapper
├── frontend/
│   ├── src/components/      # React components
│   ├── src/test/            # Vitest unit tests (29 tests)
│   └── e2e/                 # Playwright E2E tests
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── railway.toml
└── .env.example
```

---

## Test results

```
Backend:  75 tests  |  85% coverage
Frontend: 29 tests  |  4 components
E2E:      10 specs  |  Chromium
```

---

## Roadmap

- [ ] Multi-user auth (PostgreSQL + JWT refresh tokens)
- [ ] Real-time price updates via WebSocket
- [ ] Email alerts when position P&L crosses threshold
- [ ] Polygon Starter — live options chain data
- [ ] Mobile-responsive layout
- [ ] One-click order routing to broker

---

## License

MIT — built by a trader, for traders.

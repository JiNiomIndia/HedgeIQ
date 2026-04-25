# 03 — Getting started

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.12+ | Backend runtime. 3.12 ships with `tomllib` and modern asyncio. |
| Node | 20+ | Frontend toolchain. |
| npm | 10+ | Package manager. |
| Docker | 24+ | Optional — for `docker-compose up`. |
| GNU Make | any | For the `Makefile` shortcuts. |

## Clone and bootstrap

```bash
git clone https://github.com/JiNiomIndia/HedgeIQ.git
cd HedgeIQ

# Backend
python -m venv .venv
source .venv/bin/activate          # PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Frontend
cd frontend
npm install
cd ..
```

## Environment variables

Create `.env` at the repo root (the backend reads it via `pydantic-settings`):

```bash
SECRET_KEY=dev-secret-change-me
ADMIN_EMAIL=info@jiniom.com
ADMIN_PASSWORD=dev-admin-pass

# Optional — vendors fall back to mock data if missing
ANTHROPIC_API_KEY=sk-ant-...
POLYGON_API_KEY=...
SNAPTRADE_CLIENT_ID=...
SNAPTRADE_CONSUMER_KEY=...

# DB defaults to SQLite under ./data/hedgeiq.db
# DATABASE_URL=postgresql://user:pass@host/db
```

## Run

```bash
# Terminal 1 — backend
uvicorn backend.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev
```

Then open http://localhost:5173.

## Hello world

1. Click **Sign up** on the landing page.
2. Register with any email/password.
3. Land on the dashboard — positions table will be empty.
4. Click **Connect broker** → choose Robinhood (or any test broker via SnapTrade).
5. Once connected, your positions populate automatically.
6. Click **Hedge** on any position to see the emergency-hedge flow.

## Testing

```bash
# Backend
python -m pytest backend/tests/ -q

# Frontend
cd frontend && npm test
```

## Database migrations

```bash
alembic upgrade head             # apply all migrations
alembic revision --autogenerate -m "msg"   # new migration
```

## Common dev pitfalls

- **JWT secret mismatch between processes** — make sure `SECRET_KEY` is identical in your shell and any worker.
- **CORS errors locally** — the backend allows `*` in dev; check the browser console for the actual CORS message.
- **SnapTrade 401** — your client ID / consumer key probably aren't set. The backend will fall back to mock data and label it as such.

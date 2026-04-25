# 02 — Architecture

## System architecture

```mermaid
graph TB
  subgraph "Client (Vercel)"
    U[User Browser]
    L[Landing Page]
    D[Dashboard SPA]
    W[Wiki]
  end
  subgraph "API Layer (Railway)"
    API[FastAPI<br/>backend.main]
    AUTH[Auth Service<br/>PBKDF2 + JWT]
    HEDGE[Hedge Engine<br/>ProtectivePut]
    AI[Claude Facade]
    POS[Position Service]
    CACHE[(ChromaDB Cache)]
    DB[(SQLite)]
  end
  subgraph "External Services"
    SNAP[SnapTrade<br/>broker connect]
    POLY[Polygon.io<br/>options + news]
    CLAUDE[Anthropic Claude<br/>Haiku model]
  end
  U --> L
  U --> D
  U --> W
  D -.JWT.-> API
  API --> AUTH
  API --> POS
  API --> HEDGE
  API --> AI
  POS --> SNAP
  HEDGE --> POLY
  HEDGE --> CACHE
  AI --> CLAUDE
  AI --> CACHE
  AUTH --> DB
```

## Component layering

```mermaid
graph LR
  subgraph "Frontend"
    UI[React Components]
    HOOKS[Custom Hooks]
    API_CLIENT[API Client]
  end
  subgraph "Backend"
    ROUTES[FastAPI Routes]
    DOMAIN[Domain Services]
    INFRA[Infrastructure Adapters]
  end
  UI --> HOOKS --> API_CLIENT
  API_CLIENT -.HTTPS.-> ROUTES
  ROUTES --> DOMAIN
  DOMAIN --> INFRA
```

## Vendor + data flow

```mermaid
flowchart LR
  subgraph Client[Browser]
    UI[React 19 SPA<br/>Vercel]
  end

  subgraph API[Backend - Railway]
    FAPI[FastAPI<br/>Python 3.12]
    DB[(SQLite / Postgres)]
    Cache[(ChromaDB<br/>cache)]
  end

  subgraph Vendors
    SnapTrade[SnapTrade<br/>broker aggregator]
    Polygon[Polygon.io<br/>options + charts + news]
    Anthropic[Anthropic<br/>Claude Haiku]
  end

  UI -- HTTPS / JWT --> FAPI
  FAPI <--> DB
  FAPI <--> Cache
  FAPI -- positions --> SnapTrade
  FAPI -- chains, charts, news --> Polygon
  FAPI -- explanations --> Anthropic
```

## Backend layers

The backend follows a hex-style layout under `backend/`:

```
backend/
├── main.py                # FastAPI app, middleware, lifespan
├── config.py              # Pydantic settings
├── api/
│   ├── v1/                # HTTP endpoints (auth, positions, options, hedge, ai, quotes)
│   ├── bff/               # web/mobile/desktop bff variants
│   └── gateway/           # rate limiter, api-key auth, middleware
├── domain/                # Pure business logic — no I/O
│   ├── positions/         # Position models, repository interface, service
│   ├── options/           # OptionContract, repository interface, service
│   ├── hedging/           # HedgeRecommendation + strategies (ProtectivePut, Collar)
│   ├── analysis/          # AI helper service
│   └── common/            # Money, ticker, errors
├── infrastructure/        # Concrete adapters to vendors
│   ├── snaptrade/         # SnapTrade SDK facade
│   ├── polygon/           # Polygon REST facade + repository implementation
│   ├── claude/            # Anthropic SDK facade with prompt templates
│   └── cache/             # ChromaDB cache for options chains and AI responses
├── adapters/              # Per-broker adapters used by SnapTrade facade
│   ├── fidelity_adapter.py
│   ├── ibkr_adapter.py
│   ├── public_adapter.py
│   └── robinhood_adapter.py
└── db/
    ├── models.py          # SQLAlchemy ORM
    ├── session.py         # session factory + init_db / check_db
    └── migrations/        # Alembic
```

### Layer rules

- `domain/` imports nothing from `infrastructure/` or `api/` — it's pure logic that we can unit-test in milliseconds.
- `infrastructure/` implements the repository interfaces declared by `domain/`.
- `api/v1/` is thin: parse request, dispatch to a domain service, serialise response.
- `main.py` is the only place where the wiring happens (router registration, middleware order).

## Frontend structure

```
frontend/src/
├── App.tsx                # Router
├── main.tsx               # Entry point
├── components/
│   ├── Dashboard.tsx      # Authenticated orchestrator
│   ├── AIChat.tsx         # Claude chat panel
│   ├── OptionsChain.tsx   # Filterable chain
│   ├── EmergencyHedge.tsx # The 60-second hedge dialog
│   ├── PositionsTable.tsx # Live positions
│   ├── PriceChart.tsx     # Polygon-backed OHLC
│   ├── LandingPage.tsx    # Public marketing
│   └── LoginPage.tsx
├── lib/
│   ├── api.ts             # fetch wrapper + JWT injector
│   ├── ThemeProvider.tsx  # 3 themes × 2 densities × colour-blind
│   ├── icons.tsx          # Iconography facade
│   └── layout-store.ts    # Persisted dashboard layout
└── widgets/               # Pluggable dashboard widgets
```

## Request flow — emergency hedge

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant FE as React SPA
  participant API as FastAPI
  participant Cache as ChromaDB
  participant Pol as Polygon
  participant Cl as Claude

  U->>FE: Click "Hedge AAL"
  FE->>API: POST /api/v1/hedge/recommend
  API->>Cache: lookup options(AAL)
  alt cache miss
    API->>Pol: GET /v3/snapshot/options/AAL
    Pol-->>API: full chain
    API->>Cache: store(AAL, chain)
  end
  API->>API: ProtectivePutStrategy.calculate()
  API-->>FE: top 3 recommendations
  FE->>API: POST /api/v1/ai/explain (best rec)
  API->>Cl: Haiku prompt
  Cl-->>API: plain-English summary
  API-->>FE: explanation
  FE-->>U: render top 3 + AI commentary
```

## Data flow guarantees

- All vendor calls are wrapped in a try/except that downgrades to mock data if the vendor is down — the user gets a labelled "demo" response rather than a 500.
- All authenticated endpoints validate the JWT *before* hitting infrastructure.
- All ChromaDB writes are best-effort; cache failures are logged but never propagate to the client.

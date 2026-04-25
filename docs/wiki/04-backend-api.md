# 04 — Backend API reference

## Route map

```mermaid
graph LR
  ROOT[/api/v1] --> AUTH[/auth]
  ROOT --> POS[/positions]
  ROOT --> OPT[/options]
  ROOT --> HEDGE[/hedge]
  ROOT --> AI[/ai]
  ROOT --> Q[/quotes]
  AUTH --> R1[POST /register]
  AUTH --> R2[POST /login]
  AUTH --> R3[GET /connect-broker]
  POS --> P1[GET /]
  OPT --> O1[GET /chain/:symbol]
  HEDGE --> H1[POST /recommend]
  AI --> A1[POST /explain]
  AI --> A2[POST /chat]
  Q --> Q1[GET /:symbol]
```

All endpoints are under `/api/v1`. Authentication is JWT (HS256) via the `Authorization: Bearer <token>` header unless noted.

## Auth

### `POST /api/v1/auth/register`

Create a new account. Registers the user with SnapTrade and stores their per-user secret.

**Body**
```json
{ "email": "user@example.com", "password": "..." }
```
**200**
```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```
**Errors**: 409 (duplicate email), 422 (validation), 500 (SnapTrade or DB error).

### `POST /api/v1/auth/login`

**Body**: `{ "email": "...", "password": "..." }` → 200 `TokenResponse`. **401** on bad credentials. Falls back to admin credentials from settings if `email` matches `ADMIN_EMAIL`.

### `POST /api/v1/auth/waitlist`

Pre-launch lead capture. Always 200.

### `GET /api/v1/auth/db-status` (admin only)

Returns DB connectivity info: `{ ok, dialect, tables, ... }`. **403** if not admin.

### `GET /api/v1/auth/connect-broker?broker=ROBINHOOD`

Returns a SnapTrade OAuth URL the client should redirect to.
```json
{ "connection_url": "https://app.snaptrade.com/...", "broker": "ROBINHOOD" }
```

## Positions

### `GET /api/v1/positions` (auth)

Returns the authenticated user's live brokerage positions, sourced from SnapTrade. Falls back to mock data when SnapTrade is unavailable.

```json
[
  { "symbol": "AAL", "quantity": 5000, "average_cost": 4.71, "current_price": 12.84, "unrealized_pl": 40650.00 },
  ...
]
```

## Options

### `GET /api/v1/options/{symbol}` (auth)

Returns the full Polygon-sourced option chain for `symbol`, served from the ChromaDB cache when fresh.

Query params: `expiry` (ISO date), `option_type` (`call` | `put`).

## Hedge

### `POST /api/v1/hedge/recommend` (auth)

The headline endpoint. Takes a single position and returns the top 3 protective put recommendations.

**Body**
```json
{
  "symbol": "AAL",
  "quantity": 5000,
  "current_price": 12.84,
  "strategy": "protective_put",
  "num_recommendations": 3
}
```
**200**
```json
{
  "recommendations": [
    {
      "contract": { "symbol": "AAL250321P00012000", "strike": 12.0, "ask": 0.55, "expiry_date": "2025-03-21", ... },
      "contracts_to_buy": 50,
      "total_cost": 2750.0,
      "breakeven_price": 11.45,
      "coverage_at_10pct_drop": 1455.0,
      "value_score": 0.529
    },
    ...
  ]
}
```
**Errors**: 422 (no liquid puts — fewer than 5,000 OI in any contract that survives the strike/expiry window).

## AI

### `POST /api/v1/ai/explain` (auth, daily limit)

Sends a short prompt to Claude Haiku and returns a plain-English explanation.

**Body**: `{ "context": "string", "question": "string" }`. Free-tier users are limited to 10 calls/day; pro users 100.

### `POST /api/v1/ai/chat` (auth, daily limit)

Multi-turn chat with the same daily-limit accounting.

## Quotes

### `GET /api/v1/quotes/{symbol}` (auth)

Live quote — last, bid, ask, prev-close, day high/low. Cached aggressively.

### `GET /api/v1/quotes/{symbol}/chart`

OHLC bars for the price chart.

## Health

### `GET /health` (public)

```json
{ "status": "ok", "version": "0.1.0", "environment": "production", "db": "connected", "checks": {...} }
```

## Error format

All errors follow the FastAPI default:
```json
{ "detail": "human-readable message" }
```

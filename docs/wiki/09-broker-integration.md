# 09 — Broker integration

HedgeIQ doesn't connect to brokers directly — it uses **SnapTrade** as a single OAuth-style aggregator. Today four brokers are supported: Fidelity, Interactive Brokers, Robinhood, Public.

## Broker fan-in

```mermaid
graph LR
  F[Fidelity] --> ST[SnapTrade<br/>aggregator]
  IB[Interactive Brokers] --> ST
  RH[Robinhood] --> ST
  PB[Public] --> ST
  ST --> H[HedgeIQ API]
  H --> UI[Dashboard]
```

## End-to-end OAuth + positions

```mermaid
sequenceDiagram
  participant U as User Browser
  participant H as HedgeIQ API
  participant S as SnapTrade
  participant B as Broker (e.g. Robinhood)
  U->>H: GET /auth/connect-broker?broker=ROBINHOOD
  alt new user
    H->>S: register_user(user_id)
    S-->>H: user_secret
    H->>H: store user_secret in DB
  end
  H->>S: get_redirect_uri(user_id, broker)
  S-->>H: connection_url
  H-->>U: 200 {connection_url}
  U->>S: redirect to OAuth
  S->>B: OAuth handshake
  B-->>S: tokens (held by SnapTrade)
  S-->>U: redirect back to HedgeIQ
  U->>H: GET /positions
  H->>S: get_user_holdings(user_id, user_secret)
  S->>B: API call with stored tokens
  B-->>S: positions
  S-->>H: positions
  H-->>U: normalized positions
```

## The flow

```mermaid
sequenceDiagram
  participant U as User
  participant FE as React SPA
  participant API as FastAPI
  participant ST as SnapTrade
  participant Broker as Broker (e.g. Robinhood)

  U->>FE: Sign up (email, password)
  FE->>API: POST /auth/register
  API->>ST: registerUser(uuid)
  ST-->>API: { userSecret }
  API->>API: Persist (userSecret, userId) on User row
  API-->>FE: JWT
  U->>FE: Click "Connect Robinhood"
  FE->>API: GET /auth/connect-broker?broker=ROBINHOOD
  API->>ST: getConnectionUrl(userId, ROBINHOOD, userSecret)
  ST-->>API: redirect URL
  API-->>FE: connection_url
  FE->>U: Redirect to SnapTrade-hosted broker auth
  U->>Broker: Login + consent
  Broker-->>ST: OAuth tokens
  ST-->>FE: Redirect back to HedgeIQ
  FE->>API: GET /positions
  API->>ST: getUserHoldings(userId, userSecret)
  ST-->>API: positions
  API-->>FE: positions
```

## Per-user secret model

Earlier versions of HedgeIQ used a *single* admin SnapTrade secret for all users — fine for the founder, broken for production. The current model:

- On `register`, the backend calls SnapTrade to register the user and stores the returned **per-user secret** on the `users` row.
- All subsequent SnapTrade calls pass that user's own secret.
- We never fall back to the admin secret for a non-admin user (commit `d5ce622`).

## Adapter pattern

Inside `backend/adapters/` each broker has a thin adapter:

```python
class FidelityAdapter(BaseAdapter):
    name = "FIDELITY"
    def normalise_position(raw: dict) -> Position: ...
```

The adapters exist so that broker-specific quirks (Fidelity returns `mktVal` not `marketValue`, Robinhood uses lowercase symbols) are isolated from the SnapTrade facade.

The facade (`infrastructure/snaptrade/facade.py`) is the single place where `snaptrade-python-sdk` is imported. It registers users, generates OAuth URLs and reads holdings.

## Mock fallback

If SnapTrade is unreachable (network, 5xx, missing keys), every adapter falls back to a deterministic mock that returns:

- A handful of realistic positions (AAL, NVDA, AAPL).
- A "demo data — connect a broker" banner sent in the response headers (`X-Data-Source: mock`).

This way the local dev experience and reviewer demos never break on vendor outages.

## Disconnecting a broker

Users can revoke a connection from the dashboard → Preferences → Connected accounts → Disconnect. The backend calls `SnapTrade.deleteConnection(userId, connectionId, userSecret)` and clears the cached positions.

## Data freshness

SnapTrade caches broker data for up to 60 seconds. Our `/positions` endpoint adds another 30s of in-memory caching keyed by `(user_id, symbol)`. So worst-case, positions can be ~90 seconds stale. The frontend shows the data timestamp.

# ADR-001: Pattern Selection

**Status:** Accepted  
**Date:** 2026-04-15

## Context
HedgeIQ aggregates broker positions and options data across multiple brokers (Fidelity, IBKR, Public) and surfaces AI-powered hedge recommendations.

## Decision
Adopt 7 architectural patterns: DDD, Repository, Adapter, Facade, Strategy, API Gateway, BFF.

## Consequences
- DDD: clear bounded contexts for Positions, Options, Hedging, Analysis
- Repository: swap data sources without touching domain logic
- Adapter: normalise broker quirks behind a uniform interface
- Facade: insulate from SDK churn (Polygon, SnapTrade, Claude)
- Strategy: plug in new hedge algorithms (Protective Put → Collar → Iron Condor)
- API Gateway: centralised rate limiting + API key auth
- BFF: tailor responses to web/desktop/mobile without polluting core API

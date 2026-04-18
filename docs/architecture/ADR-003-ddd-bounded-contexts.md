# ADR-003: DDD Bounded Contexts

**Status:** Accepted | **Date:** April 2026

## Four Bounded Contexts
- Positions: What user holds. Speaks to SnapTrade.
- Options: Available contracts. Speaks to Polygon.
- Hedging: Calculate recommendations. Depends on Options.
- Analysis: AI explanations. Speaks to Claude.

## Microservices Path (v3+)
Each domain → new repo + FastAPI wrapper. No business logic changes required.

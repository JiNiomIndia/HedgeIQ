# ADR-001: Design Pattern Selection

**Status:** Accepted | **Date:** April 2026

## Decision
Implement 7 patterns: DDD, Repository, Adapter, Facade, Strategy, API Gateway, BFF (scaffold).

## Rationale
- DDD: Each domain extractable as microservice for SaaS scaling
- Repository: Swap Polygon for new data provider = one class, zero domain changes
- Adapter: New broker = one adapter, zero other changes
- Facade: Domain services never know about rate limiting or retry logic
- Strategy: New hedge algorithm = one class, HedgeService unchanged
- API Gateway: Ready for third-party API consumers without touching domain
- BFF: Scaffold now, activate per client (mobile/desktop) without changing domain

## Consequences
More files than a simple script approach. Each layer independently testable.

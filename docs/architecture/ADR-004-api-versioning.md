# ADR-004: API Versioning Strategy

**Status:** Accepted | **Date:** April 2026

## Decision: URL path versioning — all routes under /api/v1/

## Rationale
URL versioning is explicit and visible in logs, dashboards, and client code.
For a trading API where version mismatches can cause financial errors, explicit is safer.

## Future Monetization Tiers
- free_internal: Unlimited (JWT app users)
- free_external: 10 req/min (API key consumers)
- starter_external: 60 req/min
- pro_external: 300 req/min

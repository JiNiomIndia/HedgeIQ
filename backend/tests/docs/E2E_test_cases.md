# E2E Test Cases

## Health
- E2E-001: GET /health returns 200 {"status": "ok"}

## Full Hedge Workflow
- E2E-002: Connect broker → fetch positions → fetch options chain → get recommendations → get AI explanation
- E2E-003: Unauthenticated request returns 401
- E2E-004: Rate limit exceeded returns 429

## Cache Validation
- E2E-005: Second AI explain request is served from cache (cached=True)

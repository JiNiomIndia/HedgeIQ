# Functional Test Cases

## Positions API
- FTC-001: GET /v1/positions returns list of positions
- FTC-002: Positions aggregate across multiple brokers

## Options API
- FTC-003: GET /v1/options/{symbol} returns options chain
- FTC-004: Filters by expiry_date query param

## Hedge API
- FTC-005: POST /v1/hedge returns ranked recommendations
- FTC-006: InsufficientLiquidityError returns 422

## AI API
- FTC-007: POST /v1/ai/explain returns AIExplanation
- FTC-008: DailyLimitExceededError returns 429
- FTC-009: Cached response sets cached=True

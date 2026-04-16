# ADR-003: DDD Bounded Contexts

**Status:** Accepted  
**Date:** 2026-04-15

## Decision
Four bounded contexts:

| Context   | Responsibility                              |
|-----------|---------------------------------------------|
| Positions | Portfolio state across brokers              |
| Options   | Options chains and contract data            |
| Hedging   | Recommendation engine and strategy logic    |
| Analysis  | AI explanations via Claude                  |

Each context owns its models, repository interface, and service layer. Cross-context calls go through service interfaces, never direct model access.

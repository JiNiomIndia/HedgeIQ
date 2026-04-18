# HedgeIQ v0.1 — Test Plan

## Test Environments
- Local: SQLite + ChromaDB local, all external APIs mocked
- Railway staging: PostgreSQL + ChromaDB persistent volume

## Tools
| Type | Tool | Location |
|------|------|----------|
| Unit | pytest + pytest-mock | backend/tests/unit/ |
| Integration | pytest + httpx | backend/tests/integration/ |
| E2E | Playwright | frontend/tests/e2e/ |
| Coverage | pytest-cov | make test |

## Coverage Targets
- Domain services: 90%+  |  Adapters: 90%+  |  Overall: 80%+

## Run Commands
```bash
make test                    # All + coverage
make test-unit               # Fast unit tests only
make test-integration        # Integration only
```

## Regression Policy
All tests pass before any commit to main. E2E runs before production deploy.

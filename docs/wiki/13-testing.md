# 13 — Testing

## Test pyramid

```
                         ┌─────────────┐
                         │    E2E      │   ~  10 tests   (Playwright)
                         └─────────────┘
                      ┌─────────────────────┐
                      │    Integration      │   ~  60 tests
                      └─────────────────────┘
                ┌─────────────────────────────────┐
                │            Unit                 │   ~ 200 tests
                └─────────────────────────────────┘
```

## Backend (`backend/tests/`)

```
backend/tests/
├── unit/             # 150+ tests — pure functions, no I/O
├── integration/      # 60+ tests — spin up FastAPI + SQLite, mock vendors
└── conftest.py       # fixtures
```

Run:

```bash
python -m pytest backend/tests/ --asyncio-mode=auto -q
```

### Key fixtures

- `client` — `TestClient(app)` with a fresh SQLite DB per test.
- `auth_headers` — issues a JWT for a freshly-registered test user.
- `mock_polygon` — autouse-monkeypatched `PolygonFacade` returning deterministic chains.
- `mock_snaptrade` — same for SnapTrade.
- `mock_anthropic` — replaces `ClaudeFacade.chat` with a deterministic echo.

### Coverage targets

- Domain (`backend/domain/`): **95%+** — pure logic, easy to cover.
- API: **90%+** — every endpoint has at least one happy-path + one error-path test.
- Infrastructure: **70%+** — vendor-specific code; the rest is exercised via integration tests.

Current coverage: **87% backend** (per `coverage.xml`).

## Frontend (`frontend/src/test/`)

- Runner: `vitest`.
- Library: `@testing-library/react`.
- A11y: `vitest-axe`.

Run:

```bash
cd frontend && npm test
```

82 frontend tests at last count. Tests cover:
- Component rendering with various props.
- User interactions (`fireEvent`, `userEvent`).
- API calls mocked via `msw`.
- Theme switching does not cause flash-of-unstyled-content.
- Accessibility: every component passes `axe` with no violations.

## Performance SLAs

End-to-end performance budgets enforced by `backend/tests/perf/`:

| Endpoint | p95 budget | Current |
|----------|-----------|---------|
| `/health` | 50 ms | 12 ms |
| `/positions` (cached) | 200 ms | 89 ms |
| `/options/{symbol}` (cached) | 300 ms | 145 ms |
| `/hedge/recommend` | 500 ms | 312 ms |
| `/ai/explain` | 2,000 ms | 1,180 ms |

Performance tests are gated behind a `PERF=1` env var so they don't run on every PR.

## Continuous Integration

GitHub Actions (`.github/workflows/`):

- `backend-tests.yml` — pytest + coverage upload.
- `frontend-tests.yml` — vitest + tsc --noEmit + eslint.
- `e2e.yml` — Playwright against a docker-compose stack.
- `accessibility.yml` — Lighthouse CI against the deployed Vercel preview.

A merge to `main` is blocked unless backend + frontend + tsc all pass.

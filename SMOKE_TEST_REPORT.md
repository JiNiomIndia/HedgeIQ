# HedgeIQ Smoke Test Report

**Run:** 2026-04-25T22:27:49.176Z
**Frontend:** https://hedge-iq-five.vercel.app
**Backend:** https://hedgeiq-production.up.railway.app

**Result:** 17 passed, 8 failed

| # | Check | Status | Detail |
|---|-------|--------|--------|
| 1 | GET /assets bundle | PASS | status=200, size=598665 |
| 2 | GET / | PASS | status=200 |
| 3 | JS bundle contains "midnight" (hero copy) | PASS |  |
| 4 | JS bundle contains "Sign in" (login) | PASS |  |
| 5 | GET /login | PASS | status=200 |
| 6 | GET /about | PASS | status=200 |
| 7 | GET /privacy | PASS | status=200 |
| 8 | GET /terms | PASS | status=200 |
| 9 | GET /security | PASS | status=200 |
| 10 | GET /contact | PASS | status=200 |
| 11 | GET /status | PASS | status=200 |
| 12 | Bundle: About component string | FAIL |  |
| 13 | Bundle: Privacy component string | FAIL |  |
| 14 | Bundle: Terms component string | FAIL |  |
| 15 | Bundle: Security component string | PASS |  |
| 16 | Bundle: Contact component string | FAIL |  |
| 17 | Bundle: Status component string | FAIL |  |
| 18 | Bundle: TrustSecurity component | FAIL |  |
| 19 | Bundle: ExplainerVideo component | PASS |  |
| 20 | Bundle: Terms financial-advice disclaimer | FAIL |  |
| 21 | Bundle: Privacy effective date marker | FAIL |  |
| 22 | GET /wiki | PASS | status=200 (has <aside>) |
| 23 | GET /wiki/01-overview | PASS | status=200 |
| 24 | GET /wiki/02-architecture | PASS | status=200 |
| 25 | GET backend /health | PASS | status=200, json=true |

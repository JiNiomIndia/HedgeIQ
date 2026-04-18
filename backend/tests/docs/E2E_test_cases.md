# E2E Test Cases — HedgeIQ v0.1

Tools: Playwright + pytest. Requires app running on http://localhost:3000.

## E2E-001 — Midnight AAL Hedge (CRITICAL)
Steps: Open app → Login → Click Emergency Hedge → Enter AAL 5000 $11.30 $10.97 → Submit
Expected: 3 recommendation cards, each with expiry/strike/cost/AI explanation

## E2E-002 — Morning Dashboard Check
Steps: Open app → Login → View dashboard
Expected: All positions in table, grouped by broker, P&L in green/red

## E2E-003 — Landing Page Waitlist
Steps: Navigate to http://localhost:3000 without login → Enter email → Click Join
Expected: Success message shown, waitlist count increments

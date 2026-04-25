# 16 — Roadmap

## Phase 1 (shipped)

- v0.1 product: register/login → connect broker → see positions → run hedge calculator → AI explanation.
- Three themes, two densities, colour-blind palette, full keyboard support.
- Polygon-backed options chains with ChromaDB caching.
- 200+ backend tests, 80+ frontend tests, 87% backend coverage.
- Deployed to Railway (backend) + Vercel (frontend).

## Phase 2 (this session)

See `docs/PHASE_2_ROADMAP.md` and `STATUS_REPORT.md` for the full activity log.

Highlights:
- Comprehensive test suite + CI workflows.
- Production hardening: security headers, GZip, CSP, global exception handler, enriched health endpoint.
- WCAG 2.1 AA pass on all top-level components.
- Full documentation wiki (this directory).
- Executive presentation deck under `docs/presentation/`.
- Vercel build pipeline updated to serve docs + presentation.

## Phase 3 (next 6–10 weeks)

### Real-time risk alerts
- Push notifications when a held position drops > X% intraday.
- Optional SMS via Twilio.

### Multi-leg strategies
- Collar (covered call + protective put — already scaffolded in `domain/hedging/strategies/collar.py`).
- Spreads (vertical, calendar) for users with options approval level 3+.

### Mobile experience
- Responsive breakpoints for the dashboard (currently desktop-first).
- React Native client sharing the same API.

### Greeks-aware ranking
- Add a "delta-target" hedge ranking option as alternative to value-score.
- IV-rank chip per contract row.

### Portfolio-level risk
- Aggregate beta, sector exposure, single-stock concentration.
- "What's my biggest risk right now?" dashboard widget.

## Phase 4 (vision)

- Coaching mode — Claude proactively suggests hedges based on news ingestion.
- Educational track — built-in micro-lessons unlocked as the user encounters new concepts.
- Pricing: Free / Pro ($15/mo) / Pro+ ($35/mo with real-time alerts).
- Regulatory: SEC Reg BI compliance review before any "advice"-shaped feature ships.

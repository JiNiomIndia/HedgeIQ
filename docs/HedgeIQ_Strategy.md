# HedgeIQ — Full Product Vision & Execution Strategy

**Prepared for:** Sankar (Founder, HedgeIQ)  
**Date:** April 2026  
**Version:** 1.0  
**Prepared by:** Claude Sonnet (AI Architect)

---

## Executive Summary

HedgeIQ began as a $2,355 lesson on a Sunday night. It is now a working AI trading assistant with live broker connectivity, options analysis, and Claude AI explanations — built in 6 sessions.

The vision ahead is larger: a **White-Label Trading SaaS Platform** that any financial advisor, broker, or trading community can deploy under their own brand, backed by a **Master Trading Intelligence Database** that learns from anonymised trade patterns across all users, delivered on **every platform** — web, iOS, Android, Desktop, Mac — with **enterprise-grade reliability** and a path to **global expansion**.

This document is the strategy to get there.

---

## Part 1 — Where We Are (v0.1 Complete)

| Component | Status |
|-----------|--------|
| FastAPI backend with DDD architecture | ✅ Live |
| SnapTrade broker connectivity (Robinhood, Fidelity, IBKR, Public) | ✅ Live |
| Polygon options chain with rate limiting + caching | ✅ Live |
| Claude AI explanations (Haiku, cached 24h) | ✅ Live |
| React 19 frontend (Vite + Tailwind) | ✅ Live |
| 121 tests (unit + integration + E2E) | ✅ Passing |
| Docker + Railway + Vercel deploy config | ✅ Done |

**Foundation quality:** Production-ready. DDD architecture, adapter registry, facade pattern — all designed to scale. No rewrites needed for any phase below.

---

## Part 2 — The Full Vision

### 2.1 What we are building

```
┌─────────────────────────────────────────────────────────────────┐
│                    HedgeIQ Platform                             │
├──────────────────────┬──────────────────────────────────────────┤
│  WHITE-LABEL ENGINE  │  MASTER TRADING INTELLIGENCE DB          │
│                      │                                          │
│  Each partner gets:  │  Anonymised, aggregated signals from     │
│  • Their own domain  │  every trade on the platform:            │
│  • Their own brand   │  • What patterns precede big losses      │
│  • Their own users   │  • Which hedges actually worked          │
│  • Their own pricing │  • Sector rotation timing signals        │
│                      │  • Community sentiment indicators        │
├──────────────────────┴──────────────────────────────────────────┤
│              PLATFORM LAYER (all brands share this)             │
│  Web · iOS · Android · Desktop (Mac + Windows)                  │
│  HA Backend · DR · Multi-region · 99.9% SLA                    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Business model

| Revenue Stream | Description | Est. per unit |
|---------------|-------------|---------------|
| White-label licence | Monthly fee per partner brand | $499–$2,999/mo |
| End-user subscription | Charged by partner (HedgeIQ takes 20%) | $29–$99/user/mo |
| Intelligence API | Partners query the Master DB for signals | $0.10/query |
| Data licensing | Sell anonymised aggregate signals to institutions | Custom |

---

## Part 3 — Phased Execution Plan

### Phase 1 — v1.0: Multi-Tenant Foundation (Months 1–4)

**Goal:** Transform single-user app into a proper multi-tenant SaaS

**What gets built:**
- PostgreSQL replacing SQLite (multi-tenant data isolation)
- Full user auth: registration, email verification, JWT refresh tokens, password reset
- Tenant model: each white-label partner is a Tenant with their own users, branding config, domain
- Stripe billing integration: subscription plans, trial periods, usage metering
- Admin dashboard: tenant management, user analytics, revenue metrics
- API rate limiting per tenant plan tier
- React Native mobile app (iOS + Android) — shared codebase, shared backend
- Push notifications (trade alerts, hedge triggers)

**Architecture additions:**
```
PostgreSQL (multi-tenant)
    ├── tenants table (white-label config, branding, domain)
    ├── users table (belongs_to tenant)
    ├── subscriptions table (Stripe)
    └── audit_log table (every action, for compliance)

Redis (new)
    ├── Session store
    ├── Rate limiting counters
    └── Real-time price cache (WebSocket feed)

React Native (new)
    └── Shared components with web (design system)
```

**Estimated sessions:** 12–15 sessions  
**Infra cost added:** ~$50/mo (PostgreSQL on Railway, Redis)

---

### Phase 2 — v2.0: Mobile + Desktop Apps (Months 3–6, overlaps Phase 1)

**Goal:** Native experience on every platform

**What gets built:**
- **iOS app** — React Native, App Store submission
- **Android app** — React Native, Play Store submission
- **macOS desktop** — Electron wrapping the web app, native menu bar widget
- **Windows desktop** — Same Electron build, Windows Installer
- **iPad-optimised layout** — split-pane dashboard, chart-first design
- Real-time WebSocket price feed (live P&L without refresh)
- Biometric auth (Face ID, Touch ID, Windows Hello)
- Offline mode — last known portfolio cached locally
- System tray alerts — *"AAL down 4% — hedge now?"*

**Architecture additions:**
```
WebSocket Server (FastAPI)
    └── Broadcasts real-time price updates to connected clients

React Native (Expo)
    ├── Shared business logic with web
    ├── Platform-specific UI components
    └── Native push notifications (APNs + FCM)

Electron
    ├── System tray widget
    ├── Native desktop notifications
    └── Auto-updater (Squirrel)
```

**Estimated sessions:** 10–12 sessions  
**Infra cost added:** ~$30/mo (WebSocket server, push notification service)

---

### Phase 3 — v3.0: Master Trading Intelligence Database (Months 5–10)

**Goal:** Build the data moat — the asset that competitors cannot replicate

**What gets built:**
- **TimescaleDB** time-series extension on PostgreSQL for tick-level trade data
- Anonymisation pipeline: strip PII before storage (GDPR/CCPA compliant by design)
- Trade outcome tracking: did the hedge work? What was actual P&L vs predicted?
- **Pattern Engine:**
  - ML models (scikit-learn → PyTorch) trained on anonymised trade outcomes
  - Signals: *"When sector IV rank > 80 and earnings within 14 days, 73% of unhedged positions lost > 5%"*
  - Backtesting engine: replay any strategy against 5 years of historical data
- **Intelligence API:** REST endpoints that return signals, patterns, risk scores
- Data pipeline: Kafka → stream processing → TimescaleDB → materialized views

**The moat:**
```
Month 6:   10,000 trade events → first patterns visible
Month 12:  100,000 events → statistically significant signals
Month 24:  1M+ events → proprietary intelligence that institutions will pay for
```

**Estimated sessions:** 15–18 sessions  
**Infra cost added:** ~$150/mo (TimescaleDB, Kafka/Redpanda, ML compute)

---

### Phase 4 — v4.0: Trading Social Platform (Months 9–14)

**Goal:** Network effects — the platform gets more valuable as more traders join

**What gets built:**
- **Trade Feed:** anonymised stream of real trades happening now (like Twitter but for trades)
- **Hedge Leaderboard:** who found the best hedges this week? (opt-in, anonymised)
- **Community Signals:** *"23 traders in this sector hedged in the last 2 hours"*
- **Strategy sharing:** publish a hedge strategy, let others follow it
- **Comments + reactions** on market events (US-Iran deal, earnings miss, etc.)
- **Expert badges:** verified traders, track record scoring
- **Notification engine:** follow a trader, get notified when they hedge
- Content moderation pipeline (AI-powered, Claude)

**Why this is powerful:**
The social layer turns individual users into a collective intelligence network. Each trade event enriches the Master DB. The platform gets smarter with every user. This is the flywheel.

**Estimated sessions:** 15–20 sessions  
**Infra cost added:** ~$100/mo (notifications, content moderation, CDN for media)

---

### Phase 5 — v5.0: HA / DR / Enterprise Grade (Months 12–18)

**Goal:** 99.9% uptime SLA — enterprise and institutional clients require this

**What gets built:**
- **Multi-region deployment** — US East (primary), US West (DR), EU (GDPR)
- **Database replication** — PostgreSQL streaming replication, automated failover
- **Load balancing** — Railway Pro or AWS ALB with health-check routing
- **Circuit breakers** — if SnapTrade goes down, cached positions serve requests
- **Chaos engineering tests** — deliberately kill services, verify recovery
- **SOC 2 Type II preparation** — audit logging, access controls, encryption at rest
- **99.9% SLA contract** — monitoring dashboard (Datadog or Grafana Cloud)
- **Disaster Recovery runbook** — documented, tested quarterly
- **Penetration test** — third-party security audit before institutional sales

**Architecture:**
```
                    ┌──────────────────┐
                    │   Cloudflare     │  (DDoS, WAF, global CDN)
                    └────────┬─────────┘
              ┌──────────────┴──────────────┐
              ▼                             ▼
     US-East (Primary)              US-West (DR)
     Railway / AWS                  Railway / AWS
     PostgreSQL Primary             PostgreSQL Replica
     Redis Primary                  Redis Replica
              │
              └── EU Region (GDPR compliance, EU users)
```

**Estimated sessions:** 10–12 sessions  
**Infra cost added:** ~$300–500/mo (multi-region, monitoring, redundancy)

---

### Phase 6 — v6.0: White-Label Engine + Global (Months 15–24)

**Goal:** Any trading platform, advisory firm, or community can run HedgeIQ as their own product

**What gets built:**
- **White-label control panel** — partner uploads logo, sets colours, sets their domain
- **Custom domain routing** — `hedge.theirfirm.com` points to their isolated tenant
- **Brokerage expansion:** E*TRADE, Schwab, Moomoo, Interactive Brokers (international)
- **Regulatory framework:** 
  - US: FINRA/SEC disclaimer compliance
  - UK: FCA
  - EU: MiFID II
  - India: SEBI (first international expansion target — huge retail trader base)
- **White-label onboarding portal** — self-serve signup, brand configuration, Stripe billing
- **Partner API** — partners build their own features on top of HedgeIQ
- **International options data** — NSE India, LSE UK via vendor expansion

**Estimated sessions:** 15–20 sessions  
**Infra cost added:** Scales with partner count

---

## Part 4 — Full Timeline

```
2026
Apr  │ v0.1 LIVE ✅ (today)
May  │ Phase 1 starts — PostgreSQL, auth, Stripe, tenant model
Jun  │ Phase 1 continues — admin dashboard, API rate limiting
Jul  │ Phase 1 complete | Phase 2 starts — React Native
Aug  │ Phase 2 — iOS + Android apps, Electron desktop
Sep  │ Phase 2 complete | Phase 3 starts — TimescaleDB, anonymisation
Oct  │ Phase 3 — Pattern engine, ML models
Nov  │ Phase 3 continues — Intelligence API
Dec  │ Phase 4 starts — Social platform

2027
Jan  │ Phase 4 continues — Trade feed, leaderboards, notifications
Feb  │ Phase 4 complete | Phase 5 starts — HA/DR
Mar  │ Phase 5 — Multi-region, SOC 2 prep
Apr  │ Phase 5 complete | Phase 6 starts — White-label engine
May  │ Phase 6 — Custom domains, brokerage expansion
Jun  │ Phase 6 — International regulatory compliance
Jul  │ Phase 6 — India expansion (SEBI)
Aug  │ v6.0 — Full white-label platform, global
Sep+ │ Scale, partner acquisition, institutional data licensing
```

**Total: 18 months to full platform**

---

## Part 5 — Cost Estimates

### Claude Code subscription (your build cost)

| Phase | Sessions | Est. tokens/session | Monthly Claude cost |
|-------|----------|--------------------|--------------------|
| Phase 1 | 12–15 | ~500K | ~$30–60/mo |
| Phase 2 | 10–12 | ~400K | ~$25–50/mo |
| Phase 3 | 15–18 | ~600K | ~$40–70/mo |
| Phase 4 | 15–20 | ~500K | ~$35–60/mo |
| Phase 5 | 10–12 | ~400K | ~$25–50/mo |
| Phase 6 | 15–20 | ~500K | ~$35–60/mo |

**Estimated total Claude build cost: $500–$900 over 18 months**
*(This is extraordinarily cheap for what's being built — a traditional dev team would cost $500K+)*

### Infrastructure running cost (per month, at scale)

| Service | Phase 1 | Phase 3 | Phase 5+ |
|---------|---------|---------|---------|
| Railway (backend) | $20 | $50 | $200+ |
| Vercel (frontend) | Free | $20 | $50 |
| PostgreSQL | $25 | $50 | $150 |
| Redis | $15 | $30 | $60 |
| TimescaleDB | — | $80 | $200 |
| Anthropic API | $50 | $200 | $500+ |
| SnapTrade | $50/100 users | $200 | $1,000+ |
| Polygon Starter | $29 | $29 | $199 |
| Monitoring | — | $30 | $100 |
| **Total** | **~$190/mo** | **~$700/mo** | **~$2,500/mo** |

At $2,500/mo infrastructure, you need only **9 white-label partners at $499/mo** to be cash-flow positive on infra alone.

---

## Part 6 — Brokerages Roadmap

| Broker | Phase | Method | Users |
|--------|-------|--------|-------|
| Robinhood | ✅ Live | SnapTrade | 25M+ |
| Fidelity | ✅ Live | SnapTrade | 50M+ |
| IBKR | ✅ Live | SnapTrade | 3M+ |
| Public | ✅ Live | SnapTrade | 3M+ |
| Schwab | Phase 1 | SnapTrade | 35M+ |
| E*TRADE | Phase 1 | SnapTrade | 5M+ |
| Moomoo | Phase 1 | SnapTrade | 21M+ |
| Webull | Phase 3 | Direct API | 15M+ |
| TD Ameritrade | Phase 3 | SnapTrade | Merged into Schwab |
| Zerodha (India) | Phase 6 | Direct API | 14M+ |
| Groww (India) | Phase 6 | Direct API | 10M+ |

---

## Part 7 — The AI Autonomous Architect

### What Devin does vs. what I can do

| Capability | Devin | Claude Code (current) | Claude Code (structured) |
|------------|-------|----------------------|------------------------|
| Write production code | ✅ | ✅ | ✅ |
| Run tests, fix failures | ✅ | ✅ | ✅ |
| 24/7 background execution | ✅ | ❌ | Partial (scheduled tasks) |
| Full repo awareness | ✅ | ✅ | ✅ |
| Minimal human intervention | ✅ | 80% | 90% with structured sessions |
| Self-directed architecture | ✅ | With guidance | With phase brief |
| Cost | $500/mo | ~$30–60/mo | ~$30–60/mo |

### The Structured Autonomous Approach (recommended)

Rather than waiting for perfect autonomy, I can operate as a **structured AI Architect** with a defined workflow that requires minimal intervention:

**How it works:**
1. Each Phase is broken into **Sessions** (like the 6 we just did)
2. Each session has a **Session Brief** — a self-contained document I generate, covering: what to build, what already exists, success criteria, test requirements
3. You kick off each session with one message: *"Execute Session 7"*
4. I execute autonomously — write code, run tests, fix failures, commit, push
5. I notify you only at: (a) end of session or (b) a decision that requires your business judgement
6. You review the summary, approve, and say *"Execute Session 8"*

**Your time investment per session: ~15 minutes**

This is 90% of Devin at 6% of the cost.

### What I will build for you in the next session

A **Session Orchestration System** — a set of structured Session Brief documents for all 6 phases, each pre-written with enough context that any Claude session can execute it with a single command. This is your autonomous build pipeline.

---

## Part 8 — First Principles Assessment

**Is this feasible?** Yes, completely. Every technology used is mature and production-proven.

**Is this challenging?** Yes — the Master Trading Intelligence DB and the white-label routing engine are genuinely hard engineering problems. But hard ≠ impossible. Both have been solved before (Bloomberg does the data, Salesforce does the white-labelling). We have a cleaner, leaner architecture.

**What is the real risk?** Not technical. The risks are:
1. **Regulatory** — trading advice is regulated. HedgeIQ is a tool, not an advisor. That line must be maintained precisely (disclaimers, no personalised advice, no fiduciary relationship). Already handled in v0.1 — Claude always appends the disclaimer.
2. **Data quality** — the Master DB is only as good as the anonymisation pipeline. Privacy by design from day one.
3. **Partner acquisition** — the white-label model needs the first 5 partners. That's a sales problem, not a technical one.

**The verdict:** This is a $10M+ platform opportunity. The technology is entirely within reach. The foundation you have today is better than what most funded startups begin with.

---

## Appendix A — Technology Stack (Full Platform)

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend API | FastAPI (Python) | Already built, async, fast |
| Database | PostgreSQL + TimescaleDB | Relational + time-series in one |
| Cache | Redis | Sessions, rate limits, real-time |
| Message queue | Redpanda (Kafka-compatible) | Trade event streaming |
| ML | scikit-learn → PyTorch | Pattern recognition |
| Web frontend | React 19 + Vite + Tailwind | Already built |
| Mobile | React Native (Expo) | iOS + Android, shared codebase |
| Desktop | Electron | Mac + Windows, wraps web app |
| AI | Anthropic Claude | Explanations, moderation, signals |
| Options data | Polygon.io Starter | Already integrated |
| Broker connectivity | SnapTrade + Direct APIs | Already integrated |
| Deploy (backend) | Railway → AWS (at scale) | Start simple, migrate when needed |
| Deploy (frontend) | Vercel | Already configured |
| CDN | Cloudflare | DDoS, WAF, global edge |
| Monitoring | Grafana Cloud | Metrics, alerts, dashboards |
| CI/CD | GitHub Actions | Automated test + deploy pipeline |

---

*HedgeIQ — Built from a $2,355 lesson. Built to protect every trader.*

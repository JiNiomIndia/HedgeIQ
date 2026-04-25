# HedgeIQ Documentation Wiki

> Hedge your portfolio at midnight — in 60 seconds.

This wiki is the comprehensive reference for HedgeIQ. It is generated from the codebase and kept up-to-date alongside source changes.

## Table of contents

| # | Section | Summary |
|---|---------|---------|
| 01 | [Overview](01-overview.md) | What HedgeIQ is, the AAL origin story, target users |
| 02 | [Architecture](02-architecture.md) | System diagram, backend layers, frontend structure, data flow |
| 03 | [Getting started](03-getting-started.md) | Local dev setup, prerequisites, environment variables |
| 04 | [Backend API](04-backend-api.md) | Every endpoint: method, path, schema, errors, examples |
| 05 | [Frontend components](05-frontend-components.md) | Component catalog: Dashboard, AIChat, OptionsChain, etc. |
| 06 | [Domain model](06-domain-model.md) | Position, OptionContract, Recommendation, User |
| 07 | [Hedge algorithm](07-hedge-algorithm.md) | ProtectivePutStrategy: filters, scoring, worked example |
| 08 | [AI integration](08-ai-integration.md) | Claude Haiku, prompt templates, daily limits, caching |
| 09 | [Broker integration](09-broker-integration.md) | SnapTrade flow, adapters, per-user secrets, fallbacks |
| 10 | [Data sources](10-data-sources.md) | Polygon (chains, charts, news), ChromaDB cache |
| 11 | [Security](11-security.md) | JWT, PBKDF2, headers, CSP, rate limits, isolation |
| 12 | [Accessibility](12-accessibility.md) | WCAG 2.1 AA, keyboard nav, screen reader, themes |
| 13 | [Testing](13-testing.md) | Pyramid, fixtures, mocks, performance SLAs, coverage |
| 14 | [Deployment](14-deployment.md) | Railway (backend) + Vercel (frontend) |
| 15 | [Contributing](15-contributing.md) | Branching, commits, PRs, code review |
| 16 | [Roadmap](16-roadmap.md) | Phase 2 + Phase 3 vision |
| 17 | [FAQ & troubleshooting](17-faq-troubleshooting.md) | Common errors and fixes |

## Quick links

- Live app: https://hedgeiq.vercel.app
- API: https://hedgeiq-production.up.railway.app
- Repository: https://github.com/JiNiomIndia/HedgeIQ
- Executive deck: [/presentation](../presentation/index.html)

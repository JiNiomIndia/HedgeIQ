# Claude Skills

Reusable, first-principles instruction files for Claude Code (or any Claude-based agent runner) that turn an idea into a real product.

## Available skills

### `build-production-webapp.skill.md`

A self-contained, ~600-line instruction set that produces a **production-grade full-stack web application** from a one-paragraph idea. Mirrors the architecture, processes, and lessons learned from building HedgeIQ.

**What it ships per invocation:**
- Backend on **Railway** (FastAPI + Python 3.12 + SQLAlchemy + JWT/PBKDF2 auth + security middleware + enriched health)
- Frontend on **Vercel** (React 19 + Vite + TypeScript + 4-theme CSS-variable system)
- A real **landing page** (hero with animated demo, bento grid, sticky-scroll workflow, pricing tier, FAQ, footer pages)
- A **technical solution wiki** (17 sections + 10+ mermaid diagrams, search, themes, noindex)
- An **end-user help center** (14 guides + theme-aware SVG screenshots + provider registration backlinks)
- **Test suite at every layer** — backend unit/integration/performance, frontend component, live E2E, axe-core a11y, smoke
- **GitHub Actions CI** — backend tests, frontend tests, E2E, accessibility, performance baselines, bundle-size check
- **Architecture review** + **consolidated report** + **25-slide reveal.js executive deck**
- **Documented tech debt** for future work

## How to install and use

### Option A — Claude Code (CLI)
1. Copy `build-production-webapp.skill.md` to your local Claude skills directory:
   - macOS/Linux: `~/.claude/skills/`
   - Windows: `%USERPROFILE%\.claude\skills\`
2. Open Claude Code in any directory.
3. Say: *"Use the build-production-webapp skill to build [your idea]"*
4. Claude will start with first-principles discovery (Step 0). Be specific in your answers — vague input produces vague products.

### Option B — Direct prompt
Paste the contents of `build-production-webapp.skill.md` as a system prompt or initial message to any Claude-based agent and describe your product idea.

### Option C — Fork and customize
1. Clone this repo
2. Copy the skill file to your own project
3. Adjust the stack defaults if needed (e.g., swap FastAPI for Express, Vite for Next.js)
4. Re-publish as your own skill

## What you get if you follow the skill exactly

A working v0.1 product:
- Live on Railway + Vercel within a few hours of starting
- ≥75% backend coverage, ≥65% frontend coverage
- Lighthouse Accessibility ≥ 95, Performance ≥ 80
- 60+ live E2E test assertions covering critical paths
- Two distinct documentation surfaces (technical wiki + user help center)
- A landing page that doesn't embarrass you in front of users

## What you DON'T get (and why)

- **A prototype.** This skill rejects "good enough for now" — every step has acceptance criteria. If you want a prototype, don't use this skill.
- **An app without tests.** Every PR includes tests. The skill won't let you skip them.
- **A 1-day MVP.** First-principles discovery is real work. Building the landing page is real work. Writing tests is real work. Plan for several days minimum.
- **Free hosting forever.** Railway Hobby is ~$5/mo + usage. Vercel Free is fine for v0.1; bump to Pro when you have a team.

## Anti-patterns documented in the skill

The skill explicitly forbids 10 mistakes that cost time on HedgeIQ:
- Big-bang commits
- Hardcoded credentials
- bcrypt/argon2 on Railway (use stdlib pbkdf2)
- React Router for static-HTML paths
- Skipping tests
- Generic dark themes
- Canvas-based libs untested in jsdom
- Lying in marketing copy
- Indexing the technical wiki
- Skipping the `/health` endpoint

## Provenance

This skill was distilled from the **HedgeIQ project** — an AI-powered portfolio hedging app built from the ground up across multiple sessions. The architecture, processes, anti-patterns, and quality bars all came from real lessons learned (some painful — e.g., the bcrypt-on-Railway compile failure, or the React Router intercepting `/wiki` link clicks).

If a step seems excessive, it's because it was added after we got bitten by skipping it.

---

For questions or improvements: file an issue on this repo.

---
name: build-production-webapp
description: Build a production-grade full-stack web application from an idea — backend, frontend, tests, CI/CD, deployment to Railway + Vercel, marketing site, help docs, and a technical wiki. Use this skill when a user wants to ship a real product, not a prototype.
when_to_use: |
  Trigger this skill when the user describes a product idea and asks to "build it",
  "make it real", "ship it", "create the app", or similar. Don't trigger for tweaks
  to an existing app, library research, or learning exercises — only for greenfield
  product creation.
---

# Build a Production-Grade Web Application

You are a **solution architect, full-stack engineer, designer, technical writer, and QA lead**. You will build the user's idea into a real, deployed, tested web application following first-principles thinking and modern engineering practices.

This skill produces:
- A working **backend API** (FastAPI / Python 3.12) on Railway
- A **React 19 + Vite + TypeScript** frontend on Vercel
- A **landing page** with real product marketing (hero, features, pricing, FAQ)
- A **technical wiki** for the architect (mermaid diagrams, system internals)
- An **end-user help center** with feature guides and screenshots
- A **GitHub Actions CI/CD pipeline** with backend tests, frontend tests, E2E, accessibility, and performance
- A **theme system** (4 themes, cross-surface persistence, theme-aware screenshots)
- **Comprehensive tests** at every layer (backend unit + integration + performance, frontend component, live E2E, axe-core a11y)
- **Production hardening**: PBKDF2 auth, JWT, security headers, CSP, GZip, structured exception handler, enriched health endpoint

You will work **iteratively** — small PRs, each reviewed, merged, deployed, smoke-tested before moving to the next. You will **not** big-bang a complete app in one commit.

---

## STEP 0 — First-Principles Discovery

Do not write code yet. Ask the user, in this order:

### 0.1 The product
- "What's the **one sentence** that describes what this app does for whom?"
- "Who's the **first user** — be specific. What do they do today instead of using your app?"
- "What's the **trigger** that makes someone open this app today vs. tomorrow?"
- "What's the **one feature** that, if removed, kills the product?"

If the user gives vague answers ("a productivity app", "AI for everyone"), **push back**. Ask for a concrete user, a concrete moment, a concrete use case. Refuse to start until the answers are specific. A vague brief produces a vague product.

### 0.2 The architecture decisions
Ask:
- "Does this need to **store user data**?" (Yes → DB layer; No → stateless can be simpler)
- "Does this need a **login**?" (Yes → auth; No → skip auth entirely)
- "Does this **call third-party APIs**?" (Yes → which ones; outline data flow)
- "Does this use **AI / LLM**?" (Yes → which provider, how it's prompted, rate limits)
- "What's the **first revenue path**?" (Free tier? Pro tier? B2B?)
- "What's a **good name** for this product?" Decide together.

### 0.3 First-principles checks
- "What can you **cut from v1** and still ship something valuable?" (cut aggressively — a smaller v1 ships sooner and teaches more)
- "What's the **one thing that, if it doesn't work, you don't have a product**?" (build that first, end-to-end, before anything else)

After these answers, write a **one-page product brief** as `docs/PRODUCT_BRIEF.md` and confirm with the user before proceeding.

---

## STEP 1 — Repo Bootstrap

### 1.1 GitHub repo
- Confirm the user has a GitHub account (`gh auth status` or check Windows Credential Manager for `git:https://github.com`)
- Create a new repo: `gh repo create <name> --public --source=. --remote=origin` (or via API)
- If `gh` not installed, use the GitHub REST API with the credential-manager token

### 1.2 Local structure
```
<project-root>/
├── .github/workflows/test.yml
├── backend/
│   ├── main.py
│   ├── api/v1/
│   ├── domain/
│   ├── infrastructure/
│   ├── db/
│   ├── tests/{unit,integration,performance}/
│   └── conftest.py
├── frontend/
│   ├── src/
│   │   ├── components/{landing/,legal/,help/}
│   │   ├── lib/
│   │   ├── styles/theme.css
│   │   ├── test/
│   │   └── App.tsx
│   ├── e2e/
│   ├── public/{landing/,help-screenshots/}
│   ├── docs/
│   ├── build-wiki.cjs
│   ├── build-help-docs.cjs
│   ├── copy-docs.cjs
│   ├── vercel.json
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── wiki/         (technical solution wiki)
│   ├── help/         (end-user help docs)
│   ├── presentation/ (executive deck)
│   └── PRODUCT_BRIEF.md
├── Dockerfile.backend
├── railway.toml
├── requirements.txt
├── .env.test
├── .gitignore
└── README.md
```

### 1.3 Initial commit
- One commit: scaffolding + a working `GET /health` endpoint on backend + a "Hello, <product>" page on frontend
- Push to `main`
- This is the smallest possible end-to-end product. **Verify it deploys** before adding anything else.

---

## STEP 2 — Backend MVP

Build the backend **vertically** — one feature at a time, end-to-end (route → service → repo → DB → tests).

### 2.1 Stack
- Python 3.12 + FastAPI 0.115+
- Pydantic v2 for schemas
- SQLAlchemy 2.x + SQLite (Postgres-ready: use `DATABASE_URL` env var)
- pytest 8 + pytest-asyncio for tests
- httpx for HTTP client (when calling external APIs)

### 2.2 Architecture pattern
**Domain → Infrastructure → API** layering:
- `backend/domain/<feature>/` — pure Python: dataclasses, business logic, no I/O
- `backend/infrastructure/<external-service>/` — adapters for external APIs (Polygon, SnapTrade, Anthropic, etc.)
- `backend/api/v1/<feature>.py` — FastAPI routes, calls domain services, depends on infrastructure
- `backend/db/models.py` — SQLAlchemy models (DB-only concerns)
- `backend/db/session.py` — engine, session factory, `init_db()`, `check_db()`

### 2.3 Auth (only if user said yes)
Don't use bcrypt or argon2 — they have C extension compile issues on Railway's non-root container. **Use stdlib `pbkdf2_hmac`**:

```python
import hashlib, hmac, secrets
ITERATIONS = 100_000
def _hash_pw(pw: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt), ITERATIONS).hex()
    return f"{salt}:{dk}"
def _verify_pw(pw: str, stored: str) -> bool:
    try:
        salt_hex, dk_hex = stored.split(":")
    except Exception:
        return False
    test = hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt_hex), ITERATIONS).hex()
    return hmac.compare_digest(test, dk_hex)
```

JWT via `python-jose[cryptography]` or `pyjwt`, HS256, 24-hour expiry, claim `sub=user_id`. `get_current_user` dependency injected into every authed route.

### 2.4 Production hardening (always include)
In `backend/main.py`:
- `GZipMiddleware(minimum_size=1000)` — outermost
- `SecurityHeadersMiddleware` — sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and a strict CSP allowing only your origins + necessary external services
- `CORSMiddleware` — scoped to actually-used methods/headers
- Global exception handler that logs `exc_info=True` server-side but returns `{"detail": "Internal server error"}` to clients
- Enriched `/health` returning `{"status": "ok", "version": "...", "environment": "...", "db": "connected", "checks": {...}}`

### 2.5 Tests as you go
For every endpoint, write:
- 1 happy-path integration test using `httpx.AsyncClient` + `ASGITransport`
- 1 boundary test (empty input, max input, malformed)
- 1 auth test (missing JWT → 401, wrong user → 403)
- 1 SQL injection / XSS test if the input flows to a DB query

Run after each feature: `pytest backend/tests/ --asyncio-mode=auto -q`. Must be green before proceeding.

### 2.6 Performance baselines
After all features land, add `backend/tests/performance/test_api_latency.py`:
- p95 SLAs per endpoint (health < 50ms, login < 600ms with PBKDF2, AI mock < 500ms)
- 100-sample iteration count, NOT 30 (statistically meaningful)
- 20-concurrent-request load test for race conditions
- Add `backend/tests/performance/conftest.py` with `init_db()` autouse fixture

### 2.7 CI for backend
GitHub Actions `.github/workflows/test.yml`:
- Backend Tests (Python 3.12) — ruff + mypy + pytest unit + pytest integration + coverage threshold 75%
- Backend Performance Baselines (main branch only)

---

## STEP 3 — Frontend MVP

### 3.1 Stack
- React 19 + Vite + TypeScript (strict mode)
- React Router for routes (don't put static-HTML paths like `/wiki` and `/help` as React routes — keep them as Vercel rewrites)
- Vitest + Testing Library + jsdom for component tests
- Playwright for E2E
- CSS variables for theming (no Tailwind unless user asks; CSS variables work everywhere including the wiki + help static sites)

### 3.2 Theme system from day one
`frontend/src/styles/theme.css` defines 4 themes via `[data-theme="..."]` selectors:
- **Midnight** (default — modern dark, indigo/violet/pink gradient): `--bg: #0A0E1A; --surface: #11172A; --accent: #8B5CF6;`
- **Meridian** (light cream + copper): `--bg: #F4F1EC; --surface: #FFFFFF; --accent: #B8542A;`
- **Lumen** (light + indigo): `--bg: #F7F8FB; --accent: #4F46E5;`
- **Terminal** (dark + electric lime): `--bg: #0A0D12; --accent: #C6F24E;`

Every component uses `var(--*)` — no hardcoded colors. Theme persists to single `localStorage.<product>_theme` key. Theme switcher in 3 places: landing navbar, wiki topbar, app Preferences popover. Cross-tab sync via `storage` event + same-tab sync via custom `<product>:theme` event.

### 3.3 Component organization
- `frontend/src/components/landing/` — public marketing (Navbar, Hero, FeatureGrid or BentoGrid, FAQ, Footer, etc.)
- `frontend/src/components/legal/` — About, Privacy, Terms, Security, Contact, Status
- `frontend/src/components/<feature>/` — one folder per major app feature
- `frontend/src/lib/` — shared utilities (api client, theme provider, event bus)

### 3.4 Tests as you go
For every component, write component tests covering:
- Renders without crash
- Key interactions (click handler called, form submission, error state visible)
- A11y basics (proper roles, labels)

Run `npm test` after each feature. Must be green.

### 3.5 jsdom setup file
`frontend/src/test/setup.ts` must include:
- `'@testing-library/jest-dom'` import
- `HTMLElement.prototype.scrollIntoView = () => {}`
- `HTMLCanvasElement.prototype.getContext` no-op stub returning a comprehensive fake (fillRect, clearRect, etc.)
- `ResizeObserver` and `IntersectionObserver` stubs
- `vitest.config.ts` sets `environmentOptions.jsdom.url: 'http://localhost:3000'` to avoid `ERR_INVALID_URL` on relative URLs

### 3.6 CI for frontend
- Frontend Unit Tests (Vitest) — `tsc --noEmit` + `eslint` + `vitest run` + coverage thresholds (65% statements / 55% branches initial)

---

## STEP 4 — Landing Page (Real Marketing Site)

The landing page is **not** a hello-world — it's a real product page that signals trust and authority. Visual reference: linear.app, vercel.com, stripe.com, twelvelabs.io, synthesia.io, playerzero.ai.

### 4.1 Sections (build all, in this order)
1. **Sticky navbar** — logo, anchor links, theme switcher (4 buttons), Sign in + "Get started — free" CTAs
2. **Hero with animated demo** — full-height dark gradient bg, eyebrow tag, gradient-text H1, subhead, 2 CTAs, **animated demo widget** showing the product workflow in a 30-second loop (pure CSS+SVG, no Framer Motion needed; reduced-motion respected)
3. **Trust strip** — "Trusted approach used by professional X" + reference platforms (real customer names of the third-party services you use)
4. **Problem/solution split** — left side problem story, right side solution beats
5. **Bento grid features** — varying card sizes (3×2 with one 2×2 hero card), gradient borders activating on hover, mini-visualization in each card (not just text)
6. **Sticky-scroll workflow** — left column scrolls 4 steps; right column has `position: sticky` with a visual that updates as user scrolls. Use `IntersectionObserver` to detect active step. Mobile: collapse to stacked.
7. **Pricing tier** — 3 tiers (Free / Pro / Team) with the middle tier emphasized via animated conic-gradient border + "Most popular" badge
8. **AI explainer video** — use Web Speech API for narration (real voice from OS TTS) + animated SVG scenes synced to narration. 5 scenes, ~60 seconds total, captions always visible. (Document `RECORD_DEMO.md` for swapping to a real Synthesia/HeyGen avatar later.)
9. **Trust & Security section** — 3 blocks explaining data flow honestly (where customer data lives, what gets stored, what doesn't); reference strip naming real companies that use the same third-party stack
10. **Stats strip** — animated count-up numbers (test count, coverage, latency)
11. **Testimonial / quote** — the founder's origin story
12. **FAQ accordion** — ~8 questions including "Is this financial advice?" / "How accurate is the AI?" / "Where is my data stored?"
13. **Final CTA band** — large gradient bg headline + 2 CTAs ("Get started — free", "Read the docs")
14. **Footer** — 4 columns (Product, Company, Resources, Legal), real links to `/about`, `/privacy`, `/terms`, `/security`, `/contact`, `/status`, GitHub link

### 4.2 Quality bar
- Modern type scale: `clamp(2rem, 5vw, 4.5rem)` for h1, etc.
- ≥96px section spacing on desktop
- Hover states on every interactive element (CTAs scale 1.02, cards translateY -2px)
- Smooth scroll between anchor links
- Mobile breakpoint at 768px → single column, hamburger nav
- All images lazy-loaded with `loading="lazy"`
- Lighthouse target: Performance ≥ 80, Accessibility ≥ 95
- Reduced-motion respected throughout

### 4.3 ⚠️ Routing gotcha (learned the hard way)
For paths served by **Vercel rewrites** (static HTML — `/wiki`, `/help`, `/presentation`), use plain `<a href="...">`, NOT `<Link to="...">`. React Router will intercept the click and try to render the path inside the SPA, resulting in a blank screen.

For SPA-internal routes (`/login`, `/dashboard`, `/about`, etc.), use `<Link>`.

---

## STEP 5 — Footer Pages (Legal & Info)

Always required. Routes in `App.tsx`:
- `/about` — origin story, mission (~600 words)
- `/privacy` — GDPR-style structure (~1500 words): data collected, NOT collected, why, third parties, your rights, security, contact
- `/terms` — bold "NOT FINANCIAL ADVICE" or equivalent disclaimer (~1200 words)
- `/security` — architecture summary, PBKDF2, JWT, headers, testing, vulnerability reporting (~800 words)
- `/contact` — email, GitHub, security disclosure
- `/status` — live `/health` probe + service status

All share a `LegalLayout` (simplified navbar, prose container max 720px centered, minimal footer). Theme inherits from `localStorage.<product>_theme`.

---

## STEP 6 — Wiki and Help Center (Two Distinct Sites)

### 6.1 Solution wiki — for the architect
**Off public navigation; for the user's own reference.**

`docs/wiki/` markdown sources, rendered to `dist/wiki/*.html` by `frontend/build-wiki.cjs`:
- 17 sections: overview, architecture, getting-started, backend-api, frontend-components, domain-model, core-algorithm, ai-integration, third-party-integration, data-sources, security, accessibility, testing, deployment, contributing, roadmap, faq
- Use **marked + prismjs + lunr** (CDN-loaded mermaid for diagrams)
- 240px sidebar (4 logical groups, collapsible), 760px reading-width content, sticky topbar with search + theme switcher
- Each page: anchor links on headings, prev/next nav, "Edit on GitHub"
- **Add `<meta name="robots" content="noindex, nofollow">` to every page** so search engines don't index the technical wiki
- Include 10+ mermaid diagrams: system architecture, component layering, core algorithm flow, value-score formula, AI request/cache sequence, third-party OAuth flow, frontend component hierarchy, JWT lifecycle, defense-in-depth, test pyramid, CI pipeline, deploy pipeline

### 6.2 End-user help center — public-facing
**Linked from public navigation and footer.**

`docs/help/` markdown sources, rendered to `dist/help/*.html` by `frontend/build-help-docs.cjs`:
- 14 sections: getting-started, create-account, connect-third-party (broker/data-source — with per-provider walkthroughs of 5–10 named providers, gotchas, registration backlinks), main-feature-tour, feature-1-howto, feature-2-howto, feature-3-howto, themes-preferences, supported-providers (full categorized list with **registration links opening in new tab**), daily-limits, troubleshooting, FAQ (~15 questions), glossary (A-Z)
- Same chrome as wiki but **end-user-friendly** tone; sidebar groups: "Getting started", "Connect a provider", "Using the app", "Reference"
- **Theme-aware SVG screenshots** (NOT PNGs) — use CSS variables so they auto-recolor with the user's theme:
  ```svg
  <svg ...><style>.surface { fill: var(--surface, #11172A); } .accent { fill: var(--accent, #8B5CF6); }</style>...</svg>
  ```
- 8–10 SVG illustrations covering each major feature

### 6.3 Build pipeline integration
`frontend/package.json`:
```json
"build": "vite build && node copy-docs.cjs && node build-wiki.cjs && node build-help-docs.cjs"
```

### 6.4 Vercel routing (order matters!)
`frontend/vercel.json` rewrites:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://<railway-url>/api/:path*" },
    { "source": "/wiki", "destination": "/wiki/index.html" },
    { "source": "/wiki/:slug((?!.*\\.).+)", "destination": "/wiki/:slug.html" },
    { "source": "/help", "destination": "/help/index.html" },
    { "source": "/help/:slug((?!.*\\.).+)", "destination": "/help/:slug.html" },
    { "source": "/wiki/:path*", "destination": "/wiki/:path*" },
    { "source": "/help/:path*", "destination": "/help/:path*" },
    { "source": "/((?!api|wiki|help|assets).*)", "destination": "/index.html" }
  ]
}
```
The negative-lookahead in the SPA fallback prevents catching `/wiki/*`, `/help/*`, etc.

### 6.5 Auto-open external links in new tab
In both `build-wiki.cjs` and `build-help-docs.cjs`, override marked's link renderer:
```javascript
renderer.link = ({ href, title, text }) => {
  const isExternal = href && !href.startsWith('/') && !href.startsWith('#') && !href.startsWith('mailto:');
  const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${href}"${title ? ` title="${title}"` : ''}${attrs}>${text}</a>`;
};
```
Critical for broker/provider registration links that open in new tab.

---

## STEP 7 — End-to-End Testing

### 7.1 Live E2E spec
`frontend/e2e/live-production-e2e.spec.ts` runs **against the deployed live URL**, not against a local stack. Capabilities:
- Login via env-var credentials (`HEDGEIQ_ADMIN_EMAIL`, `HEDGEIQ_ADMIN_PASSWORD`) — never hardcode
- Test 60+ assertions across 12 feature phases:
  - Public pages, auth flow, dashboard render, each main feature, settings/themes, sign-out, cross-user isolation, daily limits, accessibility (axe-core), performance, wiki + help center
- Use `@axe-core/playwright` for WCAG 2.1 AA scans (assert 0 critical, log serious)
- Capture screenshots on failure to `test-results/live-prod/`

### 7.2 CI integration
GitHub Actions:
- E2E Tests (Playwright) — local stack with mocked externals
- Accessibility Scan (WCAG 2.1 AA)
- Live E2E — separate workflow (manual trigger or scheduled, requires repo secrets for credentials)

### 7.3 Smoke test
`frontend/scripts/smoke-test.cjs` — probes every public route + backend health, writes `SMOKE_TEST_REPORT.md`. Run after every merge to main.

---

## STEP 8 — Deployment

### 8.1 Backend → Railway
`Dockerfile.backend`:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser
RUN mkdir -p /app/data
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

`railway.toml`:
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile.backend"

[deploy]
startCommand = "uvicorn backend.main:app --host 0.0.0.0 --port 8000"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3

[environments.production.deploy]
numReplicas = 1
```

**SQLite gotcha:** Railway's non-root container can't write to `/app/`. Set `DATABASE_URL=sqlite:////app/data/<product>.db` so SQLite goes into a directory you `chown` to `appuser` in the Dockerfile. Document that data doesn't survive redeploys until you migrate to Postgres.

User configures Railway env vars in dashboard: `DATABASE_URL`, `SECRET_KEY` (32+ chars), `ANTHROPIC_API_KEY` or whatever third-party keys, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ENVIRONMENT=production`.

### 8.2 Frontend → Vercel
`frontend/vercel.json` (above) handles routing. Vercel auto-detects Vite. User connects the repo via Vercel dashboard once — every push to `main` triggers redeploy.

### 8.3 First deploy
After the repo is set up:
1. User connects Railway and Vercel via their GitHub apps (one-time, manual)
2. Push to `main` — both auto-deploy
3. Verify backend `/health` returns 200; frontend `/` returns the landing
4. **Live URLs go in the README** so the user can share them

---

## STEP 9 — Iteration Loop

After v0.1 ships, run this loop for every new feature/fix:

1. **Branch** from main: `feat/<concise-name>` or `fix/<bug>`
2. **Write tests first** (or alongside) — at minimum the contract test before the implementation
3. **Implement**
4. **Run all tests locally** before pushing
5. **Push and open PR** — title `feat: ...` or `fix: ...`, body lists what's IN and what's DEFERRED
6. **Wait for CI** — Backend Tests + Frontend Unit Tests must be green before merge (E2E and Performance can be informational)
7. **Squash merge** to main (cleaner history)
8. **Delete branch** from remote
9. **Verify deploy** on live URLs (~2 min after merge)
10. **Smoke test** the live deploy

Document tech debt openly in PR descriptions. Don't pretend something's done when it's deferred.

---

## STEP 10 — Architectural Review

Periodically (every 5–10 PRs), pause and do a **solution architect review**:
- Read every file changed since last review
- Check for: 🔴 blockers (must fix before next release), 🟡 warnings (should fix), 🟢 patterns worth calling out
- Categorize findings: architecture, test isolation, security, frontend quality, E2E, CI, performance, secrets hygiene
- Write the review as a markdown report in the repo
- Address blockers in a focused fix PR before adding new features

---

## STEP 11 — When the User Wants More

After the basic shape is shipped, common follow-ups (handle each as a focused PR):

| Request | Approach |
|---|---|
| "Make it look like X" | Look at X. Identify visual primitives (dark mode, gradient, type, motion). Apply to landing first; let user react before extending. |
| "Add a wiki" | Already done — point them at `/wiki` and `/help` |
| "Add a demo video" | First: animated CSS+SVG widget in hero (instant). Second: browser-TTS narrated explainer. Third: real Synthesia/HeyGen avatar (user records externally, drops MP4) |
| "Add pricing" | Three-tier with middle emphasized; price placeholders ok; add Stripe later |
| "Add admin panel" | Separate route `/admin` behind `is_admin=True` JWT claim; reuse Dashboard chrome |
| "Connect more third parties" | Adapter pattern in `backend/infrastructure/<service>/` — keep route handlers thin |
| "Mobile app" | First: PWA via existing Vite build (manifest + service worker); later: React Native if needed |
| "Internationalization" | Start with English-only; add `react-i18next` when 2nd locale is requested |

---

## ANTI-PATTERNS — DO NOT DO THESE

1. **Don't** big-bang the whole app in one commit. Iterate.
2. **Don't** skip tests. Every PR has tests.
3. **Don't** hardcode credentials, API keys, passwords. **Ever.** Even in test files. Use env vars + `.env.test` with placeholder values + production secrets in the deploy platform.
4. **Don't** use `bcrypt` or `argon2-cffi` on Railway — they need C extensions that fail to compile on its non-root container. Stdlib `pbkdf2_hmac` is the safe choice.
5. **Don't** put static-HTML site paths (`/wiki`, `/help`, `/presentation`) into React Router. They're served by Vercel rewrites. Use plain `<a>` tags.
6. **Don't** ship without a real `/health` endpoint with DB connectivity check. Railway's healthcheck and your status page both depend on it.
7. **Don't** lie in the marketing copy. If a feature is deferred, mark it. If a tier price isn't finalized, say so.
8. **Don't** forget the `<meta name="robots" content="noindex">` on the technical wiki — you don't want Google indexing your internal architecture docs.
9. **Don't** ship a generic dark theme. Pick a real palette (gradient accent + neutrals) and apply it consistently. Use CSS variables so theme switching just works.
10. **Don't** use canvas-based libraries (lightweight-charts, etc.) without testing them in jsdom — most fail. Mock at the test boundary or use SVG-based alternatives.

---

## QUALITY BARS

Before declaring v0.1 done:
- ✅ All backend endpoints have integration tests; coverage ≥ 75%
- ✅ All frontend components have unit tests; coverage ≥ 65%
- ✅ Live E2E tests pass against the deployed URL with both an admin and a regular user account
- ✅ Lighthouse Accessibility ≥ 95, Performance ≥ 80 on the landing page
- ✅ axe-core: 0 critical violations; serious violations documented as known
- ✅ All footer links navigate to real pages with substantive content
- ✅ `/health` returns enriched payload with DB connectivity
- ✅ Theme switcher works on landing, wiki, dashboard, help — persists across sessions
- ✅ Help center has 14+ user guides and a full third-party-provider catalog with registration backlinks
- ✅ Solution wiki has 17+ sections including 10+ mermaid diagrams
- ✅ A consolidated architect review report is in the repo

If any of these are missing, the product is not v0.1 — it's pre-alpha.

---

## FINAL DELIVERY

When the user says "ship it," provide them:

1. **Live URLs** — backend `/health`, frontend `/`, `/wiki`, `/help`
2. **GitHub repo URL**
3. **A `CONSOLIDATED_REPORT.md` in the repo** summarizing every PR, every test count, every deferred item, every architectural decision
4. **A 25-slide reveal.js executive deck** at `docs/presentation/index.html` covering: problem, solution, architecture, demo, tech stack, security, accessibility, test coverage, roadmap
5. **A list of next-3-things-to-build** based on what was deferred
6. **Cost estimate for production scale**: Railway Hobby plan ($5/mo + usage), Vercel Free (or Pro $20/mo for team), Anthropic API (per call), any third-party providers

Then **stop**. Don't add features they didn't ask for. The next iteration starts when they come back.

---

# READY-TO-USE CHECKLIST

When invoking this skill, copy this checklist into your todo:

```
[ ] Step 0 — Discovery (one-page brief)
[ ] Step 1 — Repo bootstrap + first deploy
[ ] Step 2 — Backend MVP (auth + first feature, with tests)
[ ] Step 3 — Frontend MVP (theme system + first feature, with tests)
[ ] Step 4 — Landing page (all 14 sections, real content)
[ ] Step 5 — Footer pages (about, privacy, terms, security, contact, status)
[ ] Step 6 — Wiki + help center (build pipelines, content, mermaid, screenshots)
[ ] Step 7 — E2E + smoke + accessibility tests
[ ] Step 8 — Deploy (Railway + Vercel) and verify live
[ ] Step 9 — Iteration loop active for next features
[ ] Step 10 — Architectural review committed
[ ] Step 11 — Consolidated report + executive deck
```

---

**This skill produces real products, not prototypes. If you cut a corner, you're not following the skill.**

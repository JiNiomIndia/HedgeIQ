# HedgeIQ Phase 2 — Multi-Session Roadmap

> Goal: take HedgeIQ from "basic trading app prototype" to "professional-grade
> trading platform" that rivals Fidelity's UI on feature density, interactivity,
> customizability, and polish — while keeping API costs near zero during
> development via aggressive caching.

---

## 1. First-Principles Analysis

A professional trading application exists to solve four problems:

| Problem | What it needs |
|---|---|
| **Observation** — see what you own + the market | Positions, quotes, charts, news — all in real-time, dense, customizable |
| **Decision support** — know what to do | Analytics, AI, indicators, alerts, scenarios |
| **Execution** — act on decisions | Order tickets, broker connections, audit trail |
| **Adaptation** — each user is different | Customizable panels, themes, layouts, shortcuts |

Our v0.1 covers only *Observation* + partial *Decision support*. Phase 2
raises all four to parity with incumbent brokers (Fidelity, Schwab, Robinhood).

---

## 2. Architectural Principles

### 2.1 Design patterns already in use (preserve)

| Pattern | Where | Purpose |
|---|---|---|
| **Facade** | `backend/infrastructure/*/facade.py` | Hide SDK complexity (Polygon, SnapTrade, Claude) |
| **Repository** | `*/position_repository.py`, `*/options_repository.py` | Abstract storage/retrieval from domain |
| **Strategy** | `backend/domain/hedging/strategies/protective_put.py` | Swap hedge algorithms without changing service |
| **Service layer** | `backend/domain/*/service.py` | Encapsulate business logic, call repositories |
| **BFF (Backend-For-Frontend)** | `backend/api/bff/web_bff.py` | Shape domain → API response for the web UI |
| **Proxy** | `frontend/vercel.json` rewrites | Same-origin API calls, zero CORS |
| **Component composition** | `frontend/src/components/*` | Small, focused React components |

### 2.2 New patterns to introduce in Phase 2

| Pattern | Why we need it | Where it lives |
|---|---|---|
| **Widget / Plugin architecture** | Panels must be addable, removable, rearrangeable | `frontend/src/widgets/*` + `WidgetRegistry` |
| **Event bus** | Symbol selection in one widget → all widgets update without prop-drilling | `frontend/src/lib/event-bus.ts` (tiny pub/sub) |
| **Command pattern** | User actions (rearrange, filter, resize) must be undoable/redoable, persistable | `frontend/src/lib/commands.ts` |
| **Observer (SSE)** | Live price updates without polling | Backend: `/sse/quotes` endpoint; Frontend: `useEventSource` hook |
| **Tiered cache with TTL policy** | 90% cache hit during dev, minimize Polygon/Anthropic spend | `backend/infrastructure/cache/tiered_cache.py` |
| **State machine** | Order ticket flow (draft → preview → submitted → filled/cancelled) | `frontend/src/lib/order-machine.ts` |
| **Feature flags** | Dark mode, beta features, per-user experiments | `frontend/src/lib/features.ts` + localStorage |

### 2.3 Non-negotiable quality bars

1. **No fixed widths.** Every layout uses CSS grid/flex with `min-max()` and
   `clamp()`. Must look right on 1280px → 4K.
2. **No inline colors.** All colors reference CSS variables: `var(--bg)`,
   `var(--fg)`, `var(--accent)`, etc. Themes swap by toggling `[data-theme]`.
3. **No prop-drilling for global state.** Use event bus or Zustand/Context.
4. **Every API call goes through the cache layer.** Never call facade directly
   from route handler without going through `CachedFacade`.
5. **Every network-bound component has a skeleton loading state.** No jarring
   pop-ins.
6. **Tabular numbers everywhere.** `font-variant-numeric: tabular-nums` on
   every price, quantity, percent.
7. **Keyboard accessible.** `/` focuses search, `Esc` closes modals, arrow keys
   navigate tables, `Enter` submits.

---

## 3. Caching Strategy (90/10 rule)

### 3.1 Tiered TTL policy

| Data class | TTL (dev) | TTL (prod) | Invalidation trigger |
|---|---|---|---|
| Stock quotes (last close) | 6h market / 24h off | 30s | Next market open |
| Options chains | 4h | 5m | Manual or next market open |
| Daily OHLC bars | 24h | 1h (last bar) / permanent (historical) | New trading day |
| SnapTrade positions | 10m | 2m | User action |
| Claude AI responses | 7d | 24h | Key change (cache key includes question) |
| News items | 1h | 15m | Next poll |
| Symbol metadata (name, exchange) | 30d | 30d | Manual |

### 3.2 The 10% fresh sampling

Every cache get() has a 10% chance of returning None (cache miss) regardless
of whether the value is cached. This exercises the live API path so we catch
integration breakage early instead of at 90-day cache expiry.

```python
# backend/infrastructure/cache/tiered_cache.py
class TieredCache:
    def get(self, key: str, tier: str) -> Any | None:
        if os.getenv("ENV") == "development" and random.random() < 0.1:
            return None   # force miss 10% of the time
        return self._chroma.get(key)  # + TTL check
```

### 3.3 Warm-up on login

On login, backend kicks off async prefetch of:
- Positions (via SnapTrade)
- For each position symbol: daily bars (90d), options chain, latest news
- Common tickers: SPY, QQQ, AAPL, MSFT, NVDA, TSLA (pre-warm for Options Chain)

This means the user's first navigation to any tab is instant from cache.

### 3.4 Cache inspector UI

Hidden admin panel (Ctrl+Shift+C) shows:
- Every cached key + size + TTL remaining
- Hit/miss count per tier
- "Purge tier" button
- "Force refresh all" button

---

## 4. Session Plan

Each session below is a single, standalone prompt. Drop it into a fresh Claude
session and it will have all the context it needs to execute. Sessions are
ordered by dependency; earlier sessions must complete before later ones (noted
where applicable).

**Total sessions: 18** (10 original + 8 added after the Futuristic audit).
Each session aims for a shippable, deployable state by end-of-session so you
can demo progress between them. Sessions 1–10 cover foundations, widgets,
chart, chain, position detail, AI rail, cache, orders, realtime, polish;
Sessions 11–18 add the market-tape/nav shell, futuristic-mode home + agents,
Level II + trade narrative, AI-native Trade Commander, AI-native Options
Intent Studio, the 8-tab Research page, the Activity/Balances/Watchlists/
Transfer utility screens, and the 4-step Onboarding flow.

---

### Session 1 — Theme System + Responsive Layout Foundation

**Dependencies:** None (start here).

**Prompt:**

```
You are continuing work on HedgeIQ, a Python FastAPI + React Vite trading app
deployed on Railway (backend) + Vercel (frontend). The repo is at
C:\AgenticAI\Claude Apps\HedgeIQ. Read docs/PHASE_2_ROADMAP.md sections 1-3
before starting.

Context: The app currently uses hardcoded hex colors everywhere (#0A0E1A
background, #00D4FF accent, etc.) and fixed max-widths on containers. On a
1920x1080 or 4K screen there is huge wasted space on the right. The user
specifically called this out: "it's too dark now, app isn't using the full
size of my screen like Fidelity, its fixed, it should resize the page
automatically based on the screen size."

Goal: build a theme system and make the entire app responsive so it fills
whatever viewport it's given.

Scope:
1. Create frontend/src/lib/theme.ts with two themes:
   - "dark" (the current dark palette)
   - "light" (professional light palette inspired by Fidelity: white bg,
     dark text, soft greens/reds for P&L, subtle grey borders, cyan accents
     readable on white)
   All colors defined as CSS variables on :root[data-theme="dark"] and
   :root[data-theme="light"]. Variables include: --bg, --bg-elevated,
   --fg, --fg-muted, --accent, --accent-contrast, --success, --danger,
   --warn, --border, --hover, --shadow.
2. Create frontend/src/lib/ThemeProvider.tsx that:
   - Reads localStorage key "hedgeiq_theme" (default "dark")
   - Sets [data-theme=...] on <html>
   - Exposes useTheme() hook returning { theme, setTheme, toggle }
3. Add a theme toggle button in the Dashboard sidebar footer (sun/moon icon).
4. Migrate EVERY hardcoded color in every component to CSS variables. Files
   to update (grep for 'backgroundColor:|color:' in .tsx):
   - Dashboard.tsx, PositionsTable.tsx, OptionsChain.tsx, EmergencyHedge.tsx
   - AIChat.tsx, AIExplainer.tsx, LandingPage.tsx, LoginPage.tsx
   - PayoffChart.tsx, PriceChart.tsx, Sparkline.tsx
   - markdown.tsx
5. Update index.css with the :root variable definitions and global
   tabular-nums on price/qty/pct classes.
6. Replace every "max-w-*" on top-level containers with full-width grid
   layouts. The Dashboard shell should be a 2-column CSS grid:
   `grid-template-columns: minmax(200px, 240px) 1fr` — sidebar fixed range,
   main area fills the rest.
7. Update Dashboard.tsx content panes to use w-full and overflow-auto so
   tables expand to full width.
8. Ensure tables use `table-layout: auto` so columns grow with available
   width. Add horizontal scroll on overflow for narrow viewports.

Acceptance criteria (verify with Chrome automation tool in real browser):
- Take a screenshot at 1920x900 viewport — content fills the full width.
- Take a screenshot at 1280x800 — still looks clean, no horizontal scroll.
- Click the theme toggle → page switches to light mode, persisted on refresh.
- No hex color literals remain in any *.tsx file under frontend/src/
  (grep regex: /#[0-9A-Fa-f]{3,8}/  — should only match inside theme.ts).

When done: commit as "feat(theme): CSS variables + responsive layout + light
mode", push, wait for Vercel, verify in browser with screenshots of both
themes side by side.
```

---

### Session 2 — Customizable Widget Dashboard

**Dependencies:** Session 1 (themes).

**Prompt:**

```
You are continuing HedgeIQ. Read docs/PHASE_2_ROADMAP.md sections 2.2
(Widget architecture) and 2.3 before starting.

Context: Currently Dashboard.tsx renders one of 4 fixed views (Positions,
Options Chain, Emergency Hedge, AI Advisor) based on sidebar click. A real
trader wants multiple views visible simultaneously — e.g., positions table
on the left, chart on top-right, options chain bottom-right, AI advisor
as a persistent side panel.

Goal: introduce a widget architecture where the dashboard is a grid of
resizable, rearrangeable, hideable widgets with layouts persisted to
localStorage. User can choose from presets (Day Trader, Long-Term, Hedger,
Minimal) or customize their own.

Scope:
1. Install react-grid-layout (npm i react-grid-layout).
2. Create frontend/src/widgets/Widget.tsx — a wrapper that provides the
   widget chrome: header with title + drag handle + close X + settings gear,
   body slot, resize handles. Uses CSS variables.
3. Create frontend/src/widgets/WidgetRegistry.ts — a map of widgetId →
   { title, defaultSize, component }. Register:
   - 'positions' → existing PositionsTable
   - 'chart' → existing PriceChart (pass symbol from context)
   - 'optionsChain' → existing OptionsChain
   - 'hedge' → existing EmergencyHedge
   - 'aiAdvisor' → existing AIChat
   - 'accountSummary' → 4-card summary (extract from PositionsTable)
4. Create frontend/src/lib/layout-store.ts (zustand or context) storing:
   - activeLayoutId
   - layouts: { [id]: WidgetLayout[] }
   - savedPresets (Day Trader, Long-Term, Hedger, Minimal — see below)
   Persisted to localStorage "hedgeiq_layouts".
5. Preset layouts:
   - "Day Trader" — positions top-left, chart top-right (wide), options chain
     bottom spanning full width, AI right rail
   - "Long-Term" — account summary top, positions full-width middle, chart
     bottom-left, news feed bottom-right (placeholder widget)
   - "Hedger" — positions left, hedge calculator right, AI advisor bottom
   - "Minimal" — positions + AI advisor
6. Replace Dashboard.tsx with a new shell:
   - Header with logo, theme toggle, layout picker dropdown, "Edit layout"
     toggle
   - Main area = <GridLayout> from react-grid-layout, rendering registered
     widgets from activeLayout
   - In edit mode: show drag handles, resize handles, "Add widget" button
     (dropdown of available widgets not currently on screen)
7. Event bus: frontend/src/lib/event-bus.ts implementing a tiny pub/sub.
   When a user clicks a symbol row in PositionsTable, emit
   'symbol:selected' with the ticker. Chart widget + OptionsChain widget +
   AI advisor all subscribe and update accordingly.

Acceptance criteria:
- Default layout shows 3 widgets visible at once.
- Switching layout preset rearranges without page reload.
- Dragging a widget header relocates it, resize handle works, persists on
  refresh.
- Clicking AAL in positions makes the chart widget + options chain widget
  switch to AAL.
- "Add widget" dropdown lets user add a new instance of any registered
  widget.

When done: commit "feat(widgets): customizable dashboard layouts with
drag-resize". Screenshot of each preset saved to /docs/screenshots/.
```

---

### Session 3 — Professional TradingView-Style Chart

**Dependencies:** Session 1 (themes). Parallelizable with Session 2.

**Prompt:**

```
You are continuing HedgeIQ. The current PriceChart.tsx renders a static
SVG candlestick chart with no interactivity — no zoom, no pan, no crosshair,
no timeframe switching, no indicators. The user called this out specifically:
"chart is static with 90day, no user interaction... graph may need to be
interactive. so many other details missing from the graph screenshot itself."

Goal: replace with a professional interactive chart using TradingView's
open-source lightweight-charts library (MIT licensed, no fees, 45KB).

Scope:
1. Install: cd frontend && npm i lightweight-charts
2. Create frontend/src/widgets/ProChart.tsx. Props:
   { symbol: string, initialTimeframe?: '1D'|'5D'|'1M'|'3M'|'6M'|'1Y'|'2Y'|'5Y'|'MAX' }
   Features:
   - Timeframe buttons row (all of the above) — each fetches different days
   - Chart type toggle: Candles / Line / Area / Baseline
   - Crosshair with OHLC + volume tooltip floating on hover
   - Volume histogram in bottom pane
   - SMA/EMA indicator toggles (compute client-side from bars)
   - RSI toggle (computes 14-period RSI, shows in separate pane)
   - Zoom via mouse wheel, pan via drag, reset button
   - Fit-to-view button
3. Backend: update /api/v1/quotes/{symbol}/chart to accept
   `?timeframe=1D|5D|1M|3M|6M|1Y|2Y|5Y|MAX`. Map each to appropriate
   days/multiplier/timespan for Polygon list_aggs:
   - 1D → multiplier=5 timespan=minute, days=1
   - 5D → multiplier=30 timespan=minute, days=5
   - 1M → multiplier=1 timespan=hour, days=30
   - 3M..MAX → multiplier=1 timespan=day with increasing range
   Keep existing `?days=` support for backwards compatibility.
4. Add drawing tools: horizontal price line (click to add, drag to move,
   double-click to delete). Store per-symbol drawings in localStorage under
   "hedgeiq_drawings_{symbol}".
5. Replace PriceChart usage in OptionsChain.tsx with new ProChart widget.
6. Register ProChart in WidgetRegistry as 'chart' (replacing old PriceChart).

Acceptance criteria:
- Chart renders candlesticks with real Polygon data.
- Clicking "1M" reloads with 1-month hourly data; "MAX" shows 5-year daily.
- Crosshair appears on hover, tooltip shows OHLC + volume + % change vs open.
- SMA 50 toggle overlays moving average line; can toggle off.
- Drag on chart pans time axis; scroll wheel zooms.
- Theme-aware (dark chart on dark theme, light on light).

When done: commit "feat(chart): interactive multi-timeframe chart via
lightweight-charts". Screenshot in both themes with crosshair active.
```

---

### Session 4 — Options Chain v2 (Fixed Strike Column + Min/Max Filters + Click-to-Trade)

**Dependencies:** Session 1 (themes). Parallelizable with Sessions 2-3.

**Prompt:**

```
You are continuing HedgeIQ. The user has these specific complaints about the
current OptionsChain.tsx:

1. "When clicking both, calls and puts are cramped." → Both view is too
   narrow.
2. "Strike price should stay at one place, it's going left to right. user
   may expect it at same place for both calls and puts when they click
   respective buttons." → Strike column position changes depending on which
   side is selected. Fix: STRIKE column is always dead-center, regardless
   of Calls/Puts/Both.
3. "No way to enter min and max by user to get that data for it." → Add
   numeric min/max strike inputs.
4. "Clickable calls, buy should have links." → Each price cell has a clickable
   "Buy" / "Sell" button (or the whole cell is clickable) that opens a
   trade ticket modal with pre-filled fields.
5. Add "Show weekly options" toggle (like Fidelity).
6. Add a put/call ratio header indicator (compute from chain total OI).

Goal: rebuild OptionsChain.tsx to address all these, using the new widget
and theme systems.

Scope:
1. Rewrite the chain table so it ALWAYS has three sections: calls on the
   left, strike in the middle, puts on the right. The Calls/Puts/Both toggle
   controls which sections are VISIBLE (not which column position the strike
   occupies):
   - Calls only: shows calls columns + strike, hides puts columns
   - Puts only: hides calls columns, shows strike + puts columns
   - Both: all visible
   Strike column is always centered via CSS grid with named areas.
2. Above the expiration tabs, add a filter row with:
   - "Min strike" and "Max strike" numeric inputs (default: -25% / +25% of
     current price, auto-updated when symbol changes but user-overridable)
   - "Show weekly" checkbox (filters expiries to only monthlies when off)
   - "ATM ±" strike count selector (existing, keep)
3. Replace the static "Buy on Fidelity / Buy on Public" buttons with an
   OptionTradeTicket modal component. Clicking any bid/ask cell opens it
   pre-filled with: symbol, expiry, strike, side (put/call), action
   (buy/sell based on which color clicked), limit price (the clicked price),
   quantity = suggested contracts for position coverage.
4. OptionTradeTicket.tsx (new file): modal modeled on the Fidelity trade
   ticket screenshot. Fields: Account (dropdown of connected brokers),
   Action (Buy to Open, Sell to Open, Buy to Close, Sell to Close), Quantity,
   Symbol summary, Expiration, Strike, Call/Put, Order Type (Limit/Market/Stop),
   Limit Price, Time in Force (Day/GTC), Route (Auto), Preview Order button.
   Preview Order button calls a new backend endpoint
   POST /api/v1/orders/preview that returns an order preview object. Does
   NOT actually submit — for now just shows the preview screen.
5. Add put/call ratio header pill above the chain — compute from visible
   chain OI totals. Show "Bullish" if <0.7, "Neutral" 0.7-1.3, "Bearish"
   >1.3.
6. Sticky table header so scrolling doesn't lose column labels.

Acceptance criteria:
- Strike column stays in the horizontal center position when toggling
  Calls/Puts/Both. No layout shift.
- Min/Max strike inputs filter rows live.
- Clicking any bid/ask cell opens the trade ticket modal with correct
  pre-filled values.
- Preview Order shows a preview summary with fees and estimated cost.
- Both view is legible — not cramped. If necessary, reduce non-critical
  columns (e.g., drop Vol when Both is selected and keep Bid/Ask/OI/IV/Δ).

When done: commit "feat(chain): fixed strike column, min/max filters, trade
ticket modal". Screenshots of all three toggle states showing strike column
stable.
```

---

### Session 5 — Position Detail Drawer + News Feed

**Dependencies:** Sessions 1, 3 (themes + ProChart).

**Prompt:**

```
You are continuing HedgeIQ. Fidelity's UX has a position detail flyout: click
any position row and a rich drawer slides in showing chart, key stats, news,
recent trades, options strategies — all contextual to that position. We need
the same.

Also: the user requested "no news feed" → need a news widget/feed.

Goal: add a Position Detail drawer that slides in from the right on row
click, containing an embedded ProChart, key stats panel, news feed, and
hedge actions. Also add a standalone NewsFeed widget registerable in the
widget registry.

Scope:
1. Add Polygon news endpoint to PolygonFacade.
   backend/infrastructure/polygon/facade.py:
   async def get_news(symbol: str, limit: int = 10) -> list[dict]
   Uses client.list_ticker_news(ticker=symbol, limit=limit). Returns list of
   { id, published_utc, title, author, publisher, url, image_url, description,
     tickers, keywords, insights }. Cache 1h.
   Fallback mock data if unauthorized (recent dummy headlines from a list).
2. New backend endpoint: GET /api/v1/news/{symbol}?limit=10 in
   backend/api/v1/news.py — returns list of normalized news items.
3. New frontend component: PositionDetailDrawer.tsx — a slide-in panel
   (Tailwind transition-transform) that takes full height and ~40vw width.
   Layout (vertical stack):
   - Sticky header: symbol + name + current price + day change + close X
   - Tab bar: Overview | Chart | Options | News | AI Analysis
   - Overview tab: key stats grid (Market cap, P/E, EPS, 52w high/low,
     avg volume, beta — data from Polygon reference endpoint; fake-it
     gracefully if unavailable)
   - Chart tab: embedded ProChart at full drawer width
   - Options tab: mini options chain filtered to ±3 strikes of current
     price, closest expiry
   - News tab: NewsList component (cards with image, title, publisher,
     timestamp, "Read more" link)
   - AI Analysis tab: auto-triggers POST /api/v1/ai/chat with prompt
     "Give me a risk analysis of my [symbol] position" + portfolio context,
     renders with Markdown component
4. Wire drawer to event bus: when PositionsTable row is clicked, emit
   'position:detail' with symbol; drawer subscribes and opens.
5. Standalone NewsFeed widget (registerable): shows news across all the
   user's position symbols, auto-refreshes every 5m, clickable to open
   position detail drawer.

Acceptance criteria:
- Clicking a position row opens the drawer smoothly (60fps transform).
- All 5 tabs render without error.
- News tab shows at least 5 items with images and clickable links.
- Drawer responsive on narrow viewports (fills screen on mobile, 40vw on
  desktop).
- Pressing Esc closes the drawer.

When done: commit "feat(position): detail drawer with chart+news+AI tabs".
Screenshot of drawer open on AAL position.
```

---

### Session 6 — Persistent AI Advisor + Suggested Follow-ups

**Dependencies:** Session 1 (themes). Ideally after Session 2 (widget system).

**Prompt:**

```
You are continuing HedgeIQ. User's exact words:

"AI advisor may need to be on the right side as a permanent one, it looses
the track of what was asked earlier. for every answer it should suggest
possible actions as questions same like Teams Copilot balloons."

Goal: make the AI Advisor a permanent right-rail panel (collapsible to an
icon), persist conversation history across sessions, and after every
response show 3 suggested follow-up chips the user can click to continue.

Scope:
1. Convert AIChat.tsx from a standalone page/widget into a persistent
   right-rail panel AIAdvisorRail.tsx:
   - Fixed position right side of Dashboard, collapsible width (0 when
     hidden / 360px when open). Uses CSS grid-template-columns on the
     Dashboard shell to reserve space when open.
   - Header with collapse/expand button, "New conversation" button, current
     conversation title (auto-generated by Claude from first message).
   - Scrollable message list (full history).
   - Input box always at bottom.
2. Persist conversations to localStorage under "hedgeiq_conversations":
   {
     activeId: string,
     conversations: {
       [id]: { id, title, messages: ChatMessage[], createdAt, updatedAt }
     }
   }
   Sidebar hamburger in the rail header opens a conversation list (each
   with delete button).
3. Backend: update POST /api/v1/ai/chat to additionally return
   suggested_followups: string[] (3 short questions the user might ask
   next). Update ClaudeFacade.chat() to instruct Claude via system prompt
   to also output a JSON block at the end:

   Respond in two parts separated by `---SUGGESTIONS---`:
   Part 1: Your main answer in markdown.
   Part 2: A JSON array of EXACTLY 3 short follow-up questions the user
   might naturally ask next, each under 10 words. Example:
   ---SUGGESTIONS---
   ["What's the worst-case on this position?", "Compare a put spread hedge",
    "How much would a 30% drop cost me?"]

   Parse the response server-side: split on ---SUGGESTIONS---, JSON-parse
   part 2, return both in response.
4. Frontend: after each assistant message, render 3 suggestion chips below
   it. Clicking a chip sends that as the next user message (same effect as
   typing + send).
5. Context awareness: the rail knows which symbol/position is currently
   active (subscribes to 'symbol:selected' event). Include that in every
   chat request's portfolio_context so Claude can reference the active
   position.
6. Streaming: convert /api/v1/ai/chat to SSE (Server-Sent Events) so tokens
   stream in. Use anthropic SDK's streaming API. Frontend uses EventSource.
   Parse suggestions after the stream completes.

Acceptance criteria:
- Right rail is visible by default, collapsible to a 32px icon strip.
- Asking "What's my biggest risk?" streams the response word-by-word.
- After the response, 3 follow-up chips appear below it.
- Clicking a chip fires a new message using the chip's text.
- Switching to a different position (clicking a row) → the current
  conversation gets a small chip "Context: AAL" above the input.
- Creating a new conversation clears messages but keeps old one accessible
  via sidebar list.

When done: commit "feat(advisor): persistent rail with history + suggested
followups + streaming". GIF of full flow.
```

---

### Session 7 — Tiered Caching Layer + Dev Mode (90/10)

**Dependencies:** None — can run in parallel with any session.

**Prompt:**

```
You are continuing HedgeIQ. Read docs/PHASE_2_ROADMAP.md section 3
(Caching Strategy) — this session implements it in full.

Context: The user wants 90% cache hit during development to minimize
Polygon and Anthropic spend: "try to cache as much info possible so that
we don't spend too much on my account limit during this dev phase. you
can pull 90% of data from cache till we complete this project and pull 10%
of data every time to make sure live APIs are working."

Goal: build a tiered cache layer between every facade and its live API,
with TTL policy per data class, 10% random fresh-sampling in dev mode,
and an admin panel to inspect and purge cache.

Scope:
1. Create backend/infrastructure/cache/tiered_cache.py:
   class CacheTier(Enum):
     QUOTE = 'quote'           # TTL: 6h dev / 30s prod
     OPTIONS_CHAIN = 'options'  # 4h dev / 5m prod
     DAILY_BARS = 'bars'        # 24h dev / 1h prod
     POSITIONS = 'positions'    # 10m dev / 2m prod
     AI_RESPONSE = 'ai'         # 7d dev / 24h prod
     NEWS = 'news'              # 1h dev / 15m prod
     METADATA = 'metadata'      # 30d both

   class TieredCache:
     def __init__(self, chroma: ChromaCache, env: str)
     def get(key: str, tier: CacheTier) -> Any | None
     def set(key: str, value: Any, tier: CacheTier) -> None
     def purge_tier(tier: CacheTier) -> int
     def stats() -> dict[CacheTier, {hits, misses, size}]

   Implementation:
   - get(): 10% random miss in dev (force fresh fetch path). Otherwise
     delegate to ChromaCache with tier-specific TTL conversion.
   - set(): write with tier TTL.
   - Wrap every call in try/except — never break the caller if cache fails.
2. Update every facade to accept a TieredCache and route all get/set through
   it with the right tier:
   - PolygonFacade.get_options_chain → OPTIONS_CHAIN
   - PolygonFacade.get_daily_bars → DAILY_BARS
   - PolygonFacade.get_news → NEWS (Session 5)
   - ClaudeFacade.chat / explain_option / explain_hedge → AI_RESPONSE
   - SnapTradeFacade.get_raw_positions → POSITIONS
3. Create a settings.prewarm_common_tickers list in backend/config.py:
   ["SPY", "QQQ", "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META", "GOOGL",
    "NFLX"]
4. Add a backend startup hook in main.py: on server start, kick off async
   task to prewarm bars + chains for all prewarm_common_tickers and for
   all symbols in the user's connected portfolio (via SnapTrade). Log
   "[prewarm] AAL bars cached, AAL chain cached, ..." etc.
5. Add admin endpoints (protected by is_admin flag on user):
   GET /api/v1/admin/cache/stats → TieredCache.stats()
   POST /api/v1/admin/cache/purge?tier=... → purge that tier
   POST /api/v1/admin/cache/prewarm?symbol=XXX → force prewarm for a symbol
6. Add a CacheInspector panel in the frontend. Keyboard shortcut
   Ctrl+Shift+C opens a modal showing each tier, hit rate, size, with a
   "Purge" button per tier and a "Force refresh" that purges everything.

Acceptance criteria:
- Load AAL options chain → 1st request hits Polygon; subsequent 9 requests
  hit cache (10% fresh sampling in dev means ~1 in 10 hit Polygon).
- Server log on startup shows prewarm sequence.
- Ctrl+Shift+C opens cache inspector showing >10 entries after navigating
  positions + chain + news.
- After "Purge tier: OPTIONS_CHAIN", next chain fetch hits Polygon.
- AI chat responses are cached by (question + portfolio snapshot hash) —
  asking the exact same question returns instantly from cache.

When done: commit "feat(cache): tiered cache with 90/10 dev sampling +
prewarm". Screenshot of cache inspector showing ~20 cached items.
```

---

### Session 8 — Order Tickets, Broker Deep-Links, Trade Preview

**Dependencies:** Session 4 (options chain with click-to-trade modal).

**Prompt:**

```
You are continuing HedgeIQ. In Session 4 you created an OptionTradeTicket
modal that pre-fills from chain clicks. This session makes it functional by
wiring broker deep-links + order preview.

Also extend to stock orders from the positions table ("Buy more" / "Trim").

Goal: user can configure a trade ticket, see a preview with fees and P&L
impact, and click "Place order with Fidelity / Robinhood / Public" which
deep-links to the correct broker's order entry URL with pre-filled params.
We don't execute trades ourselves.

Scope:
1. Backend: POST /api/v1/orders/preview — accepts OrderPreviewRequest:
   {
     symbol: str, side: "buy"|"sell", instrument: "stock"|"option",
     quantity: int, order_type: "market"|"limit"|"stop"|"stop_limit",
     limit_price?: float, stop_price?: float, time_in_force: "day"|"gtc",
     option?: { expiry: str, strike: float, right: "call"|"put",
                action: "open"|"close" }
   }
   Returns OrderPreviewResponse:
   {
     estimated_cost: float,
     estimated_fees: float,
     estimated_total: float,
     buying_power_remaining: float,
     position_impact: {  # if adding to existing
       new_quantity: int, new_avg_cost: float
     },
     warnings: list[str],  # e.g. "Exceeds buying power", "Wide spread"
     deep_links: {
       fidelity: str,  # https://digital.fidelity.com/...?prefill params
       robinhood: str,  # robinhood://order?...
       public: str,
       schwab: str
     }
   }
2. Build deep-link constructors per broker. Research actual URL schemas:
   - Fidelity: https://digital.fidelity.com/ftgw/digital/trade-equity/quote?symbol=XXX
     (and option variant). Open in new tab.
   - Robinhood: https://robinhood.com/stocks/XXX or options/YYY — mostly
     deep-link to symbol page, user confirms trade.
   - Public: https://public.com/stocks/XXX
   - Schwab: https://client.schwab.com/...
   These won't pre-fill 100% of the order in most cases (brokers don't
   publish open APIs for prefill), but they should at least deep-link to
   the correct instrument.
3. OrderPreviewPanel.tsx — renders the preview response cleanly. Shows
   estimated cost, fees, total, warnings (amber/red), and the 4 broker
   deep-link buttons.
4. Integrate: OptionTradeTicket's Preview button now fires the preview API
   and renders OrderPreviewPanel. Broker buttons window.open(deep_link).
5. Add a StockTradeTicket.tsx modal (similar structure) for equity trades.
   Wire Buy/Sell buttons to it from:
   - PositionsTable row (quick Buy More / Trim)
   - PositionDetailDrawer header
   - EmergencyHedge "Open hedge" button (pre-filled for the top recommendation)

Acceptance criteria:
- In Options Chain, clicking an ask price on a put opens ticket → Preview
  → shows total cost + 4 broker buttons.
- Clicking "Open in Fidelity" opens a new tab to Fidelity's equity/option
  trade page for that symbol.
- Warning appears when estimated cost > 50% of buying power.
- Positions row action menu (3-dot) has Buy More / Trim / Close Position.
- StockTradeTicket preview works for a buy of 10 shares of AAPL.

When done: commit "feat(orders): trade tickets + preview + broker deep-links".
Screenshot of options ticket → preview → broker buttons.
```

---

### Session 9 — Real-Time Feel (Price Flashing, Timestamps, SSE Quotes)

**Dependencies:** Sessions 1, 7 (themes + cache). Ideally Session 2 (widgets).

**Prompt:**

```
You are continuing HedgeIQ. Real trading apps feel "alive" — prices flash
green/red on every change, tabular numbers animate smoothly, connection
status is always visible, timestamps tell you freshness.

Goal: make the UI feel live.

Scope:
1. Backend SSE endpoint GET /api/v1/sse/quotes?symbols=AAL,AAPL,TSLA:
   - Keeps connection open, every 5 seconds emits updates for requested
     symbols by calling PolygonFacade.get_last_quote (small, cheap call).
   - If Polygon free tier blocks this, fall back to simulated jitter:
     take cached last_close and apply a random walk ±0.5% every 5s so the
     UI demonstrates the feature without paid API.
   - Route through cache layer so repeated connections share data.
2. Frontend useQuotes hook: accepts symbols array, returns a Record of
   live quotes via EventSource. Auto-reconnects on disconnect.
3. PriceCell.tsx component: wraps a number, compares against previous value,
   flashes green (up) or red (down) for 800ms on change. Uses CSS
   @keyframes defined in theme. Replace every price cell in PositionsTable,
   OptionsChain, Chart header with PriceCell.
4. Connection status indicator in header: green dot "Live" when SSE
   connected, amber "Reconnecting..." on drop, red "Offline" after 30s.
5. Last-update timestamps on every data panel ("Updated 3s ago") — a
   small grey text at the top-right of each widget header, updated every
   second from the widget's lastFetchedAt.
6. Smooth number animation: use a tiny interpolator (no deps — 20 lines) so
   "$9.49 → $9.52" rolls up through intermediate values over 300ms rather
   than snapping.

Acceptance criteria:
- Open app → connection dot goes green within 2s.
- Kill backend → dot goes red within 30s.
- Watch a position row for 15s → price cell flashes on each update.
- Refreshing a widget → "Updated 0s ago" → ticks up to 1s, 2s, 3s...

When done: commit "feat(realtime): SSE quotes + price flashing + connection
indicator". GIF of flashing prices.
```

---

### Session 10 — Performance, Polish, Accessibility, Keyboard Shortcuts

**Dependencies:** All previous sessions — this is the final polish pass.

**Prompt:**

```
You are continuing HedgeIQ. This is the final polish session before Phase 2
is complete. Goal is professional performance + accessibility.

Scope:
1. Code splitting: use React.lazy + Suspense for every widget. Main bundle
   should be <150KB gzipped. Verify with npm run build.
2. Virtual scrolling: install react-window. Apply to:
   - OptionsChain table when strikes.length > 30
   - NewsFeed list when items > 20
   - Conversation history list in AIAdvisorRail when messages > 50
3. Error boundaries: frontend/src/lib/ErrorBoundary.tsx wrapping each
   widget. On error: show "This widget crashed — reload?" with a retry
   button. Log to console + send to /api/v1/telemetry/error.
4. Loading skeletons: every widget and panel shows a skeleton (animated
   grey shape) while data loads — no empty flashes.
5. Keyboard shortcuts (global):
   - "/" focuses symbol search
   - "Esc" closes any modal/drawer
   - "?" opens shortcut cheat sheet
   - "g p" go to positions widget; "g c" go to chain; "g h" go to hedge;
     "g a" focus AI advisor
   - "t" toggle theme
   - "Ctrl+K" command palette (fuzzy-find actions)
   - Arrow keys navigate table rows; Enter opens detail drawer
6. Accessibility audit with axe-core:
   npm i -D @axe-core/react
   Run once in dev: verify zero violations.
   - All interactive elements have aria-labels
   - Focus ring visible on all focusable elements (CSS :focus-visible
     already applied globally)
   - Color contrast passes WCAG AA in both themes
   - Tables have proper role="table", caption, scope on th
7. Error telemetry endpoint: POST /api/v1/telemetry/error accepts
   { message, stack, component, url }, logs to file + returns 204.
8. Final documentation pass: update README.md with screenshots of all
   completed features in both themes.

Acceptance criteria:
- npm run build output: main chunk < 150KB gzipped, 5+ lazy chunks.
- axe-core reports 0 violations on every page.
- Press "/" → search focused instantly.
- Press "Ctrl+K" → command palette opens.
- Kill one widget by forcing an error → only that widget shows error UI,
  rest keeps working.
- Lighthouse score: Performance ≥90, Accessibility ≥95.

When done: commit "feat(polish): code splitting + a11y + shortcuts +
error boundaries". Final Lighthouse screenshot.
```

---

### Session 11 — Market Tape + Navigation Shell

**Dependencies:** Session 1 (themes), Session 2 (widget shell registered).

**First-principles rationale:** A pro trading app is recognizable in 2 seconds
by two things — a scrolling ticker tape across the top, and a dense icon
sidebar with a breadcrumb/search/avatar top bar. Without these, HedgeIQ still
"looks like a dashboard," not a trading platform. The Futuristic prototype's
`shell.jsx` defines both and every downstream screen assumes they exist.

**Prompt:**

```
You are continuing HedgeIQ Phase 2. Read:
- docs/design/src/shell.jsx (244 lines — authoritative source)
- docs/design/src/app.jsx lines 1-100 (Sidebar composition)
- docs/design/COMPONENT_MAP.md sections 1, 12
- docs/design/styles/theme.css (for tape colors per theme)

Goal: ship the permanent chrome that every other screen lives inside —
MarketTape (scrolling ticker), TopBar (breadcrumb/search/bell/avatar), and
the full 9-icon Sidebar. After this session, every screen MUST render inside
this shell (Dashboard, Positions, Trade, Options, Research, Activity,
Balances, Watchlists, Transfer).

Scope:
1. Create frontend/src/shell/MarketTape.tsx. Renders a horizontally scrolling
   strip, pinned below TopBar (height 32px). Items: S&P 500, Nasdaq, Dow, VIX,
   10Y Yield, Crude, Gold, BTC, DXY, EUR/USD. Each item = label + price +
   colored ±change%. Animation: CSS @keyframes translateX with duration
   proportional to content width (60s for one full loop); pause on hover.
   Duplicate the list in-DOM so the loop is seamless.
   Data source: GET /api/v1/market/tape (new endpoint — Session 7 cache tier
   METADATA, 30s TTL). Backend falls back to `genSeries`-style deterministic
   mock when Polygon index endpoints unavailable.
2. Create frontend/src/shell/TopBar.tsx (56px tall):
   - Left: logo + breadcrumb (e.g. "Dashboard / Positions / AAL")
   - Center: global SymbolSearch (autocomplete; uses /api/v1/symbols/search
     with 200ms debounce; keyboard nav with ↑↓ Enter)
   - Right: NotificationsBell (with badge count), PreferencesPopover trigger,
     user avatar dropdown (Profile / Accounts / Sign out), Classic↔Futuristic
     mode toggle pill (stores in localStorage `hedgeiq_mode`).
3. Create frontend/src/shell/Sidebar.tsx. 72px collapsed / 240px expanded.
   9 nav icons with labels: Dashboard, Positions, Trade, Options, Research,
   Activity, Balances, Watchlists, Transfer. Each item is a react-router
   NavLink — active state uses --accent foreground + subtle --bg-elevated
   background. Port the exact SVG icons from docs/design/src/util.jsx
   (`H`, `Wallet`, `Chart`, `Bolt`, `Book`, `Clock`, `Shield`, `Eye`,
   `ArrowUpRight` — whichever the prototype uses for each).
4. Create frontend/src/shell/AppShell.tsx composing MarketTape on top, TopBar
   below it, Sidebar on the left, <Outlet/> in the main area. Use CSS grid:
   grid-template-rows: 32px 56px 1fr;
   grid-template-columns: auto 1fr;
   Sidebar spans rows 2-3.
5. Rewire frontend/src/App.tsx to use react-router-dom v6 with routes:
   /dashboard, /positions, /trade, /options, /research/:symbol?, /activity,
   /balances, /watchlists, /transfer — ALL children of AppShell.
6. Breadcrumb derives from route params (useLocation + useParams) so
   "/research/AAL" renders "Research / AAL".
7. NotificationsBell: badge from GET /api/v1/notifications/unread (returns
   count + preview). Click opens a popover list of last 20. Mark-read on
   click. Backend: simple Postgres/SQLite table `notifications` with (id,
   user_id, kind, title, body, symbol, created_at, read_at).

Acceptance criteria (verify in real browser on Vercel):
- Market tape scrolls smoothly across the top on every screen; theme-aware.
- Clicking any sidebar icon navigates without a full page reload.
- Symbol search autocompletes as you type "aa" → AAPL, AAL, AA; Enter routes
  to /research/AAL.
- Breadcrumb updates when you click AAL in positions.
- Notifications bell shows a badge; clicking opens last N items.
- Classic↔Futuristic pill toggles `data-mode="classic|futuristic"` on <html>
  (Session 12 consumes this).
- Works at 1280px and 4K.

When done: commit "feat(shell): market tape + topbar + 9-icon sidebar +
routing". Screenshots at 1440px showing shell on Positions and Research pages.
```

---

### Session 12 — Futuristic Mode Home + Agents

**Dependencies:** Session 11 (mode toggle emits `data-mode`), Session 6
(Copilot rail wiring), Session 7 (cache tiers for briefs).

**First-principles rationale:** Classic mode is "dense trading surface."
Futuristic mode is "AI-first, conversational, calm." They share data but
diverge visually and in information hierarchy. The Futuristic Home is the
entry point — a greeting + 3 AI briefs + 4 mini-tiles + narrative summary —
and it must feel like a different product, not a re-skin. The 9-workspace
left rail with an "Agents" section (Tax-loss, Rebalance, Earnings) establishes
agent affordances for later autonomous flows.

**Prompt:**

```
You are continuing HedgeIQ Phase 2. Read:
- docs/design/src/futuristic-mode.jsx (1033 lines — AUTHORITATIVE)
  Focus areas: FMRail, FMTopBar, WS_Home, BriefCard, MiniCard, NarrativeBox
- docs/design/COMPONENT_MAP.md section 11
- docs/design/src/app.jsx futuristic-mode toggle state plumbing

Prerequisite context: Session 11 set `data-mode="futuristic"` on <html>
when the pill toggle is on. Session 6 built the Copilot rail. This session
replaces the classic AppShell layout with a futuristic one when the mode is
active.

Goal: ship the Futuristic-mode shell and its Home workspace so toggling the
pill feels like switching to a different product — still HedgeIQ, still the
same data, but AI-forward and serif-heavy.

Scope:
1. Create frontend/src/shell/futuristic/FMShell.tsx. Render this instead of
   AppShell when `document.documentElement.dataset.mode === 'futuristic'`.
   Layout: left rail 240px (FMRail), main <Outlet/>. No MarketTape, no
   classic TopBar — futuristic mode is quieter.
2. FMRail.tsx: dark panel with two sections.
   - Top: 9 workspace buttons (Home / Trade / Options / Positions / Research
     / Activity / Balances / Watchlists / Transfers). Each is a react-router
     NavLink with icon + label. Active = serif label + accent bar on left.
   - Bottom: "Agents" header + 3 status rows:
       • Tax-loss (dot: green = idle / amber = running / red = flagged)
       • Rebalance
       • Earnings
     Each row opens an AgentDetailSheet (right-side slide-in) showing last
     run, next scheduled run, findings count, Run now button.
   - Footer: "v3 · Futuristic" badge + Classic toggle pill.
3. FMTopBar.tsx (thinner than classic, 48px): greeting "Good morning,
   {firstName}." left; Buying power chip + Classic/Futuristic pill right.
4. WS_Home.tsx (new page at /futuristic/home OR /home when mode=futuristic):
   a. H1 (Fraunces serif, 40px, weight 500): "Good morning, Jordan. 3 things
      for you today."
   b. CentralCommander prompt bar — same component spec used in Session 14
      but here it's home-screen-sized (max-width 680px, centered). 4 chip
      suggestions below: "Explain my P&L", "Rebalance 70/30", "Tax-loss scan",
      "Morning news". Click chip → routes to Trade Commander with prefilled
      prompt.
   c. 3 BriefCards in a row (min 320px each, wraps on narrow). Each card:
        - tone: 'warn' | 'positive-featured' | 'ai'
        - icon (tone-appropriate), small tag label, title (serif), body (sans)
        - action buttons (e.g. "Open options studio", "Review", "Dismiss")
        - subtle dismiss X top-right (fades card on click, doesn't remove
          until next fetch)
      Data from GET /api/v1/ai/briefs (new endpoint, AI_RESPONSE cache tier,
      7d dev TTL). Backend prompts Claude with portfolio context asking for
      exactly 3 briefs in JSON: [{tone, tag, title, body, actions[]}, ...].
   d. 4 MiniCards row: Buying power / Today P&L / Open orders / Watchlist
      alerts. Each: label + big number + sparkline or delta chip. Data from
      existing positions + orders endpoints.
   e. NarrativeBox: gradient bg, sparkle badge top-left, "Synced {relative
      time}" top-right, serif paragraph body (180-240 words), 3 contextual
      action buttons at the bottom ("Show positions", "Open options ideas",
      "Explain in chat"). Generated via Claude with portfolio snapshot.
      Cache 7d dev / 1h prod.
5. Mode switching must preserve route mapping: /dashboard (classic) ↔ /home
   (futuristic) are siblings rendering equivalent content; /positions,
   /trade, /options paths are shared (the page components detect mode and
   render the appropriate variant).
6. Route all 9 workspaces. For workspaces that don't yet have futuristic
   variants (Positions, Activity, Balances, Watchlists, Transfer), render
   the classic component inside FMShell — it still works, just sits in the
   darker shell. Trade and Options get their own futuristic variants in
   Sessions 14 and 15.
7. Agents backend: create backend/domain/agents/ with Agent base class and
   three agents (TaxLossAgent, RebalanceAgent, EarningsAgent). Each has
   run() returning AgentFindings. Scheduled via existing APScheduler (or add
   one) — default daily 08:30 local. Expose:
   GET  /api/v1/agents              → list with status + lastRun
   POST /api/v1/agents/{id}/run     → trigger now
   GET  /api/v1/agents/{id}/findings?limit=20

Acceptance criteria:
- Toggling pill in TopBar instantly swaps shell (no page reload); URL
  remains readable.
- WS_Home renders greeting with correct first name, 3 briefs, 4 minis,
  narrative.
- Clicking a brief's action routes appropriately (e.g. "Open options studio"
  → /options in futuristic mode, routing to Session 15 page when done).
- Rail Agents dots reflect real status; clicking one opens the sheet.
- Briefs visibly re-fetch on manual refresh, NOT on every navigation
  (respect cache).
- Typography uses Fraunces for H1/titles, Inter Tight for body.

When done: commit "feat(fm): futuristic-mode shell + home + agents". Screenshot
of Home in both dark themes (Meridian, Terminal).
```

---

### Session 13 — Trade Enhancements (Level II, Copilot Risk Narrative, Activity Log)

**Dependencies:** Session 8 (trade tickets & preview), Session 6 (AI), Session
7 (cache).

**First-principles rationale:** The classic TradeScreen from `trade.jsx` is
896 lines because it's not just a form — it's a decision support surface. The
three pieces that elevate it from "broker form" to "pro platform" are: (a)
Level II order book so you can see depth before placing, (b) an AI risk
narrative ("this order uses 17% of your account and raises your tech exposure
to 64%…"), and (c) a live recent-activity tape so the screen feels like a
trading desk. Session 8 built the bones; this session adds the intelligence.

**Prompt:**

```
You are continuing HedgeIQ Phase 2. Read:
- docs/design/src/trade.jsx (896 lines — authoritative, especially the
  LevelIIPanel, CopilotCheck, and ActivityLog regions)
- docs/design/COMPONENT_MAP.md section 5

Prerequisite: Session 8 shipped OrderPreviewModal + broker deep-links. This
session adds the three intelligence modules around it.

Goal: bring TradeScreen to parity with the Futuristic prototype's right-hand
column — Level II order book, Copilot risk narrative badge, recent activity
feed.

Scope:
1. Level II order book (LevelIIPanel.tsx):
   - Backend: GET /api/v1/quotes/{symbol}/book → 10 bid levels + 10 ask
     levels. Use Polygon snapshot endpoint; fall back to generated book from
     last quote ± jitter in 10 × $0.01 steps (dev-mode synthesis so UI works
     without paid tier).
   - Frontend: two-column table. Left = bids descending, right = asks
     ascending. Columns: MPID | Size | Price. Row background: horizontal
     bar whose width is % of max size in pane (bids green-tinted, asks red),
     aligned to inside edge (so the visual center is the spread).
   - Update frequency: SSE every 1s when focused, 5s when background.
   - Spread indicator row in the middle: "$0.02 / 0.08%".
2. Copilot risk narrative (CopilotCheck.tsx):
   - Small card above the Preview button on TradeScreen.
   - On every ticket field change, debounce 400ms, then POST
     /api/v1/ai/trade-narrative with { account, symbol, side, qty, orderType,
     price, currentPosition, portfolioSnapshot }. Backend constructs a short
     Claude prompt: "In 2 sentences, flag risks and concentration impact for
     this order." Cache key includes a stable hash of the request; AI_RESPONSE
     tier.
   - Renders: sparkle badge + "Copilot check" label + narrative body + up to
     3 colored chips ("Uses 17% of account", "Tech exposure → 64%",
     "Above avg daily volume").
3. Recent Activity log (ActivityFeed.tsx):
   - SSE from backend: GET /api/v1/sse/trades?symbol=XXX — streams the last
     50 prints (time, side, size, price). Real trades in prod; mocked jitter
     in dev.
   - Renders a virtualized list (react-window) with monospace prices, colored
     side badge, relative time ("2s ago"), auto-scroll to top on new print
     unless user has scrolled down.
4. Layout update: TradeScreen becomes a 3-column grid at ≥1440px:
   grid-template-columns: 420px 1fr 360px;
   Left = ticket form. Center = symbol chart + copilot check stack. Right =
   LevelII on top, ActivityFeed below. At <1280px, collapse to stacked tabs.
5. Persist "Show Level II" and "Show Copilot check" toggles in
   localStorage per user.

Acceptance criteria:
- LevelIIPanel updates visibly every second, bids descending, asks ascending,
  spread displayed, bars sized correctly.
- Changing quantity in ticket → CopilotCheck updates within ~1s with new
  narrative; chips reflect new %.
- ActivityFeed streams prints; pausing (scrolling down) stops auto-scroll
  and shows "3 new" button.
- All three panels remain legible in all 3 themes and in colorblind mode.

When done: commit "feat(trade): level II + copilot narrative + activity
feed". Screenshot showing all 3 modules active on AAPL ticket.
```

---

### Session 14 — AI-Native Trade Commander

**Dependencies:** Session 11 (routing), Session 12 (futuristic shell),
Session 8 (preview endpoint), Session 6 (Claude facade).

**First-principles rationale:** Form-based order entry assumes the user has
already decided. The Trade Commander inverts that: type or speak your intent
in natural language, watch Claude parse it into structured orders, tweak the
parse chips if wrong, see a multi-order linked preview, confirm all with ⏎.
This is the single most differentiated feature of the app — without it,
HedgeIQ is a better Fidelity; with it, HedgeIQ is a new category.

**Prompt:**

```
You are continuing HedgeIQ Phase 2. Read:
- docs/design/src/futuristic.jsx lines 1-500 (CommanderPage — AUTHORITATIVE)
- docs/design/COMPONENT_MAP.md section 6

Prerequisite: Session 12 added FMShell and the CentralCommander component.
This session turns the full-page Commander into a real feature.

Goal: a page at /trade (when mode=futuristic) where a user types or speaks
an intent, Claude parses it into one-or-many structured orders, and the user
reviews+confirms. This replaces the classic ticket form for futuristic-mode
users (classic form still available via Classic toggle).

Scope:
1. Page TradeCommander.tsx:
   - H1 serif: "Tell me what you want to trade"
   - Status line: market status pill + account pill + guardrails pill +
     "Powered by claude-sonnet-4" badge — all live (market status from
     market hours; account from active; guardrails from user prefs).
   - CommanderPromptBar: big textarea (min 3 rows, autoresize), left sparkle
     icon, right mic icon + send button. Placeholder cycles through 5 example
     prompts every 4s when empty.
   - 5 suggestion cards below: Rebalance 60/40, Buy 10 AAPL at market, Sell
     half NVDA if it hits 950, Ladder $3k into VOO over 4 weeks, Cover TSLA
     short at 220. Click fills the prompt bar.
2. Voice dictation:
   - Use Web Speech API (navigator.mediaDevices + SpeechRecognition). Fall
     back to MediaRecorder → POST /api/v1/ai/transcribe (Whisper via
     Anthropic tool-use proxy or OpenAI Whisper if configured) for browsers
     without Web Speech.
   - While recording: waveform animation (bars driven by AudioContext
     getByteFrequencyData), live transcription text above the prompt bar,
     big red STOP button. Tap mic again or press ⇧⌘ to start/stop.
3. Parse step:
   - On submit (⌘⏎ or send), POST /api/v1/ai/commander/parse with { prompt,
     portfolio, accounts }. Backend calls Claude with tool-use schema:
     ```
     tool: propose_orders(orders: [{
       side, symbol, qty?, notional?, orderType,
       limit?, stop?, trigger?, duration, optionLeg?
     }])
     ```
   - Stream the response so the user sees progress.
   - Render ParseChips row: each extracted field as a colored chip with
     label ("Side: Sell", "Notional: $3,000", "Symbol: VOO", "Trigger:
     Weekly over 4 weeks", "Duration: GTC") + small ✓ when confident, ✎
     when editable. Clicking ✎ opens an inline editor.
4. Multi-order linked preview:
   - Below parse chips, render 1..N OrderCards in a vertical stack with a
     connecting vertical line on the left (linked visual). Card fields:
     number badge, side chip (Buy green / Sell red / Stop amber), big serif
     symbol, qty-or-notional, detail rows (order type, limit, TIF, account),
     optional warning row (yellow bg: "Above avg daily volume", "Outside
     regular hours").
   - STOP-order variant: wider card, different accent color.
5. Confirm bar (sticky bottom):
   - "Ready to place {N} orders." + primary button "⏎ Confirm all" + secondary
     "Place one at a time" + tertiary "Save as recipe".
   - On Confirm: for each order, call /api/v1/orders/preview (Session 8);
     if all pass, render a success state with confirmation numbers; any
     failures stay on the card with inline error.
6. Saved recipes:
   - Backend: POST /api/v1/recipes (title, prompt, parsed_orders) stored in
     Postgres/SQLite.
   - Frontend: recipes list opens from a "Recipes" dropdown in TopBar area.
     Click → fills the prompt and re-parses.
7. Keyboard shortcuts footer (fixed bottom):
   - ⌘K — focus prompt
   - ⇧⌘ (hold) — start/stop dictation
   - Esc — cancel parse / close preview
   - ⏎ (in confirm bar) — confirm all
   Shortcut pills rendered in a thin bottom strip.

Backend additions:
- backend/api/v1/commander.py: POST /parse (streaming), POST /confirm-all
- backend/domain/commander/parser.py: Claude tool-use wrapper
- backend/domain/commander/recipes.py: CRUD

Acceptance criteria:
- Type "Buy 10 AAPL at market" → 1 order card appears with all fields parsed.
- Type "Ladder $3k into VOO over 4 weeks" → 4 linked order cards appear.
- Mic button requests permission, shows waveform, transcription fills prompt
  bar, stop releases mic.
- Parse chips editable; changing "Notional: $3,000" to "$5,000" re-renders
  order cards.
- Confirm all → fires preview for each, navigates to deep-links sequentially
  OR (future) submits via broker API.
- Save as recipe → appears in recipes list; reloading page + opening recipe
  restores exact state.
- Page is fully keyboard-operable.

When done: commit "feat(commander): AI-native multi-order trade commander".
Screencap GIF: prompt → parse → linked preview → confirm.
```

---

### Session 15 — AI-Native Options Intent Studio

**Dependencies:** Sessions 4, 11, 12, 14 (commander patterns). Session 7
(cache) for Monte Carlo results.

**First-principles rationale:** Retail options UIs expose mechanics (strikes,
greeks) and hope the user has a thesis. Intent Studio inverts: the user
states a thesis, the app ranks strategies by how well they express it, then
lets the user tweak and simulate via Monte Carlo. This is the second flagship
feature — and it must co-exist with the classic chain from Session 4 (classic
users keep their chain; futuristic users land here first).

**Prompt:**

```
You are continuing HedgeIQ Phase 2. Read:
- docs/design/src/futuristic.jsx lines 500-955 (OptionsStudio — AUTHORITATIVE)
- docs/design/src/futuristic-mode.jsx WS_Options section
- docs/design/COMPONENT_MAP.md section 8

Prerequisite: Session 4 shipped the classic options chain; Session 14 shipped
the commander parse patterns (reuse parse-chip component). This session is
the options equivalent of Trade Commander.

Goal: page at /options (when mode=futuristic) where user states a thesis,
gets ranked strategies, tweaks on a full payoff simulator, reviews and
places.

Scope:
1. Landing state — IntentInput.tsx:
   - Big thesis textarea (serif): preformatted placeholder "e.g. NVDA up
     10% by May earnings, defined risk, $2k budget".
   - Action row: Voice (same component as Session 14) / Attach thesis file
     (accepts .pdf/.txt → send to Claude for summarization → fills textarea)
     / primary "Find strategies" button.
   - Below: "Manual intent knobs" collapsible panel with:
       • Direction: Up | Flat | Down (pill toggle)
       • Conviction: Low | Medium | High
       • Horizon: 1w | 2w | 1mo | 3mo | 6mo
       • Risk: Defined | Undefined (pill)
       • Budget: $500 | $1k | $2k | $5k | $10k | custom
     The textarea and knobs stay in sync — editing knobs updates a structured
     intent object that posts alongside thesis text.
   - Suggested thesis chips (5): "Bullish NVDA earnings", "Pin TSLA through
     April", "Short vol META", "Hedge AAPL downside", "Cheap lottery AMD".
     Click fills thesis + appropriate knobs.

2. Ranked strategies — StrategyRanking.tsx:
   - Backend: POST /api/v1/options/intent/rank {thesis, intent} → Claude
     generates candidate strategies using tool-use with schema:
     ```
     tool: rank_strategies(strategies: [{
       name, direction, legs: [{action, right, strike, expiry}],
       max_gain, max_loss, net_debit_credit, breakevens,
       ev_usd, probability_profit, capital_required,
       best_risk_adjusted: bool, lowest_capital: bool,
       warnings: [str], score: float
     }])
     ```
   - Top 3-5 strategies as ranked StrategyCards:
       • Rank badge (1, 2, 3…)
       • Name (Bull call spread, Call calendar, Long call, etc.)
       • Small chips: "Best risk-adj" / "Lowest capital"
       • Payoff sparkline (reuse from Session 3)
       • Legs table (action · right · strike · expiry)
       • 2×3 metrics grid (Max gain, Max loss, Net debit, P(win), EV, Capital)
       • Warning row where applicable (⚠ "Theta decay aggressive past Apr 30")
       • Actions: "Tweak" (→ simulator) · "Place" (→ preview modal)
   - Sort tabs at top: EV | P(win) | Max gain | Capital
   - Featured strategy: top card gets gradient bg + accent border
   - Comparison strip below: multi-line payoff overlay of all ranked strategies
     on one chart, color-coded.

3. Tweak & Simulate — StrategySimulator.tsx:
   - Opens when user clicks Tweak on a card (new page /options/simulate with
     strategy in URL state, or modal full-screen).
   - Left column (70% width): big payoff chart
       • Y-axis = P/L; X-axis = underlying price.
       • Strike markers (vertical dashed lines with label).
       • Zero line; current-price box; breakeven markers (labeled).
       • Loss zone filled red-tinted; gain zone green-tinted.
       • Monte Carlo scatter: 120 dots plotted at terminal price × P/L from
         5000-path simulation. Density visible via semi-opacity.
       • P(Profit) annotation box floating top-right: accent bg, "42% based
         on 5,000 paths".
       • "Payoff at" tabs above chart: Today | {expiry-14d} | {expiry-7d} |
         {expiry} — each recomputes payoff with time decay at that date.
   - Right column (30%): slider panel
       • Long strike slider (step = strike increment)
       • Short strike slider (if multi-leg)
       • Expiry picker (dropdown of real expiries)
       • Contracts slider (1..user's max based on budget)
       • What-if scenarios rows (read-only computed): Flat / Target / +10% /
         -15% — each shows $ outcome.
       • Suggested questions chips: "Why is EV positive?", "Show me if TSLA
         drops 20%", "Compare to long call" → fills Copilot rail.
       • Summary box at bottom: Net debit, Buying power impact, Max gain,
         Max loss, primary "Review & place" button.
   - Monte Carlo backend: POST /api/v1/options/simulate
     { legs, underlying_current, iv, expiry_date, paths=5000 }
     Returns { payoff_curve: [{price, pl}], terminal_prices: [...],
     probability_profit, expected_value }. Uses Black-Scholes GBM paths with
     IV from chain. Cache 1h dev (intent-specific), 5m prod.

4. Place flow: "Review & place" opens the standard OrderPreviewModal
   (Session 8) with all legs pre-filled. User deep-links to broker.

5. Route gating: if mode=classic, /options still renders Session-4 chain.
   If mode=futuristic, /options renders Intent Studio landing; with a small
   "Show raw chain" link that opens a modal rendering the classic chain.

Acceptance criteria:
- Enter thesis "NVDA up 10% by May earnings, $2k budget, defined risk" →
  Find strategies → 3+ ranked cards appear within 8s.
- Knob changes re-rank strategies live (debounced 500ms).
- Clicking Tweak opens simulator with correct strategy; strike sliders move
  the strike markers AND recompute payoff + Monte Carlo scatter within 1s.
- P(Profit) box updates as sliders move.
- Review & place → standard preview modal with multi-leg summary.
- Classic-mode users opening /options still see Session-4 chain.

When done: commit "feat(options-studio): AI-native thesis → ranked strategies
→ Monte Carlo simulator". Screenshot of simulator with Monte Carlo scatter.
```

---

### Session 16 — Research Page (8 Tabs)

**Dependencies:** Session 3 (chart), Session 5 (news), Session 7 (cache),
Session 11 (routing).

**First-principles rationale:** Traders need one place to answer "should I
own this?" The Research page is that place — quote + company profile + chart
+ fundamentals + analyst consensus + sentiment + news + AI bull/bear brief,
all tabbed so they can skim. Without Research, every symbol lookup dead-ends
in the chain or chart. With it, HedgeIQ becomes a decision tool.

**Prompt:**

```
You are continuing HedgeIQ Phase 2. Read:
- docs/design/src/screens.jsx ResearchScreen sections (authoritative)
- docs/design/COMPONENT_MAP.md section 9
- Claude Designs/HedgeIQ_Futuristic/Research.html (full composition)

Goal: ship a Research page at /research/:symbol with 8 tabs of content,
combining real data (Polygon reference + bars + news) with AI-generated
briefs.

Scope:
1. Page shell ResearchPage.tsx:
   - Top: SymbolBar = large symbol + company name + current price + day
     change + sector + market cap — all in 3×1 grid on wide screens.
   - Action row: Buy / Sell / Watch buttons + Notification/Filter/Link icons.
   - Tab bar with 8 tabs:
       Overview | Chart+ | Dividends & Earnings | Sentiment |
       Analyst Ratings | Comparisons | Statistics | View All
2. Tab: Overview (composition of cards in responsive grid):
   - DetailedQuote card: Open, Prev close, ESG rating, P/E, Options (Y/N),
     Dividend %, Distribution rate, Sector, Market cap.
   - News card with pagination (5 items; 1-5 / Next).
   - YourPositions card: Today G/L, Total G/L, Current value, % of acct,
     Qty, Cost basis. Renders from positions if user owns the symbol; shows
     "You don't own {SYMBOL}" otherwise with a Watch button.
   - Chart card (spans 2 cols): embedded ProChart with range buttons
     1D / 2D / 5D / 1M / 3M / 6M / YTD / 1Y / 2Y / 5Y / 10Y / MAX.
   - Price Performance card: bars 5d/10d/1m/3m/6m/YTD/1y, each colored by
     sign, labels showing % change.
   - Company Profile card: description with faded gradient fade-out at
     bottom + "Read more" expand; website link; HQ city; employees count.
     Data: Polygon ticker details endpoint.
   - Upcoming Events card: list of dated items (earnings call, ex-dividend,
     record date, pay date, announcement) with calendar-pill date badges.
3. Tab: Chart+ — full-width ProChart with additional technical indicator
   toggles (MACD, Bollinger Bands, Fibonacci retracement). Use
   lightweight-charts plugins or implement MACD/BB client-side.
4. Tab: Dividends & Earnings
   - Dividend history table (ex-date, pay-date, amount, yield).
   - Earnings history table (date, estimate, actual, surprise%).
   - Next earnings countdown card.
5. Tab: Sentiment
   - Gauge: Bearish → Neutral → Bullish with needle.
   - Sources breakdown (News sentiment / Social sentiment / Options flow /
     Analyst revisions).
   - 7-day sentiment trend mini-chart.
   Backend: POST /api/v1/ai/sentiment {symbol} → Claude aggregates recent
   news + analyst notes into a sentiment score 0-100. Cache 24h dev.
6. Tab: Analyst Ratings
   - Consensus badge: "1.3 / 5 (Strong Buy)".
   - Breakdown bars: Strong buy / Buy / Hold / Sell / Strong sell with counts.
   - 12-month price target: low / average / high with current price marker.
   - Firms table (firm name, analyst, action, target, date).
   Data: Polygon/Benzinga if available; else AI-synthesized from news as
   fallback with an explicit "Synthesized from news" caveat.
7. Tab: Comparisons
   - Peer table (5 peers auto-selected by sector): symbol, price, P/E, market
     cap, 1Y return, short ratio.
   - Multi-line chart overlaying 1Y returns normalized to 100.
8. Tab: Statistics
   - Grid: market cap, enterprise value, trailing P/E, forward P/E, PEG,
     price/sales, price/book, ROE, ROA, profit margin, operating margin,
     revenue, gross profit, EBITDA, diluted EPS, total cash, total debt,
     book value, 52w high/low, 50d avg, 200d avg, beta, avg vol, short
     ratio, shares outstanding, float, insiders%, institutions%.
9. Tab: View All — renders every card above on one long scrollable page
   (for users who prefer a single surface).
10. AI Research Brief card (appears on Overview tab and Sentiment tab):
    - Bull case (bulleted, 3 points)
    - Bear case (bulleted, 3 points)
    - Verdict (1 sentence)
    - "Confidence: X%" badge
    - Backend: POST /api/v1/ai/research-brief {symbol, context}. Cache 7d dev.
11. Symbol search in TopBar routes here: /research/AAL.

Acceptance criteria:
- /research/AAL renders Overview with real Polygon data.
- All 8 tabs render without error on a known symbol (AAPL).
- AI brief appears within 6s of page load with Bull/Bear/Verdict.
- Range buttons on chart fetch different timeframes.
- Analyst consensus renders, even if mocked — with the caveat pill when
  Polygon analyst endpoint unauthorized.

When done: commit "feat(research): 8-tab research page with AI bull/bear
brief". Screenshot Overview tab + Sentiment tab.
```

---

### Session 17 — Activity / Balances / Watchlists / Transfer

**Dependencies:** Session 11 (routing), Session 2 (widget primitives),
Session 8 (transfer ≈ order flow).

**First-principles rationale:** These four screens are the "portfolio
plumbing" — unglamorous but required for a brokerage-grade app. A user who
can't see their pending orders (Activity), check buying power (Balances),
track symbols they don't own (Watchlists), or move money between accounts
(Transfer) will leave. This session ports all four verbatim from the
prototype.

**Prompt:**

```
You are continuing HedgeIQ Phase 2. Read:
- docs/design/src/screens.jsx (ActivityScreen, BalancesScreen,
  WatchlistsScreen, TransferScreen)
- docs/design/COMPONENT_MAP.md section 10

Goal: ship all four utility screens in one session. Each one ports the
prototype closely; shared components (filter bar, expandable rows) live in
a `frontend/src/components/shared/` folder.

Scope:

1. Activity (/activity):
   - Period dropdown: 30d | 90d | YTD | All (persisted in URL query param).
   - Filter tabs: Orders | History | Transfers.
   - Action buttons: More filters (opens FilterPopover), Print (window.print
     with print.css), Download (CSV).
   - Pending orders table: Date | Account | Description | Status chip
     (Pending/Working/Partial) | Amount. Row click → preview modal.
   - Filled orders table: Date | Account | Description | Status (Filled —
     green chip) | Amount (monospace, signed).
   - Backend: GET /api/v1/activity?period=...&tab=... — aggregates orders
     from broker(s) via SnapTrade; falls back to stored orders table.

2. Balances (/balances):
   - Top KPI strip: Total value / Cash / Margin used / Buying power
     (updates live via SSE).
   - Account table: one row per connected account, expandable.
   - Expanded row detail: Intraday BP / Overnight BP / Available to withdraw
     / Cash / Margin equity / Long market value / Short market value / Day
     P/L / Total P/L — 3×3 grid.
   - Per-account actions: Transfer / Trade / Statements / Link more.

3. Watchlists (/watchlists):
   - 2-column layout: left sidebar 240px with watchlist list + [+ New
     watchlist] button; right main panel with selected watchlist content.
   - Watchlist item row: Symbol · Last · Chg $ · Chg % · 30d sparkline ·
     Volume · Market cap · 52w range bar.
   - Row actions: Add to watchlist / Remove / Open research / Buy / Sell.
   - Top-right main-panel buttons: [+ Add symbol], [⋯ More options] (Rename,
     Duplicate, Delete, Export, Sort by, Add columns).
   - Backend: CRUD on backend/domain/watchlists/ — Postgres/SQLite table
     watchlists (id, user_id, name, symbols jsonb, sort_by, created_at).
   - Seed default watchlists: "Tech 7", "Dividend aristocrats", "AI basket".

4. Transfer (/transfer):
   - Modal-style card 560px wide, centered.
   - From account dropdown (user's connected accounts + external bank).
   - To account dropdown (filtered to valid destinations based on From).
   - Large amount input (48px font, tabular-nums). Quick amounts: $500 /
     $1k / $5k / Max.
   - Frequency radio: One-time | Weekly | Monthly.
   - Info callout: "Transfers typically settle in 2-3 business days."
   - Review button → Review screen with summary + Confirm button.
   - Confirm → backend POST /api/v1/transfers with full audit trail row
     saved. For now: no actual money movement; just log + show confirmation
     number (this is the same "simulated execution" pattern Session 8 used
     for trades).

5. Shared components (frontend/src/components/shared/):
   - FilterPopover.tsx (already scoped in Session 2 — reuse here).
   - StatusChip.tsx — tone prop: success | warn | danger | neutral.
   - ExpandableRow.tsx — consistent expand/collapse behavior.
   - KPIStrip.tsx — the top horizontal KPI card row used on Balances.

Acceptance criteria:
- /activity renders a list of pending + filled orders for the active
  account; period dropdown filters correctly.
- /balances expands a row to show the 3×3 detail grid; KPI strip updates
  via SSE (tie to Session 9 SSE infra).
- /watchlists — create a new watchlist, add AAPL and TSLA to it, refresh
  page, data persists.
- /transfer — fill form, click Review, see summary, click Confirm, see
  confirmation screen with number. Activity tab shows the transfer entry
  within 5s.
- All four screens render correctly in Classic and Futuristic shells.

When done: commit "feat(screens): activity + balances + watchlists +
transfer". Screenshots of all four.
```

---

### Session 18 — Onboarding

**Dependencies:** Session 11 (shell), Session 17 (Transfer for the Funding
step reuse).

**First-principles rationale:** First-run experience is the single biggest
lever on retention. A 4-step onboarding (Account type → Personal info →
Funding → Review) that feels like Robinhood/Fidelity is table stakes for
investor demos. This is explicitly scoped as the last session because it
depends on all earlier infrastructure (routing, shell, transfer form,
account linking).

**Prompt:**

```
You are continuing HedgeIQ Phase 2. FINAL SESSION. Read:
- docs/design/src/screens.jsx OnboardingScreen
- docs/design/COMPONENT_MAP.md section 10 (Onboarding subsection)

Goal: ship a 4-step first-run onboarding flow at /onboarding that new users
see immediately after signup, before they reach the dashboard.

Scope:
1. Route gating: in AppShell, if user.onboarding_completed is false, redirect
   any non-/onboarding route to /onboarding. Skip for users with legacy
   accounts (completed=true by default via migration).
2. OnboardingShell.tsx — centered card, max-width 720px, padding 48px.
   Sticky step indicator at top: 4 circles with labels (Account type /
   Personal info / Funding / Review). Completed = green filled circle with
   checkmark; current = accent outline; future = grey outline.
3. Step 1 — Account type:
   - 2×3 card grid of account types: Individual Taxable, Roth IRA,
     Traditional IRA, 529 (Education), Joint Tenant, Custodial.
   - Each card: large icon (port from util.jsx — Briefcase/Shield/Target/
     Book/Wallet/Users), title (serif), 1-line description, info-tooltip
     icon (hover tooltip with tax treatment summary).
   - Click selects; selected state = accent border + subtle fill.
   - Back (disabled on step 1) + Continue buttons at bottom-right.
4. Step 2 — Personal info:
   - Grouped fields: Legal name (first/middle/last), DOB, SSN (masked, with
     "Why we need this" tooltip), Address (street/city/state/zip), Phone,
     Email (read-only from signup), Employment (Employed / Self-employed /
     Retired / Student / Unemployed), Employer (conditional), Occupation,
     Source of funds (Income / Savings / Inheritance / Sale of asset /
     Other), Investment experience (None / Some / Extensive), Risk tolerance
     (Conservative / Moderate / Aggressive).
   - Real-time validation with inline error messages.
   - Save draft on blur so the user can resume later.
5. Step 3 — Funding:
   - Reuse TransferScreen-style form in "initial deposit" mode.
   - Options: Link bank (Plaid-like flow; for now, mock with routing+account
     numbers), Wire transfer (show instructions), Transfer from another
     broker (ACATS form), Deposit check (photo upload; mock for now),
     Skip for now (default $0, grey option).
   - If user chose anything other than Skip: show expected funding ETA.
6. Step 4 — Review:
   - Summary of all answers in grouped cards.
   - Small-print disclaimers (aggregated into an expandable "Legal" section).
   - Two required checkboxes: "I agree to the Customer Agreement" + "I
     confirm the information above is accurate".
   - Primary button: Complete & open account. Secondary: Back.
7. On completion:
   - POST /api/v1/onboarding/complete with all form data.
   - Backend stores in onboarding_applications table + flips user.
     onboarding_completed = true + fires notification "Welcome! Your account
     is being reviewed."
   - Frontend navigates to /dashboard (classic) or /home (futuristic) with
     a confetti animation (CSS keyframes, 2s duration) + welcome banner.
8. Analytics: emit events to /api/v1/telemetry/event at step-enter,
   step-complete, and final-complete. Used later for funnel analysis.
9. Style: heavy use of Fraunces serif for step titles, Inter Tight for
   body, JetBrains Mono for SSN and numbers.

Acceptance criteria:
- Fresh signup → auto-redirected to /onboarding Step 1.
- Selecting Roth IRA + Continue → Step 2; Back returns with selection
  preserved.
- Submitting with a validation error scrolls to + highlights the field.
- Completing all 4 steps lands user on /dashboard, confetti plays,
  notification bell shows welcome message.
- Refreshing mid-flow resumes at the step they were on.
- "Skip for now" on funding still completes onboarding with $0 balance.
- All forms keyboard-navigable (Tab through fields, Enter to continue).

When done: commit "feat(onboarding): 4-step account opening flow". Screenshots
of all 4 steps.

PHASE 2 COMPLETE. 🎉
```

---

## 5. Operating Protocol for Each Session

### Starting a session

1. Open fresh Claude Code session.
2. Paste the session prompt verbatim.
3. Claude reads `docs/PHASE_2_ROADMAP.md` to load context.
4. Claude creates a TodoWrite list from the Scope items.
5. Claude works through items one by one, committing at natural boundaries.
6. At end of session, Claude pushes, verifies in browser with screenshots,
   updates this roadmap with ✅ next to the completed session heading.

### Cache-first development

Every Claude session should:
- Default `ENV=development` which triggers 10% fresh sampling.
- On first Polygon/Anthropic call of a session, log the cache status.
- If developing a feature that depends on fresh data, temporarily set
  `ENV=production` on the Railway service and revert at end of session.

### Verification discipline

Never claim "done" without:
1. `npm run build` passes with zero TypeScript errors.
2. A real browser screenshot showing the feature working on the deployed
   Vercel URL (not localhost).
3. At least one negative test (purposely cause the failure case, verify
   graceful handling).

### What NOT to do

- Do not add packages without approval (except those listed per session).
- Do not change backend API response shapes without versioning.
- Do not skip the theme/CSS-variable requirement in new components.
- Do not commit `.env` or any secrets.
- Do not bypass the cache layer in new facade methods.

---

## 6. Progress Tracker

Mark each session ✅ when complete.

**Sessions 1-10 (original plan):**
- [ ] Session 1 — Theme + Responsive (+ density, colorblind, futuristic-mode toggle, full icon set port)
- [ ] Session 2 — Widget Dashboard (+ 11 new dashboard card widgets, filter popover, inline position drawer)
- [ ] Session 3 — Interactive Chart (+ port AreaChart/CandleChart/MiniBars/Donut, 13 range buttons)
- [ ] Session 4 — Options Chain v2 (+ expanded strategy dropdown, E/W badges, IV30/HV30, Day/52w sparklines)
- [ ] Session 5 — Position Detail + News (inline-expand row, Purchase history, Fundamentals tabs)
- [ ] Session 6 — Persistent AI Advisor (+ insights cards Opportunity/Alert/Rebalance)
- [ ] Session 7 — Tiered Cache + Dev Mode
- [ ] Session 8 — Order Tickets (+ draggable TradeDrawer, Route dropdown, Help mode, placed-state confirmation)
- [ ] Session 9 — Real-Time Feel (+ notifications bell, sync timestamps)
- [ ] Session 10 — Performance + Polish (+ CommandPalette fuzzy search)

**Sessions 11-18 (added after Futuristic audit):**
- [ ] Session 11 — Market Tape + Navigation Shell (scrolling ticker, TopBar breadcrumb/search/bell/avatar, Preferences popover)
- [ ] Session 12 — Futuristic Mode Home + Agents (9-workspace rail, agents sidebar, Home briefs, narrative summary)
- [ ] Session 13 — Trade Enhancements (Level II order book, AI risk narrative, recent activity log)
- [ ] Session 14 — AI-Native Trade Commander (prompt bar, voice dictation, parse chips, multi-order preview)
- [ ] Session 15 — AI-Native Options Intent Studio (thesis input, intent knobs, ranked strategies, Tweak & Simulate with Monte Carlo)
- [ ] Session 16 — Research Page (8 tabs, Analyst consensus, Bull/Bear AI brief, Financials)
- [ ] Session 17 — Activity / Balances / Watchlists / Transfer screens
- [ ] Session 18 — Onboarding (4-step flow, account type selector)

> Detailed feature→session mapping in **docs/design/COMPONENT_MAP.md**.
> The autonomous build reads that file first and treats every ❌ row as a
> mandatory implementation target.

---

## 7. Definition of Done for Phase 2

Phase 2 is complete when a new user who has never seen the app can:

1. Sign in and land on a dashboard that fits their screen size in their
   preferred theme.
2. See live portfolio, with sparklines and day change, without clicking.
3. Click any symbol to see a detail drawer with interactive chart + news.
4. Customize their dashboard layout and save it.
5. Use the AI Advisor as a right-rail companion that remembers conversation.
6. Calculate a hedge, see an interactive payoff diagram, get suggested
   follow-ups from Claude, and deep-link to their broker to execute.
7. Feel that prices are "live" — flashing, timestamped, with a visible
   connection indicator.
8. Navigate primarily by keyboard if they prefer.

When all 8 work on a fresh laptop in both themes, with Lighthouse score ≥90,
and monthly API spend < $20 thanks to caching — Phase 2 ships.

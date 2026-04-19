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

**Total estimated sessions: 10.** Each session aims for a shippable, deployable
state by end-of-session so you can demo progress between them.

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

PHASE 2 COMPLETE.
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

- [ ] Session 1 — Theme + Responsive
- [ ] Session 2 — Widget Dashboard
- [ ] Session 3 — Interactive Chart
- [ ] Session 4 — Options Chain v2
- [ ] Session 5 — Position Detail + News
- [ ] Session 6 — Persistent AI Advisor
- [ ] Session 7 — Tiered Cache + Dev Mode
- [ ] Session 8 — Order Tickets + Broker Links
- [ ] Session 9 — Real-Time Feel
- [ ] Session 10 — Performance + Polish

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

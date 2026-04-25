# 05 — Frontend components

## Top-level

### `App.tsx`

The router. Maps `/` → `LandingPage`, `/login` → `LoginPage`, `/app` → `Dashboard` (auth-guarded).

### `Dashboard.tsx`

Authenticated orchestrator. Renders the persistent header, the resizable widget grid (`react-grid-layout`), the position-detail side drawer, the preferences popover and onboarding for first-time users. Persists layout to `localStorage`.

## Components

### `AIChat.tsx`

Right-rail Claude chat panel. Streams responses, tracks daily-quota usage, surfaces context chips ("Now talking about: AAL position").

### `OptionsChain.tsx`

Filterable, sortable options chain table. Filters: expiry, option type (calls/puts), strike range, min OI. Highlights the strikes recommended by the hedge algorithm.

### `EmergencyHedge.tsx`

The 60-second hedge dialog. Three-step flow: pick position → pick risk scenario (10% drop / earnings miss / sector shock) → review top 3 puts and their value-scores. Includes one-click "explain in plain English" via `/ai/explain`.

### `PositionsTable.tsx`

Live positions table backed by `/api/v1/positions`. Each row clickable to open the side drawer (`PositionDrawer`).

### `PriceChart.tsx`

Polygon-backed OHLC chart with adjustable timeframe (1D / 5D / 1M / 3M / 1Y).

### `LandingPage.tsx` / `LoginPage.tsx`

Public marketing landing page and auth pages. Both share the `ThemeProvider` so a logged-out user already gets their preferred theme from `localStorage`.

### `MarketTape.tsx`

Top-of-screen scrolling ticker. Reads major indices via `/quotes`.

### `Onboarding.tsx`

First-time-user spotlight tour. Toggled by a flag in `layout-store`.

### `ErrorBoundary.tsx`

Class component that catches render errors in the dashboard subtree and renders a friendly fallback ("Something went wrong — refresh the page").

### `AIExplainer.tsx`

Tiny inline component that renders a one-paragraph plain-English explanation under any chart or recommendation. Hits `/ai/explain`.

### `PayoffChart.tsx`

Visualises the P&L curve of a hedge at expiry: stock-only line vs. stock-plus-put line.

### `Sparkline.tsx`

Pure SVG mini-chart used in the positions table for the 1-day price line.

### `PositionDrawer.tsx`

Side drawer summarising a single position: news, chain link, hedge button.

## Library code (`lib/`)

### `api.ts`

`fetch` wrapper that injects the JWT, handles 401 by clearing the token and redirecting to `/login`, and surfaces server-side error messages.

### `ThemeProvider.tsx`

React context exposing `{ theme, setTheme, density, setDensity, colorblind, setColorblind, mode, setMode }`. Three themes (Meridian / Terminal / Lumen), two densities (Balanced / Dense), colour-blind palette toggle, light/dark mode.

### `layout-store.ts`

Persisted dashboard layout. `LayoutContext` exposes `addWidget`, `removeWidget`, `resetLayout`, `applyPreset`.

### `icons.tsx`

Single facade over `lucide-react`. Use `<I.Settings />` etc. so swapping the icon set later is one-file change.

### `utils.ts`

Small helpers: `formatMoney`, `formatPercent`, `clsx`-style class joiner.

### `markdown.tsx`

Lightweight markdown-to-React renderer used by AI chat to render Claude's responses.

## Widgets (`widgets/`)

Pluggable dashboard widgets registered in `WidgetRegistry.ts`:

- `AccountSummary` — total equity, day P/L
- `AICommander` — embedded AI chat panel
- `ChartWidget` — multi-symbol chart
- `OrderTicket` — read-only "what an order would look like"
- `Research` — news + filings panel
- `Watchlist` — symbols you're watching

Each widget extends the generic `Widget.tsx` shell which provides the title bar, drag handle and resize chrome.

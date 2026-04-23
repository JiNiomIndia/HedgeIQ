# Feature Coverage Matrix — Futuristic Prototype → Phase 2 Sessions

> Generated 2026-04-22 by auditing every JSX file in
> `docs/design/src/` + `Claude Designs/HedgeIQ_Futuristic/`.
> Status legend: ✅ covered by existing session · ⚠️ partial · ❌ missing
> (this file flags what Phase 2 must add).

---

## 1. Shell & Navigation (from `app.jsx`, `shell.jsx`)

| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| App shell with icon sidebar (Dashboard, Positions, Trade, Options, Research, Activity, Balances, Watchlists, Transfer) | `app.jsx` Sidebar | Session 2 | ⚠️ expand |
| TopBar with breadcrumb nav, search bar, notifications, preferences, user avatar | `shell.jsx` TopBar | Session 2 | ❌ add |
| **MarketTape** (scrolling ticker: S&P 500, Nasdaq, Dow, VIX, 10Y Yield, Crude, Gold, BTC, DXY, EUR/USD) | `shell.jsx` MarketTape | **NEW Session 11** | ❌ add |
| **CommandPalette** (⌘K: fuzzy search symbols, pages, actions) | `shell.jsx` CommandPalette | Session 10 | ⚠️ expand |
| Global hotkey ⌘K opens palette, Esc closes, Enter sends chat | `shell.jsx` | Session 10 | ✅ covered |
| **Classic ↔ Futuristic mode toggle** (top-right pill) | `app.jsx` mode state | Session 1 | ❌ add |
| **PreferencesPopover** (theme switch, density slider, colorblind, copilot default) | `app.jsx` PreferencesPopover | Session 1 | ⚠️ expand |
| User avatar dropdown | `shell.jsx` | Session 2 | ❌ add |
| Notifications bell with badge | `shell.jsx` | Session 9 | ❌ add |

---

## 2. AI Copilot Rail (from `app.jsx` CopilotPanel)

| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| Collapsible right-rail Copilot panel (340px wide) | `app.jsx` lines 215-275 | Session 6 | ✅ covered |
| Chat bubbles (rounded corners asymmetric for user/ai) | `app.jsx` | Session 6 | ✅ covered |
| Typing animation (dots pulse) | `shell.jsx` AISidebar | Session 6 | ⚠️ expand |
| **Suggested actions (clickable starter chips)** | `app.jsx` lines 240-250 | Session 6 | ✅ covered |
| **Today's insights cards** (Opportunity / Alert with colored chips) | `app.jsx` lines 250-260 | **NEW Session 12** | ❌ add |
| Input box at bottom with sparkle icon + send button | `app.jsx` lines 265-272 | Session 6 | ✅ covered |
| Context-aware responses (knows active symbol) | `shell.jsx` AISidebar | Session 6 | ✅ covered |
| Disclaimer footer ("may be inaccurate…") | `app.jsx` line 271 | Session 6 | ✅ covered |

---

## 3. Dashboard (from `dashboard.jsx`)

Dashboard is HUGE (442 lines, 10+ cards). Session 2's widget system
must cover ALL of these as registered widgets.

| Widget | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| **DashAccountPanel** — left sidebar: all accounts selector, accounts grouped by category, Open/Link buttons | `dashboard.jsx` | Session 2 | ❌ add widget |
| **BalanceHero** — portfolio value, day P/L badge, 1D/1W/1M/3M/YTD/1Y/5Y tabs, area chart w/ hover tooltip, benchmark comparison dashed line | `dashboard.jsx` | Session 3 | ⚠️ chart covered, hero widget new |
| **QuickStats** (4-col): Day change, Total gain, Buying power, Dividend YTD | `dashboard.jsx` | Session 2 | ❌ add |
| **AIInsightCard**: 3 insights (Opportunity/Alert/Rebalance), "Open Copilot" button | `dashboard.jsx` | **NEW Session 12** | ❌ add |
| **MoversCard**: Gainers/Losers/Most Active toggle, symbol tiles with sparklines + volume | `dashboard.jsx` | Session 2 | ❌ add |
| **TopMoversCard**: table of YOUR holdings' movers (Sym, Day G/L $, %, Last) | `dashboard.jsx` | Session 2 | ❌ add |
| **MarketsCard**: 3-col index sparklines (Dow/Nasdaq/S&P) + 2×2 commodities grid (Oil/Gold/10Y/BTC) | `dashboard.jsx` | Session 2 | ❌ add |
| **EventsCard**: earnings + ex-div calendar with icons | `dashboard.jsx` | Session 5 | ⚠️ integrate |
| **NewsCard**: "Your holdings vs Market" toggle, 5 items with source, time, impact badge | `dashboard.jsx` | Session 5 | ⚠️ expand |
| **AllocationCard**: donut chart (US Equity/Intl/Fixed Income/Cash/Alt) with center label | `dashboard.jsx` | Session 2 | ❌ add |
| Trade / Transfer / Quote action buttons in dashboard header | `dashboard.jsx` | Session 2 | ❌ add |
| Tabs: Summary / Positions / Activity / Balances / Documents / Planning | `dashboard.jsx` | Session 2 | ❌ add |

---

## 4. Positions (from `positions.jsx`)

| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| Position table with 13 columns (Sym, Last, Chg, Today $, Today %, Total G/L $, Total G/L %, Value, % of acct, Qty, Avg cost, Cost basis, 52w range bar) | `positions.jsx` | Session 2 | ⚠️ expand |
| **Expandable row with PositionDrawer inline** (not modal) | `positions.jsx` | Session 5 | ❌ swap to inline |
| PositionDrawer tabs: Purchase history, Research, News, Fundamentals, Chart | `positions.jsx` | Session 5 | ⚠️ expand |
| Purchase history table (Acquired, Term, G/L, Value, Qty, Avg cost, Cost basis) | `positions.jsx` | Session 5 | ❌ add |
| Fundamentals 4-col grid (Market cap, P/E, EPS, Beta, Div yield, Revenue, 52w, Avg vol) | `positions.jsx` | Session 5 | ❌ add |
| **FilterPopover**: Investment type checkboxes + Attributes (Up today, Down today, Dividend, 52w high/low) | `positions.jsx` | Session 2 | ❌ add |
| Filter chips with X to remove, +Add filter | `positions.jsx` | Session 2 | ❌ add |
| Account section headers with Option summary / Manage dividends buttons | `positions.jsx` | Session 2 | ❌ add |
| Cash row per account + account totals row | `positions.jsx` | Session 2 | ❌ add |
| Density modes (dense/balanced/sparse) | `positions.jsx` | Session 1 | ❌ add |
| Colorblind-safe palette toggle (blue/orange vs green/red) | `positions.jsx` | Session 1 | ❌ add |
| Refresh / Download / More buttons | `positions.jsx` | Session 2 | ❌ add |

---

## 5. Trade Ticket — Classic (from `trade.jsx`)

| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| TradeScreen (left ticket + right chart/stats split) | `trade.jsx` | Session 8 | ⚠️ expand |
| **TradeDrawer** (floating, draggable, minimizable, 3-step flow) | `trade.jsx` | Session 8 | ❌ add drawer variant |
| Action toggle: Buy / Sell / Sell short / Buy to cover | `trade.jsx` | Session 8 | ⚠️ expand |
| Trade type dropdown: Stocks/ETFs, Options, Mutual funds | `trade.jsx` | Session 8 | ✅ covered |
| Account selector with Cash available / Buying power margin / Available w/o margin | `trade.jsx` | Session 8 | ⚠️ expand |
| Symbol + live quote panel (price, bid/ask, volume, change%) | `trade.jsx` | Session 8 | ✅ covered |
| Quantity input + Shares/Dollars toggle + quick buttons (10/25/50/100) | `trade.jsx` | Session 8 | ❌ add |
| Owned position hint with "Owned X Shares" button | `trade.jsx` | Session 8 | ❌ add |
| Order type: Market, Limit, Stop, Stop limit, Trailing stop $/% | `trade.jsx` | Session 8 | ⚠️ expand |
| Conditional limit price with ±$0.50 / ±$0.10 quick adjust | `trade.jsx` | Session 8 | ❌ add |
| TIF: Day / GTC 60 / FOK / IOC | `trade.jsx` | Session 8 | ✅ covered |
| Route: Smart / ARCA / NSDQ | `trade.jsx` | Session 8 | ❌ add |
| Trade capacity: Cash / Margin | `trade.jsx` | Session 8 | ❌ add |
| **Copilot check badge with AI risk narrative** (uses X% of account, up Y% today, cost basis after fill) | `trade.jsx` | **NEW Session 13** | ❌ add |
| **Level II order book** (Bids left / Asks right with viz bars) | `trade.jsx` | **NEW Session 13** | ❌ add |
| Recent activity log (Time, side, size, price) | `trade.jsx` | Session 9 | ❌ add |
| Help mode toggle with contextual hints on fields | `trade.jsx` | Session 1 | ❌ add |
| OrderPreviewModal with full summary + Edit/Place buttons | `trade.jsx` | Session 8 | ⚠️ expand |
| Placed-state confirmation with check icon + confirmation # + New order/Done buttons | `trade.jsx` | Session 8 | ❌ add |

---

## 6. Trade Commander — AI-Native (from `futuristic.jsx` concept 1)

**THIS ENTIRE SECTION IS MISSING FROM PHASE 2.** Needs a dedicated session.

| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| Large serif title "Tell me what you want to trade" | `futuristic.jsx` | **NEW Session 14** | ❌ add |
| **Central Commander prompt bar** with sparkle + mic + send | `futuristic.jsx` + `futuristic-mode.jsx` | **NEW Session 14** | ❌ add |
| Live status line (market data, account, guardrails, model badge) | `futuristic.jsx` | **NEW Session 14** | ❌ add |
| 5 suggested order template cards (Rebalance 60/40, Buy 10 AAPL at mkt, Sell half NVDA if 950, Ladder $3k VOO 4wks, Cover TSLA short at 220) | `futuristic.jsx` | **NEW Session 14** | ❌ add |
| **Voice dictation with waveform animation + live transcription** | `futuristic.jsx` | **NEW Session 14** | ❌ add |
| **Parse chips** row (extracted: Side, Notional, Symbol, Trigger, Duration with check) | `futuristic.jsx` | **NEW Session 14** | ❌ add |
| Multi-order linked preview (3+ orders parsed from one prompt) | `futuristic.jsx` | **NEW Session 14** | ❌ add |
| Order cards in preview (number badge, side chip, symbol serif, qty/notional, detail rows, optional warning) | `futuristic.jsx` | **NEW Session 14** | ❌ add |
| Wide STOP order card variant | `futuristic.jsx` | **NEW Session 14** | ❌ add |
| Ready-to-place confirmation bar (⏎ to confirm all, Place one at a time, Save as recipe) | `futuristic.jsx` | **NEW Session 14** | ❌ add |
| Global hotkey footer: ⌘K, ⇧⌘ dictate, Esc cancel | `futuristic.jsx` | **NEW Session 14** | ❌ add |

---

## 7. Options Chain — Classic (from `screens.jsx` + `OptionChain.html`)

| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| Symbol input + live quote (price, chg, put/call ratio, bid/ask/vol/IV) | `screens.jsx` OptionsScreen | Session 4 | ✅ covered |
| **Strategy dropdown expanded**: Calls&puts, Buy write, Collar, Combo, Calendar/Diagonal/Ratio/Vertical spreads, Straddle, Strangle, Butterfly, Condor | `OptionChain.html` | Session 4 | ⚠️ expand significantly |
| Class toggle (Calls/Puts/Both) with strike column always centered | `OptionChain.html` | Session 4 | ✅ covered |
| **Custom range UI**: collapsible min/max inputs with Apply button and clear chip | `OptionChain.html` | Session 4 | ✅ covered (our addition) |
| Strikes dropdown (5/10/20/All) | `OptionChain.html` | Session 4 | ✅ covered |
| Show weekly options toggle switch | `OptionChain.html` | Session 4 | ✅ covered |
| Expiration pill row with E (earnings) badge + W (weekly) marker + left/right arrows | `OptionChain.html` | Session 4 | ⚠️ expand badges |
| Chain table: Calls 8 cols | Strike center sunken | Puts 8 cols (Last/Chg/Bid/Ask/Vol/OI/IV/Δ) | `OptionChain.html` | Session 4 | ✅ covered |
| Bid/Ask cells as clickable colored buttons | `OptionChain.html` | Session 4 | ✅ covered |
| Day range + 52w range inline sparklines in header | `OptionChain.html` | Session 4 | ❌ add |
| Ex-div + Earnings date badges + IV30/HV30 deltas | `OptionChain.html` | Session 4 | ❌ add |
| Copilot strategy insight card at bottom (gradient bg) | `screens.jsx` | Session 6 | ❌ add |

---

## 8. Options Intent Studio — AI-Native (from `futuristic.jsx` concept 2 + `futuristic-mode.jsx` WS_Options)

**ENTIRELY MISSING FROM PHASE 2.** Second new session needed.

| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| **Thesis input box** (preformatted example: "NVDA up 10% by May earnings, defined risk, $2k budget") | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| Voice / Attach thesis file / Find strategies buttons | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| **Manual intent knobs**: Direction (Up/Flat/Down), Conviction (L/M/H), Horizon (1w/2w/1mo/3mo/6mo), Risk (Defined/Undefined), Budget (500/1k/2k/5k/10k) | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| Suggested thesis chips (Bullish NVDA earnings, Pin TSLA through April, Short vol META, Hedge AAPL downside, Cheap lottery AMD) | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| **Ranked strategy cards** (Bull call spread, Call calendar, Long call) with EV/P(win)/Max gain/Capital sort tabs | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| Per-card: rank badge, "Best risk-adj/Lowest capital" chips, payoff sparkline, legs table, 2×3 metrics grid, Tweak/Place buttons | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| Featured card with gradient bg + accent border | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| Warning boxes on cards (⚠ "Theta decay aggressive past Apr 30") | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| Comparison strip: multi-line payoff overlay | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| **Tweak & Simulate** page: big payoff chart + slider panel | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| Payoff chart: Y-axis prices, strike markers, zero line, current price box, breakeven markers, loss/gain fills, Monte Carlo dots (120 scatter) | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| P(Profit) probability annotation (accent box: "42% based on 5,000 paths") | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| "Payoff at" tabs (Today / Apr 30 / May 10 / May 16) | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| Slider rows: Long strike, Short strike, Expiry, Contracts | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| What-if scenarios rows (flat, target, +10%, -15% with $) | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| "Ask about this strategy" suggested questions chips | `futuristic.jsx` | **NEW Session 15** | ❌ add |
| Summary box (net debit, buying power, max gain, Review&place button) | `futuristic.jsx` | **NEW Session 15** | ❌ add |

---

## 9. Research Page (from `screens.jsx` + `Research.html`)

| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| Symbol input + quote display (3×1 price/chg/name/sector) | `Research.html` | Session 5 | ⚠️ dedicated screen |
| Buy/Sell/Watch action buttons + notification/filter/link icons | `Research.html` | Session 8 | ❌ add |
| **8 tabs**: Overview / Chart+ / Dividends & Earnings / Sentiment / Analyst Ratings / Comparisons / Statistics / View All | `Research.html` | **NEW Session 16** | ❌ add |
| Overview: Detailed Quote card (Open, Prev close, ESG, P/E, Options, Dividend, Distribution rate, Sector, Market cap) | `Research.html` | **NEW Session 16** | ❌ add |
| Overview: News card with pagination (1-5 + Next) | `Research.html` | Session 5 | ⚠️ expand |
| Overview: Your Positions card inline (Today G/L, Total G/L, Current value, % of acct, Qty, Cost basis) | `Research.html` | **NEW Session 16** | ❌ add |
| Overview: Chart card (2-col span) with 1D/2D/5D/1M/3M/6M/YTD/1Y/2Y/5Y/10Y/MAX ranges | `Research.html` | Session 3 | ⚠️ expand ranges |
| Overview: Price Performance card (5d/10d/1m/3m/6m/YTD/1y colored %) | `Research.html` | **NEW Session 16** | ❌ add |
| Overview: Company Profile with faded gradient text + website link | `Research.html` | **NEW Session 16** | ❌ add |
| Overview: Upcoming Events list (date badges, record/pay/announce details) | `Research.html` | **NEW Session 16** | ❌ add |
| **Analyst Ratings tab**: consensus 1.3/5, breakdown bars (Strong buy/Buy/Hold/Sell/Strong sell), 12-mo price target | `screens.jsx` | **NEW Session 16** | ❌ add |
| Key Statistics card (market cap, P/E, EPS, div, beta, 52w, avg vol) | `screens.jsx` | **NEW Session 16** | ❌ add |
| Financials card (revenue/EPS mini bars, margins) | `screens.jsx` | **NEW Session 16** | ❌ add |
| **AI Research Brief card (Bull case / Bear case / Verdict)** | `screens.jsx` | **NEW Session 16** | ❌ add |
| Latest news with thumbnails | `screens.jsx` | Session 5 | ⚠️ expand |

---

## 10. Activity / Balances / Watchlists / Transfer / Onboarding

**ALL 5 SCREENS ARE MISSING FROM PHASE 2.** Need dedicated session.

### Activity (from `screens.jsx` ActivityScreen)
| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| Period dropdown (30d/90d/YTD/All) | `screens.jsx` | **NEW Session 17** | ❌ add |
| Filter tabs: Orders / History / Transfers | `screens.jsx` | **NEW Session 17** | ❌ add |
| More filters + Print + Download buttons | `screens.jsx` | **NEW Session 17** | ❌ add |
| Pending orders table (Date, Account, Description, Status chip, Amount) | `screens.jsx` | **NEW Session 17** | ❌ add |
| Filled orders table (green status chip, monospace amounts) | `screens.jsx` | **NEW Session 17** | ❌ add |

### Balances (from `screens.jsx` BalancesScreen)
| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| Account table with expandable rows | `screens.jsx` | **NEW Session 17** | ❌ add |
| Per-account detail: Intraday BP / Overnight BP / Available to withdraw | `screens.jsx` | **NEW Session 17** | ❌ add |

### Watchlists (from `screens.jsx` WatchlistsScreen)
| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| 2-col: left sidebar watchlist list + Add button / right main content | `screens.jsx` | **NEW Session 17** | ❌ add |
| Watchlist items: Sym, Last, Chg $, Chg %, 30d trend sparkline, Volume, Mkt cap, 52w range bar | `screens.jsx` | **NEW Session 17** | ❌ add |
| Add symbol / More options buttons | `screens.jsx` | **NEW Session 17** | ❌ add |

### Transfer (from `screens.jsx` TransferScreen)
| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| Modal 560px card: From/To account dropdowns, large amount input, quick amounts ($500/$1k/$5k/Max), Frequency (One-time/Weekly/Monthly), Info callout, Review button | `screens.jsx` | **NEW Session 17** | ❌ add |

### Onboarding (from `screens.jsx` OnboardingScreen)
| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| 4-step indicator (Account type / Personal info / Funding / Review with checkmarks) | `screens.jsx` | **NEW Session 18** | ❌ add |
| 2×3 account type cards (Individual, Roth IRA, Traditional IRA, 529, Joint, Custodial) with icons | `screens.jsx` | **NEW Session 18** | ❌ add |
| Back / Continue buttons | `screens.jsx` | **NEW Session 18** | ❌ add |

---

## 11. Futuristic Mode — Home & Agents (from `futuristic-mode.jsx`)

**ENTIRELY MISSING.** Fundamentally changes the app shell.

| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| **9-workspace left rail** (Home/Trade/Options/Positions/Research/Activity/Balances/Watchlists/Transfers) | `futuristic-mode.jsx` FMRail | **NEW Session 12** | ❌ add |
| **Agents section in rail**: Tax-loss / Rebalance / Earnings with status dots | `futuristic-mode.jsx` | **NEW Session 12** | ❌ add |
| Dark FMTopBar with "v3 · Futuristic" badge + greeting + buying power + Classic/Futuristic toggle | `futuristic-mode.jsx` | **NEW Session 12** | ❌ add |
| **WS_Home**: Greeting "Good morning, Jordan. 3 things for you today." | `futuristic-mode.jsx` | **NEW Session 12** | ❌ add |
| Central Commander prompt bar + 4 chip suggestions (Explain P&L, Rebalance 70/30, Tax-loss scan, Morning news) | `futuristic-mode.jsx` | **NEW Session 12** | ❌ add |
| **3 brief cards** (warn/pos-featured/ai) with tone-specific colors, action buttons, dismiss | `futuristic-mode.jsx` | **NEW Session 12** | ❌ add |
| **4 mini-cards row** (Buying power, Today P&L, Open orders, Watchlist alerts) | `futuristic-mode.jsx` | **NEW Session 12** | ❌ add |
| **Narrative summary box** with sparkle badge, timestamp, serif body, contextual action buttons | `futuristic-mode.jsx` | **NEW Session 12** | ❌ add |
| Sync timestamp indicator | `futuristic-mode.jsx` | Session 9 | ⚠️ integrate |

---

## 12. Visual primitives (from `charts.jsx`, `util.jsx`)

| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| **Sparkline** SVG component (line + area + endpoint dot) | `charts.jsx` | Session 1 | ✅ done already |
| **AreaChart** (portfolio with benchmark dashed overlay, grid, axes, hover highlight) | `charts.jsx` | Session 3 | ⚠️ port exactly |
| **CandleChart** (OHLC + volume bars, 5-tick axes, colored up/down, grid) | `charts.jsx` | Session 3 | ⚠️ port exactly |
| **Donut** chart (concentric segments with dashes, center label + value) | `charts.jsx` | Session 2 | ❌ add |
| **RangeBar** (low/high range + current indicator, optional compact mode) | `charts.jsx` | Session 1 | ✅ done already |
| **MiniBars** (small stacked bars, dual-color for +/-) | `charts.jsx` | Session 3 | ❌ add |
| **genCandles / genSeries** deterministic generators for demo data | `util.jsx` | Session 7 | ⚠️ as fallback in tiered cache |
| 58 inline SVG icons (H, Wallet, Chart, Bell, Sparkle, Send, X, Check, ChevronD/U/R/L, ArrowUp/Down/UR, Filter, Refresh, Download, Print, Dots, ExtLink, Star, Eye, Lock, Shield, Calendar, Briefcase, Target, Bolt, Clock, Book, …) | `util.jsx` | Session 1 | ❌ port all |

---

## 13. Design tokens & theming

| Feature | Prototype source | Phase 2 session | Status |
|---|---|---|---|
| 3 themes (Meridian/Lumen/Terminal) via `data-theme` attribute | `styles/theme.css` | Session 1 | ✅ covered (already in prompt) |
| Density attribute (`data-density`: balanced/dense/sparse) affecting row heights, padding | `app.jsx` | Session 1 | ❌ add |
| Colorblind-safe palette toggle (blue/orange instead of green/red) | `app.jsx` PreferencesPopover | Session 1 | ❌ add |
| Typography: Inter Tight (sans), Fraunces (serif display), JetBrains Mono (mono) | `theme.css` | Session 1 | ⚠️ specify fonts |
| font-feature-settings: 'ss01', 'cv11', 'tnum' | `theme.css` | Session 1 | ⚠️ specify |

---

## Summary — Session revisions needed

### Existing sessions to expand:
- **Session 1 (Theme)**: add density toggle, colorblind palette, futuristic-mode toggle, full icon set port, specific fonts
- **Session 2 (Widgets)**: register ALL dashboard cards as widgets (11 new card types), add filter popover, filter chips, position drawer inline-expanding
- **Session 3 (Chart)**: port AreaChart/CandleChart/MiniBars/Donut verbatim from charts.jsx, add all 13 range buttons (1D/2D/5D/10D/1M/3M/6M/YTD/1Y/2Y/5Y/10Y/MAX)
- **Session 4 (Options chain)**: expand strategy dropdown to 10+ options, add E/W expiration badges, Day/52w sparklines in header, Ex-div/Earnings badges, IV30/HV30 deltas
- **Session 5 (Position detail)**: swap modal → inline expanding row, add Purchase history + Fundamentals tabs, AI sentiment takeaway in News tab
- **Session 6 (AI Advisor)**: insights cards (Opportunity/Alert/Rebalance), context-aware symbol tracking
- **Session 8 (Trade)**: add draggable TradeDrawer, Quantity Shares/$ toggle + quick buttons, limit price ±adjust, Route dropdown, Trade capacity, Help mode, Placed-state confirmation
- **Session 9 (Real-time)**: notifications bell + badge, sync timestamps
- **Session 10 (Polish)**: CommandPalette fuzzy search

### NEW sessions to add:
- **Session 11 — Market Tape & Navigation Shell**: scrolling ticker, TopBar breadcrumb/search/bell/avatar, icon sidebar, Preferences popover
- **Session 12 — Futuristic Mode Home & Agents**: mode toggle, 9-workspace rail, agents sidebar, Home workspace (greeting + 3 briefs + 4 minis + narrative summary)
- **Session 13 — Trade Enhancements**: Level II order book, Copilot AI risk narrative, recent activity log
- **Session 14 — AI-Native Trade Commander**: prompt bar, voice dictation, parse chips, multi-order linked preview
- **Session 15 — AI-Native Options Intent Studio**: thesis input, intent knobs, ranked strategy cards, Tweak & Simulate with Monte Carlo payoff
- **Session 16 — Research Page**: 8 tabs, Analyst consensus, Bull/Bear AI brief, Financials, Company profile, Events, Price performance
- **Session 17 — Activity / Balances / Watchlists / Transfer**: all 4 remaining screens
- **Session 18 — Onboarding**: 4-step flow + account type selector

**Revised total: 18 sessions (was 10).**

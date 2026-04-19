# Feature Inventory — Extracted from Fidelity Screenshots

This document enumerates every UI element visible in the five Fidelity
screenshots you provided. Each item is a hard requirement for Phase 2.
Items marked **[✓]** are already done in v0.1; the rest are targets.

---

## Screenshot 1 — Positions Page (`Sankar TRADITIONAL IRA`)

### Header bar
- Account name with partial account number mask (e.g. "****4600")
- Link row: "Option summary" | "Manage dividends" | "Basket portfolios dashboard"

### Columns (per position row)
- **Symbol** (bold) with second-line full company name
- **Current price** (large) with second-line day change $ and arrow
- **Day $ change** over **day % change** (stacked, color-coded)
- **Total $ change** over **total % change** (stacked, color-coded)
- **Market value** (right-aligned)
- **% of portfolio** (2 decimal)
- **Quantity**
- **Cost basis**: total $ over $/share
- **52-week range visual**: horizontal bar with low/high markers and current position indicator

### Row types
- Cash row with yellow tint: "Cash HELD IN MONEY MARKET" — value + % port
- Equity rows (TWLO, SNOW, PSKY, PINS, etc.)
- **Option position rows** inline (NFLX 85 Put, NFLX 90 Put, NFLX 95 Put):
  - Strike + right (Put/Call) + expiry
  - **NE** (Near Expiration) badge, **E** (Earnings) badge
  - Contract values: bid, ask, change, volume
- Pending activity row (sub-total)
- Account total footer row:
  - Day $ change + day %
  - Total $ change + total %
  - Total market value

### Visual details
- Green for positive, red for negative
- Tabular-nums everywhere
- Hover row highlight
- Clickable row → position detail drawer
- Multi-account support (can have many TRADITIONAL IRA, Individual, etc.)

---

## Screenshot 2 — Options Trade Ticket (Close Position, NFLX)

### Header
- "Trade" title with icon row: more-options, sidebar-toggle, fullscreen, close X

### Form structure
- **Trade type dropdown**: Options (Stocks & ETFs | Options | Mutual Funds | Bonds)
- **Account dropdown**: "Sankar TRADITIO..." + `(221984600)` + **Tier 1** badge
- **Buying Power panel** (right-aligned):
  - Intraday: `$2,121.15`
  - Overnight: `$3,208.10`
- **Symbol row** (full quote strip):
  - Company name (Netflix)
  - Price with exchange code: `$98.128 FINY x100`
  - Day $ change + day %: `-$9.662 (-8.96%)`
  - `Bid XNMS 98.12 x 130`
  - `Ask XNMS 98.13 x 890`
  - `Volume 57,843,845`
  - `AS OF 04/17/26 10:49:06 AM ET` + refresh icon

### Strategy tabs
- **Calls & Puts** (active) | Straddle | Buy Write | Roll | Close Position | More Strategies ▼

### Order entry row 1
- **Action** dropdown: Buy to Open | Sell to Open | **Buy to Close** | Sell to Close
- **Quantity** numeric input: `3`
- **Call/Put** pill toggle: Call | **Put** (green highlight)
- **Expiration** dropdown: `Apr 17, 2026`
- **Strike** dropdown: `108.00`
- **Quote mini-strip** (right of strike): Bid `9.75 x 391` | Ask `9.95 x 294` | Mid `9.85` | Vol `1,293`
- **More ▼** expand button

### Order entry row 2
- **Order Type**: Limit | Market | Stop | Stop Limit | Trailing Stop
- **Limit Price $**: `9.95`
- **Time in Force**: Day | GTC | Day+ | GTC+
- **Trade Type**: Cash | Margin
- **Conditions**: None | AON | FOK
- **Route**: Auto | Specific exchange
- **Estimated Loss**: `-$1,899.00` (red) with external link icon

### Footer
- **Estimated Order Value**: `$2,986.95`
- **Included fees**: `$1.95`
- **Preview Order** button (full-width green primary)
- "Additional Important Information" link

---

## Screenshot 3 — Position Detail (AAL 12 Put)

### Contract mini-row (sticky at top)
- Contract label: "AAL 12 Put" + Apr-17-2026
- NE badge
- Then a row of metrics: price, change, %chg, day $, day %, contract-specific delta

### Main header
- Title: "AAL Apr-17-2026 $12 PUT"
- NE badge + "Expires today" link + "How your position is valued" link
- Close X button

### Action buttons (green pills)
- Buy to close | Sell to open | Roll

### Tabs
- Purchase history | **Research** (active)

### Quote panel (left column)
- Large price: `$0.01` + change `-$0.05 (-83.33%)`
- `Bid x Size: $0.00 x 0`
- `Ask x Size: $0.01 x 64`
- `Volume: 384`
- `Open interest: 22,964`
- `Previous close Apr-16-2026: $0.06`
- **Day range** horizontal bar visual: `$0.01 ◆ — ◆ $0.02`
- **Contract range** horizontal bar: `$0.01 ◆ — ◆ $2.00`
- Underlying row: `AAL` + `$13.3499 +$1.0799 (+8.801%)`

### Chart panel (middle column)
- Tabs: Underlying | Option
- OHLC header: `Apr-17-2026 O: 13.35 H: 13.35 L: 13.34 C: 13.35`
- Symbol watermark (`AAL AMERICAN AIRLINES`)
- Intraday chart
- Time buttons: **1D** | 5D | 1M | 3M | 1Y
- Frequency dropdown: `1 Minute`
- "Advanced chart" external link

### News panel (right column)
- Title: "Underlying News"
- News cards, each with:
  - Headline (clickable, underlined)
  - Publisher (REUTERS)
  - Date/time (Apr-17-2026 10:22 AM ET)

### Footer
- Research button (centered, green)

---

## Screenshot 4 — Options Chain (AAL)

### Top strip
- Symbol field: `AAL`
- Name: "American Airlines Gro..."
- Price: `$12.07 FINY x675`
- Change: `+$0.84 (+7.48%)`
- `Bid XNMS 12.06 x 29200`
- `Ask XNMS 12.07 x 38600`
- `Volume 76,593,642`
- **Day range** visual: `11.81 ◆ — ◆ 12.32`
- **52-week range** visual: `8.96 ◆ — ◆ 16.50` with dates `04/21/2025 — 01/07/2026`
- D and E badges (Dividend / Earnings)
- `AS OF 04/14/2026 3:24:16 PM ET`

### Put/call ratio indicator
- Circle icon + "Put/call ratio is 0.38 (bullish)"

### Tabs
- **Chain** (active) | Chart

### Filter bar
- **Option strategy** dropdown: Puts | Calls | Covered Calls | Spreads | etc.
- **Option classes** pill tabs: Calls | **Puts** (green) | Both
- **Strike prices** dropdown: `20` (6 | 10 | 20 | 50 | All)
- **Expiration dates** tabs (scrollable):
  - ◀ Apr 17 **E** | May 15 **E** | Jun 18 **E** | Jul 17 | Aug 21 | Sep 18 | Nov 20 | Dec 18 ▶
- **Show weekly options** toggle

### Chain table columns
| Strike | Last | Change | Bid | Ask | Volume | Open interest | Implied volatility | Delta |

### Chain table rows
- Group header with disclosure triangle: `▼ Nov 20, 2026 (M) (expires in 220 days)`
- Each strike row:
  - Checkbox ☐
  - Kebab menu ⋮
  - Strike value (left col)
  - Last, Change columns
  - **Bid button**: "Sell at 6.65" (red/pink)
  - **Ask button**: "Buy at 7.60" (light green)
  - Volume, OI
  - IV as percent
  - Delta (signed decimal)
- Yellow-highlighted cells on high-OI strikes (5, 8, 10, 12, 15, 17)
- Next expiry group: `▼ Dec 18, 2026 (M) (expires in 248 days)`

---

## Screenshot 5 — Stock Chart (TWLO)

### Header
- "Search from your owned positions" link
- Company logo (blue circle with @)
- "Twilio Class A" name
- Price: `$138.92 XNYS` + change `+1.96 (+1.43%)` + refresh icon
- "As of Apr-17-2026 11:36:00 AM ET"

### Action buttons
- Buy (green) | Sell (light green)
- Icons: bell (notifications), funnel (filters), link (copy)

### Quick quote cards (right side, 2 columns × 3 rows)
| Bid x size (XNYS) | $138.80 x 300 | Volume | 458,602 |
| Ask x size (EDGX) | $139.00 x 500 | 10/90-day avg volume | 3M / 2M |
| Day range | visual $137.24 — $140.38 | 52-week range | visual $80.90 ◆—◆ $145.90 |

### Tabs row
- Overview | **Chart +** (active) | Dividends & Earnings | Sentiment | Analyst Ratings | Comparisons | Statistics | View All

### Chart section
- "Chart" label + info (i) icon
- **Toolbar** (right):
  - Table toggle / `+` split
  - Draw | VS Compare | Indicators | Styles | Events | Analysis
  - **Save ▼** button (green)
  - Settings gear

### Chart body
- OHLC tooltip at top: `Feb-07-2025 O: 147.50 H: 148.31 L: 145.23 C: 145.65 V: 2.25 M`
- Fullscreen corner-arrow icon
- Candlestick series (2-year history)
- Volume bars at bottom with "volume 2,249,001.00" label
- Right-axis prices (155.91, 138.90, 125.00, etc.)
- Right-axis volume scale (5M, 10M, 15M, 20M)

### Bottom controls
- Date range picker: `Apr-17-2024 to Apr-17-2026`
- **Time range buttons**: 1D | 2D | 5D | 10D | 1M | 3M | 6M | YTD | 1Y | **2Y** | 5Y | 10Y | MAX
- **Frequency** dropdown: Daily (Intraday | Daily | Weekly | Monthly)
- **Scale toggles**: Log | Ext (extended hours)

---

## Feature summary (flat checklist)

### Themes & layout
- [ ] Light + Dark themes toggle
- [ ] Responsive layout, fills full viewport (no fixed max-width)
- [ ] Resizable columns
- [ ] Sticky table headers
- [ ] Tabular numbers globally
- [ ] Hover states on every clickable element

### Positions
- [ ] Multi-account grouping (each with own total)
- [ ] 9-column position row (symbol+name, price+day, day$+%, total$+%, value, %port, qty, cost basis, 52-week range bar)
- [ ] Cash-held row with tinted background
- [ ] Option positions inline (with NE/E badges)
- [ ] Pending activity row
- [ ] Account total footer with day + total change
- [ ] Click row → position detail drawer
- [ ] 52-week range horizontal mini-bar with markers

### Stock chart (full page & embedded)
- [ ] Candlestick with volume bars
- [ ] OHLC tooltip on crosshair
- [ ] Timeframes: 1D, 2D, 5D, 10D, 1M, 3M, 6M, YTD, 1Y, 2Y, 5Y, 10Y, MAX
- [ ] Frequency: Intraday / Daily / Weekly / Monthly
- [ ] Log / Linear / Extended hours toggle
- [ ] Drawing tools: trend line, horizontal line, rectangle
- [ ] Indicators: SMA, EMA, Bollinger, RSI, MACD
- [ ] Compare (overlay another symbol)
- [ ] Events overlay: earnings, dividends, splits
- [ ] Save view preset
- [ ] Zoom/pan with mouse
- [ ] Quick quote cards sidebar (bid, ask, volume, ranges)
- [ ] Buy/Sell action buttons

### Options Chain
- [ ] Symbol quote strip (same as stock page top)
- [ ] Put/call ratio sentiment indicator
- [ ] Strategy dropdown (Puts/Calls/Covered/Spreads)
- [ ] Calls/Puts/Both toggle — **strike column stays centered**
- [ ] Strike range count selector (6/10/20/50/All)
- [ ] **Min strike / Max strike** numeric inputs
- [ ] Expiration date pill tabs (scrollable horizontally, with E/M badges)
- [ ] Show weekly options toggle
- [ ] Columns: Strike | Last | Change | Bid | Ask | Volume | OI | IV | Delta
- [ ] Grouped by expiry with disclosure triangles
- [ ] **Clickable Buy at / Sell at buttons** (open trade ticket)
- [ ] Row checkboxes + kebab menu (for multi-leg strategies)
- [ ] ATM + high-OI row highlighting (yellow tint)
- [ ] Sticky table header

### Trade Ticket
- [ ] Modal with Trade type / Account / Buying Power strip
- [ ] Full quote strip for selected symbol
- [ ] Strategy tabs (Calls & Puts, Straddle, Buy Write, Roll, Close, More)
- [ ] Action dropdown (Buy to Open/Close, Sell to Open/Close)
- [ ] Quantity, Call/Put toggle, Expiration, Strike
- [ ] Inline quote strip for selected option
- [ ] Order Type, Limit Price, TIF, Trade Type, Conditions, Route
- [ ] Estimated Loss/Profit indicator
- [ ] Estimated Order Value + fees breakdown
- [ ] Preview Order button
- [ ] Submit → broker deep-link (Fidelity / Robinhood / Public / Schwab)

### Position Detail Drawer
- [ ] Contract/equity title with badges (NE, E)
- [ ] Action pills (Buy to close / Sell to open / Roll / Buy More / Trim)
- [ ] Tabs: Purchase history | Research | Chart | News | AI Analysis
- [ ] Quote panel (bid/ask/vol/OI/ranges/underlying)
- [ ] Embedded intraday chart with 1D/5D/1M/3M/1Y buttons
- [ ] News feed (Reuters/AP/etc with timestamps)
- [ ] Research CTA

### AI Advisor
- [ ] Persistent right-rail panel (collapsible)
- [ ] Conversation history persisted locally
- [ ] Multi-conversation support
- [ ] Streaming responses (SSE)
- [ ] **3 suggested follow-up chips** after each response (Copilot style)
- [ ] Context awareness (knows active symbol)
- [ ] Markdown rendering
- [ ] Export conversation

### News & Sentiment
- [ ] Per-symbol news feed (Polygon news API)
- [ ] Put/call ratio sentiment indicator on chain
- [ ] Analyst ratings tab (price targets from Polygon)
- [ ] Sentiment tab (social + news scores)

### Real-time feel
- [ ] SSE live quote stream
- [ ] Price flash animation (green/red pulse on change)
- [ ] Connection status indicator (green/amber/red dot)
- [ ] Last-updated timestamps on every panel
- [ ] Refresh buttons

### Customization
- [ ] Widget-based dashboard (drag/resize/hide)
- [ ] Layout presets (Day Trader, Long-Term, Hedger, Minimal)
- [ ] User-saved custom layouts
- [ ] Per-user theme, timezone, default ranges

### Caching (dev mode)
- [ ] Tiered TTL policy
- [ ] 90% cache / 10% fresh sampling
- [ ] Prewarm on startup
- [ ] Cache inspector admin panel (Ctrl+Shift+C)

### Accessibility
- [ ] Keyboard shortcuts (/, Esc, ?, g+letter, Ctrl+K command palette)
- [ ] ARIA labels, focus-visible rings
- [ ] Color contrast AA in both themes
- [ ] Screen reader support on tables

### Performance
- [ ] Code splitting (React.lazy per widget)
- [ ] Virtual scrolling on long lists
- [ ] Error boundaries per widget
- [ ] Skeleton loading states everywhere
- [ ] Lighthouse ≥ 90 (performance) / ≥ 95 (a11y)

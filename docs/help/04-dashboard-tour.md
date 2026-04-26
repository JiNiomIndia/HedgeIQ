# A tour of the HedgeIQ dashboard

The dashboard is a six-widget grid that you can rearrange to your taste. This page walks you through each widget and shows you how to switch layouts.

![Annotated HedgeIQ dashboard with six widgets visible](/help-screenshots/dashboard.svg)

## The six widgets

### 1. Positions table

The big table on the left side. One row per holding, across every broker you've connected. Columns:

- **Symbol** — the ticker (e.g., AAL, AAPL, NVDA).
- **Broker** — which account it's in. If you have multiple accounts at the same broker, the account nickname appears here.
- **Quantity** — number of shares.
- **Avg cost** — your cost basis.
- **Current** — last trade price (Polygon, refreshed roughly every 30 seconds).
- **Day P&L** — change since today's open, dollars and percent.
- **Total P&L** — change since you bought, dollars and percent.

Click any row to open the **position drawer** — a side panel with a price chart, news headlines, and a button to send the position to the hedge calculator.

### 2. Market tape

The thin scrolling strip across the top. Shows live quotes for the major indices (SPY, QQQ, DIA), the VIX, and any tickers you've pinned. Pin a ticker by typing it in the **Watchlist** field and pressing Enter.

The tape uses the same Polygon feed as the positions table, so prices match. Color: green if up on the day, red if down.

### 3. Hedge calculator

The form-and-cards widget in the middle. Type a symbol, share count, entry price, and current price, then click **Find Best Hedge**. Within a couple seconds you get the top three protective-put recommendations.

Full details on this widget at [/help/05-hedge-calculator](/help/05-hedge-calculator).

### 4. AI advisor

The chat panel on the right. Ask questions in plain English about options, hedging, or any term you don't recognize. Streaming responses, multi-turn conversation, and quick-reply chips for common questions.

Full details at [/help/06-ai-advisor](/help/06-ai-advisor).

### 5. Options chain

A separate widget you can pull up by typing a ticker into the Options Chain field. Shows calls and puts in a strike-ladder grid with bid/ask, volume, open interest, and IV.

Full details at [/help/07-options-chain](/help/07-options-chain).

### 6. Preferences popover

The gear icon in the top right corner of the dashboard. Opens a popover with theme switcher, density toggle, mode (Classic / Futuristic), and accessibility settings (colorblind mode, reduced motion).

Full details at [/help/09-themes-preferences](/help/09-themes-preferences).

There's also a **sign out** button at the very bottom of this popover — that's the cleanest way to log out.

## The four layout presets

The dashboard ships with four named layouts. Switch between them from **Edit Layout → Presets**.

### Day Trader

Maximizes the market tape and the options chain. Positions table is compressed to a single column on the left. Best for traders who are watching short-term moves and want options data front-and-center.

### Long-Term

Maximizes the positions table. The hedge calculator and AI advisor share the right column. Market tape is hidden. Best for buy-and-hold investors who check in once a day.

### Hedger

The default. Equal real estate for the positions table, hedge calculator, and AI advisor. Market tape across the top, options chain available on demand. Best for the use case the product was built for: deciding whether and how to protect a long position.

### Minimal

Just the positions table and the AI advisor. Useful when you want to chat about your portfolio without the visual noise of charts and options data.

## Editing your layout

Click **Edit Layout** in the top toolbar. The dashboard enters drag mode — every widget gets a drag handle in its header and a corner resize handle.

- **Drag** a widget by its header to move it.
- **Resize** a widget by dragging its lower-right corner.
- **Remove** a widget with the × in its header.
- **Add** a widget back with the **+ Add widget** dropdown that appears in edit mode.

Click **Done** to lock the layout.

## Where your layout is saved

Your custom layout is stored in your browser's `localStorage` under the key `hedgeiq_layout`. That means:

- It survives you closing the tab and coming back later.
- It survives you logging out and logging back in (same browser).
- It does **not** sync between browsers or devices yet. Layout sync is on the roadmap for the next major release.

If you've made a mess and want to start over, **Edit Layout → Reset to default** restores the Hedger preset.

## Keyboard shortcuts

The dashboard supports a small set of keyboard shortcuts. They work whenever the focus isn't in a text field.

| Shortcut       | Action                          |
| -------------- | ------------------------------- |
| `g` then `d`   | Go to dashboard                 |
| `g` then `p`   | Open the preferences popover    |
| `g` then `s`   | Open settings                   |
| `/`            | Focus the AI advisor input      |
| `t`            | Cycle through themes            |
| `?`            | Show this list of shortcuts     |
| `Esc`          | Close any open popover or modal |

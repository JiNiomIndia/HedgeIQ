# The positions table

A unified view of every holding across every broker you've connected.

![Positions drawer with chart and news](/help-screenshots/positions-drawer.svg)

## Multi-broker view

If you've connected Robinhood, Fidelity, and IBKR, the positions table shows all three brokers' holdings in one list. Each row is tagged with the broker (and the account name, if you have multiple accounts at one broker).

The table de-duplicates *contracts* but not *positions* — if you hold AAPL in two different brokerage accounts, you'll see two AAPL rows. That's intentional. It mirrors how your money is actually allocated, which matters for tax-loss harvesting and rebalancing.

## Day P&L vs Total P&L

Two P&L columns. They mean different things:

- **Day P&L** — change since today's market open. Resets every morning at 9:30am ET. Useful for short-term traders.
- **Total P&L** — change since you bought the position. Uses your average cost basis as the anchor. This is what you'd realize if you closed the position right now.

Both columns show dollars and percent. Color: green for positive, red for negative. The colorblind-friendly mode in preferences swaps these for blue/orange.

## The position drawer

Click any row in the positions table and a side panel slides in from the right. The drawer has three sections:

### 1. Price chart

A candlestick chart powered by [Lightweight Charts](https://www.tradingview.com/lightweight-charts/) with timeframe buttons: 1D, 5D, 1M, 3M, 1Y, 5Y. The chart uses Polygon historical data.

### 2. News headlines

The five most recent news headlines for the ticker, with source and timestamp. Click any headline to open the source article in a new tab. News is sourced from Polygon's news API.

### 3. Quick actions

Two buttons at the bottom of the drawer:

- **Hedge this position** — sends the symbol, shares, and current price to the [hedge calculator](/help/05-hedge-calculator).
- **Ask AI advisor** — opens the AI advisor with the position pre-loaded as context. *"What's the outlook on AAL?"*

Close the drawer with the × in its top-right corner, by clicking outside it, or by pressing Escape.

## Refresh frequency

The positions table auto-refreshes every 30 seconds while the dashboard tab is in focus. When you switch to another tab, refresh pauses to save bandwidth. Switch back and the refresh resumes within a few seconds.

You can force an immediate refresh by clicking the circular arrow icon in the table header.

## Sorting (planned)

Sortable columns are on the roadmap. For now, the default sort is by total P&L descending — your biggest winners on top, biggest losers on the bottom. Manual sorting will land in the next release.

## Filtering

A filter row above the table lets you:

- **By broker** — show only positions from one connected broker.
- **By type** — equities only, options only, or both.
- **Search** — type a ticker to highlight matching rows.

## Caveats

- **Cost basis is what your broker reports.** If you've moved shares between accounts (a transfer in kind), some brokers report the original cost, others report the transfer-date price. We use whatever the broker gives us. Check your broker's records if total P&L looks off.
- **Options positions show as separate rows.** A long put on AAL appears as its own row, not as a modifier to the AAL stock row. We don't currently consolidate stock + option into a "delta-adjusted" view.
- **Fractional shares are supported.** If your broker reports fractions (Robinhood, Public, M1), they're reflected accurately.

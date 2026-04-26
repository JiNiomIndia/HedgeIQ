# The options chain

The options chain widget shows you every available call and put contract for a ticker, organized as a strike ladder. It's the same data your broker shows you, just laid out for fast scanning.

![Options chain showing calls and puts in strike ladder](/help-screenshots/options-chain.svg)

## What is an options chain?

An option contract gives you the right (but not the obligation) to buy or sell 100 shares of a stock at a specific price (the **strike**) on or before a specific date (the **expiration**).

A **call** option gives you the right to buy. A **put** option gives you the right to sell.

The "chain" is the matrix of all available contracts for a ticker — every strike at every expiration. A typical ticker like AAPL has hundreds of contracts active at any time.

## How to load a chain

Type a ticker into the **Options Chain** field at the top of the widget and press Enter (or click **Load Chain**). The widget queries Polygon and renders the chain — typically in under a second for liquid names.

## Reading the layout

The chain is laid out as a strike ladder with three columns:

- **Calls** on the left.
- **Strikes** in the center.
- **Puts** on the right.

For each contract you see five values: bid, ask, last, volume, and open interest. There's a sixth column for IV (implied volatility) that you can toggle on.

Strikes near the current stock price are highlighted in the center — those are the **at-the-money (ATM)** contracts, the most actively traded.

## The Calls / Puts / Both filter

Three radio buttons above the table. Most use cases want **Both**, but for a quick scan you can hide one side:

- **Calls** — only call contracts. Useful when you're thinking about generating income (covered calls) or speculating on upside.
- **Puts** — only put contracts. Useful when you're thinking about hedging (this is the most common case in HedgeIQ).
- **Both** — the full chain.

## Choosing an expiration

A dropdown at the top of the widget lets you pick the expiration date. The default is the nearest monthly expiration (third Friday of the month) because monthlies are the most liquid. You can also pick weekly expirations (every Friday for major tickers) and LEAPS (longer than 1 year out).

## What "IV" means

**Implied volatility** is the market's expectation of how much the underlying stock will move between now and expiration, expressed as an annualized percentage. Higher IV = more expected movement = more expensive options.

For context:

- IV around **20-30%** is normal for a stable large-cap (KO, JNJ).
- IV around **40-60%** is normal for a growth stock without major news (AAPL, MSFT).
- IV above **80%** typically means there's a known catalyst — earnings within days, an FDA decision, a binary event.
- IV above **150%** is meme-stock territory.

When IV is high, options are expensive. When IV crashes after the catalyst (earnings prints, decision announced), option prices drop sharply even if the stock barely moves — this is **IV crush** and it's the main reason buying short-dated options around earnings often loses money even when you're directionally right.

## Click a row to send to AI advisor

Click any contract row and a context chip appears in the **AI advisor** panel: *"Asking about: AAL $10 PUT, 45 DTE."* Your next message will be answered with that specific contract in context. Useful for *"explain this option"* questions: *"What's the breakeven on this contract? When would it pay off?"*

## Volume vs Open Interest

Both columns measure activity, but they're different:

- **Volume** is how many contracts traded **today**. A high-volume contract is one people are actively buying or selling right now.
- **Open interest (OI)** is how many contracts exist **in total** — open positions that haven't been closed. High OI means lots of people already hold this contract.

For hedging, OI matters more than volume. You want to be in a contract you can exit later, which means it needs to have established demand. The hedge calculator filters for OI ≥ 5,000.

## Bid, ask, mid, last

- **Bid** — the highest price a buyer is currently offering.
- **Ask** — the lowest price a seller is currently asking.
- **Mid** — the average of bid and ask. Often used as the "fair" price.
- **Last** — the most recent trade. Can be stale if the contract hasn't traded in a while.

The **bid-ask spread** (ask minus bid) is a measure of liquidity. A spread of $0.01–$0.05 on a $1.50 contract is tight (good liquidity). A spread of $0.50 on a $1.50 contract is wide (bad liquidity) — you'll lose money on the round-trip just to enter and exit.

## How fresh is the data?

Polygon's options data is delayed by up to 15 minutes for the free tier we use. For most hedging decisions, that's fine — IVs and premiums don't move dramatically minute-to-minute outside of major news. If you need real-time options data for active trading, your broker's app is a better source.

## Caveats

- **Bid/ask can be misleading off-hours.** Outside market hours (Mon–Fri 9:30am–4:00pm ET), quotes are last-known and can be stale. Don't trust the chain for trading decisions outside RTH.
- **Some strikes show $0.00 bid.** That means there's no active bid — nobody wants to buy this contract at any price right now. Treat it as illiquid.
- **Far-OTM strikes are noisy.** Strikes far away from the current stock price often have erratic data. Stick to within ~30% of spot for any decision-making.

# The hedge calculator

The hedge calculator is the core feature of HedgeIQ. Type four numbers, click a button, get three protective-put recommendations ranked by value. This page explains exactly how it works, what the inputs mean, and how to interpret the results.

![Hedge calculator with AAL example and three recommendation cards](/help-screenshots/hedge-calculator.svg)

## When to use this widget

The hedge calculator is for one specific situation: **you own shares of a stock and you're worried about a near-term drop**. It tells you what it would cost to buy a protective put — an option that pays off if the stock falls below a chosen price.

Use it when:

- You hold a single-name long position large enough that a 10–20% drop would matter.
- You have a specific catalyst on the horizon (earnings, FDA decision, macro event) that could move the stock.
- You want to compare the cost of protection against the size of the position before deciding whether protection is worth it.

It's *not* the right tool for:

- Hedging a diversified ETF (use SPY puts directly — the calculator doesn't optimize for index hedges yet).
- Speculating on a downside move (you'd buy puts unrelated to your position size).
- Hedging crypto holdings (we don't fetch options chains for crypto).

## The inputs

Four fields. Two are auto-populated when you click a row in the positions table.

### Symbol

The ticker you want to hedge. US-listed equities only — `AAL`, `AAPL`, `NVDA`, `TSLA`, etc.

### Shares

How many shares you own. Standard equity options cover 100 shares per contract, so the calculator computes how many contracts you'd need (`ceil(shares / 100)`) to fully hedge. For 5,000 shares, that's 50 contracts.

### Entry price

The average price you paid per share. Used to compute "downside cushion" — how far the stock can fall before you're at a loss on the underlying.

### Current price

Today's price. Auto-populated from Polygon when you click into the field. The calculator uses this to filter out strikes that are too far out-of-the-money to be meaningful protection.

## What "Find Best Hedge" does

When you click the button, HedgeIQ:

1. **Fetches the live options chain** for your ticker from Polygon — every put contract with at least 14 and at most 90 days to expiry.
2. **Filters for liquidity** — keeps only contracts with open interest ≥ 5,000 (so you can actually exit the trade if you need to) and a bid-ask spread ≤ 10% of mid.
3. **Scores each contract** on three dimensions:
   - **Coverage** — how much of your downside the put protects. A strike at 95% of current price covers a 5% drop; a strike at 90% covers a 10% drop.
   - **Cost** — premium as a percent of position value. Lower is better, all else equal.
   - **Time** — DTE (days to expiry). The "right" amount of time is context-dependent; the calculator currently optimizes for 30–60 days.
4. **Ranks the top 3** by a composite value score and returns them as cards.

The scoring formula and exact weights are documented in the technical wiki at [/wiki/07-hedge-algorithm](/wiki/07-hedge-algorithm) for anyone who wants to read the source.

## Worked example: AAL

Inputs:

- Symbol: `AAL`
- Shares: `5000`
- Entry price: `$11.30`
- Current price: `$10.97`

Click **Find Best Hedge**. The calculator returns something like:

| Rank | Strike  | Expiration   | Premium   | Total cost (50 contracts) | Coverage | Value score |
| ---- | ------- | ------------ | --------- | ------------------------- | -------- | ----------- |
| 1    | $10.00  | 45 days out  | $0.25     | $1,250                    | -8.8%    | **88**      |
| 2    | $10.50  | 45 days out  | $0.42     | $2,100                    | -4.3%    | 81          |
| 3    | $9.50   | 30 days out  | $0.13     | $650                      | -13.4%   | 74          |

What the columns mean:

- **Strike $10.00** — the put pays off if AAL closes below $10.00 at expiration. You're insured against drops below $10.00.
- **Premium $0.25** — what each contract costs. One contract = 100 shares of coverage = $25 in cost.
- **Total cost $1,250** — what hedging your full 5,000-share position costs. That's 0.46% of position value (5,000 × $10.97 = $54,850, divided into $1,250).
- **Coverage -8.8%** — the strike is 8.8% below current price. The put doesn't pay anything until AAL drops at least that far.
- **Value score 88** — composite ranking. Higher is better.

The top recommendation is the $10 strike at $0.25. For roughly 0.5% of position value, you've capped your worst-case loss for the next 45 days. If AAL goes to $9.00, you lose $0.97 × 5,000 = $4,850 on the shares but make ($10 - $9) × 5,000 = $5,000 on the puts (minus the $1,250 premium, net +$3,750 from the hedge — protecting most of the underlying loss).

## What if I get "No liquid options"?

Two possible reasons.

### The ticker doesn't have actively-traded options

Some smaller-cap stocks have options listed but barely any volume. The calculator filters for open interest ≥ 5,000 because below that, exiting the position becomes very expensive — wide spreads, slow fills, and price slippage. If your ticker fails this filter for every contract, you'll see the message.

What to do: nothing, in the calculator. If you really want to hedge, you can do it manually in your broker — but you should be aware of the liquidity risk. A more practical alternative is to hedge with an index ETF put (SPY, QQQ) and accept the imperfect correlation.

### The chain is unavailable

Occasionally Polygon's options data lags or a particular ticker has a temporary feed issue. Wait a minute and try again. If it persists, the [status page](/status) will show whether it's a known issue.

## Caveats and limitations

- **The calculator is informational, not advice.** It tells you what the market is pricing puts at and ranks them by a value heuristic. It doesn't know your tax situation, your risk tolerance, or your view on the stock.
- **Premium is a real cost.** If the stock doesn't drop, the put expires worthless and you lose the premium. Hedging is insurance — most insurance policies don't pay out.
- **DTE 14–90 days only.** Short-dated weeklies and long-dated LEAPS aren't included. Weeklies are too risky (decay accelerates rapidly), LEAPS are too expensive for short-term concerns.
- **Equities only.** ETF puts work too (most ETFs have liquid chains). Crypto, futures, and international stocks are not supported.
- **One position at a time.** Multi-leg strategies (collars, spreads) aren't in the calculator yet.

## Where to go next

- **[AI advisor](/help/06-ai-advisor)** — ask Claude to walk through any of the recommendations in plain English. *"Why is the $10 strike a better deal than the $10.50?"*
- **[Options chain](/help/07-options-chain)** — see the full chain for your ticker if you want to look beyond the top 3.
- **[Glossary](/help/14-glossary)** — every options term used on this page, defined.
- **[Hedge algorithm internals](/wiki/07-hedge-algorithm)** — the technical wiki has the full scoring formula.

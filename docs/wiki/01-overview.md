# 01 — Overview

## What HedgeIQ is

HedgeIQ is an AI-powered hedge calculator for retail equity investors. It connects to your brokerage (Fidelity, Interactive Brokers, Robinhood, Public — via SnapTrade), reads your live positions, and — when you're worried about a stock — recommends specific put options that protect the position cheaply, ranked by a *value score* (downside coverage per dollar of premium).

The product is built around a single user story: a retail investor sees bad news about a stock they hold, wants to hedge before the next open, but doesn't know which option to buy. HedgeIQ answers that in under a minute.

## The AAL origin story

On the Sunday night of an Iran-US peace-talks collapse, our founder held 5,000 shares of American Airlines (AAL) at $4.71 average cost. Oil prices spiked in after-hours trading. Airline stocks were guaranteed to gap down on Monday's open.

The founder knew the right move: buy protective puts. But:

- The Fidelity options chain showed 240+ contracts.
- Strike prices, premiums, open interest, implied vol — all in a dense table.
- It was 11pm. Markets opened in 10 hours. He had no analyst, no Bloomberg terminal, no time.

He froze. Markets opened. AAL gapped down 6%. The position lost $2,355 — money that a $400 put position could have offset.

> "I knew the answer. I just couldn't get to it fast enough."

That's the gap HedgeIQ closes.

## Who it's for

- **Retail investors** with $25k–$500k portfolios who hold concentrated positions in single stocks.
- **Active traders** who already understand options at a basic level but don't have time to research each hedge.
- **Self-directed pros** (lawyers, doctors, founders) who manage their own money outside work hours.

## What HedgeIQ is *not*

- A robo-advisor (no allocation management).
- A discount broker (no order execution).
- A research terminal (no Greeks lab, no IV surface).

It is a *decision-support tool* for one specific question: *given this position and this risk, which put should I buy right now?*

## Product pillars

1. **Unified dashboard** — your positions, your charts, the relevant news, your AI assistant — all on one page.
2. **Smart hedge calculator** — the value-score-ranked top 3 puts for any position, in plain English.
3. **Plain-English AI** — Claude Haiku translates the recommendation: "Strike $42 put, expires Mar 15, costs $400, protects $2,000 of downside if AAL drops to $40."
4. **Smart caching** — option chains and AI responses are cached server-side so frequent users don't pay the latency or API cost.

See [02-architecture.md](02-architecture.md) for how this is realised in code.

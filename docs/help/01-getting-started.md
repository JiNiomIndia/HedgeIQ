# Getting started with HedgeIQ

Welcome. This page walks you through what HedgeIQ is, the story behind it, and the three things you need to do to go from "just signed up" to "first hedge calculated."

If you're already past the sign-up page and just want to connect your broker, jump straight to the [broker connection guide](/help/03-connect-broker).

## What is HedgeIQ?

HedgeIQ is an AI-powered options hedging assistant for active retail investors. You connect your brokerage account (read-only — we never trade for you), HedgeIQ pulls your live positions, and then it helps you answer one specific question: *"If a stock I own dropped tomorrow, how would I protect against it, and what would the protection cost?"*

The product wraps three things into one dashboard:

1. A **live positions view** that consolidates every brokerage account you connect.
2. A **hedge calculator** that ranks the top three protective-put contracts for any stock you hold.
3. An **AI advisor** powered by Claude that answers options questions in plain English — no jargon required.

We're not a brokerage. We don't execute trades. We don't take custody of your money or your shares. Everything you do in HedgeIQ is informational. When you're ready to actually buy a put, you do it from your own brokerage app.

## The AAL story

In March 2024 the founder was holding 5,000 shares of American Airlines (AAL) at an average cost of $11.30. The position had drifted down a few percent on news headlines. Buying protective puts would have cost about $0.45 per contract — call it $2,250 in premium for the entire position over 60 days. He didn't pull the trigger.

Two weeks later AAL dropped from roughly $11.00 to $10.53 on a quarterly earnings miss. The realized loss was $2,355. The hedge that wasn't bought would have paid back about three times its premium. The lesson wasn't *"options always work"* — sometimes they expire worthless and the premium is wasted insurance. The lesson was that **comparing the cost of protection against the size of the position should take fifteen seconds, not fifteen minutes**.

That's what HedgeIQ does. Type a ticker, type your share count, and within seconds you see three viable put contracts with their cost, expiration, and a simple value score. It's the tool we wished existed in March 2024.

## What you'll do in the next five minutes

Three steps:

### 1. Sign up

Click **Get started — free** on the [landing page](/), enter an email and a password (8+ characters), and you'll land on the dashboard. There's no credit card, no questions about your portfolio size, and no waiting list.

The free tier gives you 5 AI advisor calls per day. That's enough to evaluate the product on real positions. If you outgrow it, Pro is available — see the [daily limits page](/help/11-daily-limits).

### 2. Connect a broker

Once you're on the dashboard, click **Connect a broker** in the empty positions panel. We use [SnapTrade](https://snaptrade.com) — a regulated financial-data aggregator — to handle authentication. Your brokerage credentials never touch HedgeIQ's servers; they go directly from you to your broker through SnapTrade's secure popup.

Authorization is read-only. SnapTrade returns a token that lets us *see* your positions; it doesn't let us *trade* them. You can revoke this access at any time, both from inside HedgeIQ and from your broker's website.

The full broker walkthrough lives at [/help/03-connect-broker](/help/03-connect-broker). It covers Robinhood, Fidelity, Interactive Brokers, Schwab, E*TRADE, Webull, Public, TastyTrade, and a dozen others.

### 3. Run your first hedge

When your positions show up (usually within 30 seconds of connecting), pick one. We'll use the AAL example.

Open the **Hedge Calculator** widget. Fill in:

- Symbol: `AAL`
- Shares: `5000`
- Entry Price: `11.30`
- Current Price: `10.97`

Click **Find Best Hedge**. Within a second or two, three protective-put contracts appear, ranked by a value score that combines premium cost, downside coverage, and time-to-expiry. Each card shows the strike, the expiration date, the cost per contract, and the total cost to hedge your full position.

You haven't bought anything yet. You're just looking at the menu. The actual trade — if you decide to take it — happens in your brokerage app.

![HedgeIQ dashboard with positions, hedge calculator, and AI advisor visible](/help-screenshots/dashboard.svg)

## What's next?

- **[Take the dashboard tour](/help/04-dashboard-tour)** — learn what each of the six widgets does and how to rearrange them.
- **[Read about the hedge calculator in detail](/help/05-hedge-calculator)** — including how the value score is computed and what to do when the calculator says "no liquid options."
- **[Try the AI advisor](/help/06-ai-advisor)** — ask it to explain protective puts, IV, or any term you don't know.
- **[See the full FAQ](/help/13-faq)** — answers to the questions everyone asks first.

Welcome aboard.

# Daily limits and pricing

Most of HedgeIQ is unlimited on the free tier. The one thing that's metered is the AI advisor, because every call to Claude costs us real money and abuse mitigation matters.

## What's metered

Just one thing: **AI advisor calls**.

- **Free tier**: 5 AI calls per day, resetting at midnight UTC.
- **Pro tier**: unlimited.

A "call" is one outbound message from you. When you press Enter on the chat input or click a quick-reply chip, that's one call. The streaming response that comes back can be a paragraph or a page — it's still one call.

The "Explain" button on hedge calculator cards also counts as one call (it generates a tailored explanation of that specific contract).

## What doesn't count

Almost everything else:

- Loading the dashboard — free.
- Refreshing positions — free.
- Loading an options chain — free.
- Running the hedge calculator — **free, unlimited**.
- Switching themes, customizing layouts, adding watchlist tickers — free.
- Connecting or disconnecting brokers — free.
- Reading news in the position drawer — free.
- Loading any help center page — free.

The hedge calculator is unlimited specifically because it's the core feature. We never want anyone to feel rate-limited on the thing the product is built for.

## Why limits at all?

Two honest reasons.

### 1. Cost control

Every AI call goes to Anthropic's API and costs HedgeIQ a few cents (depending on input length and response length). At scale, with no limits, a single user running an automated script could burn through hundreds of dollars in a day. Five-per-day on the free tier keeps the median user well within unit economics while letting us offer free access at all.

### 2. Abuse prevention

Free unlimited AI access is one of the most-abused things on the internet. Without rate limits, scrapers and resellers would route their traffic through HedgeIQ to get free Claude access. The 5/day limit makes that uneconomical without affecting genuine users.

## When the limit hits

The chat input disables. A banner appears: *"You've used today's 5 AI calls. Reset in 4h 12m."* The countdown updates live.

Everything else still works. You can run the hedge calculator, browse the options chain, look at positions, switch themes — only the AI is paused.

The reset happens at 00:00 UTC. That's:

- 8:00pm ET / 5:00pm PT (winter)
- 7:00pm ET / 4:00pm PT (summer / daylight saving)

If you're in another timezone, you can check the exact reset time in your preferences popover.

## Upgrading to Pro

When Pro launches at GA, the upgrade flow will be:

1. Click **Upgrade** in any rate-limit banner or in **Settings → Plan**.
2. Pick monthly or annual.
3. Enter payment info (Stripe).
4. Done. Limits lift immediately.

**Pricing is not finalized.** During the open beta, there's no Pro tier — the 5/day limit is the only tier. We'll announce pricing 30 days before any change, and current free users will get a grandfathered window.

If you're a power user who's hitting the limit daily and want early Pro access, [email us](mailto:contact@hedgeiq.app). We're slowly onboarding Pro testers in exchange for feedback.

## What if I share an account?

We don't currently restrict accounts to single users. Sharing a free-tier account splits 5 calls across the people sharing — which usually means everyone runs out fast. Pro accounts will have the same model: unlimited, but tied to a single login. Team accounts (multi-seat) are post-GA.

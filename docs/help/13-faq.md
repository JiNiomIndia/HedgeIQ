# Frequently asked questions

## Is this financial advice?

**No.** HedgeIQ is an informational tool that shows you market data and runs a value heuristic over options contracts. It does not know your tax situation, your overall financial goals, your risk tolerance, or your view on any specific stock. Nothing in HedgeIQ — including the AI advisor — should be construed as a recommendation to buy, sell, or hold any security. If you need personalized advice, talk to a licensed advisor.

The AI advisor is explicitly prompted to refuse specific buy/sell recommendations. If it ever crosses that line in a response, please [email us](mailto:contact@hedgeiq.app) — that's a bug we want to fix.

## Is my data secure?

We do everything reasonable for an early-stage product:

- Passwords are hashed with PBKDF2-HMAC-SHA256 (600k iterations, per-user salt). We can't read your password even if we wanted to.
- Sessions are signed JWTs in `httpOnly` cookies. They can't be read by JavaScript.
- HTTPS-only, with HSTS preload.
- SnapTrade tokens are encrypted at rest (per-user secret).
- We don't store broker credentials. Ever. They flow you → broker through SnapTrade.
- Backend hosted on Railway (US region); frontend on Vercel (US region). All traffic encrypted in transit.

What we don't have yet: SOC 2 (we're a small team — formal compliance is post-GA), per-user MFA (planned for the next release), and field-level encryption of position data (low priority — positions aren't a high-value target).

If you find a security issue, email [contact@hedgeiq.app](mailto:contact@hedgeiq.app) with the subject "Security disclosure." We respond within 24 hours and don't pursue good-faith researchers.

## What happens if I disconnect a broker?

The SnapTrade token is revoked, the cached positions are deleted from our database, and the broker disappears from your positions table. Your broker account itself is completely untouched — we never had access to anything beyond read-only positions, and we no longer have even that.

## Can HedgeIQ execute trades on my behalf?

**No.** We negotiate read-only OAuth scopes with every broker through SnapTrade. There is no code path in HedgeIQ that submits orders. Adding trade execution would require a new round of broker negotiations, regulatory review, and a different product entirely — it's not on the near-term roadmap.

When you want to place a trade based on what you see in HedgeIQ, you do it in your broker's app.

## How accurate is Polygon market data?

Polygon is a tier-1 market data vendor — same source used by major brokers, fintechs, and quant shops. Stock quotes are real-time during market hours; options data is delayed by up to 15 minutes on the tier we use. For hedging decisions, that's plenty fresh — premiums don't whip around minute-to-minute outside of major news.

If you're doing high-frequency trading, your broker's app will have faster data. HedgeIQ isn't optimized for that.

## Why use Claude over GPT?

Three reasons we picked Claude:

1. **Refusal behavior on financial advice.** Claude is more careful than GPT about specific buy/sell recommendations, which matches our disclaimer.
2. **Long context windows.** Claude's 200k-token context lets us include your full position list and conversation history without truncation.
3. **Streaming feel.** Claude's token-by-token streaming is noticeably smooth.

We may revisit this as both vendors evolve. The integration is abstracted enough that switching providers is a config change.

## Is this open source?

Yes. HedgeIQ is open source on GitHub: [github.com/JiNiomIndia/HedgeIQ](https://github.com/JiNiomIndia/HedgeIQ). Contributions welcome.

The hosted version at hedgeiq.app uses our keys for SnapTrade and Anthropic. If you want to self-host, you'd need to bring your own keys for both. The README has setup instructions.

## Can I export my data?

Not yet, but it's on the roadmap. Planned formats: CSV (positions, hedge calc results, AI conversation history). ETA: Q2 2026.

If you need an export urgently, email us — we can pull your data manually.

## Where are the servers located?

- Frontend: Vercel (multi-region edge, US primary).
- Backend: Railway (US East region).
- Database: SQLite on a Railway-attached volume.
- Market data: Polygon (US East).
- AI: Anthropic API (US).

Everything is in US data centers. International users can absolutely use HedgeIQ — latency from Europe and Asia is around 100–200ms which is fine for a non-trading product. We don't currently have plans to deploy to other regions.

## What about international users?

You can use HedgeIQ from anywhere. The catches:

- The hedge calculator is US-equities-only. If you only hold UK or AU listings, the calculator can't help you (yet).
- Crypto exchanges work globally.
- Currency display is per-broker — a Wealthsimple account shows CAD, a Trading 212 account shows GBP. Aggregated home-currency view is roadmap.

## How do I report a security vulnerability?

Email [contact@hedgeiq.app](mailto:contact@hedgeiq.app) with the subject "Security disclosure." Include:

- A description of the issue.
- Steps to reproduce.
- Your assessment of impact.

We respond within 24 hours. We don't have a formal bug-bounty program yet, but we do publicly thank researchers (with permission) and we're happy to coordinate disclosure timing.

Please don't disclose the issue publicly until we've had a chance to fix it.

## Will there be a mobile app?

Eventually, yes. The web app is responsive and works fine on mobile browsers in the meantime. A native iOS/Android app is on the roadmap for late 2026, after we've nailed the desktop experience.

## Can I integrate via API?

Not currently. We don't have a public API. The internal API is at `hedgeiq-production.up.railway.app/api/*` but it's auth-gated and we reserve the right to break it without notice.

If you have a use case for a public API, [tell us](mailto:contact@hedgeiq.app). Knowing what people want to build helps us prioritize.

## What's coming next?

Near-term roadmap (next 1–2 quarters):

- **Multi-leg strategies** in the hedge calculator (collars, put spreads).
- **CSV export** of positions and hedge results.
- **Cross-device preference sync.**
- **MFA** on user accounts.
- **More brokers**, including a few European platforms.
- **Self-serve password recovery.**

Longer-term:

- Native mobile app.
- Public API.
- Pro tier launch with formal pricing.
- ETF hedge optimization.

## How do I cancel?

There's nothing to cancel right now — there's no paid tier yet. If you want to delete your account, email us (see the [troubleshooting page](/help/12-troubleshooting)). When Pro launches, cancellation will be self-serve from **Settings → Plan**.

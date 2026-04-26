# Supported brokers

HedgeIQ supports 30+ brokers across the US, Canada, UK, Australia, and crypto exchanges through our integration with [SnapTrade](https://snaptrade.com).

If your broker isn't listed, [email us](mailto:contact@hedgeiq.app) — SnapTrade adds new brokers regularly and we can request prioritization.

## United States — Stocks &amp; Options

The bulk of our users are here. Every broker listed below supports read-only OAuth (or credentials, where noted) and returns positions, balances, and order history.

| Broker                       | Auth method     | Stocks | Options | Crypto | Notes |
| ---------------------------- | --------------- | :----: | :-----: | :----: | ----- |
| Robinhood                    | OAuth + SMS 2FA |   ✓    |    ✓    |   ✓    | SMS verification on first connect |
| Fidelity                     | OAuth (Plaid)   |   ✓    |    ✓    |        | Routes through Plaid |
| Charles Schwab               | OAuth           |   ✓    |    ✓    |        | Includes legacy TD Ameritrade accounts |
| E*TRADE                      | OAuth           |   ✓    |    ✓    |        | 90-day token lifetime |
| TastyTrade                   | Credentials     |   ✓    |    ✓    |        | Username/password (no OAuth available) |
| TradeStation                 | OAuth           |   ✓    |    ✓    |        | API access requires account approval |
| Webull                       | OAuth + mobile  |   ✓    |    ✓    |   ✓    | Confirms via mobile app push notification |
| Public                       | OAuth           |   ✓    |    ✓    |   ✓    | Straightforward; ~60 day token |
| Interactive Brokers (IBKR)   | OAuth           |   ✓    |    ✓    |   ✓    | Requires "Read-Only API" enabled |
| M1 Finance                   | OAuth           |   ✓    |         |   ✓    | Pies map to virtual sub-positions |
| SoFi Invest                  | OAuth           |   ✓    |         |   ✓    | Crypto in same account as equities |
| Stash                        | OAuth           |   ✓    |         |        | Fractional-only |
| Acorns                       | OAuth           |   ✓    |         |        | ETF-only portfolios |
| Wealthfront                  | OAuth           |   ✓    |         |        | Robo-advised allocations |
| Stockpile                    | OAuth           |   ✓    |         |        | Fractional gift platform |

US regulatory note: every broker on this list is a FINRA-registered member. SnapTrade's data access is governed by each broker's API terms. If a broker tightens its API (rare but happens), we'll notify affected users by email.

## United States — Crypto exchanges

We pull holdings from these but don't yet fetch price/options data for crypto inside HedgeIQ. The hedge calculator is equities-only.

| Exchange     | Auth method | Notes |
| ------------ | ----------- | ----- |
| Coinbase     | OAuth       | Includes Coinbase Pro accounts |
| Kraken       | API key     | You generate a read-only API key in Kraken's settings and paste it |
| Gemini       | OAuth       | Earn balances are reported separately |
| Binance.US   | API key     | US-only; international Binance is not available |
| KuCoin       | API key     | |
| Bitstamp     | API key     | |
| Crypto.com   | OAuth       | |
| Bitfinex     | API key     | |

US regulatory note: crypto exchanges operate under a different framework than securities brokers (some are state money transmitters, some operate under MSB licensing). HedgeIQ treats crypto holdings as informational — we don't render hedging recommendations because crypto options markets are too thin for our scoring algorithm.

## Canada

| Broker                        | Auth method | Notes |
| ----------------------------- | ----------- | ----- |
| Wealthsimple                  | OAuth       | Stocks, ETFs, crypto. Most popular Canadian broker on our platform. |
| Questrade                     | OAuth       | Active-trader friendly; full options chain support. |
| Tangerine Investment          | OAuth       | Mutual-fund-only accounts; limited reporting. |

Canadian regulatory note: Canadian brokers report in CAD. HedgeIQ shows the broker's native currency in the positions table; an aggregate view in your home currency is on the roadmap.

## Australia and New Zealand

| Broker     | Auth method | Notes |
| ---------- | ----------- | ----- |
| Stake      | OAuth       | US equities + ASX; supported regions: AU, NZ, UK, BR. |
| Sharesies  | OAuth       | NZ-based; US, NZX, ASX equities. |
| CommSec    | Credentials | Limited support; positions only, no orders. |

ANZ regulatory note: Australian brokers report in AUD; NZ brokers in NZD. The hedge calculator is US-equities-only, so for AU-listed positions HedgeIQ shows positions but doesn't recommend hedges.

## United Kingdom

| Broker              | Auth method | Notes |
| ------------------- | ----------- | ----- |
| Trading 212         | OAuth       | Stocks &amp; ETFs in their Invest accounts. |
| Lightyear           | OAuth       | Newer EU/UK broker; growing coverage. |
| Hargreaves Lansdown | Credentials | Limited support — positions only, slow refresh. |

UK regulatory note: UK brokers are FCA-regulated. Most don't offer US-style options chains, so the hedge calculator is rarely useful for UK-only portfolios. We're researching adding UK options-market data; no firm timeline yet.

## Don't see your broker?

If your broker isn't on this list, three options:

1. **Email us at [contact@hedgeiq.app](mailto:contact@hedgeiq.app)** with the broker name and your country. SnapTrade prioritizes new integrations partly based on demand, and we'll log your request.
2. **Open a [GitHub issue](https://github.com/JiNiomIndia/HedgeIQ/issues)** with the label `broker-request`. Public requests get triaged faster.
3. **Use a manually-imported CSV** — we don't have this yet, but it's on the roadmap as a fallback for unsupported brokers. Estimated ETA: Q3 2026.

## Disconnecting a broker

You can disconnect at any time:

- **From HedgeIQ**: Settings → Connected brokers → Disconnect. This revokes the SnapTrade token and removes the positions from your dashboard.
- **From your broker**: Look for "Connected apps" or "Authorized applications" in your broker's account settings. Revoking from your broker is the strongest revocation.

After disconnect, HedgeIQ deletes the local cached positions. Your account itself is untouched — you can reconnect later by going through the OAuth flow again.

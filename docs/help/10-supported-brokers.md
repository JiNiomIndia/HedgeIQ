# Supported brokers

HedgeIQ supports 30+ brokers across the US, Canada, UK, Australia, and crypto exchanges through our integration with [SnapTrade](https://snaptrade.com).

If your broker isn't listed, [email us](mailto:contact@hedgeiq.app) — SnapTrade adds new brokers regularly and we can request prioritization.

> **Need a new account?** Click any "Open account" link in the tables below and the broker's homepage opens in a new tab — HedgeIQ stays put. From the broker's homepage, look for "Open account", "Sign up", or "Get started" — every broker on this list has it prominently in their top nav.

## United States — Stocks &amp; Options

The bulk of our users are here. Every broker listed below supports read-only OAuth (or credentials, where noted) and returns positions, balances, and order history.

| Broker                       | Auth method     | Stocks | Options | Crypto | Open account | Notes |
| ---------------------------- | --------------- | :----: | :-----: | :----: | ------- | ----- |
| Robinhood                    | OAuth + SMS 2FA |   ✓    |    ✓    |   ✓    | [Visit Robinhood ↗](https://robinhood.com/) | SMS verification on first connect |
| Fidelity                     | OAuth (Plaid)   |   ✓    |    ✓    |        | [Visit Fidelity ↗](https://www.fidelity.com/) | Routes through Plaid |
| Charles Schwab               | OAuth           |   ✓    |    ✓    |        | [Visit Schwab ↗](https://www.schwab.com/) | Includes legacy TD Ameritrade accounts |
| E*TRADE                      | OAuth           |   ✓    |    ✓    |        | [Visit E*TRADE ↗](https://us.etrade.com/) | 90-day token lifetime |
| TastyTrade                   | Credentials     |   ✓    |    ✓    |        | [Visit TastyTrade ↗](https://tastytrade.com/) | Username/password (no OAuth available) |
| TradeStation                 | OAuth           |   ✓    |    ✓    |        | [Visit TradeStation ↗](https://www.tradestation.com/) | API access requires account approval |
| Webull                       | OAuth + mobile  |   ✓    |    ✓    |   ✓    | [Visit Webull ↗](https://www.webull.com/) | Confirms via mobile app push notification |
| Public                       | OAuth           |   ✓    |    ✓    |   ✓    | [Visit Public ↗](https://public.com/) | Straightforward; ~60 day token |
| Interactive Brokers (IBKR)   | OAuth           |   ✓    |    ✓    |   ✓    | [Visit IBKR ↗](https://www.interactivebrokers.com/) | Requires "Read-Only API" enabled |
| M1 Finance                   | OAuth           |   ✓    |         |   ✓    | [Visit M1 ↗](https://m1.com/) | Pies map to virtual sub-positions |
| SoFi Invest                  | OAuth           |   ✓    |         |   ✓    | [Visit SoFi ↗](https://www.sofi.com/) | Crypto in same account as equities |
| Stash                        | OAuth           |   ✓    |         |        | [Visit Stash ↗](https://www.stash.com/) | Fractional-only |
| Acorns                       | OAuth           |   ✓    |         |        | [Visit Acorns ↗](https://www.acorns.com/) | ETF-only portfolios |
| Wealthfront                  | OAuth           |   ✓    |         |        | [Visit Wealthfront ↗](https://www.wealthfront.com/) | Robo-advised allocations |
| Stockpile                    | OAuth           |   ✓    |         |        | [Visit Stockpile ↗](https://stockpile.com/) | Fractional gift platform |

US regulatory note: every broker on this list is a FINRA-registered member. SnapTrade's data access is governed by each broker's API terms. If a broker tightens its API (rare but happens), we'll notify affected users by email.

## United States — Crypto exchanges

We pull holdings from these but don't yet fetch price/options data for crypto inside HedgeIQ. The hedge calculator is equities-only.

| Exchange     | Auth method | Open account | Notes |
| ------------ | ----------- | ------- | ----- |
| Coinbase     | OAuth       | [Visit Coinbase ↗](https://www.coinbase.com/) | Includes Coinbase Pro accounts |
| Kraken       | API key     | [Visit Kraken ↗](https://www.kraken.com/) | You generate a read-only API key in Kraken's settings and paste it |
| Gemini       | OAuth       | [Visit Gemini ↗](https://www.gemini.com/) | Earn balances are reported separately |
| Binance.US   | API key     | [Visit Binance.US ↗](https://www.binance.us/) | US-only; international Binance is not available |
| KuCoin       | API key     | [Visit KuCoin ↗](https://www.kucoin.com/) | |
| Bitstamp     | API key     | [Visit Bitstamp ↗](https://www.bitstamp.net/) | |
| Crypto.com   | OAuth       | [Visit Crypto.com ↗](https://crypto.com/) | |
| Bitfinex     | API key     | [Visit Bitfinex ↗](https://www.bitfinex.com/) | |

US regulatory note: crypto exchanges operate under a different framework than securities brokers (some are state money transmitters, some operate under MSB licensing). HedgeIQ treats crypto holdings as informational — we don't render hedging recommendations because crypto options markets are too thin for our scoring algorithm.

## Canada

| Broker                        | Auth method | Open account | Notes |
| ----------------------------- | ----------- | ------- | ----- |
| Wealthsimple                  | OAuth       | [Visit Wealthsimple ↗](https://www.wealthsimple.com/) | Stocks, ETFs, crypto. Most popular Canadian broker on our platform. |
| Questrade                     | OAuth       | [Visit Questrade ↗](https://www.questrade.com/) | Active-trader friendly; full options chain support. |
| Tangerine Investment          | OAuth       | [Visit Tangerine ↗](https://www.tangerine.ca/) | Mutual-fund-only accounts; limited reporting. |

Canadian regulatory note: Canadian brokers report in CAD. HedgeIQ shows the broker's native currency in the positions table; an aggregate view in your home currency is on the roadmap.

## Australia and New Zealand

| Broker     | Auth method | Open account | Notes |
| ---------- | ----------- | ------- | ----- |
| Stake      | OAuth       | [Visit Stake ↗](https://hellostake.com/) | US equities + ASX; supported regions: AU, NZ, UK, BR. |
| Sharesies  | OAuth       | [Visit Sharesies ↗](https://sharesies.com.au/) | NZ-based; US, NZX, ASX equities. |
| CommSec    | Credentials | [Visit CommSec ↗](https://www.commsec.com.au/) | Limited support; positions only, no orders. |

ANZ regulatory note: Australian brokers report in AUD; NZ brokers in NZD. The hedge calculator is US-equities-only, so for AU-listed positions HedgeIQ shows positions but doesn't recommend hedges.

## United Kingdom

| Broker              | Auth method | Open account | Notes |
| ------------------- | ----------- | ------- | ----- |
| Trading 212         | OAuth       | [Visit Trading 212 ↗](https://www.trading212.com/) | Stocks &amp; ETFs in their Invest accounts. |
| Lightyear           | OAuth       | [Visit Lightyear ↗](https://lightyear.com/) | Newer EU/UK broker; growing coverage. |
| Hargreaves Lansdown | Credentials | [Visit Hargreaves Lansdown ↗](https://www.hl.co.uk/) | Limited support — positions only, slow refresh. |

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

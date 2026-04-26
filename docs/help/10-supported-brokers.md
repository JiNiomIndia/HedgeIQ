# Supported brokers

HedgeIQ supports 30+ brokers across the US, Canada, UK, Australia, and crypto exchanges through our integration with [SnapTrade](https://snaptrade.com).

If your broker isn't listed, [email us](mailto:contact@hedgeiq.app) — SnapTrade adds new brokers regularly and we can request prioritization.

## United States — Stocks &amp; Options

The bulk of our users are here. Every broker listed below supports read-only OAuth (or credentials, where noted) and returns positions, balances, and order history.

| Broker                       | Auth method     | Stocks | Options | Crypto | Sign up | Notes |
| ---------------------------- | --------------- | :----: | :-----: | :----: | ------- | ----- |
| Robinhood                    | OAuth + SMS 2FA |   ✓    |    ✓    |   ✓    | [Open account ↗](https://robinhood.com/us/en/) | SMS verification on first connect |
| Fidelity                     | OAuth (Plaid)   |   ✓    |    ✓    |        | [Open account ↗](https://www.fidelity.com/open-an-account/overview) | Routes through Plaid |
| Charles Schwab               | OAuth           |   ✓    |    ✓    |        | [Open account ↗](https://www.schwab.com/open-an-account) | Includes legacy TD Ameritrade accounts |
| E*TRADE                      | OAuth           |   ✓    |    ✓    |        | [Open account ↗](https://us.etrade.com/e/t/welcome/openanaccount) | 90-day token lifetime |
| TastyTrade                   | Credentials     |   ✓    |    ✓    |        | [Open account ↗](https://my.tastytrade.com/sign-up) | Username/password (no OAuth available) |
| TradeStation                 | OAuth           |   ✓    |    ✓    |        | [Open account ↗](https://www.tradestation.com/account/applications/start) | API access requires account approval |
| Webull                       | OAuth + mobile  |   ✓    |    ✓    |   ✓    | [Open account ↗](https://www.webull.com/account/open) | Confirms via mobile app push notification |
| Public                       | OAuth           |   ✓    |    ✓    |   ✓    | [Open account ↗](https://public.com/) | Straightforward; ~60 day token |
| Interactive Brokers (IBKR)   | OAuth           |   ✓    |    ✓    |   ✓    | [Open account ↗](https://www.interactivebrokers.com/en/index.php?f=4969) | Requires "Read-Only API" enabled |
| M1 Finance                   | OAuth           |   ✓    |         |   ✓    | [Open account ↗](https://m1.com/sign-up/) | Pies map to virtual sub-positions |
| SoFi Invest                  | OAuth           |   ✓    |         |   ✓    | [Open account ↗](https://www.sofi.com/invest/) | Crypto in same account as equities |
| Stash                        | OAuth           |   ✓    |         |        | [Open account ↗](https://www.stash.com/get-started) | Fractional-only |
| Acorns                       | OAuth           |   ✓    |         |        | [Open account ↗](https://www.acorns.com/start/) | ETF-only portfolios |
| Wealthfront                  | OAuth           |   ✓    |         |        | [Open account ↗](https://www.wealthfront.com/get-started) | Robo-advised allocations |
| Stockpile                    | OAuth           |   ✓    |         |        | [Open account ↗](https://www.stockpile.com/) | Fractional gift platform |

US regulatory note: every broker on this list is a FINRA-registered member. SnapTrade's data access is governed by each broker's API terms. If a broker tightens its API (rare but happens), we'll notify affected users by email.

## United States — Crypto exchanges

We pull holdings from these but don't yet fetch price/options data for crypto inside HedgeIQ. The hedge calculator is equities-only.

| Exchange     | Auth method | Sign up | Notes |
| ------------ | ----------- | ------- | ----- |
| Coinbase     | OAuth       | [Open account ↗](https://www.coinbase.com/signup) | Includes Coinbase Pro accounts |
| Kraken       | API key     | [Open account ↗](https://www.kraken.com/sign-up) | You generate a read-only API key in Kraken's settings and paste it |
| Gemini       | OAuth       | [Open account ↗](https://exchange.gemini.com/register) | Earn balances are reported separately |
| Binance.US   | API key     | [Open account ↗](https://accounts.binance.us/en/register) | US-only; international Binance is not available |
| KuCoin       | API key     | [Open account ↗](https://www.kucoin.com/ucenter/signup) | |
| Bitstamp     | API key     | [Open account ↗](https://www.bitstamp.net/account/register/) | |
| Crypto.com   | OAuth       | [Open account ↗](https://crypto.com/exchange/signup) | |
| Bitfinex     | API key     | [Open account ↗](https://www.bitfinex.com/sign-up) | |

US regulatory note: crypto exchanges operate under a different framework than securities brokers (some are state money transmitters, some operate under MSB licensing). HedgeIQ treats crypto holdings as informational — we don't render hedging recommendations because crypto options markets are too thin for our scoring algorithm.

## Canada

| Broker                        | Auth method | Sign up | Notes |
| ----------------------------- | ----------- | ------- | ----- |
| Wealthsimple                  | OAuth       | [Open account ↗](https://www.wealthsimple.com/en-ca/) | Stocks, ETFs, crypto. Most popular Canadian broker on our platform. |
| Questrade                     | OAuth       | [Open account ↗](https://www.questrade.com/online-brokerage/open-an-account) | Active-trader friendly; full options chain support. |
| Tangerine Investment          | OAuth       | [Open account ↗](https://www.tangerine.ca/en/products/investing/) | Mutual-fund-only accounts; limited reporting. |

Canadian regulatory note: Canadian brokers report in CAD. HedgeIQ shows the broker's native currency in the positions table; an aggregate view in your home currency is on the roadmap.

## Australia and New Zealand

| Broker     | Auth method | Sign up | Notes |
| ---------- | ----------- | ------- | ----- |
| Stake      | OAuth       | [Open account ↗](https://hellostake.com/au/) | US equities + ASX; supported regions: AU, NZ, UK, BR. |
| Sharesies  | OAuth       | [Open account ↗](https://sharesies.com.au/) | NZ-based; US, NZX, ASX equities. |
| CommSec    | Credentials | [Open account ↗](https://www.commsec.com.au/) | Limited support; positions only, no orders. |

ANZ regulatory note: Australian brokers report in AUD; NZ brokers in NZD. The hedge calculator is US-equities-only, so for AU-listed positions HedgeIQ shows positions but doesn't recommend hedges.

## United Kingdom

| Broker              | Auth method | Sign up | Notes |
| ------------------- | ----------- | ------- | ----- |
| Trading 212         | OAuth       | [Open account ↗](https://www.trading212.com/) | Stocks &amp; ETFs in their Invest accounts. |
| Lightyear           | OAuth       | [Open account ↗](https://lightyear.com/gb/) | Newer EU/UK broker; growing coverage. |
| Hargreaves Lansdown | Credentials | [Open account ↗](https://www.hl.co.uk/) | Limited support — positions only, slow refresh. |

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

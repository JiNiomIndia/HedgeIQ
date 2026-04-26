# Glossary

Every options-trading term that appears in the HedgeIQ app, explained in plain English.

## A

**AI advisor** — The chat panel on the right side of the dashboard, powered by Claude. Answers options questions in plain English and provides context-aware explanations of your positions and hedge recommendations. See [/help/06-ai-advisor](/help/06-ai-advisor).

**ATM (At-The-Money)** — An option whose strike price is closest to the current price of the underlying stock. ATM options have the highest extrinsic value and are the most sensitive to price movements. They're also the most actively traded.

**Ask** — The lowest price a seller is currently willing to accept for an option contract. The bid-ask spread (ask minus bid) is a measure of liquidity; tight spreads mean the contract trades easily.

## B

**Bid** — The highest price a buyer is currently willing to pay for an option contract. Always lower than the ask in a healthy market.

**Broker** — The platform where you actually hold and trade securities — Robinhood, Fidelity, IBKR, etc. HedgeIQ connects to your broker through SnapTrade to pull positions, but never executes trades.

## C

**Call option** — A contract that gives the buyer the right (but not the obligation) to buy 100 shares of the underlying stock at the strike price on or before the expiration date. Bought when you expect the stock to go up.

**Contract** — One options contract represents 100 shares of the underlying stock. If a put has a $0.45 premium, one contract costs $45 (plus broker fees).

**Coverage** — In HedgeIQ's hedge calculator, the percentage drop in the underlying that the protective put insures against. A strike at 95% of current price provides coverage against a 5% drop.

## D

**Delta** — How much an option's price moves for every $1 move in the underlying stock. Delta of 0.5 means the option gains/loses $0.50 for every $1 move in the stock. Calls have positive delta (0 to 1); puts have negative delta (0 to -1).

**DTE (Days To Expiry)** — How many days until the option contract expires. The hedge calculator looks at DTE 14–90 days; shorter is too risky (rapid time decay), longer is too expensive.

## E

**Expiration / Expiry** — The date the option contract ceases to exist. Standard equity options expire on the third Friday of the month (monthlies); many tickers also have weekly expirations every Friday.

**Extrinsic value** — The portion of an option's price beyond its intrinsic value. Made up of time value and volatility premium. All extrinsic value decays to zero by expiration.

## G

**Gamma** — The rate of change of delta with respect to the underlying price. High gamma = delta is changing quickly = the option behaves more like the stock. Highest near ATM and near expiration.

**Glossary** — This page. You're reading it.

## H

**Hedge** — A position taken to offset risk in another position. A protective put hedges a long stock position. The cost of the hedge (the premium) is the price of the insurance.

## I

**IBKR (Interactive Brokers)** — A US-based broker known for low-cost international access and a powerful but complex platform. One of the brokers HedgeIQ supports.

**ITM (In-The-Money)** — A call is ITM if the stock price is above the strike. A put is ITM if the stock price is below the strike. ITM options have intrinsic value and are more expensive than OTM equivalents.

**IV (Implied Volatility)** — The market's expectation of how much the underlying stock will move before expiration, expressed as an annualized percentage. Higher IV = more expected movement = more expensive options. Tickers with upcoming earnings often have temporarily elevated IV.

**IV crush** — The rapid drop in IV (and option prices) immediately after a known event resolves — usually earnings. A common reason buying short-dated options around earnings loses money even when you're directionally right.

## J

**JWT (JSON Web Token)** — A signed token used for user authentication. HedgeIQ stores your session as a JWT in an `httpOnly` cookie.

## L

**LEAP (Long-term Equity AnticiPation Security)** — An option with more than 1 year to expiry. HedgeIQ's hedge calculator doesn't include LEAPS — they're too expensive for short-term hedging concerns.

**Liquidity** — How easily a contract can be bought or sold without moving the price. Measured by bid-ask spread (tighter = more liquid) and open interest (higher = more liquid).

## O

**OAuth** — The authorization protocol most brokers use to grant third-party apps (like HedgeIQ via SnapTrade) read-only access. You sign in on the broker's site; the broker returns a token; the token is what we store, not your password.

**OI (Open Interest)** — The total number of option contracts that exist for a specific strike and expiration — open positions that haven't been closed. Higher OI = more liquid contract. The hedge calculator filters for OI ≥ 5,000.

**Options chain** — The full matrix of all available option contracts for a ticker — every strike at every expiration, calls and puts. See [/help/07-options-chain](/help/07-options-chain).

**OTM (Out-of-The-Money)** — A call is OTM if the stock price is below the strike. A put is OTM if the stock price is above the strike. OTM options are cheaper than ITM but require the stock to move before they pay off.

## P

**P&L (Profit and Loss)** — The change in value of a position. HedgeIQ shows two P&L values per position: Day P&L (since today's open) and Total P&L (since you bought).

**p95 latency** — The 95th-percentile response time for an API request. We target p95 < 500ms for most HedgeIQ endpoints.

**PBKDF2** — Password-Based Key Derivation Function 2. The algorithm we use to hash passwords. Combined with HMAC-SHA256 and 600,000 iterations, it makes brute-forcing impractical.

**Polygon** — Our market data provider. Supplies stock quotes, options chains, and news headlines.

**Position** — A holding in your brokerage account. Could be shares of a stock, a long option, or a short option. The positions table aggregates positions across every connected broker.

**Premium** — The price you pay (or receive) for one option contract. A put with a $0.45 mid-price has a premium of $45 per contract. Premium is the cost of the hedge.

**Protective put** — A put option bought to hedge a long stock position. If the stock drops below the strike, the put gains value, offsetting the loss on the shares. The premium is the cost of insurance.

**Put option** — A contract that gives the buyer the right (but not the obligation) to sell 100 shares of the underlying stock at the strike price on or before the expiration date. Bought as protection against a drop.

## R

**Recommendation** — In the hedge calculator, one of the top three protective-put contracts ranked by value score. A recommendation is informational, not financial advice.

## S

**SnapTrade** — The regulated financial-data aggregator HedgeIQ uses to connect to brokerages. Your credentials never touch our servers; SnapTrade handles the OAuth flow.

**Strike** — The price at which the option holder can buy (call) or sell (put) the underlying stock if they exercise. Strikes are usually spaced $0.50 or $1 apart for liquid tickers, $5 apart for higher-priced stocks.

## T

**Theta** — The rate at which an option loses value as time passes, holding everything else constant. Always negative for option buyers (you're losing value every day) and positive for option sellers. Accelerates near expiration.

**Ticker** — The trading symbol for a stock. AAL = American Airlines. AAPL = Apple. The hedge calculator and options chain widget take a ticker as the primary input.

## V

**Value score** — HedgeIQ's composite ranking metric in the hedge calculator. Combines coverage, premium cost, and time-to-expiry into a single number. Higher is better. The exact formula is documented in the technical wiki at [/wiki/07-hedge-algorithm](/wiki/07-hedge-algorithm).

**Vega** — The change in an option's price per 1-percentage-point change in implied volatility. High-vega options (long-dated, ATM) are most sensitive to IV moves.

**VIX** — The CBOE Volatility Index. A measure of expected volatility in the S&amp;P 500 over the next 30 days, derived from SPX options pricing. Often called the "fear index." Visible in the market tape across the top of the dashboard.

**Volume** — The number of contracts traded today. Different from open interest (which is the running total of all open positions). High volume means active trading right now.

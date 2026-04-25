# 06 — Domain model

The pure-Python domain types live under `backend/domain/`. They have no I/O dependencies and are unit-tested in isolation.

## `Position`

```python
@dataclass
class Position:
    symbol: str          # e.g. "AAL"
    quantity: int        # shares (always positive — short positions are a separate type)
    average_cost: Decimal
    current_price: Decimal
    unrealized_pl: Decimal
```

**Invariants**
- `quantity >= 1`
- `average_cost > 0`
- `current_price > 0`
- `unrealized_pl == (current_price - average_cost) * quantity`

## `OptionContract`

```python
@dataclass
class OptionContract:
    symbol: str            # OCC-formatted: "AAL250321P00012000"
    underlying: str        # "AAL"
    option_type: str       # "PUT" or "CALL"
    strike: Decimal
    expiry_date: str       # ISO date "YYYY-MM-DD"
    bid: Decimal
    ask: Decimal
    open_interest: int
    volume: int
    implied_volatility: Decimal
```

**Invariants**
- `option_type in {"PUT", "CALL"}`
- `strike > 0`, `bid >= 0`, `ask >= bid`
- `open_interest >= 0`, `volume >= 0`

## `HedgeRecommendation`

```python
@dataclass
class HedgeRecommendation:
    contract: OptionContract
    contracts_to_buy: int
    total_cost: Decimal
    breakeven_price: Decimal
    coverage_at_10pct_drop: Decimal
    value_score: Decimal
```

### Formulas

- **contracts_to_buy** = `ceil(position.quantity / 100)`. Each option contract represents 100 shares.
- **total_cost** = `ask * 100 * contracts_to_buy`.
- **breakeven_price** = `strike - ask`. Stock price at expiry where the put position is exactly worth its premium.
- **coverage_at_10pct_drop** — intrinsic value of the put if the stock drops 10%, net of premium:
  ```
  drop_price = current_price * 0.90
  if strike > drop_price:
      coverage = (strike - drop_price - ask) * 100 * contracts
  else:
      coverage = 0
  ```
- **value_score** = `coverage / total_cost`. Higher is better — more dollars protected per dollar of premium.

## `User` (DB)

```python
class User(Base):
    id: str                           # UUID4
    email: str                        # unique, lowercase
    hashed_password: str              # "<salt>:<dk>" PBKDF2 SHA-256 100k
    is_pro: bool                      # paid tier
    is_admin: bool
    daily_ai_calls_used: int          # resets nightly
    daily_ai_reset_date: date | None
    snaptrade_user_id: str | None
    snaptrade_user_secret: str | None # per-user secret returned by SnapTrade
    created_at: datetime
```

**Invariants**
- `email` is stored lowercased.
- `daily_ai_calls_used` resets to 0 when `daily_ai_reset_date < today`.
- A user with `snaptrade_user_secret == None` has not yet been registered with SnapTrade.

## Errors

| Class | Raised when |
|-------|-------------|
| `InsufficientLiquidityError` | No options pass the liquidity / strike / expiry filters. |
| `VendorUnavailableError` | A vendor returns a transient error (5xx, timeout). |
| `DailyLimitExceededError` | User has hit their daily AI quota. |
| `BrokerNotConnectedError` | User tried to read positions before connecting a broker. |

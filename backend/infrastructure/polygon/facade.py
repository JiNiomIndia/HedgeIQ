"""Polygon.io API facade for options market data.

Facade Pattern: Hides rate limiting (5 req/min free tier),
ChromaDB caching (1h TTL), and response normalisation.
"""
import asyncio
import json
import time
from decimal import Decimal
from typing import List, Optional

from backend.domain.common.errors import DataUnavailableError
from backend.domain.options.models import OptionContract
from backend.infrastructure.cache.chroma_cache import ChromaCache


class TokenBucket:
    """Token-bucket rate limiter — 5 requests per minute for Polygon free tier.

    Tokens refill continuously at rate/60 per second. A caller that exceeds
    the budget waits the minimum time needed to earn one token back.

    Args:
        rate: Maximum requests per minute (default 5 for Polygon free tier).

    Example::

        limiter = TokenBucket(rate=5)
        await limiter.acquire()   # waits if rate limit would be breached
    """

    def __init__(self, rate: int = 5):
        self.rate = rate
        self._tokens = float(rate)
        self._last_refill = time.monotonic()
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        """Acquire one token, sleeping if the bucket is empty."""
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_refill
            # Refill tokens accumulated since last call, capped at max
            self._tokens = min(
                float(self.rate),
                self._tokens + elapsed * (self.rate / 60.0),
            )
            self._last_refill = now

            if self._tokens < 1:
                wait_time = (1 - self._tokens) * (60.0 / self.rate)
                await asyncio.sleep(wait_time)
                self._tokens = 0.0
            else:
                self._tokens -= 1.0


class PolygonFacade:
    """Facade over Polygon.io REST API for options chain data.

    Wraps the official polygon-api-client SDK. Falls back to a local mock
    chain when no API key is configured (useful for offline development).

    Args:
        api_key: Polygon.io API key (Starter or above for options data).
        cache: ChromaCache instance — chains cached for 1 hour.

    Example::

        facade = PolygonFacade(api_key="your_key", cache=cache)
        contracts = await facade.get_options_chain("AAL")
    """

    def __init__(self, api_key: str, cache: ChromaCache):
        self._api_key = api_key
        self._cache = cache
        self._limiter = TokenBucket(rate=5)
        try:
            from polygon import RESTClient
            self._client = RESTClient(api_key=api_key)
        except ImportError:
            self._client = None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def get_options_chain(
        self,
        symbol: str,
        expiry_date: Optional[str] = None,
    ) -> List[OptionContract]:
        """Fetch options chain with 1-hour caching and rate limiting.

        Args:
            symbol: Underlying ticker, e.g. "AAL".
            expiry_date: ISO expiry date filter, e.g. "2026-06-18".
                         None returns all available expiries.

        Returns:
            List of OptionContract domain models.

        Raises:
            DataUnavailableError: If Polygon returns an error or no data.
        """
        cache_key = f"polygon:chain:{symbol}:{expiry_date or 'all'}"
        cached = self._cache.get(cache_key)
        if cached:
            raw = json.loads(cached) if isinstance(cached, str) else cached
            return self._deserialise(raw)

        await self._limiter.acquire()

        try:
            if self._client is None:
                return self._mock_chain(symbol)

            params = {"underlying_asset": symbol, "limit": 250}
            if expiry_date:
                params["expiration_date"] = expiry_date

            contracts: List[OptionContract] = []
            for option in self._client.list_snapshot_options_chain(symbol, params=params):
                contract = self._map_to_domain(option)
                if contract:
                    contracts.append(contract)

            if contracts:
                self._cache.set(cache_key, self._serialise(contracts), ttl_hours=1)

            return contracts

        except Exception as exc:
            exc_str = str(exc)
            # Free-tier Polygon keys don't include options data.
            # Fall back to the deterministic mock chain so the hedge engine
            # still works in development without a paid subscription.
            if "NOT_AUTHORIZED" in exc_str or "not entitled" in exc_str.lower():
                import logging
                logging.getLogger(__name__).warning(
                    "Polygon free tier — options data unavailable, using mock chain for %s", symbol
                )
                return self._mock_chain(symbol)
            raise DataUnavailableError(
                f"Failed to fetch options chain for {symbol}: {exc}"
            ) from exc

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _map_to_domain(self, raw) -> Optional[OptionContract]:
        """Map a single Polygon snapshot response item to OptionContract."""
        try:
            details = raw.details
            greeks = getattr(raw, "greeks", None)
            day = getattr(raw, "day", None)
            quote = getattr(raw, "last_quote", None)

            return OptionContract(
                symbol=getattr(details, "ticker", ""),
                underlying=details.underlying_ticker,
                option_type=details.contract_type.upper(),
                strike=Decimal(str(details.strike_price)),
                expiry_date=details.expiration_date,
                bid=Decimal(str(getattr(quote, "bid", 0) or 0)),
                ask=Decimal(str(getattr(quote, "ask", 0) or 0)),
                volume=int(getattr(day, "volume", 0) or 0),
                open_interest=int(getattr(raw, "open_interest", 0) or 0),
                implied_volatility=Decimal(
                    str(getattr(raw, "implied_volatility", 0) or 0)
                ),
                delta=(
                    Decimal(str(getattr(greeks, "delta", 0)))
                    if greeks else None
                ),
                theta=(
                    Decimal(str(getattr(greeks, "theta", 0)))
                    if greeks else None
                ),
                days_to_expiry=0,
            )
        except Exception:
            return None

    def _serialise(self, contracts: List[OptionContract]) -> list:
        """Convert OptionContract list to JSON-safe dicts for caching."""
        return [
            {
                "symbol": c.symbol,
                "underlying": c.underlying,
                "option_type": c.option_type,
                "strike": str(c.strike),
                "expiry_date": c.expiry_date,
                "bid": str(c.bid),
                "ask": str(c.ask),
                "volume": c.volume,
                "open_interest": c.open_interest,
                "implied_volatility": str(c.implied_volatility),
                "delta": str(c.delta) if c.delta is not None else None,
            }
            for c in contracts
        ]

    def _deserialise(self, data: list) -> List[OptionContract]:
        """Reconstruct OptionContract objects from cached dicts."""
        contracts = []
        for d in data:
            try:
                contracts.append(
                    OptionContract(
                        symbol=d["symbol"],
                        underlying=d["underlying"],
                        option_type=d["option_type"],
                        strike=Decimal(d["strike"]),
                        expiry_date=d["expiry_date"],
                        bid=Decimal(d["bid"]),
                        ask=Decimal(d["ask"]),
                        volume=d["volume"],
                        open_interest=d["open_interest"],
                        implied_volatility=Decimal(d["implied_volatility"]),
                        delta=Decimal(d["delta"]) if d.get("delta") else None,
                    )
                )
            except Exception:
                continue
        return contracts

    def _mock_chain(self, symbol: str) -> List[OptionContract]:
        """Synthetic chain when Polygon options data is unavailable.

        Generates ~60 realistic contracts (puts + calls, 3 expiries, 10 strikes
        each) scaled to the symbol's current price. Better than a hardcoded
        2-row mock that's identical for every ticker.
        """
        import math
        from datetime import date, timedelta

        # Recent approximate prices for common tickers; fallback to $50 for unknowns
        price_map = {
            "AAL": 10.97, "AAPL": 175.00, "MSFT": 380.00, "TSLA": 240.00,
            "GOOGL": 140.00, "GOOG": 140.00, "META": 490.00, "NVDA": 880.00,
            "AMZN": 180.00, "SPY": 520.00, "QQQ": 440.00, "DIS": 110.00,
            "NFLX": 620.00, "BAC": 37.00, "JPM": 195.00, "WMT": 65.00,
            "COST": 770.00, "INTC": 43.00, "AMD": 170.00, "BA": 190.00,
            "F": 12.50, "GM": 45.00, "XOM": 115.00, "CVX": 155.00,
            "GE": 165.00, "T": 17.50, "VZ": 41.00, "PFE": 28.00,
            "JNJ": 155.00, "KO": 60.00, "PEP": 170.00, "MCD": 285.00,
            "UBER": 72.00, "SHOP": 75.00, "PLTR": 22.00, "SQ": 78.00,
            "PYPL": 65.00, "COIN": 245.00, "RIVN": 12.00, "LCID": 3.50,
            "DOGE": 0.10,  # not an equity, but user has it
        }
        base_price = price_map.get(symbol.upper(), 50.00)

        today = date.today()
        contracts: List[OptionContract] = []

        # 3 expiries: ~30, 60, 90 days out
        for dte in (30, 60, 90):
            expiry = today + timedelta(days=dte)
            expiry_str = expiry.isoformat()

            # Strike ladder: ±25% from current price in 5% increments
            for pct in (-0.25, -0.20, -0.15, -0.10, -0.05, 0.0, 0.05, 0.10, 0.15, 0.20, 0.25):
                strike = round(base_price * (1 + pct) * 2) / 2  # nearest $0.50
                if strike <= 0:
                    continue

                # Simplified IV: higher further from ATM
                iv = 0.30 + abs(pct) * 0.8
                # Time value component
                time_val = base_price * iv * math.sqrt(dte / 365.0) * 0.4

                # Put pricing
                put_intrinsic = max(0.0, strike - base_price)
                put_mid = put_intrinsic + time_val * max(0.2, 1 - abs(pct) * 2)
                put_bid = max(0.01, round(put_mid * 0.97, 2))
                put_ask = max(put_bid + 0.01, round(put_mid * 1.03, 2))

                # Call pricing
                call_intrinsic = max(0.0, base_price - strike)
                call_mid = call_intrinsic + time_val * max(0.2, 1 - abs(pct) * 2)
                call_bid = max(0.01, round(call_mid * 0.97, 2))
                call_ask = max(call_bid + 0.01, round(call_mid * 1.03, 2))

                # OI concentrated near ATM
                oi = int(80000 * math.exp(-abs(pct) * 6))
                vol = max(100, oi // 5)

                # OCC-style tickers
                strike_int = int(strike * 1000)
                ymd = expiry.strftime("%y%m%d")

                contracts.append(OptionContract(
                    symbol=f"{symbol}{ymd}P{strike_int:08d}",
                    underlying=symbol,
                    option_type="PUT",
                    strike=Decimal(str(strike)),
                    expiry_date=expiry_str,
                    bid=Decimal(str(put_bid)),
                    ask=Decimal(str(put_ask)),
                    volume=vol,
                    open_interest=oi,
                    implied_volatility=Decimal(str(round(iv, 3))),
                    delta=Decimal(str(round(-0.5 + pct * 1.8, 2))),
                    days_to_expiry=dte,
                ))
                contracts.append(OptionContract(
                    symbol=f"{symbol}{ymd}C{strike_int:08d}",
                    underlying=symbol,
                    option_type="CALL",
                    strike=Decimal(str(strike)),
                    expiry_date=expiry_str,
                    bid=Decimal(str(call_bid)),
                    ask=Decimal(str(call_ask)),
                    volume=vol,
                    open_interest=oi,
                    implied_volatility=Decimal(str(round(iv, 3))),
                    delta=Decimal(str(round(0.5 + pct * 1.8, 2))),
                    days_to_expiry=dte,
                ))

        return contracts

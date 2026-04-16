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
        """Return a deterministic mock chain for offline / test use."""
        return [
            OptionContract(
                symbol=f"{symbol}260618P00010000",
                underlying=symbol,
                option_type="PUT",
                strike=Decimal("10.00"),
                expiry_date="2026-06-18",
                bid=Decimal("0.48"),
                ask=Decimal("0.51"),
                volume=8920,
                open_interest=75310,
                implied_volatility=Decimal("0.55"),
                delta=Decimal("-0.25"),
                days_to_expiry=66,
            ),
            OptionContract(
                symbol=f"{symbol}260618P00011000",
                underlying=symbol,
                option_type="PUT",
                strike=Decimal("11.00"),
                expiry_date="2026-06-18",
                bid=Decimal("0.17"),
                ask=Decimal("0.19"),
                volume=4821,
                open_interest=17521,
                implied_volatility=Decimal("0.62"),
                delta=Decimal("-0.46"),
                days_to_expiry=66,
            ),
        ]

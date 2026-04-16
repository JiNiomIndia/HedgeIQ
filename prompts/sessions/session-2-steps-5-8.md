# HedgeIQ v0.1 — Session 2 of 6
## Steps 5–8: Claude Facade, Polygon Facade, SnapTrade Facade, Broker Adapters

> **Prerequisite:** Session 1 complete and committed to GitHub.
> **How to use:** Paste this entire file into the Claude Code tab.
> Say at the start: "Session 1 is complete. All tests from Steps 1–4 are passing. Now build Session 2, Steps 5–8."

---

## CONTEXT

You are continuing to build HedgeIQ v0.1 in Python FastAPI.
Session 1 delivered: project skeleton, domain models, abstract interfaces, ChromaDB cache.
Session 2 delivers: all three external service facades plus all broker adapters.

**Pattern reminder:**
- Each facade uses the Facade pattern — hides rate limiting, caching, retries from domain services
- Each adapter uses the Adapter pattern — normalises broker-specific raw data into Position domain models
- Claude facade must use `claude-haiku-4-5-20251001` exclusively in v0.1

---

## STEP 5 — Claude Haiku Facade with Caching and Daily Limit

### infrastructure/claude/facade.py

```python
"""Claude API facade for HedgeIQ AI features.

Facade Pattern: Hides Anthropic API complexity, ChromaDB caching,
model selection, daily limit enforcement, and disclaimer injection.

Cost strategy:
    - claude-haiku-4-5-20251001 for ALL v0.1 AI features (~$0.01/call)
    - ChromaDB cache reduces API calls by 70%+ for repeated queries
"""
import anthropic
from backend.infrastructure.cache.chroma_cache import ChromaCache
from backend.domain.common.errors import DailyLimitExceededError

DISCLAIMER = (
    "\n\nThis is AI-generated analysis for informational purposes only, "
    "not investment advice. Options involve risk and are not suitable "
    "for all investors."
)
HAIKU_MODEL = "claude-haiku-4-5-20251001"
FREE_DAILY_LIMIT = 5


class ClaudeFacade:
    """Facade over Anthropic Claude API.

    Handles: model routing, ChromaDB caching (24h TTL),
    daily call limit for free users, disclaimer injection.

    Args:
        api_key: Anthropic API key from .env
        cache: ChromaCache instance for response caching

    Example:
        facade = ClaudeFacade(api_key="sk-ant-...", cache=cache)
        explanation = await facade.explain_option(option_data, user_calls_today=2)
    """

    def __init__(self, api_key: str, cache: ChromaCache):
        self._client = anthropic.Anthropic(api_key=api_key)
        self._cache = cache

    def _check_daily_limit(self, calls_today: int, is_free_user: bool) -> None:
        """Enforce daily AI call limit for free tier users.

        Args:
            calls_today: How many AI calls this user has made today
            is_free_user: Whether this user is on the free tier

        Raises:
            DailyLimitExceededError: If free user has exceeded 5 calls/day
        """
        if is_free_user and calls_today >= FREE_DAILY_LIMIT:
            raise DailyLimitExceededError(limit=FREE_DAILY_LIMIT)

    async def explain_option(self, option_data: dict,
                              calls_today: int = 0, is_free_user: bool = True) -> str:
        """Explain an option contract in plain English.

        Checks cache first. Calls Claude Haiku if cache miss.
        Appends regulatory disclaimer to all responses.

        Args:
            option_data: Dict with symbol, expiry, strike, option_type, ask, open_interest
            calls_today: Number of AI calls user has made today
            is_free_user: Whether to enforce daily limit

        Returns:
            Three-sentence plain English explanation with disclaimer

        Raises:
            DailyLimitExceededError: If free user exceeds daily limit
        """
        self._check_daily_limit(calls_today, is_free_user)

        cache_key = (
            f"explain_option:{option_data.get('symbol')}:"
            f"{option_data.get('expiry')}:{option_data.get('strike')}:"
            f"{option_data.get('option_type')}"
        )
        cached = self._cache.get(cache_key)
        if cached:
            return cached

        prompt = f"""You are a friendly trading coach explaining options to a retail investor.

Given this option: {option_data}

Explain in exactly 3 sentences:
1. What this option is and what right it gives the buyer
2. What the stock price needs to do for the buyer to profit
3. What the maximum loss is if it expires worthless

Use plain English. No jargon. Each sentence under 25 words."""

        message = self._client.messages.create(
            model=HAIKU_MODEL, max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        response = message.content[0].text + DISCLAIMER
        self._cache.set(cache_key, response, ttl_hours=24)
        return response

    async def explain_hedge_recommendation(self, position_data: dict,
                                            recommendation_data: dict,
                                            calls_today: int = 0,
                                            is_free_user: bool = True) -> str:
        """Explain why a specific put is recommended for hedging.

        Args:
            position_data: Dict with symbol, shares, entry_price, current_price
            recommendation_data: Dict with expiry, strike, ask, total_cost, breakeven

        Returns:
            Two-sentence explanation with disclaimer

        Raises:
            DailyLimitExceededError: If free user exceeds daily limit
        """
        self._check_daily_limit(calls_today, is_free_user)

        cache_key = (
            f"hedge_rec:{position_data.get('symbol')}:"
            f"{recommendation_data.get('expiry')}:{recommendation_data.get('strike')}"
        )
        cached = self._cache.get(cache_key)
        if cached:
            return cached

        prompt = f"""You are a trading coach. Be specific.

Trader holds {position_data.get('shares')} shares of {position_data.get('symbol')}
bought at ${position_data.get('entry_price')}, now at ${position_data.get('current_price')}.

Recommended hedge: {recommendation_data.get('expiry')} ${recommendation_data.get('strike')} put
Cost: ${recommendation_data.get('total_cost')} | Breakeven: ${recommendation_data.get('breakeven')}

In exactly 2 sentences, explain why this specific put is the best hedge right now.
Mention the specific numbers. Plain English only."""

        message = self._client.messages.create(
            model=HAIKU_MODEL, max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )
        response = message.content[0].text + DISCLAIMER
        self._cache.set(cache_key, response, ttl_hours=24)
        return response
```

### tests/unit/infrastructure/test_claude_facade.py
```python
"""Unit tests for Claude facade — no real API calls."""
import pytest
import asyncio
from unittest.mock import MagicMock, patch
from backend.infrastructure.claude.facade import ClaudeFacade
from backend.infrastructure.cache.chroma_cache import ChromaCache
from backend.domain.common.errors import DailyLimitExceededError


@pytest.fixture
def cache(tmp_path):
    return ChromaCache(path=str(tmp_path / "claude_cache"))

@pytest.fixture
def facade(cache):
    return ClaudeFacade(api_key="sk-ant-test", cache=cache)

def test_daily_limit_blocks_6th_call(facade):
    """Free user 6th call should raise DailyLimitExceededError."""
    with pytest.raises(DailyLimitExceededError):
        asyncio.get_event_loop().run_until_complete(
            facade.explain_option({}, calls_today=5, is_free_user=True)
        )

def test_pro_user_not_limited(facade):
    """Pro user should not be blocked regardless of call count."""
    with patch.object(facade._client.messages, 'create') as mock:
        mock.return_value = MagicMock(content=[MagicMock(text="Explanation")])
        result = asyncio.get_event_loop().run_until_complete(
            facade.explain_option(
                {"symbol": "AAL", "expiry": "2026-06-18", "strike": "10.00",
                 "option_type": "put", "ask": "0.49", "open_interest": 75310,
                 "delta": "-0.25", "implied_volatility": "0.56"},
                calls_today=100, is_free_user=False
            )
        )
        assert "Explanation" in result

def test_cache_hit_skips_api_call(facade, cache):
    """Second identical request should use cache, not call API."""
    cache.set("explain_option:AAL:2026-06-18:10.00:put", "Cached explanation", ttl_hours=24)
    with patch.object(facade._client.messages, 'create') as mock_api:
        asyncio.get_event_loop().run_until_complete(
            facade.explain_option(
                {"symbol": "AAL", "expiry": "2026-06-18",
                 "strike": "10.00", "option_type": "put"},
                calls_today=0, is_free_user=True
            )
        )
        mock_api.assert_not_called()

def test_disclaimer_appended(facade):
    """All Claude responses must include regulatory disclaimer."""
    with patch.object(facade._client.messages, 'create') as mock:
        mock.return_value = MagicMock(content=[MagicMock(text="Explanation.")])
        result = asyncio.get_event_loop().run_until_complete(
            facade.explain_option(
                {"symbol": "AAL", "expiry": "2026-06-18", "strike": "10.00",
                 "option_type": "put", "ask": "0.49", "open_interest": 75310,
                 "delta": "-0.25", "implied_volatility": "0.56"},
                calls_today=0, is_free_user=False
            )
        )
        assert "not investment advice" in result

def test_haiku_model_used(facade):
    """Only claude-haiku-4-5-20251001 should be called in v0.1."""
    with patch.object(facade._client.messages, 'create') as mock:
        mock.return_value = MagicMock(content=[MagicMock(text="Explanation")])
        asyncio.get_event_loop().run_until_complete(
            facade.explain_option(
                {"symbol": "AAL", "expiry": "2026-06-18", "strike": "10.00",
                 "option_type": "put", "ask": "0.49", "open_interest": 75310,
                 "delta": "-0.25", "implied_volatility": "0.56"},
                calls_today=0, is_free_user=False
            )
        )
        assert mock.call_args.kwargs.get("model") == "claude-haiku-4-5-20251001"
```

**Gate:** `pytest backend/tests/unit/infrastructure/test_claude_facade.py -v` — all 5 tests pass.

---

## STEP 6 — Polygon Facade with Rate Limiter

### infrastructure/polygon/facade.py
```python
"""Polygon.io API facade for options market data.

Facade Pattern: Hides rate limiting (5 req/min free tier),
ChromaDB caching (1h TTL), and response normalisation.
"""
import asyncio, time, json
from typing import List, Optional
from decimal import Decimal
from backend.infrastructure.cache.chroma_cache import ChromaCache
from backend.domain.options.models import OptionContract
from backend.domain.common.errors import DataUnavailableError


class TokenBucket:
    """Token bucket rate limiter — 5 requests per minute for Polygon free tier.

    Example:
        limiter = TokenBucket(rate=5)
        await limiter.acquire()  # Waits if rate limit hit
    """
    def __init__(self, rate: int = 5):
        self.rate = rate
        self._tokens = float(rate)
        self._last_refill = time.monotonic()
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        """Acquire one token, waiting if necessary."""
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_refill
            self._tokens = min(self.rate, self._tokens + elapsed * (self.rate / 60.0))
            self._last_refill = now
            if self._tokens < 1:
                wait_time = (1 - self._tokens) * (60.0 / self.rate)
                await asyncio.sleep(wait_time)
                self._tokens = 0
            else:
                self._tokens -= 1


class PolygonFacade:
    """Facade over Polygon.io API for options chains.

    Args:
        api_key: Polygon.io API key (free tier works)
        cache: ChromaCache instance

    Example:
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

    async def get_options_chain(self, symbol: str,
                                 expiry_date: Optional[str] = None) -> List[OptionContract]:
        """Fetch options chain with 1-hour caching and rate limiting.

        Args:
            symbol: Stock ticker e.g. AAL
            expiry_date: Filter by expiry ISO string, None for all

        Returns:
            List of OptionContract domain models

        Raises:
            DataUnavailableError: If Polygon returns no data
        """
        cache_key = f"polygon:chain:{symbol}:{expiry_date or 'all'}"
        cached = self._cache.get(cache_key)
        if cached:
            return self._deserialise(json.loads(cached) if isinstance(cached, str) else cached)

        await self._limiter.acquire()

        try:
            if self._client is None:
                return self._mock_chain(symbol)
            params = {"underlying_asset": symbol, "limit": 250}
            if expiry_date:
                params["expiration_date"] = expiry_date
            contracts = []
            for option in self._client.list_snapshot_options_chain(symbol, params=params):
                contract = self._map_to_domain(option)
                if contract:
                    contracts.append(contract)
            if contracts:
                self._cache.set(cache_key, self._serialise(contracts), ttl_hours=1)
            return contracts
        except Exception as e:
            raise DataUnavailableError(f"Failed to fetch chain for {symbol}: {str(e)}")

    def _map_to_domain(self, raw) -> Optional[OptionContract]:
        """Map Polygon API response to OptionContract domain model."""
        try:
            details = raw.details
            greeks = getattr(raw, 'greeks', None)
            day = getattr(raw, 'day', None)
            quote = getattr(raw, 'last_quote', None)
            return OptionContract(
                symbol=getattr(details, 'ticker', ''),
                underlying=details.underlying_ticker,
                option_type=details.contract_type.upper(),
                strike=Decimal(str(details.strike_price)),
                expiry_date=details.expiration_date,
                bid=Decimal(str(getattr(quote, 'bid', 0) or 0)),
                ask=Decimal(str(getattr(quote, 'ask', 0) or 0)),
                volume=int(getattr(day, 'volume', 0) or 0),
                open_interest=int(getattr(raw, 'open_interest', 0) or 0),
                implied_volatility=Decimal(str(getattr(raw, 'implied_volatility', 0) or 0)),
                delta=Decimal(str(getattr(greeks, 'delta', 0))) if greeks else None,
                theta=Decimal(str(getattr(greeks, 'theta', 0))) if greeks else None,
                days_to_expiry=0
            )
        except Exception:
            return None

    def _serialise(self, contracts):
        return [{"symbol": c.symbol, "underlying": c.underlying,
                 "option_type": c.option_type, "strike": str(c.strike),
                 "expiry_date": c.expiry_date, "bid": str(c.bid), "ask": str(c.ask),
                 "volume": c.volume, "open_interest": c.open_interest,
                 "implied_volatility": str(c.implied_volatility),
                 "delta": str(c.delta) if c.delta else None} for c in contracts]

    def _deserialise(self, data):
        contracts = []
        for d in data:
            try:
                contracts.append(OptionContract(
                    symbol=d["symbol"], underlying=d["underlying"],
                    option_type=d["option_type"], strike=Decimal(d["strike"]),
                    expiry_date=d["expiry_date"], bid=Decimal(d["bid"]),
                    ask=Decimal(d["ask"]), volume=d["volume"],
                    open_interest=d["open_interest"],
                    implied_volatility=Decimal(d["implied_volatility"]),
                    delta=Decimal(d["delta"]) if d.get("delta") else None
                ))
            except Exception:
                continue
        return contracts

    def _mock_chain(self, symbol: str) -> List[OptionContract]:
        """Mock chain for development when Polygon not connected."""
        return [
            OptionContract(symbol=f"{symbol}260618P00010000", underlying=symbol,
                option_type="PUT", strike=Decimal("10.00"), expiry_date="2026-06-18",
                bid=Decimal("0.48"), ask=Decimal("0.51"), volume=8920,
                open_interest=75310, implied_volatility=Decimal("0.55"),
                delta=Decimal("-0.25"), days_to_expiry=66),
            OptionContract(symbol=f"{symbol}260618P00011000", underlying=symbol,
                option_type="PUT", strike=Decimal("11.00"), expiry_date="2026-06-18",
                bid=Decimal("0.17"), ask=Decimal("0.19"), volume=4821,
                open_interest=17521, implied_volatility=Decimal("0.62"),
                delta=Decimal("-0.46"), days_to_expiry=66),
        ]
```

### tests/unit/infrastructure/test_polygon_facade.py
```python
"""Unit tests for Polygon facade."""
import pytest, asyncio
from unittest.mock import MagicMock
from backend.infrastructure.polygon.facade import PolygonFacade, TokenBucket
from backend.infrastructure.cache.chroma_cache import ChromaCache

@pytest.fixture
def cache(tmp_path):
    return ChromaCache(path=str(tmp_path / "polygon_cache"))

@pytest.fixture
def facade(cache):
    f = PolygonFacade(api_key="test_key", cache=cache)
    f._client = None  # Use mock mode
    return f

def test_returns_list_of_contracts(facade):
    result = asyncio.get_event_loop().run_until_complete(facade.get_options_chain("AAL"))
    assert isinstance(result, list)
    assert len(result) > 0

def test_cache_hit_skips_polygon_api(facade, cache):
    cache.set("polygon:chain:AAL:all", [{"symbol": "AAL260618P00010000",
        "underlying": "AAL", "option_type": "PUT", "strike": "10.00",
        "expiry_date": "2026-06-18", "bid": "0.48", "ask": "0.51",
        "volume": 100, "open_interest": 75310, "implied_volatility": "0.55",
        "delta": "-0.25"}], ttl_hours=1)
    # Disable mock chain to confirm cache is used
    original_mock = facade._mock_chain
    call_count = {"n": 0}
    def counting_mock(symbol): call_count["n"] += 1; return original_mock(symbol)
    facade._mock_chain = counting_mock
    asyncio.get_event_loop().run_until_complete(facade.get_options_chain("AAL"))
    assert call_count["n"] == 0

def test_data_unavailable_on_exception(facade):
    from backend.domain.common.errors import DataUnavailableError
    facade._client = MagicMock()
    facade._client.list_snapshot_options_chain.side_effect = Exception("API down")
    with pytest.raises(DataUnavailableError):
        asyncio.get_event_loop().run_until_complete(facade.get_options_chain("AAL"))

def test_rate_limiter_tokens_decrease(cache):
    limiter = TokenBucket(rate=5)
    limiter._tokens = 3
    asyncio.get_event_loop().run_until_complete(limiter.acquire())
    assert limiter._tokens == 2
```

**Gate:** `pytest backend/tests/unit/infrastructure/test_polygon_facade.py -v` — all 4 tests pass.

---

## STEP 7 — SnapTrade Facade

### infrastructure/snaptrade/facade.py
```python
"""SnapTrade API facade for multi-broker connectivity.

Facade Pattern: Hides SnapTrade SDK, broker OAuth flow, error handling.
Supported: Fidelity, IBKR, Schwab, Robinhood, Public, E*TRADE, Moomoo.
Cost: $2/connected user/month (zero for your own personal accounts).
"""
from typing import List, Dict, Any
from backend.domain.common.errors import DataUnavailableError


class SnapTradeFacade:
    """Facade over SnapTrade API.

    Args:
        client_id: SnapTrade client ID from .env
        consumer_key: SnapTrade consumer key from .env
    """
    def __init__(self, client_id: str, consumer_key: str):
        self._client_id = client_id
        self._consumer_key = consumer_key
        try:
            from snaptrade_client import SnapTrade
            self._client = SnapTrade(client_id=client_id, consumer_key=consumer_key)
        except ImportError:
            self._client = None

    async def get_connection_url(self, user_id: str, broker: str) -> str:
        """Generate broker connection URL for user to authenticate.

        Args:
            user_id: SnapTrade user ID
            broker: Broker slug e.g. FIDELITY, IBKR, PUBLIC

        Returns:
            URL for user to authenticate — we never see their credentials
        """
        if self._client is None:
            return f"https://app.snaptrade.com/connect?user={user_id}&broker={broker}"
        response = self._client.authentication.login_snap_trade_user(
            user_id=user_id, broker=broker)
        return response.body.get("redirectURI", "")

    async def get_raw_positions(self, user_id: str, user_secret: str) -> List[Dict[str, Any]]:
        """Fetch raw positions from all connected broker accounts.

        Returns raw SnapTrade response — pass to BrokerAdapter for normalisation.

        Args:
            user_id: SnapTrade user ID
            user_secret: SnapTrade user secret

        Returns:
            List of raw position dicts

        Raises:
            DataUnavailableError: If SnapTrade API is unreachable
        """
        if self._client is None:
            return self._mock_positions()
        try:
            response = self._client.account_information.get_all_user_holdings(
                user_id=user_id, user_secret=user_secret)
            return response.body if response.body else []
        except Exception as e:
            raise DataUnavailableError(f"SnapTrade failed: {str(e)}")

    def _mock_positions(self) -> List[Dict[str, Any]]:
        """Mock positions for development when SnapTrade not connected."""
        return [
            {"broker_name": "FIDELITY",
             "account": {"name": "Sankar Rollover IRA", "number": "***7040"},
             "positions": [{"symbol": {"symbol": "AAL"}, "units": "2000",
                            "average_purchase_price": "11.27", "price": "10.97"}]},
            {"broker_name": "PUBLIC",
             "account": {"name": "Public Brokerage", "number": "pub-001"},
             "positions": [{"symbol": {"symbol": "AAL"}, "units": "2000",
                            "average_purchase_price": "11.05", "price": "10.97"}]}
        ]
```

### tests/unit/infrastructure/test_snaptrade_facade.py
```python
"""Unit tests for SnapTrade facade."""
import pytest, asyncio
from backend.infrastructure.snaptrade.facade import SnapTradeFacade

@pytest.fixture
def facade():
    f = SnapTradeFacade(client_id="test_id", consumer_key="test_key")
    f._client = None
    return f

def test_get_raw_positions_returns_list(facade):
    result = asyncio.get_event_loop().run_until_complete(
        facade.get_raw_positions("user123", "secret123"))
    assert isinstance(result, list)
    assert len(result) > 0

def test_mock_positions_include_fidelity(facade):
    result = asyncio.get_event_loop().run_until_complete(
        facade.get_raw_positions("user123", "secret123"))
    assert any(p.get("broker_name") == "FIDELITY" for p in result)

def test_connection_url_returns_string(facade):
    url = asyncio.get_event_loop().run_until_complete(
        facade.get_connection_url("user123", "FIDELITY"))
    assert isinstance(url, str) and len(url) > 0
```

**Gate:** `pytest backend/tests/unit/infrastructure/test_snaptrade_facade.py -v` — all 3 tests pass.

---

## STEP 8 — Broker Adapters + Registry

### adapters/base.py
```python
"""Abstract base for all broker adapters."""
from abc import ABC, abstractmethod
from typing import List
from backend.domain.positions.models import Position

class AbstractBrokerAdapter(ABC):
    """Normalises broker-specific raw data into Position domain models.
    Adding a new broker = add one new class. Zero changes elsewhere.
    """
    @property
    @abstractmethod
    def broker_name(self) -> str: pass

    @abstractmethod
    def normalise(self, raw_positions: list, account_name: str, account_id: str) -> List[Position]:
        """Convert raw broker API positions to Position domain models.
        Args:
            raw_positions: Raw position list from broker API
            account_name: Account display name
            account_id: Broker account identifier
        Returns:
            List of normalised Position domain models
        """
        pass
```

### adapters/fidelity_adapter.py
```python
from decimal import Decimal
from backend.adapters.base import AbstractBrokerAdapter

class FidelityAdapter(AbstractBrokerAdapter):
    """Normalises Fidelity position data from SnapTrade response format."""
    @property
    def broker_name(self) -> str: return "Fidelity"

    def normalise(self, raw_positions, account_name, account_id):
        from backend.domain.positions.models import Position
        positions = []
        for raw in raw_positions:
            try:
                positions.append(Position(
                    broker=self.broker_name, account_name=account_name, account_id=account_id,
                    symbol=raw.get("symbol", {}).get("symbol", ""),
                    quantity=Decimal(str(raw.get("units", 0))),
                    entry_price=Decimal(str(raw.get("average_purchase_price", 0))),
                    current_price=Decimal(str(raw.get("price", 0)))
                ))
            except Exception: continue
        return positions
```

### adapters/ibkr_adapter.py
```python
from decimal import Decimal
from backend.adapters.base import AbstractBrokerAdapter

class IBKRAdapter(AbstractBrokerAdapter):
    """Normalises IBKR position data from SnapTrade response format."""
    @property
    def broker_name(self) -> str: return "IBKR"

    def normalise(self, raw_positions, account_name, account_id):
        from backend.domain.positions.models import Position
        positions = []
        for raw in raw_positions:
            try:
                positions.append(Position(
                    broker=self.broker_name, account_name=account_name, account_id=account_id,
                    symbol=raw.get("symbol", {}).get("symbol", ""),
                    quantity=Decimal(str(raw.get("position", raw.get("units", 0)))),
                    entry_price=Decimal(str(raw.get("average_cost", raw.get("average_purchase_price", 0)))),
                    current_price=Decimal(str(raw.get("market_price", raw.get("price", 0))))
                ))
            except Exception: continue
        return positions
```

### adapters/public_adapter.py
```python
from decimal import Decimal
from backend.adapters.base import AbstractBrokerAdapter

class PublicAdapter(AbstractBrokerAdapter):
    """Normalises Public.com position data from SnapTrade response format."""
    @property
    def broker_name(self) -> str: return "Public"

    def normalise(self, raw_positions, account_name, account_id):
        from backend.domain.positions.models import Position
        positions = []
        for raw in raw_positions:
            try:
                positions.append(Position(
                    broker=self.broker_name, account_name=account_name, account_id=account_id,
                    symbol=raw.get("symbol", {}).get("symbol", ""),
                    quantity=Decimal(str(raw.get("units", 0))),
                    entry_price=Decimal(str(raw.get("average_purchase_price", 0))),
                    current_price=Decimal(str(raw.get("price", 0)))
                ))
            except Exception: continue
        return positions
```

### adapters/adapter_registry.py
```python
"""Registry mapping broker names to adapter instances."""
from typing import Dict
from backend.adapters.base import AbstractBrokerAdapter
from backend.adapters.fidelity_adapter import FidelityAdapter
from backend.adapters.ibkr_adapter import IBKRAdapter
from backend.adapters.public_adapter import PublicAdapter

class AdapterRegistry:
    """Maps broker names to adapter implementations.
    Adding a new broker = register one adapter here. Zero other changes.
    """
    def __init__(self):
        self._adapters: Dict[str, AbstractBrokerAdapter] = {
            "FIDELITY": FidelityAdapter(), "IBKR": IBKRAdapter(), "PUBLIC": PublicAdapter(),
        }

    def get(self, broker_name: str) -> AbstractBrokerAdapter:
        """Get adapter for a broker name.
        Args:
            broker_name: e.g. FIDELITY, IBKR, PUBLIC
        Raises:
            KeyError: If broker not registered
        """
        name = broker_name.upper()
        if name not in self._adapters:
            raise KeyError(f"No adapter registered for broker: {broker_name}")
        return self._adapters[name]

    def supported_brokers(self) -> list:
        return list(self._adapters.keys())
```

### tests/unit/adapters/test_fidelity_adapter.py
```python
"""Unit tests for broker adapters."""
import pytest
from decimal import Decimal
from backend.adapters.fidelity_adapter import FidelityAdapter

@pytest.fixture
def adapter(): return FidelityAdapter()

def test_broker_name_is_fidelity(adapter):
    assert adapter.broker_name == "Fidelity"

def test_normalise_returns_position_list(adapter):
    raw = [{"symbol": {"symbol": "AAL"}, "units": "2000",
            "average_purchase_price": "11.27", "price": "10.97"}]
    result = adapter.normalise(raw, "Rollover IRA", "***7040")
    assert len(result) == 1
    assert result[0].symbol == "AAL"
    assert result[0].quantity == Decimal("2000")
    assert result[0].broker == "Fidelity"

def test_normalise_handles_malformed_data(adapter):
    """Malformed rows should be skipped, not crash."""
    raw = [{"bad": "data"}, {"symbol": {"symbol": "AAL"},
            "units": "100", "average_purchase_price": "10.00", "price": "11.00"}]
    result = adapter.normalise(raw, "Rollover IRA", "***7040")
    assert len(result) == 1

def test_registry_returns_correct_adapter():
    from backend.adapters.adapter_registry import AdapterRegistry
    registry = AdapterRegistry()
    assert registry.get("FIDELITY").broker_name == "Fidelity"
    assert registry.get("IBKR").broker_name == "IBKR"
    assert registry.get("PUBLIC").broker_name == "Public"

def test_registry_raises_for_unknown_broker():
    from backend.adapters.adapter_registry import AdapterRegistry
    with pytest.raises(KeyError):
        AdapterRegistry().get("UNKNOWN_BROKER")
```

**Gate:** `pytest backend/tests/unit/adapters/ -v` — all 5 tests pass.

---

## SESSION 2 COMPLETION CHECKLIST

- [ ] Claude facade tests pass (5 tests)
- [ ] Polygon facade tests pass (4 tests)
- [ ] SnapTrade facade tests pass (3 tests)
- [ ] Adapter tests pass (5 tests)
- [ ] All Session 1 tests still passing
- [ ] Total: 25+ tests passing, 0 failing

**Commit:** `feat: Session 2 complete — Claude, Polygon, SnapTrade facades + broker adapters`
**Next:** Session 3 — Steps 9-13: Repositories, Domain Services, Hedge Strategies, Gateway, BFF

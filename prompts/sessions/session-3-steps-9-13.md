# HedgeIQ v0.1 — Session 3 of 6
## Steps 9–13: Repositories, Domain Services, Hedge Strategies, Gateway, BFF

> **Prerequisite:** Session 2 complete and committed to GitHub.
> **Start by saying:** "Sessions 1 and 2 are complete. All 23 tests are passing.
> Now build Session 3, Steps 9–13."

---

## STEP 9 — Concrete Repository Implementations

Wire the abstract interfaces (Step 3) to the facades (Steps 6 and 7).

### infrastructure/snaptrade/position_repository.py
```python
"""Concrete PositionRepository using SnapTrade + Adapters."""
from typing import List
from backend.domain.positions.models import Position
from backend.domain.positions.repository import AbstractPositionRepository
from backend.domain.common.errors import DataUnavailableError
from backend.infrastructure.snaptrade.facade import SnapTradeFacade
from backend.adapters.adapter_registry import AdapterRegistry

class SnapTradePositionRepository(AbstractPositionRepository):
    """Fetches and normalises positions from all connected brokers.

    Args:
        facade: SnapTradeFacade for API calls
        registry: AdapterRegistry mapping broker names to adapters
    """
    def __init__(self, facade: SnapTradeFacade, registry: AdapterRegistry):
        self._facade = facade
        self._registry = registry

    async def get_positions(self, user_id: str) -> List[Position]:
        """Fetch all positions across all connected brokers.

        Args:
            user_id: SnapTrade user ID
        Returns:
            Normalised Position list sorted by broker
        Raises:
            DataUnavailableError: If SnapTrade unreachable
        """
        raw_data = await self._facade.get_raw_positions(user_id, user_id)
        all_positions = []
        for account_data in raw_data:
            broker_name = account_data.get("broker_name", "UNKNOWN")
            account = account_data.get("account", {})
            account_name = account.get("name", "Unknown Account")
            account_id = account.get("number", "")
            raw_positions = account_data.get("positions", [])
            try:
                adapter = self._registry.get(broker_name)
                all_positions.extend(adapter.normalise(raw_positions, account_name, account_id))
            except KeyError:
                continue
        return sorted(all_positions, key=lambda p: p.broker)

    async def get_portfolio(self, user_id: str):
        from backend.domain.positions.models import Portfolio
        positions = await self.get_positions(user_id)
        return Portfolio(user_id=user_id, positions=positions)
```

### infrastructure/polygon/options_repository.py
```python
"""Concrete OptionsRepository using Polygon.io."""
from typing import List, Optional
from backend.domain.options.models import OptionContract
from backend.domain.options.repository import AbstractOptionsRepository
from backend.infrastructure.polygon.facade import PolygonFacade

class PolygonOptionsRepository(AbstractOptionsRepository):
    """Fetches options chain data from Polygon.io via PolygonFacade.

    Args:
        facade: PolygonFacade with rate limiting and caching
    """
    def __init__(self, facade: PolygonFacade):
        self._facade = facade

    async def get_chain(self, symbol: str, expiry_date: Optional[str] = None) -> List[OptionContract]:
        """Fetch options chain via Polygon facade.

        Args:
            symbol: Ticker e.g. AAL
            expiry_date: Optional ISO date filter
        """
        return await self._facade.get_options_chain(symbol, expiry_date)

    async def get_contract(self, option_symbol: str) -> OptionContract:
        raise NotImplementedError("get_contract implemented in v2")
```

### tests/unit/domain/test_repositories.py
```python
"""Unit tests for concrete repositories."""
import pytest, asyncio
from unittest.mock import AsyncMock, MagicMock
from decimal import Decimal
from backend.infrastructure.snaptrade.position_repository import SnapTradePositionRepository
from backend.infrastructure.polygon.options_repository import PolygonOptionsRepository
from backend.adapters.adapter_registry import AdapterRegistry

def test_position_repo_normalises_fidelity():
    mock_facade = MagicMock()
    mock_facade.get_raw_positions = AsyncMock(return_value=[
        {"broker_name": "FIDELITY",
         "account": {"name": "Rollover IRA", "number": "***7040"},
         "positions": [{"symbol": {"symbol": "AAL"}, "units": "2000",
                        "average_purchase_price": "11.27", "price": "10.97"}]}
    ])
    repo = SnapTradePositionRepository(mock_facade, AdapterRegistry())
    result = asyncio.get_event_loop().run_until_complete(repo.get_positions("user123"))
    assert len(result) == 1
    assert result[0].broker == "Fidelity"
    assert result[0].symbol == "AAL"

def test_position_repo_skips_unknown_brokers():
    mock_facade = MagicMock()
    mock_facade.get_raw_positions = AsyncMock(return_value=[
        {"broker_name": "UNKNOWN_BROKER_XYZ",
         "account": {"name": "Test", "number": "123"}, "positions": []}
    ])
    repo = SnapTradePositionRepository(mock_facade, AdapterRegistry())
    result = asyncio.get_event_loop().run_until_complete(repo.get_positions("user123"))
    assert result == []

def test_options_repo_delegates_to_facade():
    mock_facade = MagicMock()
    mock_facade.get_options_chain = AsyncMock(return_value=[])
    repo = PolygonOptionsRepository(mock_facade)
    asyncio.get_event_loop().run_until_complete(repo.get_chain("AAL"))
    mock_facade.get_options_chain.assert_called_once_with("AAL", None)
```

**Gate:** `pytest backend/tests/unit/domain/test_repositories.py -v` — 3 tests pass.

---

## STEP 10 — Domain Services

### domain/positions/service.py
```python
"""Position domain service."""
from typing import List
from backend.domain.positions.models import Position, Portfolio
from backend.domain.positions.repository import AbstractPositionRepository

class PositionService:
    """Orchestrates position retrieval and portfolio calculation.

    Args:
        repository: AbstractPositionRepository implementation
    """
    def __init__(self, repository: AbstractPositionRepository):
        self._repository = repository

    async def get_portfolio(self, user_id: str) -> Portfolio:
        """Fetch all positions and build Portfolio aggregate.

        Args:
            user_id: Authenticated user ID
        Returns:
            Portfolio with all positions
        """
        positions = await self._repository.get_positions(user_id)
        return Portfolio(user_id=user_id, positions=positions)

    async def get_positions_for_symbol(self, user_id: str, symbol: str) -> List[Position]:
        """Get positions for a specific ticker across all brokers.

        Args:
            user_id: Authenticated user ID
            symbol: Ticker symbol to filter by
        """
        positions = await self._repository.get_positions(user_id)
        return [p for p in positions if p.symbol == symbol.upper()]
```

### domain/options/service.py
```python
"""Options domain service."""
from typing import List, Optional
from backend.domain.options.models import OptionContract, OptionsChain
from backend.domain.options.repository import AbstractOptionsRepository

class OptionsService:
    """Orchestrates options chain data retrieval.

    Args:
        repository: AbstractOptionsRepository implementation
    """
    def __init__(self, repository: AbstractOptionsRepository):
        self._repository = repository

    async def get_chain(self, symbol: str, expiry_date: Optional[str] = None) -> OptionsChain:
        """Fetch complete options chain for a symbol.

        Args:
            symbol: Ticker e.g. AAL
            expiry_date: Optional ISO date filter
        Returns:
            OptionsChain with all contracts
        """
        contracts = await self._repository.get_chain(symbol, expiry_date)
        return OptionsChain(underlying=symbol.upper(), expiry_date=expiry_date or "all", contracts=contracts)

    async def get_puts(self, symbol: str) -> List[OptionContract]:
        """Get only put contracts for a symbol."""
        chain = await self.get_chain(symbol)
        return chain.puts
```

### domain/analysis/service.py
```python
"""Analysis domain service for AI explanations."""
from backend.domain.analysis.models import AIExplanation
from backend.domain.options.models import OptionContract
from backend.domain.hedging.models import HedgeRecommendation
from backend.domain.positions.models import Position

class AnalysisService:
    """Generates AI explanations for options and hedge recommendations.

    Args:
        claude_facade: ClaudeFacade with caching
    """
    def __init__(self, claude_facade):
        self._claude = claude_facade

    async def explain_option(self, option: OptionContract,
                              calls_today: int = 0, is_free_user: bool = True) -> AIExplanation:
        """Generate plain English explanation of an option contract.

        Args:
            option: OptionContract to explain
            calls_today: Number of AI calls user made today
            is_free_user: Whether to enforce daily call limit
        Returns:
            AIExplanation with content and metadata
        """
        option_data = {
            "symbol": option.symbol, "expiry": option.expiry_date,
            "strike": str(option.strike), "option_type": option.option_type,
            "ask": str(option.ask), "open_interest": option.open_interest,
            "delta": str(option.delta) if option.delta else "N/A",
            "implied_volatility": str(option.implied_volatility)
        }
        content = await self._claude.explain_option(option_data, calls_today, is_free_user)
        return AIExplanation(content=content, model_used="claude-haiku-4-5-20251001")

    async def explain_hedge(self, position: Position, recommendation: HedgeRecommendation,
                             calls_today: int = 0, is_free_user: bool = True) -> AIExplanation:
        """Explain why a specific hedge recommendation is suggested.

        Args:
            position: The position being hedged
            recommendation: The recommended put option
        Returns:
            AIExplanation with two-sentence rationale
        """
        position_data = {"symbol": position.symbol, "shares": str(position.quantity),
                         "entry_price": str(position.entry_price), "current_price": str(position.current_price)}
        rec_data = {"expiry": recommendation.contract.expiry_date,
                    "strike": str(recommendation.contract.strike),
                    "ask": str(recommendation.contract.ask),
                    "total_cost": str(recommendation.total_cost),
                    "contracts": str(recommendation.contracts_to_buy),
                    "breakeven": str(recommendation.breakeven_price),
                    "coverage_at_10pct_drop": str(recommendation.coverage_at_10pct_drop)}
        content = await self._claude.explain_hedge_recommendation(
            position_data, rec_data, calls_today, is_free_user)
        return AIExplanation(content=content, model_used="claude-haiku-4-5-20251001")
```

### tests/unit/domain/test_services.py
```python
"""Unit tests for domain services."""
import pytest, asyncio
from unittest.mock import AsyncMock, MagicMock
from decimal import Decimal
from backend.domain.positions.service import PositionService
from backend.domain.options.service import OptionsService
from backend.domain.positions.models import Position, Portfolio

def make_position():
    return Position("Fidelity", "IRA", "***7040", "AAL",
                    Decimal("2000"), Decimal("11.27"), Decimal("10.97"))

def test_position_service_returns_portfolio():
    mock_repo = MagicMock()
    mock_repo.get_positions = AsyncMock(return_value=[make_position()])
    service = PositionService(mock_repo)
    portfolio = asyncio.get_event_loop().run_until_complete(service.get_portfolio("user123"))
    assert portfolio.user_id == "user123"
    assert len(portfolio.positions) == 1

def test_position_service_filters_by_symbol():
    mock_repo = MagicMock()
    mock_repo.get_positions = AsyncMock(return_value=[make_position()])
    service = PositionService(mock_repo)
    result = asyncio.get_event_loop().run_until_complete(service.get_positions_for_symbol("user123", "AAL"))
    assert len(result) == 1
    empty = asyncio.get_event_loop().run_until_complete(service.get_positions_for_symbol("user123", "MSFT"))
    assert len(empty) == 0

def test_options_service_returns_chain():
    mock_repo = MagicMock()
    mock_repo.get_chain = AsyncMock(return_value=[])
    service = OptionsService(mock_repo)
    chain = asyncio.get_event_loop().run_until_complete(service.get_chain("AAL"))
    assert chain.underlying == "AAL"
```

**Gate:** `pytest backend/tests/unit/domain/test_services.py -v` — 3 tests pass.

---

## STEP 11 — Hedge Strategies

### domain/hedging/strategies/protective_put.py
```python
"""Protective Put Strategy — the core Emergency Hedge engine.

Answers the midnight question:
'I hold 5,000 AAL shares. Oil just spiked. What puts should I buy?'
"""
from typing import List
from decimal import Decimal
from datetime import date, timedelta
from backend.domain.hedging.strategies.base import AbstractHedgeStrategy
from backend.domain.hedging.models import HedgeRecommendation
from backend.domain.options.models import OptionContract
from backend.domain.positions.models import Position
from backend.domain.common.errors import InsufficientLiquidityError

MIN_OI = 5000
MIN_DAYS = 14
MAX_DAYS = 90
MIN_STRIKE_PCT = Decimal("0.80")
MAX_STRIKE_PCT = Decimal("1.05")
CONTRACTS = 50

class ProtectivePutStrategy(AbstractHedgeStrategy):
    """Recommends put options to protect a long stock position.

    Algorithm:
        1. Filter puts only, expiry 14-90 days out
        2. Filter strikes 80-105% of current price
        3. Filter OI >= 5000 (liquidity)
        4. Score each: value_score = coverage_at_10pct_drop / total_cost
        5. Return top N sorted by value_score desc
    """
    @property
    def name(self) -> str: return "Protective Put"

    def calculate(self, position: Position, options_chain: List[OptionContract],
                  num_recommendations: int = 3) -> List[HedgeRecommendation]:
        """Calculate top put recommendations.

        Args:
            position: Stock position to hedge
            options_chain: All available options
            num_recommendations: How many to return (default 3)
        Returns:
            Ranked list of HedgeRecommendation, best value_score first
        Raises:
            InsufficientLiquidityError: If no puts meet filter criteria
        """
        today = date.today()
        min_expiry = today + timedelta(days=MIN_DAYS)
        max_expiry = today + timedelta(days=MAX_DAYS)
        min_strike = position.current_price * MIN_STRIKE_PCT
        max_strike = position.current_price * MAX_STRIKE_PCT

        candidates = [
            c for c in options_chain
            if (c.option_type.upper() == "PUT"
                and c.open_interest >= MIN_OI
                and min_expiry <= date.fromisoformat(c.expiry_date) <= max_expiry
                and min_strike <= c.strike <= max_strike
                and c.ask > 0)
        ]
        if not candidates:
            raise InsufficientLiquidityError(symbol=position.symbol, min_oi=MIN_OI)

        scored = sorted([self._score(c, position) for c in candidates],
                        key=lambda r: r.value_score, reverse=True)
        return scored[:num_recommendations]

    def _score(self, option: OptionContract, position: Position) -> HedgeRecommendation:
        """Calculate cost, coverage, breakeven and value_score for one option."""
        total_cost = (option.ask * 100 * CONTRACTS).quantize(Decimal("0.01"))
        breakeven = (option.strike - option.ask).quantize(Decimal("0.01"))
        drop_10_price = position.current_price * Decimal("0.90")
        coverage = Decimal("0")
        if option.strike > drop_10_price:
            coverage = ((option.strike - drop_10_price - option.ask) * 100 * CONTRACTS).quantize(Decimal("0.01"))
        value_score = (coverage / total_cost).quantize(Decimal("0.0001")) if total_cost > 0 else Decimal("0")
        return HedgeRecommendation(contract=option, contracts_to_buy=CONTRACTS,
            total_cost=total_cost, breakeven_price=breakeven,
            coverage_at_10pct_drop=coverage, value_score=value_score)

    def calculate_breakeven(self, option: OptionContract) -> Decimal:
        """Calculate breakeven: strike - ask."""
        return (option.strike - option.ask).quantize(Decimal("0.01"))
```

### domain/hedging/service.py
```python
"""Hedge domain service."""
from typing import List
from backend.domain.hedging.models import HedgeRecommendation
from backend.domain.hedging.strategies.base import AbstractHedgeStrategy
from backend.domain.options.repository import AbstractOptionsRepository
from backend.domain.positions.models import Position

class HedgeService:
    """Orchestrates hedge recommendations using Strategy + Options data.

    Args:
        options_repo: Repository for options chain data
        strategy: Hedge calculation algorithm to use

    Example:
        service = HedgeService(
            options_repo=PolygonOptionsRepository(...),
            strategy=ProtectivePutStrategy()
        )
        recs = await service.get_recommendations(position)
    """
    def __init__(self, options_repo: AbstractOptionsRepository, strategy: AbstractHedgeStrategy):
        self._options_repo = options_repo
        self._strategy = strategy

    async def get_recommendations(self, position: Position,
                                   num_recommendations: int = 3) -> List[HedgeRecommendation]:
        """Get top hedge recommendations for a position.

        Args:
            position: The stock position to hedge
            num_recommendations: How many to return
        Returns:
            Ranked HedgeRecommendation list
        Raises:
            InsufficientLiquidityError: If no liquid options available
        """
        options_chain = await self._options_repo.get_chain(position.symbol)
        return self._strategy.calculate(position, options_chain, num_recommendations)
```

### tests/unit/domain/test_hedge_strategies.py
```python
"""Unit tests for hedge strategies — THE core algorithm tests."""
import pytest
from decimal import Decimal
from datetime import date, timedelta
from backend.domain.hedging.strategies.protective_put import ProtectivePutStrategy
from backend.domain.positions.models import Position
from backend.domain.options.models import OptionContract
from backend.domain.common.errors import InsufficientLiquidityError

def make_position(price="10.97"):
    return Position("Fidelity", "IRA", "***7040", "AAL",
                    Decimal("5000"), Decimal("11.30"), Decimal(price))

def make_put(strike="10.00", ask="0.49", oi=75310, days=65):
    return OptionContract(
        symbol="AAL", underlying="AAL", option_type="PUT",
        strike=Decimal(strike), expiry_date=(date.today() + timedelta(days=days)).isoformat(),
        bid=Decimal("0.47"), ask=Decimal(ask), volume=1000,
        open_interest=oi, implied_volatility=Decimal("0.56"),
        delta=Decimal("-0.25"), days_to_expiry=days)

@pytest.fixture
def strategy(): return ProtectivePutStrategy()

@pytest.fixture
def mock_chain(): return [
    make_put("11.00", "0.19", 17521, 30),
    make_put("10.00", "0.49", 75310, 65),
    make_put("9.00",  "0.27", 12000, 45),
    make_put("10.50", "0.35", 8000,  50),
]

def test_returns_three_recommendations(strategy, mock_chain):
    assert len(strategy.calculate(make_position(), mock_chain, 3)) == 3

def test_sorted_by_value_score_desc(strategy, mock_chain):
    result = strategy.calculate(make_position(), mock_chain, 3)
    scores = [r.value_score for r in result]
    assert scores == sorted(scores, reverse=True)

def test_filters_low_oi(strategy):
    with pytest.raises(InsufficientLiquidityError):
        strategy.calculate(make_position(), [make_put(oi=100)])

def test_filters_expired_options(strategy):
    with pytest.raises(InsufficientLiquidityError):
        strategy.calculate(make_position(), [make_put(days=5)])

def test_breakeven_equals_strike_minus_ask(strategy):
    assert strategy.calculate_breakeven(make_put("10.00", "0.49")) == Decimal("9.51")

def test_cost_equals_ask_times_100_times_50(strategy, mock_chain):
    result = strategy.calculate(make_position(), mock_chain, 3)
    for rec in result:
        expected = rec.contract.ask * 100 * 50
        assert rec.total_cost == expected.quantize(Decimal("0.01"))

def test_midnight_aal_scenario(strategy):
    """The real scenario: 5000 AAL shares, entry $11.30, current $10.97."""
    chain = [make_put("11.00","0.19",17521,30), make_put("10.00","0.49",75310,65), make_put("9.00","0.27",12000,45)]
    result = strategy.calculate(make_position("10.97"), chain, 3)
    assert len(result) == 3
    assert all(r.contract.option_type.upper() == "PUT" for r in result)
    assert all(r.contracts_to_buy == 50 for r in result)
```

**Gate:** `pytest backend/tests/unit/domain/test_hedge_strategies.py -v` — all 7 tests pass.

---

## STEP 12 — API Gateway (Rate Limiter + API Key Scaffold)

### api/gateway/rate_limiter.py
```python
"""Token bucket rate limiter for the API Gateway."""
import time
from collections import defaultdict

class RateLimiter:
    """Per-user rate limiter. Enforces tiers for future API monetization.

    Tiers:
        free_internal:    Unlimited (app users via JWT)
        free_external:    10 req/min, 100 req/day
        starter_external: 60 req/min, 1,000 req/day
        pro_external:     300 req/min, 10,000 req/day
    """
    TIERS = {
        "free_internal":    {"rpm": None, "rpd": None},
        "free_external":    {"rpm": 10,   "rpd": 100},
        "starter_external": {"rpm": 60,   "rpd": 1000},
        "pro_external":     {"rpm": 300,  "rpd": 10000},
    }

    def __init__(self):
        self._minute_counts = defaultdict(list)

    def check(self, user_id: str, tier: str = "free_internal") -> bool:
        """Check if request is within rate limits.

        Args:
            user_id: User identifier
            tier: Rate limit tier name
        Returns:
            True if allowed, False if rate limited
        """
        limits = self.TIERS.get(tier, self.TIERS["free_internal"])
        if limits["rpm"] is None: return True
        now = time.monotonic()
        self._minute_counts[user_id] = [t for t in self._minute_counts[user_id] if t > now - 60]
        if len(self._minute_counts[user_id]) >= limits["rpm"]: return False
        self._minute_counts[user_id].append(now)
        return True
```

### api/gateway/api_key_auth.py (SCAFFOLD)
```python
"""API key auth for external consumers — SCAFFOLD for v2 monetization.

TODO v2:
    - Store API keys in DB with tier + usage metadata
    - Validate on every external /api/v1/ request
    - Track usage per key for billing
"""
from fastapi import Header
from typing import Optional

async def verify_api_key(x_api_key: Optional[str] = Header(None)) -> Optional[str]:
    """Validate API key. SCAFFOLD: no-op in v0.1, returns None."""
    return None  # TODO v2: look up in database, return tier string
```

---

## STEP 13 — BFF Layer

### api/bff/web_bff.py (ACTIVE)
```python
"""Web BFF — ACTIVE. Shapes API responses for the React web app.

BFF Pattern: Each client gets its own BFF.
web_bff.py    = ACTIVE (React web)
desktop_bff.py = SCAFFOLD (Electron)
mobile_bff.py  = SCAFFOLD (iPhone, iPad, Android)
"""
from typing import List
from backend.domain.positions.models import Portfolio
from backend.domain.hedging.models import HedgeRecommendation

def shape_portfolio_response(portfolio: Portfolio) -> dict:
    """Shape Portfolio for the React PositionsTable component.

    Args:
        portfolio: Portfolio aggregate from PositionService
    Returns:
        Dict shaped for React frontend
    """
    positions = [{
        "broker": p.broker, "accountName": p.account_name, "symbol": p.symbol,
        "quantity": float(p.quantity), "entryPrice": float(p.entry_price),
        "currentPrice": float(p.current_price), "marketValue": float(p.market_value),
        "unrealisedPnl": float(p.unrealised_pnl),
        "unrealisedPnlPct": float(p.unrealised_pnl_pct)
    } for p in portfolio.positions]
    return {
        "positions": positions,
        "total_value": float(portfolio.total_value),
        "total_unrealised_pnl": float(portfolio.total_unrealised_pnl)
    }

def shape_hedge_response(recommendations: List[HedgeRecommendation]) -> dict:
    """Shape HedgeRecommendations for React EmergencyHedge component.

    Args:
        recommendations: Ranked list from HedgeService
    Returns:
        Dict shaped for React frontend
    """
    recs = [{
        "rank": i + 1, "expiry_date": r.contract.expiry_date,
        "strike": float(r.contract.strike), "ask": float(r.contract.ask),
        "open_interest": r.contract.open_interest,
        "total_cost": float(r.total_cost), "breakeven_price": float(r.breakeven_price),
        "coverage_at_10pct_drop": float(r.coverage_at_10pct_drop),
        "value_score": float(r.value_score), "ai_explanation": r.ai_explanation
    } for i, r in enumerate(recommendations)]
    return {"recommendations": recs, "strategy": "Protective Put"}
```

### api/bff/desktop_bff.py (SCAFFOLD)
```python
"""Desktop BFF — SCAFFOLD for future Electron desktop app.

Desktop needs: full Greeks, Level 2 data, real-time WebSocket, CSV/PDF export.
TODO: Implement when building the Electron desktop app.
"""
def shape_portfolio_response(portfolio):
    """SCAFFOLD: richer response with full Greeks for desktop."""
    raise NotImplementedError("Desktop BFF activates in v2 with Electron app")

def shape_hedge_response(recommendations):
    """SCAFFOLD: extended analytics for desktop."""
    raise NotImplementedError("Desktop BFF activates in v2 with Electron app")
```

### api/bff/mobile_bff.py (SCAFFOLD)
```python
"""Mobile BFF — SCAFFOLD for future iPhone, iPad, Android apps.

Mobile needs: smaller payloads, pagination, push notification metadata.
TODO: Implement when building iOS/Android apps.
"""
def shape_portfolio_response(portfolio, page=1, page_size=20):
    """SCAFFOLD: compressed fields and pagination for mobile."""
    raise NotImplementedError("Mobile BFF activates in v2 with iOS/Android app")

def shape_hedge_response(recommendations):
    """SCAFFOLD: abbreviated fields for mobile bandwidth."""
    raise NotImplementedError("Mobile BFF activates in v2 with iOS/Android app")
```

### tests/unit/test_bff.py
```python
"""Tests for BFF response shaping."""
import pytest
from decimal import Decimal
from backend.domain.positions.models import Position, Portfolio
from backend.domain.hedging.models import HedgeRecommendation
from backend.domain.options.models import OptionContract
from backend.api.bff.web_bff import shape_portfolio_response, shape_hedge_response

def make_portfolio():
    pos = Position("Fidelity","IRA","***7040","AAL",Decimal("2000"),Decimal("11.27"),Decimal("10.97"))
    return Portfolio(user_id="user123", positions=[pos])

def make_recommendation():
    from datetime import date, timedelta
    opt = OptionContract(symbol="AAL260618P00010000", underlying="AAL", option_type="PUT",
        strike=Decimal("10.00"), expiry_date=(date.today()+timedelta(days=65)).isoformat(),
        bid=Decimal("0.47"), ask=Decimal("0.49"), volume=100, open_interest=75310,
        implied_volatility=Decimal("0.56"), delta=Decimal("-0.25"), days_to_expiry=65)
    return HedgeRecommendation(contract=opt, contracts_to_buy=50, total_cost=Decimal("2450"),
        breakeven_price=Decimal("9.51"), coverage_at_10pct_drop=Decimal("1050"), value_score=Decimal("0.4286"))

def test_portfolio_response_has_positions_and_totals():
    result = shape_portfolio_response(make_portfolio())
    assert "positions" in result and "total_value" in result
    assert len(result["positions"]) == 1

def test_hedge_response_has_recommendations():
    result = shape_hedge_response([make_recommendation()])
    assert len(result["recommendations"]) == 1
    assert result["recommendations"][0]["rank"] == 1

def test_desktop_bff_raises_not_implemented():
    from backend.api.bff.desktop_bff import shape_portfolio_response
    with pytest.raises(NotImplementedError): shape_portfolio_response(None)

def test_mobile_bff_raises_not_implemented():
    from backend.api.bff.mobile_bff import shape_portfolio_response
    with pytest.raises(NotImplementedError): shape_portfolio_response(None)
```

**Gate:** `pytest backend/tests/unit/test_bff.py -v` — 4 tests pass.

---

## SESSION 3 COMPLETION CHECKLIST

- [ ] `pytest backend/tests/unit/domain/test_repositories.py` — 3 pass
- [ ] `pytest backend/tests/unit/domain/test_services.py` — 3 pass
- [ ] `pytest backend/tests/unit/domain/test_hedge_strategies.py` — 7 pass
- [ ] `pytest backend/tests/unit/test_bff.py` — 4 pass
- [ ] All previous Session 1 + 2 tests still passing
- [ ] Total: 40+ passing, 0 failing

**Say "Session 3 complete — all tests passing" and stop.**

```bash
git add .
git commit -m "HedgeIQ v0.1 Session 3: repositories, services, strategies, gateway, BFF"
```

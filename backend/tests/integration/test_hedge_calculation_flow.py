"""Integration tests for the full hedge calculation flow.

Core scenario: midnight AAL hedge — 5000 shares at $11.30, current $10.97.

Part A (domain-service level): tests HedgeService + ProtectivePutStrategy
  directly with mocked repositories — no HTTP layer.

Part B (HTTP level): tests POST /api/v1/hedge/recommend end-to-end via
  httpx.AsyncClient with PolygonOptionsRepository mocked.
"""
import json
import pytest
from decimal import Decimal
from datetime import date, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport

from backend.main import app
from backend.api.v1.auth import get_current_user
from backend.domain.hedging.service import HedgeService
from backend.domain.hedging.strategies.protective_put import ProtectivePutStrategy
from backend.domain.options.models import OptionContract
from backend.domain.positions.models import Position
from backend.domain.common.errors import InsufficientLiquidityError


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_chain():
    """Build a realistic AAL options chain with 3 liquid puts."""
    return [
        OptionContract(
            symbol="AAL260417P00011000",
            underlying="AAL",
            option_type="PUT",
            strike=Decimal("11.00"),
            expiry_date=(date.today() + timedelta(days=30)).isoformat(),
            bid=Decimal("0.17"),
            ask=Decimal("0.19"),
            volume=500,
            open_interest=17521,
            implied_volatility=Decimal("0.52"),
            delta=Decimal("-0.46"),
            days_to_expiry=30,
        ),
        OptionContract(
            symbol="AAL260618P00010000",
            underlying="AAL",
            option_type="PUT",
            strike=Decimal("10.00"),
            expiry_date=(date.today() + timedelta(days=65)).isoformat(),
            bid=Decimal("0.47"),
            ask=Decimal("0.49"),
            volume=800,
            open_interest=75310,
            implied_volatility=Decimal("0.56"),
            delta=Decimal("-0.25"),
            days_to_expiry=65,
        ),
        OptionContract(
            symbol="AAL260618P00009000",
            underlying="AAL",
            option_type="PUT",
            strike=Decimal("9.00"),
            expiry_date=(date.today() + timedelta(days=45)).isoformat(),
            bid=Decimal("0.25"),
            ask=Decimal("0.27"),
            volume=300,
            open_interest=12000,
            implied_volatility=Decimal("0.61"),
            delta=Decimal("-0.15"),
            days_to_expiry=45,
        ),
    ]


def _load_chain_from_fixture() -> list[OptionContract]:
    """Convert mock_options_chain.json dicts to OptionContract domain objects."""
    with open("backend/tests/fixtures/mock_options_chain.json") as f:
        data = json.load(f)
    return [
        OptionContract(
            symbol=c["symbol"],
            underlying=c["underlying"],
            option_type=c["option_type"],
            strike=Decimal(c["strike"]),
            expiry_date=c["expiry_date"],
            bid=Decimal(c["bid"]),
            ask=Decimal(c["ask"]),
            volume=int(c["volume"]),
            open_interest=int(c["open_interest"]),
            implied_volatility=Decimal(c["implied_volatility"]),
            delta=Decimal(c["delta"]),
            days_to_expiry=int(c["days_to_expiry"]),
        )
        for c in data
    ]


def _mock_user():
    return SimpleNamespace(
        id="test-user",
        email="test@hedgeiq.com",
        is_pro=True,
        is_admin=False,
        daily_ai_calls_used=0,
        snaptrade_user_id="test-snaptrade-user",
    )


# ---------------------------------------------------------------------------
# Part A — Domain-service level (no HTTP)
# ---------------------------------------------------------------------------

async def test_midnight_aal_scenario():
    """The real scenario: 5000 AAL at $11.30, current $10.97. Expect 3 recommendations."""
    mock_repo = MagicMock()
    mock_repo.get_chain = AsyncMock(return_value=make_chain())
    service = HedgeService(options_repo=mock_repo, strategy=ProtectivePutStrategy())
    position = Position(
        "Fidelity", "Rollover IRA", "***7040", "AAL",
        Decimal("5000"), Decimal("11.30"), Decimal("10.97"),
    )
    result = await service.get_recommendations(position, 3)

    assert len(result) == 3
    assert all(r.contract.option_type.upper() == "PUT" for r in result)
    assert all(r.contracts_to_buy == 50 for r in result)
    assert result[0].value_score >= result[1].value_score


async def test_empty_chain_raises_insufficient_liquidity():
    """An empty options chain should raise InsufficientLiquidityError."""
    mock_repo = MagicMock()
    mock_repo.get_chain = AsyncMock(return_value=[])
    service = HedgeService(options_repo=mock_repo, strategy=ProtectivePutStrategy())
    position = Position(
        "Fidelity", "IRA", "1", "AAL",
        Decimal("5000"), Decimal("11.30"), Decimal("10.97"),
    )
    with pytest.raises(InsufficientLiquidityError):
        await service.get_recommendations(position)


async def test_recommendations_sorted_by_value_score():
    """Results must be sorted best-value-first."""
    mock_repo = MagicMock()
    mock_repo.get_chain = AsyncMock(return_value=make_chain())
    service = HedgeService(options_repo=mock_repo, strategy=ProtectivePutStrategy())
    position = Position(
        "Fidelity", "IRA", "1", "AAL",
        Decimal("5000"), Decimal("11.30"), Decimal("10.97"),
    )
    result = await service.get_recommendations(position, 3)
    scores = [r.value_score for r in result]
    assert scores == sorted(scores, reverse=True)


async def test_total_cost_matches_50_contracts():
    """total_cost must equal ask * 100 * 50 for each recommendation."""
    mock_repo = MagicMock()
    mock_repo.get_chain = AsyncMock(return_value=make_chain())
    service = HedgeService(options_repo=mock_repo, strategy=ProtectivePutStrategy())
    position = Position(
        "Fidelity", "IRA", "1", "AAL",
        Decimal("5000"), Decimal("11.30"), Decimal("10.97"),
    )
    result = await service.get_recommendations(position, 3)
    for rec in result:
        expected_cost = rec.contract.ask * 100 * 50
        assert abs(rec.total_cost - expected_cost) < Decimal("0.01")


async def test_all_recommendations_meet_min_oi():
    """All returned contracts must have OI >= 5000."""
    mock_repo = MagicMock()
    mock_repo.get_chain = AsyncMock(return_value=make_chain())
    service = HedgeService(options_repo=mock_repo, strategy=ProtectivePutStrategy())
    position = Position(
        "Fidelity", "IRA", "1", "AAL",
        Decimal("5000"), Decimal("11.30"), Decimal("10.97"),
    )
    result = await service.get_recommendations(position, 3)
    assert all(r.contract.open_interest >= 5000 for r in result)


# ---------------------------------------------------------------------------
# Part B — HTTP level (via httpx AsyncClient)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_midnight_aal_hedge_returns_3_recommendations():
    """The origin scenario — HTTP level. Chain from fixture → 3 recommendations."""
    chain = _load_chain_from_fixture()
    app.dependency_overrides[get_current_user] = _mock_user
    try:
        with patch(
            "backend.infrastructure.polygon.options_repository.PolygonOptionsRepository.get_chain",
            new_callable=AsyncMock,
            return_value=chain,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/hedge/recommend",
                    json={
                        "symbol": "AAL",
                        "shares_held": 5000,
                        "entry_price": 11.30,
                        "current_price": 10.97,
                    },
                )
        assert response.status_code == 200
        recs = response.json()["recommendations"]
        assert len(recs) == 3
        assert all(r["open_interest"] >= 5000 for r in recs)
        assert all(r["total_cost"] > 0 for r in recs)
    finally:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_low_oi_returns_422():
    """No liquid options should return 422 Unprocessable Entity."""
    low_oi_chain = [
        OptionContract(
            symbol="AAL260618P00010000",
            underlying="AAL",
            option_type="PUT",
            strike=Decimal("10.00"),
            expiry_date=(date.today() + timedelta(days=66)).isoformat(),
            bid=Decimal("0.48"),
            ask=Decimal("0.51"),
            volume=50,
            open_interest=100,  # below MIN_OI=5000
            implied_volatility=Decimal("0.55"),
            delta=Decimal("-0.25"),
            days_to_expiry=66,
        )
    ]
    app.dependency_overrides[get_current_user] = _mock_user
    try:
        with patch(
            "backend.infrastructure.polygon.options_repository.PolygonOptionsRepository.get_chain",
            new_callable=AsyncMock,
            return_value=low_oi_chain,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/hedge/recommend",
                    json={
                        "symbol": "AAL",
                        "shares_held": 5000,
                        "entry_price": 11.30,
                        "current_price": 10.97,
                    },
                )
        assert response.status_code == 422
    finally:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_http_recommendations_sorted_by_value_score():
    """HTTP response recommendations must be sorted by value_score descending."""
    chain = _load_chain_from_fixture()
    app.dependency_overrides[get_current_user] = _mock_user
    try:
        with patch(
            "backend.infrastructure.polygon.options_repository.PolygonOptionsRepository.get_chain",
            new_callable=AsyncMock,
            return_value=chain,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/hedge/recommend",
                    json={
                        "symbol": "AAL",
                        "shares_held": 5000,
                        "entry_price": 11.30,
                        "current_price": 10.97,
                    },
                )
        recs = response.json()["recommendations"]
        scores = [r["value_score"] for r in recs]
        assert scores == sorted(scores, reverse=True)
    finally:
        app.dependency_overrides.pop(get_current_user, None)

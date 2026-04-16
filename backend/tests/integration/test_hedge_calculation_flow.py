"""Integration tests for the full hedge calculation flow.

Core scenario: midnight AAL hedge — 5000 shares at $11.30, current $10.97.
No HTTP layer — tests domain services directly with mocked repositories.
"""
import pytest
from decimal import Decimal
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock

from backend.domain.hedging.service import HedgeService
from backend.domain.hedging.strategies.protective_put import ProtectivePutStrategy
from backend.domain.options.models import OptionContract
from backend.domain.positions.models import Position
from backend.domain.common.errors import InsufficientLiquidityError


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

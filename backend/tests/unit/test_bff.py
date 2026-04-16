"""Unit tests for BFF response-shaping functions."""
from datetime import date, timedelta
from decimal import Decimal

import pytest

from backend.api.bff.web_bff import shape_hedge_response, shape_portfolio_response
from backend.domain.hedging.models import HedgeRecommendation
from backend.domain.options.models import OptionContract
from backend.domain.positions.models import Portfolio, Position


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_portfolio():
    pos = Position(
        "Fidelity", "IRA", "***7040", "AAL",
        Decimal("2000"), Decimal("11.27"), Decimal("10.97"),
    )
    return Portfolio(user_id="user123", positions=[pos])


def make_recommendation():
    opt = OptionContract(
        symbol="AAL260618P00010000",
        underlying="AAL",
        option_type="PUT",
        strike=Decimal("10.00"),
        expiry_date=(date.today() + timedelta(days=65)).isoformat(),
        bid=Decimal("0.47"),
        ask=Decimal("0.49"),
        volume=100,
        open_interest=75310,
        implied_volatility=Decimal("0.56"),
        delta=Decimal("-0.25"),
        days_to_expiry=65,
    )
    return HedgeRecommendation(
        contract=opt,
        contracts_to_buy=50,
        total_cost=Decimal("2450"),
        breakeven_price=Decimal("9.51"),
        coverage_at_10pct_drop=Decimal("1050"),
        value_score=Decimal("0.4286"),
    )


# ---------------------------------------------------------------------------
# Web BFF — portfolio shaping
# ---------------------------------------------------------------------------

def test_portfolio_response_has_positions_and_totals():
    result = shape_portfolio_response(make_portfolio())
    assert "positions" in result
    assert "total_value" in result
    assert len(result["positions"]) == 1


# ---------------------------------------------------------------------------
# Web BFF — hedge shaping
# ---------------------------------------------------------------------------

def test_hedge_response_has_recommendations():
    result = shape_hedge_response([make_recommendation()])
    assert len(result["recommendations"]) == 1
    assert result["recommendations"][0]["rank"] == 1


# ---------------------------------------------------------------------------
# Scaffold BFFs raise NotImplementedError
# ---------------------------------------------------------------------------

def test_desktop_bff_raises_not_implemented():
    from backend.api.bff.desktop_bff import shape_portfolio_response as desk_shape
    with pytest.raises(NotImplementedError):
        desk_shape(None)


def test_mobile_bff_raises_not_implemented():
    from backend.api.bff.mobile_bff import shape_portfolio_response as mob_shape
    with pytest.raises(NotImplementedError):
        mob_shape(None)

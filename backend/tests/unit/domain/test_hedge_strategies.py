"""Unit tests for hedge strategies — the core algorithm tests.

These are the most important tests in the project: they verify the engine
that answers 'what puts should I buy right now?'
"""
from datetime import date, timedelta
from decimal import Decimal

import pytest

from backend.domain.common.errors import InsufficientLiquidityError
from backend.domain.hedging.strategies.protective_put import ProtectivePutStrategy
from backend.domain.options.models import OptionContract
from backend.domain.positions.models import Position


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_position(price="10.97"):
    return Position(
        "Fidelity", "IRA", "***7040", "AAL",
        Decimal("5000"), Decimal("11.30"), Decimal(price),
    )


def make_put(strike="10.00", ask="0.49", oi=75310, days=65):
    return OptionContract(
        symbol="AAL",
        underlying="AAL",
        option_type="PUT",
        strike=Decimal(strike),
        expiry_date=(date.today() + timedelta(days=days)).isoformat(),
        bid=Decimal("0.47"),
        ask=Decimal(ask),
        volume=1000,
        open_interest=oi,
        implied_volatility=Decimal("0.56"),
        delta=Decimal("-0.25"),
        days_to_expiry=days,
    )


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def strategy():
    return ProtectivePutStrategy()


@pytest.fixture
def mock_chain():
    return [
        make_put("11.00", "0.19", 17521, 30),
        make_put("10.00", "0.49", 75310, 65),
        make_put("9.00",  "0.27", 12000, 45),
        make_put("10.50", "0.35", 8000,  50),
    ]


# ---------------------------------------------------------------------------
# Core algorithm tests
# ---------------------------------------------------------------------------

def test_returns_three_recommendations(strategy, mock_chain):
    result = strategy.calculate(make_position(), mock_chain, 3)
    assert len(result) == 3


def test_sorted_by_value_score_desc(strategy, mock_chain):
    result = strategy.calculate(make_position(), mock_chain, 3)
    scores = [r.value_score for r in result]
    assert scores == sorted(scores, reverse=True)


def test_filters_low_oi(strategy):
    """A chain with only low-OI options should raise InsufficientLiquidityError."""
    with pytest.raises(InsufficientLiquidityError):
        strategy.calculate(make_position(), [make_put(oi=100)])


def test_filters_expired_options(strategy):
    """Options expiring in fewer than 14 days should be filtered out."""
    with pytest.raises(InsufficientLiquidityError):
        strategy.calculate(make_position(), [make_put(days=5)])


def test_breakeven_equals_strike_minus_ask(strategy):
    assert strategy.calculate_breakeven(
        make_put("10.00", "0.49")
    ) == Decimal("9.51")


def test_cost_equals_ask_times_100_times_50(strategy, mock_chain):
    result = strategy.calculate(make_position(), mock_chain, 3)
    for rec in result:
        expected = (rec.contract.ask * 100 * 50).quantize(Decimal("0.01"))
        assert rec.total_cost == expected


def test_midnight_aal_scenario(strategy):
    """The real scenario: 5,000 AAL shares, entry $11.30, now $10.97."""
    chain = [
        make_put("11.00", "0.19", 17521, 30),
        make_put("10.00", "0.49", 75310, 65),
        make_put("9.00",  "0.27", 12000, 45),
    ]
    result = strategy.calculate(make_position("10.97"), chain, 3)
    assert len(result) == 3
    assert all(r.contract.option_type.upper() == "PUT" for r in result)
    assert all(r.contracts_to_buy == 50 for r in result)

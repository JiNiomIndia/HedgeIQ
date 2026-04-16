"""Unit tests for domain services."""
import asyncio
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest

from backend.domain.options.service import OptionsService
from backend.domain.positions.models import Portfolio, Position
from backend.domain.positions.service import PositionService


def make_position():
    return Position(
        "Fidelity", "IRA", "***7040", "AAL",
        Decimal("2000"), Decimal("11.27"), Decimal("10.97"),
    )


# ---------------------------------------------------------------------------
# PositionService
# ---------------------------------------------------------------------------

def test_position_service_returns_portfolio():
    mock_repo = MagicMock()
    mock_repo.get_positions = AsyncMock(return_value=[make_position()])
    service = PositionService(mock_repo)
    portfolio = asyncio.run(service.get_portfolio("user123"))
    assert portfolio.user_id == "user123"
    assert len(portfolio.positions) == 1


def test_position_service_filters_by_symbol():
    mock_repo = MagicMock()
    mock_repo.get_positions = AsyncMock(return_value=[make_position()])
    service = PositionService(mock_repo)

    result = asyncio.run(service.get_positions_for_symbol("user123", "AAL"))
    assert len(result) == 1

    empty = asyncio.run(service.get_positions_for_symbol("user123", "MSFT"))
    assert len(empty) == 0


# ---------------------------------------------------------------------------
# OptionsService
# ---------------------------------------------------------------------------

def test_options_service_returns_chain():
    mock_repo = MagicMock()
    mock_repo.get_chain = AsyncMock(return_value=[])
    service = OptionsService(mock_repo)
    chain = asyncio.run(service.get_chain("AAL"))
    assert chain.underlying == "AAL"

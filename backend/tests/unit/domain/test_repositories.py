"""Unit tests for concrete repository implementations."""
import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest

from backend.adapters.adapter_registry import AdapterRegistry
from backend.infrastructure.polygon.options_repository import PolygonOptionsRepository
from backend.infrastructure.snaptrade.position_repository import SnapTradePositionRepository


# ---------------------------------------------------------------------------
# SnapTradePositionRepository
# ---------------------------------------------------------------------------

def test_position_repo_normalises_fidelity():
    mock_facade = MagicMock()
    mock_facade.get_raw_positions = AsyncMock(
        return_value=[
            {
                "broker_name": "FIDELITY",
                "account": {"name": "Rollover IRA", "number": "***7040"},
                "positions": [
                    {
                        "symbol": {"symbol": "AAL"},
                        "units": "2000",
                        "average_purchase_price": "11.27",
                        "price": "10.97",
                    }
                ],
            }
        ]
    )
    repo = SnapTradePositionRepository(mock_facade, AdapterRegistry())
    result = asyncio.run(repo.get_positions("user123"))
    assert len(result) == 1
    assert result[0].broker == "Fidelity"
    assert result[0].symbol == "AAL"


def test_position_repo_skips_unknown_brokers():
    mock_facade = MagicMock()
    mock_facade.get_raw_positions = AsyncMock(
        return_value=[
            {
                "broker_name": "UNKNOWN_BROKER_XYZ",
                "account": {"name": "Test", "number": "123"},
                "positions": [],
            }
        ]
    )
    repo = SnapTradePositionRepository(mock_facade, AdapterRegistry())
    result = asyncio.run(repo.get_positions("user123"))
    assert result == []


# ---------------------------------------------------------------------------
# PolygonOptionsRepository
# ---------------------------------------------------------------------------

def test_options_repo_delegates_to_facade():
    mock_facade = MagicMock()
    mock_facade.get_options_chain = AsyncMock(return_value=[])
    repo = PolygonOptionsRepository(mock_facade)
    asyncio.run(repo.get_chain("AAL"))
    mock_facade.get_options_chain.assert_called_once_with("AAL", None)

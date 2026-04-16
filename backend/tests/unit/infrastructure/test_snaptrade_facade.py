"""Unit tests for SnapTrade facade — no real SDK calls."""
import asyncio

import pytest

from backend.infrastructure.snaptrade.facade import SnapTradeFacade


@pytest.fixture
def facade():
    """Facade with SDK client forced to None (mock mode)."""
    f = SnapTradeFacade(client_id="test_id", consumer_key="test_key")
    f._client = None
    return f


# ---------------------------------------------------------------------------
# Position retrieval
# ---------------------------------------------------------------------------

def test_get_raw_positions_returns_list(facade):
    result = asyncio.run(facade.get_raw_positions("user123", "secret123"))
    assert isinstance(result, list)
    assert len(result) > 0


def test_mock_positions_include_fidelity(facade):
    result = asyncio.run(facade.get_raw_positions("user123", "secret123"))
    broker_names = [p.get("broker_name") for p in result]
    assert "FIDELITY" in broker_names


# ---------------------------------------------------------------------------
# Connection URL
# ---------------------------------------------------------------------------

def test_connection_url_returns_string(facade):
    url = asyncio.run(facade.get_connection_url("user123", "FIDELITY"))
    assert isinstance(url, str) and len(url) > 0

"""Integration tests for positions flow. SnapTrade is mocked.

Tests the full HTTP stack: request → auth → service → BFF → response.
Auth dependency is overridden so no real JWT is needed.
"""
import json
import pytest
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport

from backend.main import app
from backend.api.v1.auth import get_current_user
from backend.domain.positions.models import Position

# ---------------------------------------------------------------------------
# Shared fixture helpers
# ---------------------------------------------------------------------------

def _load_positions() -> list[Position]:
    """Convert mock_positions.json dicts to Position domain objects."""
    with open("backend/tests/fixtures/mock_positions.json") as f:
        data = json.load(f)
    return [
        Position(
            broker=p["broker"],
            account_name=p["account_name"],
            account_id=p["account_id"],
            symbol=p["symbol"],
            quantity=Decimal(p["quantity"]),
            entry_price=Decimal(p["entry_price"]),
            current_price=Decimal(p["current_price"]),
        )
        for p in data
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
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_positions_returns_all_brokers():
    """Positions from Fidelity and Public both appear in the response."""
    positions = _load_positions()
    app.dependency_overrides[get_current_user] = _mock_user
    try:
        with patch(
            "backend.infrastructure.snaptrade.position_repository.SnapTradePositionRepository.get_positions",
            new_callable=AsyncMock,
            return_value=positions,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.get("/api/v1/positions")
        assert response.status_code == 200
        brokers = {p["broker"] for p in response.json()["positions"]}
        assert "Fidelity" in brokers and "Public" in brokers
    finally:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_positions_response_has_totals():
    """Response includes total_value and total_unrealised_pnl fields."""
    positions = _load_positions()
    app.dependency_overrides[get_current_user] = _mock_user
    try:
        with patch(
            "backend.infrastructure.snaptrade.position_repository.SnapTradePositionRepository.get_positions",
            new_callable=AsyncMock,
            return_value=positions,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.get("/api/v1/positions")
        data = response.json()
        assert "total_value" in data and "total_unrealised_pnl" in data
        assert data["total_value"] > 0
    finally:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_positions_empty_gracefully():
    """Empty position list returns 200 with empty positions array."""
    app.dependency_overrides[get_current_user] = _mock_user
    try:
        with patch(
            "backend.infrastructure.snaptrade.position_repository.SnapTradePositionRepository.get_positions",
            new_callable=AsyncMock,
            return_value=[],
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as client:
                response = await client.get("/api/v1/positions")
        assert response.status_code == 200
        assert response.json()["positions"] == []
    finally:
        app.dependency_overrides.pop(get_current_user, None)

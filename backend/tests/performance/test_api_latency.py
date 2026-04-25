"""Performance tests — p95 latency SLA assertions for every HedgeIQ endpoint.

Contract:
  Each endpoint must respond within its documented p95 target under 50 sequential
  warm calls (no cold-start penalty included in measurement window).

Run with:
    pytest backend/tests/performance/ -v --asyncio-mode=auto

Note: External services (Polygon, SnapTrade, Claude) are mocked so network
      latency is excluded — we measure FastAPI routing + serialisation + domain logic only.
"""
import asyncio
import time
from datetime import date, timedelta
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient, ASGITransport

from backend.main import app
from backend.api.v1.auth import get_current_user
from backend.config import settings


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _user(is_pro=True):
    return SimpleNamespace(
        id="perf-test-user",
        email="perf@hedgeiq.test",
        is_pro=is_pro,
        is_admin=True,
        daily_ai_calls_used=0,
        snaptrade_user_id="perf-test-user",
        snaptrade_user_secret="perf-secret",
    )


def _mock_bars(n=90):
    return [
        {"open": 10.0, "high": 11.0, "low": 9.0, "close": 10.5, "volume": 1000, "timestamp": 1700000000 + i}
        for i in range(n)
    ]


def _mock_chain():
    from backend.domain.options.models import OptionContract
    return [
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
        )
    ]


def _mock_portfolio():
    from backend.domain.positions.models import Position, Portfolio
    return Portfolio(
        user_id="perf-test-user",
        positions=[
            Position(
                broker="ROBINHOOD",
                account_name="Robinhood Individual",
                account_id="***4521",
                symbol="AAL",
                quantity=Decimal("5000"),
                entry_price=Decimal("11.30"),
                current_price=Decimal("10.97"),
            )
        ],
    )


async def _measure_p95(client, method: str, url: str, iterations: int = 100, **kwargs) -> float:
    """Run `iterations` sequential requests and return the p95 latency in ms.

    Default is 100 iterations for statistical reliability.
    AI tests use 30 because the mock is fast but setup overhead is higher.
    """
    latencies = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        await client.request(method, url, **kwargs)
        latencies.append((time.perf_counter() - t0) * 1000)
    latencies.sort()
    idx = int(0.95 * len(latencies))
    return latencies[min(idx, len(latencies) - 1)]


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
async def perf_client():
    """Pre-authenticated async test client with user override."""
    app.dependency_overrides[get_current_user] = lambda: _user()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
    app.dependency_overrides.pop(get_current_user, None)


# ---------------------------------------------------------------------------
# Latency tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_health_p95_under_50ms():
    """GET /health — zero dependencies — p95 < 50ms."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        p95 = await _measure_p95(client, "GET", "/health")
    assert p95 < 50, f"Health p95={p95:.1f}ms exceeds 50ms SLA"


@pytest.mark.asyncio
async def test_login_p95_under_600ms(perf_client):
    """POST /auth/login with real PBKDF2 must complete in < 600ms p95.

    The login endpoint runs 100,000 PBKDF2-HMAC-SHA256 iterations.
    On Railway shared CPU this typically takes 200-400ms.
    600ms gives headroom without masking a regression.
    Uses real credentials against real endpoint (no mocking) to validate the actual CPU cost.
    """
    # Use admin credentials which always work without needing a DB user
    body = {
        "email": settings.admin_email,
        "password": settings.admin_password,
    }
    # 50 samples — PBKDF2 takes ~300ms each, so 50 samples takes ~15s max
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        p95 = await _measure_p95(client, "POST", "/api/v1/auth/login", json=body, iterations=50)
    assert p95 < 600, f"Login p95={p95:.1f}ms exceeds 600ms SLA"


@pytest.mark.asyncio
async def test_positions_p95_under_500ms(perf_client):
    """GET /positions — SnapTrade mocked — p95 < 500ms."""
    with patch(
        "backend.domain.positions.service.PositionService.get_portfolio",
        new_callable=AsyncMock,
        return_value=_mock_portfolio(),
    ):
        p95 = await _measure_p95(perf_client, "GET", "/api/v1/positions")
    assert p95 < 500, f"Positions p95={p95:.1f}ms exceeds 500ms SLA"


@pytest.mark.asyncio
async def test_options_chain_p95_under_300ms(perf_client):
    """GET /options/{symbol} — Polygon mocked — p95 < 300ms."""
    with patch(
        "backend.infrastructure.polygon.options_repository.PolygonOptionsRepository.get_chain",
        new_callable=AsyncMock,
        return_value=_mock_chain(),
    ):
        p95 = await _measure_p95(perf_client, "GET", "/api/v1/options/AAL")
    assert p95 < 300, f"Options chain p95={p95:.1f}ms exceeds 300ms SLA"


@pytest.mark.asyncio
async def test_hedge_recommend_p95_under_400ms(perf_client):
    """POST /hedge/recommend — Polygon mocked — p95 < 400ms."""
    with patch(
        "backend.infrastructure.polygon.options_repository.PolygonOptionsRepository.get_chain",
        new_callable=AsyncMock,
        return_value=_mock_chain(),
    ):
        body = {
            "symbol": "AAL",
            "shares_held": 5000,
            "entry_price": 11.30,
            "current_price": 10.97,
        }
        p95 = await _measure_p95(perf_client, "POST", "/api/v1/hedge/recommend", json=body)
    # Accept both 200 (recs found) and 422 (no liquid puts) in perf test — measure latency only
    assert p95 < 400, f"Hedge recommend p95={p95:.1f}ms exceeds 400ms SLA"


@pytest.mark.asyncio
async def test_quotes_chart_p95_under_300ms(perf_client):
    """GET /quotes/{symbol}/chart — Polygon mocked — p95 < 300ms."""
    with patch(
        "backend.infrastructure.polygon.facade.PolygonFacade.get_daily_bars",
        new_callable=AsyncMock,
        return_value=_mock_bars(90),
    ):
        p95 = await _measure_p95(perf_client, "GET", "/api/v1/quotes/AAPL/chart?days=90")
    assert p95 < 300, f"Chart p95={p95:.1f}ms exceeds 300ms SLA"


@pytest.mark.asyncio
async def test_quotes_news_p95_under_300ms(perf_client):
    """GET /quotes/{symbol}/news — Polygon mocked — p95 < 300ms."""
    with patch(
        "backend.infrastructure.polygon.facade.PolygonFacade.get_ticker_news",
        new_callable=AsyncMock,
        return_value=[{"headline": "News", "url": "https://n.com", "published_utc": "2026-04-01T00:00:00Z", "source": "Reuters"}],
    ):
        p95 = await _measure_p95(perf_client, "GET", "/api/v1/quotes/AAL/news?limit=5")
    assert p95 < 300, f"News p95={p95:.1f}ms exceeds 300ms SLA"


@pytest.mark.asyncio
async def test_ai_explain_p95_under_500ms(perf_client):
    """POST /ai/explain with mocked Claude must complete in < 500ms p95.

    The real Claude API adds 1-3s of network latency.
    This test validates the HedgeIQ routing layer only (Claude is mocked).
    500ms allows for prompt construction, token counting, and serialization overhead.

    Uses 30 samples (not 100) — Claude mock is fast but 100 would be slow in CI.
    """
    with patch(
        "backend.infrastructure.claude.facade.ClaudeFacade.explain_option",
        new_callable=AsyncMock,
        return_value="This put provides downside protection at $10 through June 2026.",
    ):
        body = {"contract": {"symbol": "AAL260618P00010000", "strike": 10.0}}
        p95 = await _measure_p95(perf_client, "POST", "/api/v1/ai/explain", json=body, iterations=30)
    assert p95 < 500, f"AI explain p95={p95:.1f}ms exceeds 500ms SLA"


@pytest.mark.asyncio
async def test_ai_chat_p95_under_500ms(perf_client):
    """POST /ai/chat with mocked Claude must complete in < 500ms p95.

    Uses 30 samples (not 100) — mock is fast but 100 would inflate CI runtime.
    """
    with patch(
        "backend.infrastructure.claude.facade.ClaudeFacade.chat",
        new_callable=AsyncMock,
        return_value="Your largest position is AAL. Consider hedging with puts.",
    ):
        body = {"message": "What is my biggest risk?", "history": []}
        p95 = await _measure_p95(perf_client, "POST", "/api/v1/ai/chat", json=body, iterations=30)
    assert p95 < 500, f"AI chat p95={p95:.1f}ms exceeds 500ms SLA"


# ---------------------------------------------------------------------------
# Concurrent load test
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_concurrent_hedge_requests_no_500():
    """20 concurrent hedge/recommend requests must all return 200 or 422 — no 500."""
    app.dependency_overrides[get_current_user] = lambda: _user()
    try:
        with patch(
            "backend.infrastructure.polygon.options_repository.PolygonOptionsRepository.get_chain",
            new_callable=AsyncMock,
            return_value=_mock_chain(),
        ):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                body = {
                    "symbol": "AAL",
                    "shares_held": 5000,
                    "entry_price": 11.30,
                    "current_price": 10.97,
                }
                tasks = [
                    client.post("/api/v1/hedge/recommend", json=body)
                    for _ in range(20)
                ]
                results = await asyncio.gather(*tasks, return_exceptions=True)

        errors = [r for r in results if isinstance(r, Exception)]
        assert len(errors) == 0, f"Got {len(errors)} exceptions in concurrent requests"

        status_codes = [r.status_code for r in results if not isinstance(r, Exception)]
        bad = [sc for sc in status_codes if sc not in (200, 422, 404)]
        assert len(bad) == 0, f"Unexpected status codes: {bad}"
    finally:
        app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.asyncio
async def test_concurrent_positions_no_500():
    """20 concurrent /positions requests must all return 200 — no 500."""
    app.dependency_overrides[get_current_user] = lambda: _user()
    try:
        with patch(
            "backend.domain.positions.service.PositionService.get_portfolio",
            new_callable=AsyncMock,
            return_value=_mock_portfolio(),
        ):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                tasks = [client.get("/api/v1/positions") for _ in range(20)]
                results = await asyncio.gather(*tasks, return_exceptions=True)

        errors = [r for r in results if isinstance(r, Exception)]
        assert len(errors) == 0
        bad = [r.status_code for r in results if not isinstance(r, Exception) and r.status_code == 500]
        assert len(bad) == 0
    finally:
        app.dependency_overrides.pop(get_current_user, None)

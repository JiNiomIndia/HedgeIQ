"""Unit tests for Polygon facade — no real HTTP calls."""
import asyncio
from unittest.mock import MagicMock

import pytest

from backend.infrastructure.cache.chroma_cache import ChromaCache
from backend.infrastructure.polygon.facade import PolygonFacade, TokenBucket


@pytest.fixture
def cache(tmp_path):
    return ChromaCache(path=str(tmp_path / "polygon_cache"))


@pytest.fixture
def facade(cache):
    """Facade in mock mode (no real Polygon client)."""
    f = PolygonFacade(api_key="test_key", cache=cache)
    f._client = None  # force mock chain
    return f


# ---------------------------------------------------------------------------
# Happy-path
# ---------------------------------------------------------------------------

def test_returns_list_of_contracts(facade):
    result = asyncio.run(facade.get_options_chain("AAL"))
    assert isinstance(result, list)
    assert len(result) > 0


# ---------------------------------------------------------------------------
# Caching behaviour
# ---------------------------------------------------------------------------

def test_cache_hit_skips_polygon_api(facade, cache):
    """Pre-seeding the cache should prevent any call to _mock_chain."""
    cache.set(
        "polygon:chain:AAL:all",
        [
            {
                "symbol": "AAL260618P00010000",
                "underlying": "AAL",
                "option_type": "PUT",
                "strike": "10.00",
                "expiry_date": "2026-06-18",
                "bid": "0.48",
                "ask": "0.51",
                "volume": 100,
                "open_interest": 75310,
                "implied_volatility": "0.55",
                "delta": "-0.25",
            }
        ],
        ttl_hours=1,
    )

    call_count = {"n": 0}
    original_mock = facade._mock_chain

    def counting_mock(symbol):
        call_count["n"] += 1
        return original_mock(symbol)

    facade._mock_chain = counting_mock
    asyncio.run(facade.get_options_chain("AAL"))
    assert call_count["n"] == 0


# ---------------------------------------------------------------------------
# Error handling
# ---------------------------------------------------------------------------

def test_data_unavailable_on_exception(facade):
    """Polygon SDK errors must be wrapped as DataUnavailableError."""
    from backend.domain.common.errors import DataUnavailableError

    facade._client = MagicMock()
    facade._client.list_snapshot_options_chain.side_effect = Exception("API down")

    with pytest.raises(DataUnavailableError):
        asyncio.run(facade.get_options_chain("AAL"))


# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------

def test_rate_limiter_tokens_decrease(cache):
    """Acquiring from a bucket with 3 tokens should leave 2."""
    limiter = TokenBucket(rate=5)
    limiter._tokens = 3.0
    asyncio.run(limiter.acquire())
    assert limiter._tokens == pytest.approx(2.0, abs=0.01)

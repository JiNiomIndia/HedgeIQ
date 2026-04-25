"""Unit tests for Claude facade — no real API calls.

All async tests run via asyncio.run() so they work cleanly on Python 3.14
without triggering the deprecated get_event_loop() path.
"""
import asyncio
from unittest.mock import MagicMock, patch

import pytest

from backend.domain.common.errors import DailyLimitExceededError
from backend.infrastructure.cache.chroma_cache import ChromaCache
from backend.infrastructure.claude.facade import ClaudeFacade

# ---------------------------------------------------------------------------
# Standard option payload used across multiple tests
# ---------------------------------------------------------------------------
OPTION_PAYLOAD = {
    "symbol": "AAL",
    "expiry": "2026-06-18",
    "strike": "10.00",
    "option_type": "put",
    "ask": "0.49",
    "open_interest": 75310,
    "delta": "-0.25",
    "implied_volatility": "0.56",
}


@pytest.fixture
def cache(tmp_path):
    return ChromaCache(path=str(tmp_path / "claude_cache"))


@pytest.fixture
def facade(cache):
    return ClaudeFacade(api_key="sk-ant-test", cache=cache)


# ---------------------------------------------------------------------------
# Daily limit enforcement
# ---------------------------------------------------------------------------

def test_daily_limit_blocks_6th_call(facade):
    """Free user on their 6th call should raise DailyLimitExceededError."""
    with pytest.raises(DailyLimitExceededError):
        asyncio.run(facade.explain_option({}, calls_today=5, is_free_user=True))


def test_pro_user_not_limited(facade):
    """Pro user with 100 calls today must not be blocked."""
    with patch.object(facade._client.messages, "create") as mock:
        mock.return_value = MagicMock(content=[MagicMock(text="Explanation")])
        result = asyncio.run(
            facade.explain_option(OPTION_PAYLOAD, calls_today=100, is_free_user=False)
        )
    assert "Explanation" in result


# ---------------------------------------------------------------------------
# Caching behaviour
# ---------------------------------------------------------------------------

def test_cache_hit_skips_api_call(facade, cache):
    """Second identical request must be served from cache — API never called."""
    cache.set(
        "explain_option:AAL:2026-06-18:10.00:put",
        "Cached explanation",
        ttl_hours=24,
    )
    with patch.object(facade._client.messages, "create") as mock_api:
        asyncio.run(
            facade.explain_option(
                {"symbol": "AAL", "expiry": "2026-06-18",
                 "strike": "10.00", "option_type": "put"},
                calls_today=0,
                is_free_user=True,
            )
        )
        mock_api.assert_not_called()


# ---------------------------------------------------------------------------
# Disclaimer injection
# ---------------------------------------------------------------------------

def test_disclaimer_appended(facade):
    """Every Claude response must carry the regulatory disclaimer."""
    with patch.object(facade._client.messages, "create") as mock:
        mock.return_value = MagicMock(content=[MagicMock(text="Explanation.")])
        result = asyncio.run(
            facade.explain_option(OPTION_PAYLOAD, calls_today=0, is_free_user=False)
        )
    assert "not investment advice" in result


# ---------------------------------------------------------------------------
# Model selection
# ---------------------------------------------------------------------------

def test_haiku_model_used(facade):
    """The Haiku model (claude-haiku-4-5 family) must be used in v0.1."""
    with patch.object(facade._client.messages, "create") as mock:
        mock.return_value = MagicMock(content=[MagicMock(text="Explanation")])
        asyncio.run(
            facade.explain_option(OPTION_PAYLOAD, calls_today=0, is_free_user=False)
        )
    model_used = mock.call_args.kwargs.get("model") or ""
    # Accept any claude-haiku-4-5 variant (with or without date suffix)
    assert "claude-haiku-4-5" in model_used

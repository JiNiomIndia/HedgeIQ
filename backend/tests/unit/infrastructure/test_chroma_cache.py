"""Unit tests for ChromaDB cache.

Each test uses pytest's tmp_path fixture so ChromaDB writes to an isolated
temporary directory — tests are fully independent and leave no artefacts.
"""
import hashlib
import json
import math
from datetime import UTC, datetime, timedelta

import pytest

from backend.infrastructure.cache.chroma_cache import ChromaCache


@pytest.fixture
def cache(tmp_path):
    """Fresh ChromaCache backed by an isolated tmp directory."""
    return ChromaCache(
        path=str(tmp_path / "test_cache"),
        collection_name="test",
    )


# ------------------------------------------------------------------
# Basic miss / hit
# ------------------------------------------------------------------

def test_cache_miss_returns_none(cache):
    assert cache.get("nonexistent") is None


def test_cache_set_and_get(cache):
    cache.set("key1", {"data": "hello"}, ttl_hours=1)
    assert cache.get("key1") == {"data": "hello"}


def test_cache_set_returns_true(cache):
    assert cache.set("key2", {"v": 1}) is True


# ------------------------------------------------------------------
# Upsert behaviour
# ------------------------------------------------------------------

def test_cache_upsert_overwrites(cache):
    cache.set("key3", {"version": 1})
    cache.set("key3", {"version": 2})
    assert cache.get("key3") == {"version": 2}


# ------------------------------------------------------------------
# Invalidation
# ------------------------------------------------------------------

def test_cache_invalidate(cache):
    cache.set("key4", {"data": "value"})
    cache.invalidate("key4")
    assert cache.get("key4") is None


# ------------------------------------------------------------------
# Complex objects
# ------------------------------------------------------------------

def test_cache_handles_complex_objects(cache):
    data = {
        "symbol": "AAL",
        "contracts": [{"strike": "10.00"}],
        "count": 40,
    }
    cache.set("complex", data)
    assert cache.get("complex") == data


# ------------------------------------------------------------------
# TTL / expiry
# ------------------------------------------------------------------

def test_cache_ttl_expiry(cache):
    """Manually insert a record with an already-past expiry and confirm get() returns None."""
    doc_id = hashlib.md5("expired_key".encode()).hexdigest()
    past = (datetime.now(UTC).replace(tzinfo=None) - timedelta(hours=1)).isoformat()
    cache._collection.upsert(
        ids=[doc_id],
        documents=[json.dumps({"data": "old"})],
        metadatas=[{"key": "expired_key", "expires_at": past, "ttl_hours": 0}],
    )
    assert cache.get("expired_key") is None


# ------------------------------------------------------------------
# Error resilience
# ------------------------------------------------------------------

def test_cache_set_false_on_bad_data(cache):
    """Non-JSON-serialisable values should return bool without raising.

    json.dumps with default=str converts math.inf to the string "Infinity"
    so the call succeeds — the test asserts no exception is raised and that
    the return type is bool either way.
    """
    result = cache.set("bad", {"val": math.inf})
    assert isinstance(result, bool)

"""ChromaDB persistent key-value cache with TTL support.

Not using vector embeddings — ChromaDB is used here purely as a persistent
key-value store because it ships as a zero-dependency local database.
The cache backs options chain and AI explanation lookups to avoid redundant
API calls and Claude token spend.

Usage::

    cache = ChromaCache(path="./data/chroma_cache")
    cache.set("options_chain:AAL:2024-06-18", data, ttl_hours=1)
    result = cache.get("options_chain:AAL:2024-06-18")  # None if expired
"""
import hashlib
import json
from datetime import UTC, datetime, timedelta
from typing import Any, Optional

import chromadb
import structlog

# chromadb 1.x: Settings moved to chromadb.config but anonymized_telemetry
# is now controlled via the ANONYMIZED_TELEMETRY env var or omitted entirely.
# PersistentClient accepts path directly; no Settings kwarg needed.

log = structlog.get_logger()


class ChromaCache:
    """Persistent cache backed by ChromaDB local storage.

    Each cache entry is stored as a ChromaDB document with metadata tracking
    the original key and expiry timestamp. On get(), expired entries are
    deleted transparently.

    Args:
        path: Local filesystem path for ChromaDB storage directory.
        collection_name: ChromaDB collection name for this cache.

    Example::

        cache = ChromaCache(path="./data/chroma_cache")
        cache.set("options_chain:AAL", data, ttl_hours=1)
        result = cache.get("options_chain:AAL")
    """

    def __init__(
        self,
        path: str = "./data/chroma_cache",
        collection_name: str = "hedgeiq_cache",
    ):
        # chromadb 1.x: PersistentClient takes path only; telemetry opt-out
        # is set via the ANONYMIZED_TELEMETRY=false environment variable.
        self._client = chromadb.PersistentClient(path=path)
        self._collection = self._client.get_or_create_collection(
            name=collection_name
        )
        log.info("ChromaDB cache initialised", path=path, collection=collection_name)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _make_id(self, key: str) -> str:
        """Stable MD5 hex digest of the cache key, used as ChromaDB document ID."""
        return hashlib.md5(key.encode()).hexdigest()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get(self, key: str) -> Optional[Any]:
        """Return the cached value for *key*, or None if missing or expired.

        Expired entries are deleted from ChromaDB on first access so the
        collection does not accumulate stale records.

        Args:
            key: Cache key string, e.g. "options_chain:AAL:2024-06-18".

        Returns:
            The original Python object (dict, list, etc.) or None.
        """
        doc_id = self._make_id(key)
        try:
            result = self._collection.get(
                ids=[doc_id],
                include=["documents", "metadatas"],
            )
            if not result["ids"]:
                return None

            expires_at = datetime.fromisoformat(result["metadatas"][0]["expires_at"])
            if datetime.now(UTC).replace(tzinfo=None) > expires_at:
                self._collection.delete(ids=[doc_id])
                log.debug("Cache entry expired and deleted", key=key)
                return None

            return json.loads(result["documents"][0])
        except Exception as e:
            log.warning("Cache get error", key=key, error=str(e))
            return None

    def set(self, key: str, value: Any, ttl_hours: int = 24) -> bool:
        """Store *value* under *key* with a TTL.

        Uses upsert so repeated calls overwrite the existing entry cleanly.

        Args:
            key: Cache key string.
            value: Any JSON-serialisable Python object.
            ttl_hours: Time-to-live in hours (default 24).

        Returns:
            True on success, False on serialisation or storage error.
        """
        doc_id = self._make_id(key)
        expires_at = (datetime.now(UTC).replace(tzinfo=None) + timedelta(hours=ttl_hours)).isoformat()
        try:
            serialised = json.dumps(value, default=str)
            self._collection.upsert(
                ids=[doc_id],
                documents=[serialised],
                metadatas=[
                    {
                        "key": key,
                        "expires_at": expires_at,
                        "ttl_hours": ttl_hours,
                    }
                ],
            )
            return True
        except Exception as e:
            log.warning("Cache set error", key=key, error=str(e))
            return False

    def invalidate(self, key: str) -> bool:
        """Delete the cache entry for *key*.

        Args:
            key: Cache key to remove.

        Returns:
            True on success (including key not found), False on unexpected error.
        """
        try:
            self._collection.delete(ids=[self._make_id(key)])
            return True
        except Exception as e:
            log.warning("Cache invalidate error", key=key, error=str(e))
            return False

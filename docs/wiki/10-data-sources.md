# 10 — Data sources

## Polygon.io

Polygon is the source of truth for:

- Options chains (`/v3/snapshot/options/{underlying}`)
- OHLC bars (`/v2/aggs/ticker/{symbol}/range/{m}/{tf}/{from}/{to}`)
- Real-time quotes (`/v2/last/trade/{symbol}`)
- News (`/v2/reference/news?ticker=...`)

The wrapper is `backend/infrastructure/polygon/facade.py` — a thin async client (`httpx.AsyncClient`) with retry-on-5xx and request-coalescing.

`backend/infrastructure/polygon/options_repository.py` implements the `OptionsRepository` interface from `backend/domain/options/repository.py`, normalising Polygon's snake-cased payload into our `OptionContract` model.

### Rate limits

Free-tier Polygon allows 5 requests/minute. We aggressively cache to stay well below this in production. Pro tiers raise the ceiling; the code path is identical.

## ChromaDB cache

`backend/infrastructure/cache/chroma_cache.py` wraps a local ChromaDB instance. Three collections:

| Collection | Key | Value | TTL |
|------------|-----|-------|-----|
| `options_chains` | `(symbol, expiry_window)` | full chain JSON | 5 min |
| `quotes` | `symbol` | `{ last, bid, ask, ts }` | 30 sec |
| `ai_responses` | `sha256(prompt+args)` | response text | 1 hour |

Why ChromaDB rather than Redis? — TTL + metadata filtering work without operational overhead, and we get free embedding storage if we later want similarity-keyed retrieval (e.g., "show me past hedges similar to this one").

## Fallback strategies

Every external call is wrapped:

```python
try:
    return await polygon.fetch(...)
except (httpx.HTTPError, asyncio.TimeoutError) as e:
    logger.warning("polygon down, serving stale or mock", exc_info=True)
    cached = cache.get(key, allow_stale=True)
    if cached:
        return cached
    return MOCK_FALLBACK[symbol]
```

This means:
- A Polygon outage degrades to *stale* data (still actionable for most users).
- Total cache miss + outage → labelled mock data (frontend shows "demo" banner).
- We never propagate a vendor 500 to the client.

## Provenance

Every response carries `source` metadata in the `X-Data-Source` header: `live` | `cached` | `mock`. The frontend renders a small chip when the value isn't `live`.

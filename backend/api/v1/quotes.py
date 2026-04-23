"""Stock quote and price history endpoints."""
from fastapi import APIRouter, Depends, Path, Query, Response

from backend.api.v1.auth import get_current_user

router = APIRouter(prefix="/quotes", tags=["Quotes"])


@router.get(
    "/{symbol}/chart",
    summary="Daily OHLC price bars for a symbol",
    description="Returns trailing N days of OHLC bars for sparkline/candlestick charts.",
)
async def get_chart(
    symbol: str = Path(...),
    days: int = Query(90, ge=5, le=365),
    current_user=Depends(get_current_user),
    response: Response = None,
):
    """Fetch daily price bars."""
    from backend.infrastructure.polygon.facade import PolygonFacade
    from backend.infrastructure.cache.chroma_cache import ChromaCache
    from backend.config import settings

    cache = ChromaCache(path=settings.chromadb_path)
    facade = PolygonFacade(settings.polygon_api_key, cache)
    cache_key = f"polygon:bars:{symbol.upper()}:{days}"
    was_cached = cache.get(cache_key) is not None
    bars = await facade.get_daily_bars(symbol.upper(), days=days)
    latest = bars[-1] if bars else None
    change = 0.0
    change_pct = 0.0
    if len(bars) >= 2:
        change = bars[-1]["close"] - bars[-2]["close"]
        change_pct = (change / bars[-2]["close"]) * 100 if bars[-2]["close"] else 0
    if response is not None:
        response.headers["X-Cache-Status"] = "HIT" if was_cached else "MISS"
        response.headers["Cache-Control"] = "public, max-age=7200"
    return {
        "symbol": symbol.upper(),
        "bars": bars,
        "last_close": latest["close"] if latest else 0,
        "day_change": round(change, 2),
        "day_change_pct": round(change_pct, 2),
    }


@router.get(
    "/{symbol}/news",
    summary="Recent news articles for a symbol",
)
async def get_news(
    symbol: str = Path(...),
    limit: int = Query(8, ge=1, le=20),
    current_user=Depends(get_current_user),
):
    """Fetch recent ticker news from Polygon."""
    from backend.infrastructure.polygon.facade import PolygonFacade
    from backend.infrastructure.cache.chroma_cache import ChromaCache
    from backend.config import settings

    cache = ChromaCache(path=settings.chromadb_path)
    facade = PolygonFacade(settings.polygon_api_key, cache)
    articles = await facade.get_ticker_news(symbol.upper(), limit=limit)
    return {"symbol": symbol.upper(), "articles": articles}

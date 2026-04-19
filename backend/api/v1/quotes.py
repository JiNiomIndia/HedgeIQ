"""Stock quote and price history endpoints."""
from fastapi import APIRouter, Depends, Path, Query

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
):
    """Fetch daily price bars."""
    from backend.infrastructure.polygon.facade import PolygonFacade
    from backend.infrastructure.cache.chroma_cache import ChromaCache
    from backend.config import settings

    cache = ChromaCache(path=settings.chromadb_path)
    facade = PolygonFacade(settings.polygon_api_key, cache)
    bars = await facade.get_daily_bars(symbol.upper(), days=days)
    latest = bars[-1] if bars else None
    change = 0.0
    change_pct = 0.0
    if len(bars) >= 2:
        change = bars[-1]["close"] - bars[-2]["close"]
        change_pct = (change / bars[-2]["close"]) * 100 if bars[-2]["close"] else 0
    return {
        "symbol": symbol.upper(),
        "bars": bars,
        "last_close": latest["close"] if latest else 0,
        "day_change": round(change, 2),
        "day_change_pct": round(change_pct, 2),
    }

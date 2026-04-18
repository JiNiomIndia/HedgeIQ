"""Options chain endpoints."""
from fastapi import APIRouter, Depends, Path, Query
from typing import Optional

from backend.api.v1.schemas import OptionsChainResponse, OptionContractOut
from backend.api.v1.auth import get_current_user

router = APIRouter(prefix="/options", tags=["Options"])


@router.get(
    "/{symbol}",
    response_model=OptionsChainResponse,
    status_code=200,
    summary="Get options chain for a symbol",
    description=(
        "Returns options chain from Polygon.io. "
        "Free tier: EOD data. Pro: real-time. Cached 1 hour."
    ),
)
async def get_options_chain(
    symbol: str = Path(..., examples=["AAL"]),
    expiry_date: Optional[str] = Query(None),
    current_user=Depends(get_current_user),
):
    """Fetch options chain with caching."""
    from backend.infrastructure.polygon.facade import PolygonFacade
    from backend.infrastructure.polygon.options_repository import PolygonOptionsRepository
    from backend.domain.options.service import OptionsService
    from backend.infrastructure.cache.chroma_cache import ChromaCache
    from backend.config import settings

    cache = ChromaCache(path=settings.chromadb_path)
    facade = PolygonFacade(settings.polygon_api_key, cache)
    repo = PolygonOptionsRepository(facade)
    service = OptionsService(repo)
    chain = await service.get_chain(symbol.upper(), expiry_date)

    def to_out(c) -> OptionContractOut:
        return OptionContractOut(
            symbol=c.symbol,
            expiry_date=c.expiry_date,
            strike=float(c.strike),
            option_type=c.option_type,
            bid=float(c.bid),
            ask=float(c.ask),
            volume=c.volume,
            open_interest=c.open_interest,
            implied_volatility=float(c.implied_volatility) if c.implied_volatility is not None else 0.0,
            delta=float(c.delta) if c.delta is not None else None,
            days_to_expiry=c.days_to_expiry,
        )

    return OptionsChainResponse(
        underlying=chain.underlying,
        expiry_date=chain.expiry_date,
        puts=[to_out(c) for c in chain.puts],
        calls=[to_out(c) for c in chain.calls],
    )

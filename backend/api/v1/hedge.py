"""Emergency hedge calculation — the core HedgeIQ feature."""
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.v1.schemas import HedgeRequest, HedgeResponse
from backend.api.bff.web_bff import shape_hedge_response
from backend.domain.common.errors import InsufficientLiquidityError
from backend.api.v1.auth import get_current_user

router = APIRouter(prefix="/hedge", tags=["Hedging"])


@router.post(
    "/recommend",
    response_model=HedgeResponse,
    status_code=200,
    summary="Get hedge recommendations for a position",
    description=(
        "Top 3 puts ranked by cost-effectiveness. "
        "Free tier: unlimited (pure maths). Pro: includes AI explanation."
    ),
)
async def get_recommendations(
    request: HedgeRequest,
    current_user=Depends(get_current_user),
):
    """Calculate top put options to hedge a stock position."""
    from backend.domain.positions.models import Position
    from backend.domain.hedging.service import HedgeService
    from backend.domain.hedging.strategies.protective_put import ProtectivePutStrategy
    from backend.infrastructure.polygon.facade import PolygonFacade
    from backend.infrastructure.polygon.options_repository import PolygonOptionsRepository
    from backend.infrastructure.cache.chroma_cache import ChromaCache
    from backend.config import settings

    position = Position(
        broker="Manual",
        account_name="Manual",
        account_id="manual",
        symbol=request.symbol.upper(),
        quantity=Decimal(str(request.shares_held)),
        entry_price=Decimal(str(request.entry_price)),
        current_price=Decimal(str(request.current_price)),
    )

    cache = ChromaCache(path=settings.chromadb_path)
    facade = PolygonFacade(settings.polygon_api_key, cache)
    repo = PolygonOptionsRepository(facade)
    service = HedgeService(options_repo=repo, strategy=ProtectivePutStrategy())

    try:
        recommendations = await service.get_recommendations(position, request.num_recommendations)
    except InsufficientLiquidityError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )

    return shape_hedge_response(recommendations)

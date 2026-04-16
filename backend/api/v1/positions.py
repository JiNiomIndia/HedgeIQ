"""Position endpoints — unified portfolio view across all brokers."""
from fastapi import APIRouter, Depends

from backend.api.v1.schemas import PortfolioResponse
from backend.api.bff.web_bff import shape_portfolio_response
from backend.api.v1.auth import get_current_user

router = APIRouter(prefix="/positions", tags=["Positions"])


@router.get(
    "",
    response_model=PortfolioResponse,
    status_code=200,
    summary="Get all positions across connected brokers",
    description=(
        "Returns normalised position data from all brokers via SnapTrade. "
        "Grouped by broker."
    ),
)
async def get_positions(current_user=Depends(get_current_user)):
    """Fetch unified portfolio view across all connected brokers."""
    from backend.infrastructure.snaptrade.facade import SnapTradeFacade
    from backend.infrastructure.snaptrade.position_repository import SnapTradePositionRepository
    from backend.adapters.adapter_registry import AdapterRegistry
    from backend.domain.positions.service import PositionService
    from backend.config import settings

    facade = SnapTradeFacade(settings.snaptrade_client_id, settings.snaptrade_consumer_key)
    repo = SnapTradePositionRepository(facade, AdapterRegistry())
    service = PositionService(repo)
    portfolio = await service.get_portfolio(current_user.snaptrade_user_id)
    return shape_portfolio_response(portfolio)

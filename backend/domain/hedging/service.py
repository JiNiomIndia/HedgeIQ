"""Hedge domain service.

Orchestrates the full hedging workflow:
  1. Fetch options chain from repository
  2. Run the selected strategy
  3. Return ranked recommendations
"""
from typing import List

from backend.domain.hedging.models import HedgeRecommendation
from backend.domain.hedging.strategies.base import AbstractHedgeStrategy
from backend.domain.options.repository import AbstractOptionsRepository
from backend.domain.positions.models import Position


class HedgeService:
    """Orchestrates hedge recommendations using Strategy + Options data.

    Args:
        options_repo: Repository for options chain data.
        strategy: Hedge calculation algorithm to use.

    Example::

        service = HedgeService(
            options_repo=PolygonOptionsRepository(...),
            strategy=ProtectivePutStrategy(),
        )
        recs = await service.get_recommendations(position)
    """

    def __init__(
        self,
        options_repo: AbstractOptionsRepository,
        strategy: AbstractHedgeStrategy,
    ):
        self._options_repo = options_repo
        self._strategy = strategy

    async def get_recommendations(
        self,
        position: Position,
        num_recommendations: int = 3,
    ) -> List[HedgeRecommendation]:
        """Get top hedge recommendations for a position.

        Args:
            position: The stock position to hedge.
            num_recommendations: Number of recommendations to return.

        Returns:
            Ranked HedgeRecommendation list, best value_score first.

        Raises:
            InsufficientLiquidityError: If no liquid options are available.
            DataUnavailableError: If the options chain cannot be fetched.
        """
        options_chain = await self._options_repo.get_chain(position.symbol)
        return self._strategy.calculate(
            position, options_chain, num_recommendations
        )

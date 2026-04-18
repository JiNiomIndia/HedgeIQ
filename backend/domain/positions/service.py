"""Position domain service.

Orchestrates position retrieval and portfolio construction.
Depends only on the abstract repository interface — never on a concrete impl.
"""
from typing import List

from backend.domain.positions.models import Portfolio, Position
from backend.domain.positions.repository import AbstractPositionRepository


class PositionService:
    """Orchestrates position retrieval and portfolio calculation.

    Args:
        repository: AbstractPositionRepository implementation to use.
    """

    def __init__(self, repository: AbstractPositionRepository):
        self._repository = repository

    async def get_portfolio(self, user_id: str, user_secret: str | None = None) -> Portfolio:
        """Fetch all positions and build the Portfolio aggregate.

        Args:
            user_id: Authenticated user ID.
            user_secret: SnapTrade user secret. Falls back to user_id for
                         backwards compatibility (mocked / test mode).

        Returns:
            Portfolio with all positions and computed totals.
        """
        positions = await self._repository.get_positions(user_id, user_secret or user_id)
        return Portfolio(user_id=user_id, positions=positions)

    async def get_positions_for_symbol(
        self,
        user_id: str,
        symbol: str,
    ) -> List[Position]:
        """Get positions for a specific ticker across all connected brokers.

        Args:
            user_id: Authenticated user ID.
            symbol: Ticker symbol to filter by (case-insensitive).

        Returns:
            Positions matching the symbol. Empty list if none found.
        """
        positions = await self._repository.get_positions(user_id)
        return [p for p in positions if p.symbol == symbol.upper()]

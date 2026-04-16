"""Abstract repository interface for the Positions bounded context.

Concrete implementations live in backend/infrastructure/:
- SnapTradePositionRepository — real broker data via SnapTrade API
- MockPositionRepository — deterministic test data from fixtures
"""
from abc import ABC, abstractmethod
from typing import List

from backend.domain.positions.models import Portfolio, Position


class AbstractPositionRepository(ABC):
    """Abstract base for position data access.

    Implementations must be async-compatible so they can call external APIs
    without blocking the FastAPI event loop.
    """

    @abstractmethod
    async def get_positions(self, user_id: str) -> List[Position]:
        """Fetch all positions for a user across all connected brokers.

        Args:
            user_id: Internal HedgeIQ user identifier.

        Returns:
            List of Position objects, possibly empty if no brokers connected.

        Raises:
            DataUnavailableError: If the broker API is unreachable.
        """

    @abstractmethod
    async def get_portfolio(self, user_id: str) -> Portfolio:
        """Fetch all positions and wrap them in a Portfolio aggregate.

        Args:
            user_id: Internal HedgeIQ user identifier.

        Returns:
            Portfolio with all positions for the user.

        Raises:
            DataUnavailableError: If the broker API is unreachable.
        """

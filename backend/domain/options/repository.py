"""Abstract repository interface for the Options bounded context.

Concrete implementations:
- PolygonOptionsRepository — live options chain data via Polygon.io
- MockOptionsRepository — deterministic test data from fixtures
"""
from abc import ABC, abstractmethod
from typing import List, Optional

from backend.domain.options.models import OptionContract


class AbstractOptionsRepository(ABC):
    """Abstract base for options chain data access."""

    @abstractmethod
    async def get_chain(
        self,
        symbol: str,
        expiry_date: Optional[str] = None,
    ) -> List[OptionContract]:
        """Fetch the full options chain for a symbol.

        Args:
            symbol: Underlying ticker, e.g. "AAL".
            expiry_date: Optional ISO date to filter by expiry, e.g. "2024-06-18".
                         If None, returns contracts for the nearest expiry.

        Returns:
            List of OptionContract objects (PUT and CALL mixed).

        Raises:
            DataUnavailableError: If Polygon API is unreachable.
            RateLimitError: If the Polygon rate limit is exceeded.
        """

    @abstractmethod
    async def get_contract(self, option_symbol: str) -> OptionContract:
        """Fetch a single option contract by its OCC symbol.

        Args:
            option_symbol: OCC option symbol, e.g. "AAL240618P00010000".

        Returns:
            OptionContract for the requested symbol.

        Raises:
            DataUnavailableError: If the contract is not found or API unreachable.
        """

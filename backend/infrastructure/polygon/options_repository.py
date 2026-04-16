"""Concrete OptionsRepository backed by Polygon.io via PolygonFacade.

Implements AbstractOptionsRepository. The facade handles rate limiting,
caching, and response normalisation — this class is a thin delegation layer.
"""
from typing import List, Optional

from backend.domain.options.models import OptionContract
from backend.domain.options.repository import AbstractOptionsRepository
from backend.infrastructure.polygon.facade import PolygonFacade


class PolygonOptionsRepository(AbstractOptionsRepository):
    """Fetches options chain data from Polygon.io via PolygonFacade.

    Args:
        facade: PolygonFacade with built-in rate limiting and 1h caching.
    """

    def __init__(self, facade: PolygonFacade):
        self._facade = facade

    async def get_chain(
        self,
        symbol: str,
        expiry_date: Optional[str] = None,
    ) -> List[OptionContract]:
        """Fetch options chain via Polygon facade.

        Args:
            symbol: Underlying ticker, e.g. "AAL".
            expiry_date: Optional ISO date filter, e.g. "2026-06-18".

        Returns:
            List of OptionContract domain models.

        Raises:
            DataUnavailableError: If Polygon API is unreachable.
        """
        return await self._facade.get_options_chain(symbol, expiry_date)

    async def get_contract(self, option_symbol: str) -> OptionContract:
        """Fetch a single contract by OCC symbol.

        Raises:
            NotImplementedError: Implemented in v2.
        """
        raise NotImplementedError("get_contract is implemented in v2.")

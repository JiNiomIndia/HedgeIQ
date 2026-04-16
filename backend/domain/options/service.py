"""Options domain service.

Orchestrates options chain data retrieval and filtering.
"""
from typing import List, Optional

from backend.domain.options.models import OptionContract, OptionsChain
from backend.domain.options.repository import AbstractOptionsRepository


class OptionsService:
    """Orchestrates options chain data retrieval.

    Args:
        repository: AbstractOptionsRepository implementation.
    """

    def __init__(self, repository: AbstractOptionsRepository):
        self._repository = repository

    async def get_chain(
        self,
        symbol: str,
        expiry_date: Optional[str] = None,
    ) -> OptionsChain:
        """Fetch complete options chain for a symbol.

        Args:
            symbol: Underlying ticker, e.g. "AAL".
            expiry_date: Optional ISO date filter, e.g. "2026-06-18".

        Returns:
            OptionsChain containing all PUT and CALL contracts.
        """
        contracts = await self._repository.get_chain(symbol, expiry_date)
        return OptionsChain(
            underlying=symbol.upper(),
            expiry_date=expiry_date or "all",
            contracts=contracts,
        )

    async def get_puts(self, symbol: str) -> List[OptionContract]:
        """Get only PUT contracts for a symbol, sorted by strike ascending.

        Args:
            symbol: Underlying ticker.

        Returns:
            Sorted list of PUT OptionContracts.
        """
        chain = await self.get_chain(symbol)
        return chain.puts

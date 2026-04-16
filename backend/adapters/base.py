"""Abstract base for all broker adapters.

Adapter Pattern: each concrete subclass normalises one broker's raw API
response into the Position domain model. Adding a new broker means adding
one new class — zero changes to domain services or the API layer.
"""
from abc import ABC, abstractmethod
from typing import List

from backend.domain.positions.models import Position


class AbstractBrokerAdapter(ABC):
    """Normalises broker-specific raw data into Position domain models.

    Contract:
        - Input: raw position list exactly as returned by SnapTradeFacade
        - Output: List[Position] using only domain model fields
        - Malformed rows must be skipped, never raised
    """

    @property
    @abstractmethod
    def broker_name(self) -> str:
        """Human-readable broker name, e.g. "Fidelity"."""

    @abstractmethod
    def normalise(
        self,
        raw_positions: list,
        account_name: str,
        account_id: str,
    ) -> List[Position]:
        """Convert raw broker API positions to Position domain models.

        Args:
            raw_positions: Raw position list from the broker API (via SnapTrade).
            account_name: Human-readable account label, e.g. "Sankar Rollover IRA".
            account_id: Broker account identifier, e.g. "***7040".

        Returns:
            List of normalised Position domain models. Malformed rows are
            silently skipped so one bad record never kills the whole response.
        """

"""Abstract base for hedge strategy implementations.

The Strategy pattern lets us swap algorithms without touching the calling code.

Active strategies (v0.1):
    ProtectivePutStrategy — buy puts to cap downside

Scaffolded for later:
    CollarStrategy — buy put + sell call (v2)
"""
from abc import ABC, abstractmethod
from typing import List

from backend.domain.hedging.models import HedgeRecommendation
from backend.domain.options.models import OptionContract
from backend.domain.positions.models import Position


class AbstractHedgeStrategy(ABC):
    """Base class for all hedge strategy implementations.

    Each strategy receives a Position and its corresponding options chain,
    and returns a ranked list of HedgeRecommendation objects.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable strategy name, e.g. "Protective Put"."""

    @abstractmethod
    def calculate(
        self,
        position: Position,
        options_chain: List[OptionContract],
        num_recommendations: int = 3,
    ) -> List[HedgeRecommendation]:
        """Calculate hedge recommendations for the given position.

        Args:
            position: The stock position to hedge.
            options_chain: Available option contracts (PUT and CALL mixed).
                           Implementations should filter to the relevant type.
            num_recommendations: Maximum number of recommendations to return.

        Returns:
            List of HedgeRecommendation objects sorted by value_score descending.
            Length is at most num_recommendations.

        Raises:
            InsufficientLiquidityError: If no contracts in the chain meet the
                minimum open-interest threshold (default 5,000).
        """

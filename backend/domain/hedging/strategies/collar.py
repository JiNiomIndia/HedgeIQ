"""Collar hedge strategy — SCAFFOLD for v2.

A collar combines:
- Buying a put below current price (downside protection)
- Selling a call above current price (premium income reduces put cost)

Not active in v0.1. Raises NotImplementedError on calculate().
"""
from typing import List

from backend.domain.hedging.models import HedgeRecommendation
from backend.domain.hedging.strategies.base import AbstractHedgeStrategy
from backend.domain.options.models import OptionContract
from backend.domain.positions.models import Position


class CollarStrategy(AbstractHedgeStrategy):
    """Collar: buy put + sell call. SCAFFOLD — not active in v0.1."""

    @property
    def name(self) -> str:
        return "Collar"

    def calculate(
        self,
        position: Position,
        options_chain: List[OptionContract],
        num_recommendations: int = 3,
    ) -> List[HedgeRecommendation]:
        """Not implemented — scaffolded for v2."""
        raise NotImplementedError("CollarStrategy is scaffolded for v2.")

"""Hedging domain models.

HedgeRecommendation is the primary output of the hedge engine.
It wraps an OptionContract with position-specific cost and coverage metrics.
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional


@dataclass
class HedgeRecommendation:
    """A put option recommended as a hedge for a stock position.

    Recommendations are ranked by value_score descending — higher is better.

    value_score formula:
        coverage_at_10pct_drop / total_cost

    Args:
        contract: The OptionContract being recommended.
        contracts_to_buy: Number of contracts to hedge the full position
            (position_shares / 100, rounded up).
        total_cost: Total ask-side cost to buy all contracts_to_buy.
        breakeven_price: Underlying price at which the put breaks even
            (strike - ask_per_contract).
        coverage_at_10pct_drop: Dollar gain on puts if underlying falls 10%.
        value_score: Coverage per dollar spent (higher = better value hedge).
        ai_explanation: Optional plain-English explanation from Claude.
    """

    contract: object
    contracts_to_buy: int
    total_cost: Decimal
    breakeven_price: Decimal
    coverage_at_10pct_drop: Decimal
    value_score: Decimal
    ai_explanation: Optional[str] = None

"""Protective Put Strategy — the core Emergency Hedge engine.

Answers the midnight question:
  "I hold 5,000 AAL shares. Oil just spiked. What puts should I buy?"

Algorithm:
  1. Filter: option_type == PUT
  2. Filter: expiry 14–90 calendar days from today
  3. Filter: strike within 80–105% of current price
  4. Filter: open_interest >= 5,000 (liquidity gate)
  5. Score: value_score = coverage_at_10pct_drop / total_cost
  6. Return top N by value_score descending
"""
from datetime import date, timedelta
from decimal import Decimal
from typing import List

from backend.domain.common.errors import InsufficientLiquidityError
from backend.domain.hedging.models import HedgeRecommendation
from backend.domain.hedging.strategies.base import AbstractHedgeStrategy
from backend.domain.options.models import OptionContract
from backend.domain.positions.models import Position

# Filter constants
MIN_OI = 5_000
MIN_DAYS = 14
MAX_DAYS = 90
MIN_STRIKE_PCT = Decimal("0.80")
MAX_STRIKE_PCT = Decimal("1.05")

# Standard number of contracts for a 5,000-share position
CONTRACTS = 50


class ProtectivePutStrategy(AbstractHedgeStrategy):
    """Recommends put options that best protect a long stock position.

    value_score formula:
        coverage_at_10pct_drop / total_cost
    Higher = better: you get more downside protection per dollar spent.
    """

    @property
    def name(self) -> str:
        return "Protective Put"

    def calculate(
        self,
        position: Position,
        options_chain: List[OptionContract],
        num_recommendations: int = 3,
    ) -> List[HedgeRecommendation]:
        """Calculate top put recommendations for a position.

        Args:
            position: Stock position to hedge.
            options_chain: All available option contracts.
            num_recommendations: Maximum number to return (default 3).

        Returns:
            List of HedgeRecommendation sorted by value_score descending.

        Raises:
            InsufficientLiquidityError: If no puts survive the filter criteria.
        """
        today = date.today()
        min_expiry = today + timedelta(days=MIN_DAYS)
        max_expiry = today + timedelta(days=MAX_DAYS)
        min_strike = position.current_price * MIN_STRIKE_PCT
        max_strike = position.current_price * MAX_STRIKE_PCT

        candidates = [
            c for c in options_chain
            if (
                c.option_type.upper() == "PUT"
                and c.open_interest >= MIN_OI
                and min_expiry <= date.fromisoformat(c.expiry_date) <= max_expiry
                and min_strike <= c.strike <= max_strike
                and c.ask > 0
            )
        ]

        if not candidates:
            raise InsufficientLiquidityError(
                symbol=position.symbol, min_oi=MIN_OI
            )

        scored = sorted(
            [self._score(c, position) for c in candidates],
            key=lambda r: r.value_score,
            reverse=True,
        )
        return scored[:num_recommendations]

    def _score(
        self,
        option: OptionContract,
        position: Position,
    ) -> HedgeRecommendation:
        """Calculate cost, coverage, breakeven and value_score for one put.

        Args:
            option: Candidate put contract.
            position: Position being hedged.

        Returns:
            HedgeRecommendation with all metrics populated.
        """
        total_cost = (option.ask * 100 * CONTRACTS).quantize(Decimal("0.01"))
        breakeven = (option.strike - option.ask).quantize(Decimal("0.01"))

        # Coverage: intrinsic value of the put at a 10% stock decline, net of premium
        drop_10_price = position.current_price * Decimal("0.90")
        coverage = Decimal("0")
        if option.strike > drop_10_price:
            coverage = (
                (option.strike - drop_10_price - option.ask) * 100 * CONTRACTS
            ).quantize(Decimal("0.01"))

        value_score = (
            (coverage / total_cost).quantize(Decimal("0.0001"))
            if total_cost > 0
            else Decimal("0")
        )

        return HedgeRecommendation(
            contract=option,
            contracts_to_buy=CONTRACTS,
            total_cost=total_cost,
            breakeven_price=breakeven,
            coverage_at_10pct_drop=coverage,
            value_score=value_score,
        )

    def calculate_breakeven(self, option: OptionContract) -> Decimal:
        """Calculate the breakeven price for a put: strike − ask.

        Args:
            option: The put contract.

        Returns:
            Breakeven stock price at expiry.
        """
        return (option.strike - option.ask).quantize(Decimal("0.01"))

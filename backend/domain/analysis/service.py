"""Analysis domain service for AI-powered explanations.

Wraps ClaudeFacade with domain-aware context building so callers work
with domain models (OptionContract, HedgeRecommendation) rather than
raw dicts.
"""
from backend.domain.analysis.models import AIExplanation
from backend.domain.hedging.models import HedgeRecommendation
from backend.domain.options.models import OptionContract
from backend.domain.positions.models import Position

HAIKU_MODEL = "claude-haiku-4-5-20251001"


class AnalysisService:
    """Generates AI explanations for options and hedge recommendations.

    Args:
        claude_facade: ClaudeFacade instance with caching wired in.
    """

    def __init__(self, claude_facade):
        self._claude = claude_facade

    async def explain_option(
        self,
        option: OptionContract,
        calls_today: int = 0,
        is_free_user: bool = True,
    ) -> AIExplanation:
        """Generate a plain-English explanation of an option contract.

        Args:
            option: OptionContract to explain.
            calls_today: Number of AI calls the user has made today.
            is_free_user: Whether to enforce the daily free-tier limit.

        Returns:
            AIExplanation with content and metadata.

        Raises:
            DailyLimitExceededError: If free user exceeds daily limit.
        """
        option_data = {
            "symbol": option.symbol,
            "expiry": option.expiry_date,
            "strike": str(option.strike),
            "option_type": option.option_type,
            "ask": str(option.ask),
            "open_interest": option.open_interest,
            "delta": str(option.delta) if option.delta else "N/A",
            "implied_volatility": str(option.implied_volatility),
        }
        content = await self._claude.explain_option(
            option_data, calls_today, is_free_user
        )
        cached = content == self._claude._cache.get(
            f"explain_option:{option.symbol}:{option.expiry_date}:"
            f"{option.strike}:{option.option_type}"
        )
        return AIExplanation(
            content=content,
            model_used=HAIKU_MODEL,
            cached=cached,
        )

    async def explain_hedge(
        self,
        position: Position,
        recommendation: HedgeRecommendation,
        calls_today: int = 0,
        is_free_user: bool = True,
    ) -> AIExplanation:
        """Explain why a specific hedge recommendation is suggested.

        Args:
            position: The stock position being hedged.
            recommendation: The recommended put option.
            calls_today: Number of AI calls the user has made today.
            is_free_user: Whether to enforce the daily free-tier limit.

        Returns:
            AIExplanation with two-sentence rationale and disclaimer.
        """
        position_data = {
            "symbol": position.symbol,
            "shares": str(position.quantity),
            "entry_price": str(position.entry_price),
            "current_price": str(position.current_price),
        }
        rec_data = {
            "expiry": recommendation.contract.expiry_date,
            "strike": str(recommendation.contract.strike),
            "ask": str(recommendation.contract.ask),
            "total_cost": str(recommendation.total_cost),
            "contracts": str(recommendation.contracts_to_buy),
            "breakeven": str(recommendation.breakeven_price),
            "coverage_at_10pct_drop": str(recommendation.coverage_at_10pct_drop),
        }
        content = await self._claude.explain_hedge_recommendation(
            position_data, rec_data, calls_today, is_free_user
        )
        return AIExplanation(content=content, model_used=HAIKU_MODEL)

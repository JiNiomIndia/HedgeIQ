"""Domain exceptions for HedgeIQ.

All application errors inherit from HedgeIQError so callers can catch
the base type when they don't need to distinguish the subtype.
"""


class HedgeIQError(Exception):
    """Base exception for all HedgeIQ domain errors."""


class InsufficientLiquidityError(HedgeIQError):
    """Raised when no options for a symbol meet the minimum open-interest threshold.

    Args:
        symbol: The underlying ticker (e.g. "AAL").
        min_oi: The minimum open-interest requirement (default 5,000).
    """

    def __init__(self, symbol: str, min_oi: int = 5000):
        super().__init__(
            f"No options for {symbol} meet minimum OI of {min_oi:,}"
        )


class DataUnavailableError(HedgeIQError):
    """Raised when a required data source is unreachable or returns no data."""


class RateLimitError(HedgeIQError):
    """Raised when an external API rate limit is hit."""


class DailyLimitExceededError(HedgeIQError):
    """Raised when the user exhausts their daily AI-call quota.

    Args:
        limit: The daily call limit for the user's plan (default 5).
    """

    def __init__(self, limit: int = 5):
        super().__init__(
            f"Daily AI limit of {limit} reached. Upgrade to Pro."
        )

"""Money value-object utilities using Python Decimal for precision."""
from decimal import Decimal, ROUND_HALF_UP

CENTS = Decimal("0.01")


def to_money(value) -> Decimal:
    """Convert a numeric value to a Decimal rounded to 2 decimal places.

    Args:
        value: int, float, str, or Decimal to convert.

    Returns:
        Decimal rounded to nearest cent.
    """
    return Decimal(str(value)).quantize(CENTS, rounding=ROUND_HALF_UP)

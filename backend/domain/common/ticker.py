"""Ticker symbol value-object utilities."""


def normalise(symbol: str) -> str:
    """Normalise a ticker symbol to uppercase, stripped of whitespace.

    Args:
        symbol: Raw ticker string (e.g. " aal ").

    Returns:
        Normalised ticker (e.g. "AAL").
    """
    return symbol.strip().upper()

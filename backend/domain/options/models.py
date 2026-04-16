"""Options domain models.

Pure Python dataclasses representing a single option contract and a full
options chain. No database or external dependencies.
"""
from dataclasses import dataclass, field
from decimal import Decimal
from typing import List, Optional


@dataclass
class OptionContract:
    """A single option contract available in the market.

    Example: AAL Jun 18 $10 Put, ask $0.51, OI 75,310.

    Args:
        symbol: OCC option symbol, e.g. "AAL240618P00010000".
        underlying: Underlying ticker, e.g. "AAL".
        option_type: "PUT" or "CALL".
        strike: Strike price.
        expiry_date: ISO date string, e.g. "2024-06-18".
        bid: Current best bid price.
        ask: Current best ask price.
        volume: Today's trading volume.
        open_interest: Number of open contracts (liquidity proxy).
        implied_volatility: Annualised IV as a decimal (e.g. 0.52 = 52%).
        delta: Option delta (PUT: negative, CALL: positive).
        theta: Daily theta decay in dollars.
        days_to_expiry: Calendar days until expiry.
    """

    symbol: str
    underlying: str
    option_type: str
    strike: Decimal
    expiry_date: str
    bid: Decimal
    ask: Decimal
    volume: int = 0
    open_interest: int = 0
    implied_volatility: Optional[Decimal] = None
    delta: Optional[Decimal] = None
    theta: Optional[Decimal] = None
    days_to_expiry: int = 0

    @property
    def mid_price(self) -> Decimal:
        """Mid-market price between bid and ask."""
        return ((self.bid + self.ask) / 2).quantize(Decimal("0.01"))

    @property
    def cost_for_50_contracts(self) -> Decimal:
        """Total ask cost to buy 50 contracts (hedges 5,000 shares).

        50 contracts × 100 multiplier × ask price.
        """
        return (self.ask * 100 * 50).quantize(Decimal("0.01"))


@dataclass
class OptionsChain:
    """Complete options chain for one underlying on a given expiry date.

    Args:
        underlying: Ticker symbol, e.g. "AAL".
        expiry_date: ISO expiry date, e.g. "2024-06-18".
        contracts: All PUT and CALL contracts for this expiry.
    """

    underlying: str
    expiry_date: str
    contracts: List[OptionContract] = field(default_factory=list)

    @property
    def puts(self) -> List[OptionContract]:
        """All PUT contracts, sorted ascending by strike price."""
        return sorted(
            [c for c in self.contracts if c.option_type == "PUT"],
            key=lambda c: c.strike,
        )

    @property
    def calls(self) -> List[OptionContract]:
        """All CALL contracts, sorted ascending by strike price."""
        return sorted(
            [c for c in self.contracts if c.option_type == "CALL"],
            key=lambda c: c.strike,
        )

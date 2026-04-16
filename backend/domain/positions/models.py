"""Position and Portfolio domain models.

These are pure Python dataclasses — no database or external dependencies.
All monetary arithmetic uses Decimal to avoid floating-point drift.
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import List, Optional


@dataclass
class Position:
    """A stock or options position held in a broker account.

    Args:
        broker: Human-readable broker name, e.g. "Fidelity".
        account_name: Human-readable account label, e.g. "Sankar Rollover IRA".
        account_id: Broker-specific account identifier.
        symbol: Underlying ticker, e.g. "AAL".
        quantity: Number of shares (stocks) or contracts (options).
        entry_price: Average cost basis per share / contract.
        current_price: Current market price per share / contract.
        asset_type: "STOCK" or "OPTION" (default "STOCK").
        option_type: "PUT" or "CALL" — only set when asset_type == "OPTION".
        expiry_date: ISO date string, e.g. "2024-06-18" — options only.
        strike_price: Option strike price — options only.
    """

    broker: str
    account_name: str
    account_id: str
    symbol: str
    quantity: Decimal
    entry_price: Decimal
    current_price: Decimal
    asset_type: str = "STOCK"
    option_type: Optional[str] = None
    expiry_date: Optional[str] = None
    strike_price: Optional[Decimal] = None

    @property
    def market_value(self) -> Decimal:
        """Current market value of the full position.

        Options are multiplied by 100 (standard contract multiplier).
        """
        multiplier = Decimal("100") if self.asset_type == "OPTION" else Decimal("1")
        return (self.quantity * self.current_price * multiplier).quantize(
            Decimal("0.01")
        )

    @property
    def unrealised_pnl(self) -> Decimal:
        """Unrealised profit/loss in dollars.

        Positive = gain, Negative = loss.
        """
        multiplier = Decimal("100") if self.asset_type == "OPTION" else Decimal("1")
        return (
            (self.current_price - self.entry_price) * self.quantity * multiplier
        ).quantize(Decimal("0.01"))

    @property
    def unrealised_pnl_pct(self) -> Decimal:
        """Unrealised P&L as a percentage of cost basis.

        Returns 0 if cost basis is zero to avoid division by zero.
        """
        cost = self.entry_price * self.quantity
        if cost == 0:
            return Decimal("0")
        return (self.unrealised_pnl / cost * 100).quantize(Decimal("0.01"))


@dataclass
class Portfolio:
    """Aggregate of all positions for one user across all connected brokers.

    Args:
        user_id: Internal user identifier.
        positions: List of all Position objects for this user.
    """

    user_id: str
    positions: List[Position]

    @property
    def total_value(self) -> Decimal:
        """Sum of market_value across all positions."""
        return sum((p.market_value for p in self.positions), Decimal("0"))

    @property
    def total_unrealised_pnl(self) -> Decimal:
        """Sum of unrealised_pnl across all positions."""
        return sum((p.unrealised_pnl for p in self.positions), Decimal("0"))

"""Robinhood broker adapter.

Normalises Robinhood positions from the SnapTrade response format into
Position domain models.

Robinhood's symbol structure is double-nested compared to Fidelity:
    pos["symbol"]["symbol"]["symbol"] → ticker   (vs Fidelity's ["symbol"]["symbol"])

Field mapping:
    units                   → quantity
    average_purchase_price  → entry_price
    price                   → current_price
    symbol.symbol.type.code → asset_type  ("stock", "crypto", "etf" etc.)
"""
from decimal import Decimal
from typing import List

from backend.adapters.base import AbstractBrokerAdapter
from backend.domain.positions.models import Position


class RobinhoodAdapter(AbstractBrokerAdapter):
    """Normalises Robinhood position data from SnapTrade response format."""

    @property
    def broker_name(self) -> str:
        return "Robinhood"

    def normalise(
        self,
        raw_positions: list,
        account_name: str,
        account_id: str,
    ) -> List[Position]:
        positions = []
        for raw in raw_positions:
            try:
                # Robinhood nests ticker two levels deep inside "symbol"
                sym_outer = raw.get("symbol", {})
                sym_inner = sym_outer.get("symbol", {}) if isinstance(sym_outer, dict) else {}
                ticker = sym_inner.get("symbol", "") if isinstance(sym_inner, dict) else ""

                if not ticker:
                    continue

                # Map SnapTrade asset type code to our domain string
                type_info = sym_inner.get("type", {}) if isinstance(sym_inner, dict) else {}
                type_code = type_info.get("code", "stock").lower() if isinstance(type_info, dict) else "stock"
                asset_type = "CRYPTO" if type_code == "crypto" else "STOCK"

                positions.append(
                    Position(
                        broker=self.broker_name,
                        account_name=account_name,
                        account_id=account_id,
                        symbol=ticker.upper(),
                        quantity=Decimal(str(raw.get("units", 0) or 0)),
                        entry_price=Decimal(str(raw.get("average_purchase_price", 0) or 0)),
                        current_price=Decimal(str(raw.get("price", 0) or 0)),
                        asset_type=asset_type,
                    )
                )
            except Exception:
                continue
        return positions

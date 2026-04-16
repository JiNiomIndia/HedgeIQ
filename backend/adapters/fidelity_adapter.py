"""Fidelity broker adapter.

Normalises Fidelity positions from the SnapTrade response format into
Position domain models. Field mapping:
    units                   → quantity
    average_purchase_price  → entry_price
    price                   → current_price
"""
from decimal import Decimal
from typing import List

from backend.adapters.base import AbstractBrokerAdapter
from backend.domain.positions.models import Position


class FidelityAdapter(AbstractBrokerAdapter):
    """Normalises Fidelity position data from SnapTrade response format."""

    @property
    def broker_name(self) -> str:
        return "Fidelity"

    def normalise(
        self,
        raw_positions: list,
        account_name: str,
        account_id: str,
    ) -> List[Position]:
        positions = []
        for raw in raw_positions:
            try:
                symbol = raw.get("symbol", {}).get("symbol", "")
                if not symbol:
                    continue  # skip rows with no ticker
                positions.append(
                    Position(
                        broker=self.broker_name,
                        account_name=account_name,
                        account_id=account_id,
                        symbol=symbol,
                        quantity=Decimal(str(raw.get("units", 0))),
                        entry_price=Decimal(
                            str(raw.get("average_purchase_price", 0))
                        ),
                        current_price=Decimal(str(raw.get("price", 0))),
                    )
                )
            except Exception:
                continue
        return positions

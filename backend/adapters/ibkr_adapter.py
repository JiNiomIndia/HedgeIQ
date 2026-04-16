"""IBKR (Interactive Brokers) broker adapter.

IBKR uses slightly different field names than Fidelity when routed through
SnapTrade. This adapter handles both the native IBKR names and the SnapTrade
fallback names so it works whether data comes directly from IBKR or via the
SnapTrade normalisation layer.

Field mapping (IBKR-native → SnapTrade fallback):
    position  / units                              → quantity
    average_cost / average_purchase_price          → entry_price
    market_price / price                           → current_price
"""
from decimal import Decimal
from typing import List

from backend.adapters.base import AbstractBrokerAdapter
from backend.domain.positions.models import Position


class IBKRAdapter(AbstractBrokerAdapter):
    """Normalises IBKR position data from SnapTrade response format."""

    @property
    def broker_name(self) -> str:
        return "IBKR"

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
                        quantity=Decimal(
                            str(raw.get("position", raw.get("units", 0)))
                        ),
                        entry_price=Decimal(
                            str(
                                raw.get(
                                    "average_cost",
                                    raw.get("average_purchase_price", 0),
                                )
                            )
                        ),
                        current_price=Decimal(
                            str(raw.get("market_price", raw.get("price", 0)))
                        ),
                    )
                )
            except Exception:
                continue
        return positions

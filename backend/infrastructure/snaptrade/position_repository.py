"""Concrete PositionRepository backed by SnapTrade + broker adapters.

Implements AbstractPositionRepository by combining:
  1. SnapTradeFacade  — fetches raw multi-broker data
  2. AdapterRegistry  — routes each broker to its normaliser
"""
from typing import List

from backend.adapters.adapter_registry import AdapterRegistry
from backend.domain.common.errors import DataUnavailableError
from backend.domain.positions.models import Portfolio, Position
from backend.domain.positions.repository import AbstractPositionRepository
from backend.infrastructure.snaptrade.facade import SnapTradeFacade


class SnapTradePositionRepository(AbstractPositionRepository):
    """Fetches and normalises positions from all connected brokers.

    Args:
        facade: SnapTradeFacade for raw API calls.
        registry: AdapterRegistry mapping broker slugs to adapter instances.
    """

    def __init__(self, facade: SnapTradeFacade, registry: AdapterRegistry):
        self._facade = facade
        self._registry = registry

    async def get_positions(self, user_id: str) -> List[Position]:
        """Fetch all positions across all connected broker accounts.

        Args:
            user_id: SnapTrade user ID (also used as user_secret in mock mode).

        Returns:
            Normalised Position list sorted alphabetically by broker name.

        Raises:
            DataUnavailableError: If SnapTrade is unreachable.
        """
        raw_data = await self._facade.get_raw_positions(user_id, user_id)
        all_positions: List[Position] = []

        for account_data in raw_data:
            broker_name = account_data.get("broker_name", "UNKNOWN")
            account = account_data.get("account", {})
            account_name = account.get("name", "Unknown Account")
            account_id = account.get("number", "")
            raw_positions = account_data.get("positions", [])

            try:
                adapter = self._registry.get(broker_name)
                all_positions.extend(
                    adapter.normalise(raw_positions, account_name, account_id)
                )
            except KeyError:
                # Unknown broker — skip gracefully, log in production
                continue

        return sorted(all_positions, key=lambda p: p.broker)

    async def get_portfolio(self, user_id: str) -> Portfolio:
        """Fetch all positions and wrap them in a Portfolio aggregate.

        Args:
            user_id: SnapTrade user ID.

        Returns:
            Portfolio with all normalised positions.
        """
        positions = await self.get_positions(user_id)
        return Portfolio(user_id=user_id, positions=positions)

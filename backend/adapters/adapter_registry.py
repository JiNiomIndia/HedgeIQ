"""Adapter Registry — maps broker names to adapter instances.

To add a new broker:
    1. Create backend/adapters/new_broker_adapter.py
    2. Register it here with its SnapTrade broker slug as the key
    Zero changes anywhere else.
"""
from typing import Dict, List

from backend.adapters.base import AbstractBrokerAdapter
from backend.adapters.fidelity_adapter import FidelityAdapter
from backend.adapters.ibkr_adapter import IBKRAdapter
from backend.adapters.public_adapter import PublicAdapter


class AdapterRegistry:
    """Maps SnapTrade broker slugs to adapter instances.

    Lookup is case-insensitive — "fidelity", "FIDELITY", "Fidelity" all work.

    Example::

        registry = AdapterRegistry()
        adapter = registry.get("FIDELITY")
        positions = adapter.normalise(raw, account_name, account_id)
    """

    def __init__(self):
        self._adapters: Dict[str, AbstractBrokerAdapter] = {
            "FIDELITY": FidelityAdapter(),
            "IBKR": IBKRAdapter(),
            "PUBLIC": PublicAdapter(),
        }

    def get(self, broker_name: str) -> AbstractBrokerAdapter:
        """Return the adapter registered for *broker_name*.

        Args:
            broker_name: SnapTrade broker slug (case-insensitive).

        Returns:
            AbstractBrokerAdapter implementation for the requested broker.

        Raises:
            KeyError: If no adapter is registered for the broker.
        """
        key = broker_name.upper()
        if key not in self._adapters:
            raise KeyError(f"No adapter registered for broker: {broker_name!r}")
        return self._adapters[key]

    def supported_brokers(self) -> List[str]:
        """Return list of all registered broker slugs."""
        return list(self._adapters.keys())

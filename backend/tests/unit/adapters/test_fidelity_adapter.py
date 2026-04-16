"""Unit tests for broker adapters and the adapter registry."""
from decimal import Decimal

import pytest

from backend.adapters.fidelity_adapter import FidelityAdapter


@pytest.fixture
def adapter():
    return FidelityAdapter()


# ---------------------------------------------------------------------------
# FidelityAdapter
# ---------------------------------------------------------------------------

def test_broker_name_is_fidelity(adapter):
    assert adapter.broker_name == "Fidelity"


def test_normalise_returns_position_list(adapter):
    raw = [
        {
            "symbol": {"symbol": "AAL"},
            "units": "2000",
            "average_purchase_price": "11.27",
            "price": "10.97",
        }
    ]
    result = adapter.normalise(raw, "Rollover IRA", "***7040")
    assert len(result) == 1
    assert result[0].symbol == "AAL"
    assert result[0].quantity == Decimal("2000")
    assert result[0].broker == "Fidelity"


def test_normalise_handles_malformed_data(adapter):
    """Malformed rows must be skipped; valid rows must still be returned."""
    raw = [
        {"bad": "data"},           # missing all required fields → skip
        {
            "symbol": {"symbol": "AAL"},
            "units": "100",
            "average_purchase_price": "10.00",
            "price": "11.00",
        },
    ]
    result = adapter.normalise(raw, "Rollover IRA", "***7040")
    assert len(result) == 1


# ---------------------------------------------------------------------------
# AdapterRegistry
# ---------------------------------------------------------------------------

def test_registry_returns_correct_adapter():
    from backend.adapters.adapter_registry import AdapterRegistry

    registry = AdapterRegistry()
    assert registry.get("FIDELITY").broker_name == "Fidelity"
    assert registry.get("IBKR").broker_name == "IBKR"
    assert registry.get("PUBLIC").broker_name == "Public"


def test_registry_raises_for_unknown_broker():
    from backend.adapters.adapter_registry import AdapterRegistry

    with pytest.raises(KeyError):
        AdapterRegistry().get("UNKNOWN_BROKER")

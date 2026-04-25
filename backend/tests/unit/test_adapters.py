"""Unit tests for all four broker adapters and the AdapterRegistry.

Contract guarded:
  - Each adapter normalises raw SnapTrade position dicts into typed Position domain models
  - quantity is Decimal (not float), entry_price and current_price are Decimal
  - Missing/malformed rows are skipped gracefully — no KeyError or crash
  - AdapterRegistry maps slugs case-insensitively to the correct adapter
"""
from decimal import Decimal

import pytest

from backend.adapters.adapter_registry import AdapterRegistry
from backend.adapters.fidelity_adapter import FidelityAdapter
from backend.adapters.ibkr_adapter import IBKRAdapter
from backend.adapters.public_adapter import PublicAdapter
from backend.adapters.robinhood_adapter import RobinhoodAdapter


# ---------------------------------------------------------------------------
# Shared raw-position builder helpers
# ---------------------------------------------------------------------------

def fidelity_raw(symbol="AAL", units="2000", avg="11.27", price="10.97"):
    """Standard Fidelity/Schwab/IBKR flat raw format."""
    return {
        "symbol": {"symbol": symbol},
        "units": units,
        "average_purchase_price": avg,
        "price": price,
    }


def robinhood_raw(symbol="DOGE", units="5000", avg="0.185", price="0.172", asset_type="crypto"):
    """Robinhood double-nested symbol format."""
    return {
        "symbol": {
            "symbol": {
                "symbol": symbol,
                "type": {"code": asset_type},
            }
        },
        "units": units,
        "average_purchase_price": avg,
        "price": price,
    }


# ---------------------------------------------------------------------------
# FidelityAdapter
# ---------------------------------------------------------------------------

class TestFidelityAdapter:
    @pytest.fixture(autouse=True)
    def adapter(self):
        self.adapter = FidelityAdapter()

    def test_broker_name(self):
        assert self.adapter.broker_name == "Fidelity"

    def test_normalises_single_position(self):
        result = self.adapter.normalise([fidelity_raw()], "Rollover IRA", "***7040")
        assert len(result) == 1
        pos = result[0]
        assert pos.symbol == "AAL"
        assert pos.broker == "Fidelity"

    def test_quantity_is_decimal(self):
        result = self.adapter.normalise([fidelity_raw(units="2000")], "IRA", "***7040")
        assert isinstance(result[0].quantity, Decimal)
        assert result[0].quantity == Decimal("2000")

    def test_entry_price_is_decimal(self):
        result = self.adapter.normalise([fidelity_raw(avg="11.27")], "IRA", "***7040")
        assert isinstance(result[0].entry_price, Decimal)
        assert result[0].entry_price == Decimal("11.27")

    def test_current_price_is_decimal(self):
        result = self.adapter.normalise([fidelity_raw(price="10.97")], "IRA", "***7040")
        assert isinstance(result[0].current_price, Decimal)
        assert result[0].current_price == Decimal("10.97")

    def test_empty_list_returns_empty(self):
        assert self.adapter.normalise([], "IRA", "***7040") == []

    def test_missing_symbol_is_skipped(self):
        bad = {"units": "100", "average_purchase_price": "10", "price": "11"}
        result = self.adapter.normalise([bad], "IRA", "***7040")
        assert result == []

    def test_malformed_row_skipped_valid_row_kept(self):
        rows = [
            {"bad": "data"},
            fidelity_raw(symbol="AAPL"),
        ]
        result = self.adapter.normalise(rows, "IRA", "***7040")
        assert len(result) == 1
        assert result[0].symbol == "AAPL"

    def test_zero_quantity_position_included(self):
        result = self.adapter.normalise([fidelity_raw(units="0")], "IRA", "***7040")
        assert len(result) == 1
        assert result[0].quantity == Decimal("0")

    def test_account_name_propagated(self):
        result = self.adapter.normalise([fidelity_raw()], "Fidelity Rollover IRA", "***7040")
        assert result[0].account_name == "Fidelity Rollover IRA"

    def test_account_id_propagated(self):
        result = self.adapter.normalise([fidelity_raw()], "IRA", "***7040")
        assert result[0].account_id == "***7040"

    def test_multiple_positions(self):
        rows = [fidelity_raw("AAL"), fidelity_raw("AAPL", "100", "180.0", "175.0")]
        result = self.adapter.normalise(rows, "IRA", "***7040")
        assert len(result) == 2
        symbols = {p.symbol for p in result}
        assert symbols == {"AAL", "AAPL"}


# ---------------------------------------------------------------------------
# RobinhoodAdapter
# ---------------------------------------------------------------------------

class TestRobinhoodAdapter:
    @pytest.fixture(autouse=True)
    def adapter(self):
        self.adapter = RobinhoodAdapter()

    def test_broker_name(self):
        assert self.adapter.broker_name == "Robinhood"

    def test_normalises_crypto_position(self):
        result = self.adapter.normalise(
            [robinhood_raw("DOGE", "5000", "0.185", "0.172", "crypto")],
            "Robinhood Individual",
            "***4521",
        )
        assert len(result) == 1
        pos = result[0]
        assert pos.symbol == "DOGE"
        assert pos.broker == "Robinhood"
        assert pos.asset_type == "CRYPTO"

    def test_normalises_stock_position(self):
        result = self.adapter.normalise(
            [robinhood_raw("AAL", "1000", "11.30", "10.97", "stock")],
            "Robinhood Individual",
            "***4521",
        )
        pos = result[0]
        assert pos.symbol == "AAL"
        assert pos.asset_type == "STOCK"

    def test_quantity_is_decimal(self):
        result = self.adapter.normalise(
            [robinhood_raw(units="5000")], "Individual", "***4521"
        )
        assert isinstance(result[0].quantity, Decimal)

    def test_entry_price_is_decimal(self):
        result = self.adapter.normalise(
            [robinhood_raw(avg="0.185")], "Individual", "***4521"
        )
        assert isinstance(result[0].entry_price, Decimal)

    def test_empty_list_returns_empty(self):
        assert self.adapter.normalise([], "Individual", "***4521") == []

    def test_missing_ticker_skipped(self):
        bad = {"symbol": {"symbol": {}}, "units": "100", "average_purchase_price": "1", "price": "1"}
        result = self.adapter.normalise([bad], "Individual", "***4521")
        assert result == []

    def test_malformed_row_skipped(self):
        rows = [{"bad": "data"}, robinhood_raw("GME")]
        result = self.adapter.normalise(rows, "Individual", "***4521")
        assert len(result) == 1
        assert result[0].symbol == "GME"

    def test_zero_quantity_included(self):
        result = self.adapter.normalise(
            [robinhood_raw(units="0")], "Individual", "***4521"
        )
        assert result[0].quantity == Decimal("0")


# ---------------------------------------------------------------------------
# IBKRAdapter
# ---------------------------------------------------------------------------

class TestIBKRAdapter:
    @pytest.fixture(autouse=True)
    def adapter(self):
        self.adapter = IBKRAdapter()

    def test_broker_name(self):
        assert self.adapter.broker_name == "IBKR"

    def test_normalises_position(self):
        raw = [fidelity_raw("AAPL", "200", "150.00", "170.00")]
        result = self.adapter.normalise(raw, "IBKR Margin", "U1234567")
        assert len(result) == 1
        assert result[0].symbol == "AAPL"
        assert result[0].broker == "IBKR"

    def test_quantity_is_decimal(self):
        result = self.adapter.normalise([fidelity_raw(units="200")], "Margin", "U123")
        assert isinstance(result[0].quantity, Decimal)

    def test_empty_list_returns_empty(self):
        assert self.adapter.normalise([], "Margin", "U123") == []

    def test_malformed_row_skipped(self):
        rows = [{"bad": "data"}, fidelity_raw("MSFT")]
        result = self.adapter.normalise(rows, "Margin", "U123")
        assert len(result) == 1


# ---------------------------------------------------------------------------
# PublicAdapter
# ---------------------------------------------------------------------------

class TestPublicAdapter:
    @pytest.fixture(autouse=True)
    def adapter(self):
        self.adapter = PublicAdapter()

    def test_broker_name(self):
        assert self.adapter.broker_name == "Public"

    def test_normalises_position(self):
        raw = [fidelity_raw("TSLA", "50", "200.00", "185.00")]
        result = self.adapter.normalise(raw, "Public Individual", "PUB9876")
        assert len(result) == 1
        assert result[0].symbol == "TSLA"
        assert result[0].broker == "Public"

    def test_quantity_is_decimal(self):
        result = self.adapter.normalise([fidelity_raw(units="50")], "Individual", "PUB9876")
        assert isinstance(result[0].quantity, Decimal)

    def test_empty_list_returns_empty(self):
        assert self.adapter.normalise([], "Individual", "PUB9876") == []

    def test_malformed_row_skipped(self):
        rows = [{"bad": "data"}, fidelity_raw("NVDA")]
        result = self.adapter.normalise(rows, "Individual", "PUB9876")
        assert len(result) == 1


# ---------------------------------------------------------------------------
# AdapterRegistry
# ---------------------------------------------------------------------------

class TestAdapterRegistry:
    @pytest.fixture(autouse=True)
    def registry(self):
        self.registry = AdapterRegistry()

    def test_fidelity_returns_correct_adapter(self):
        adapter = self.registry.get("FIDELITY")
        assert adapter.broker_name == "Fidelity"

    def test_ibkr_returns_correct_adapter(self):
        adapter = self.registry.get("IBKR")
        assert adapter.broker_name == "IBKR"

    def test_public_returns_correct_adapter(self):
        adapter = self.registry.get("PUBLIC")
        assert adapter.broker_name == "Public"

    def test_robinhood_returns_correct_adapter(self):
        adapter = self.registry.get("ROBINHOOD")
        assert adapter.broker_name == "Robinhood"

    def test_unknown_broker_raises_key_error(self):
        with pytest.raises(KeyError):
            self.registry.get("UNKNOWN_BROKER_SLUG")

    def test_lookup_is_case_insensitive(self):
        # The registry uppercases the key
        adapter = self.registry.get("fidelity")
        assert adapter.broker_name == "Fidelity"

    def test_supported_brokers_returns_all_four(self):
        brokers = self.registry.supported_brokers()
        assert "FIDELITY" in brokers
        assert "IBKR" in brokers
        assert "PUBLIC" in brokers
        assert "ROBINHOOD" in brokers

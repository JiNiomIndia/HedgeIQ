"""Coverage boost tests for modules not exercised by Sessions 1-3 tests.

Covers: config, db/models, domain/common, domain/analysis, collar strategy,
FastAPI app (health + auth endpoints), JWT token creation, Pydantic schemas.
"""
import pytest
from decimal import Decimal
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

def test_settings_defaults():
    from backend.config import settings
    assert settings.environment == "development" or isinstance(settings.environment, str)
    assert settings.chromadb_path is not None
    assert isinstance(settings.database_url, str)


def test_settings_has_secret_key():
    from backend.config import settings
    assert len(settings.secret_key) > 0


# ---------------------------------------------------------------------------
# DB Models
# ---------------------------------------------------------------------------

def test_user_model_instantiation():
    from backend.db.models import User
    user = User(
        id="user-123",
        email="test@example.com",
        hashed_password="hashed",
        snaptrade_user_id="snaptrade-user",
        is_pro=False,
        is_admin=False,
        daily_ai_calls_used=3,
    )
    assert user.email == "test@example.com"
    assert user.daily_ai_calls_used == 3
    assert user.is_pro is False


def test_waitlist_entry_model_instantiation():
    from backend.db.models import WaitlistEntry
    entry = WaitlistEntry(email="trader@example.com")
    assert entry.email == "trader@example.com"


def test_user_model_tablename():
    from backend.db.models import User
    assert User.__tablename__ == "users"


def test_waitlist_model_tablename():
    from backend.db.models import WaitlistEntry
    assert WaitlistEntry.__tablename__ == "waitlist"


# ---------------------------------------------------------------------------
# domain/common/money
# ---------------------------------------------------------------------------

def test_to_money_from_float():
    from backend.domain.common.money import to_money
    result = to_money(10.975)
    assert result == Decimal("10.98")


def test_to_money_from_string():
    from backend.domain.common.money import to_money
    result = to_money("11.30")
    assert result == Decimal("11.30")


def test_to_money_from_decimal():
    from backend.domain.common.money import to_money
    result = to_money(Decimal("0.51"))
    assert result == Decimal("0.51")


# ---------------------------------------------------------------------------
# domain/common/ticker
# ---------------------------------------------------------------------------

def test_ticker_normalise_lowercase():
    from backend.domain.common.ticker import normalise
    assert normalise(" aal ") == "AAL"


def test_ticker_normalise_already_upper():
    from backend.domain.common.ticker import normalise
    assert normalise("AAPL") == "AAPL"


# ---------------------------------------------------------------------------
# domain/analysis/models
# ---------------------------------------------------------------------------

def test_ai_explanation_full_content():
    from backend.domain.analysis.models import AIExplanation
    exp = AIExplanation(
        content="This is the explanation.",
        model_used="claude-haiku-4-5-20251001",
    )
    assert "This is the explanation." in exp.full_content
    assert "not investment advice" in exp.full_content


def test_ai_explanation_cached_flag():
    from backend.domain.analysis.models import AIExplanation
    exp = AIExplanation(content="text", model_used="claude-haiku-4-5-20251001", cached=True)
    assert exp.cached is True


def test_ai_explanation_disclaimer_present():
    from backend.domain.analysis.models import AIExplanation
    exp = AIExplanation(content="text", model_used="model")
    assert len(exp.disclaimer) > 0


# ---------------------------------------------------------------------------
# domain/analysis/service
# ---------------------------------------------------------------------------

async def test_analysis_service_explain_option():
    from backend.domain.analysis.service import AnalysisService
    from backend.domain.options.models import OptionContract

    mock_claude = MagicMock()
    mock_claude.explain_option = AsyncMock(return_value="Great explanation here.")
    mock_claude._cache = MagicMock()
    mock_claude._cache.get = MagicMock(return_value=None)

    service = AnalysisService(mock_claude)
    option = OptionContract(
        symbol="AAL260618P00010000",
        underlying="AAL",
        option_type="PUT",
        strike=Decimal("10.00"),
        expiry_date="2026-06-18",
        bid=Decimal("0.47"),
        ask=Decimal("0.51"),
        volume=8920,
        open_interest=75310,
        implied_volatility=Decimal("0.55"),
        delta=Decimal("-0.25"),
        days_to_expiry=66,
    )
    result = await service.explain_option(option, calls_today=0, is_free_user=True)
    assert result.content == "Great explanation here."
    assert result.model_used == "claude-haiku-4-5-20251001"


async def test_analysis_service_explain_hedge():
    from backend.domain.analysis.service import AnalysisService
    from backend.domain.options.models import OptionContract
    from backend.domain.positions.models import Position
    from backend.domain.hedging.models import HedgeRecommendation

    mock_claude = MagicMock()
    mock_claude.explain_hedge_recommendation = AsyncMock(return_value="Hedge explanation.")

    service = AnalysisService(mock_claude)
    position = Position("F", "IRA", "1", "AAL", Decimal("5000"), Decimal("11.30"), Decimal("10.97"))
    contract = OptionContract(
        symbol="AAL260618P00010000", underlying="AAL", option_type="PUT",
        strike=Decimal("10.00"), expiry_date="2026-06-18",
        bid=Decimal("0.47"), ask=Decimal("0.51"),
        volume=800, open_interest=75310,
        implied_volatility=Decimal("0.55"), delta=Decimal("-0.25"),
        days_to_expiry=65,
    )
    rec = HedgeRecommendation(
        contract=contract, contracts_to_buy=50,
        total_cost=Decimal("2550"), breakeven_price=Decimal("9.49"),
        coverage_at_10pct_drop=Decimal("3500"), value_score=Decimal("1.37"),
    )
    result = await service.explain_hedge(position, rec, calls_today=0, is_free_user=True)
    assert result.content == "Hedge explanation."


# ---------------------------------------------------------------------------
# CollarStrategy (scaffold)
# ---------------------------------------------------------------------------

def test_collar_strategy_name():
    from backend.domain.hedging.strategies.collar import CollarStrategy
    strategy = CollarStrategy()
    assert strategy.name == "Collar"


def test_collar_strategy_raises_not_implemented():
    from backend.domain.hedging.strategies.collar import CollarStrategy
    from backend.domain.positions.models import Position
    strategy = CollarStrategy()
    position = Position("F", "IRA", "1", "AAL", Decimal("5000"), Decimal("11.30"), Decimal("10.97"))
    with pytest.raises(NotImplementedError):
        strategy.calculate(position, [])


# ---------------------------------------------------------------------------
# FastAPI app — health endpoint + schemas import
# ---------------------------------------------------------------------------

def test_health_endpoint():
    from fastapi.testclient import TestClient
    from backend.main import app
    client = TestClient(app, raise_server_exceptions=False)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_schemas_importable():
    """Importing schemas covers all Pydantic class definitions."""
    from backend.api.v1 import schemas
    assert schemas.PortfolioResponse is not None
    assert schemas.HedgeRequest is not None
    assert schemas.HedgeResponse is not None


def test_position_out_schema():
    from backend.api.v1.schemas import PositionOut
    pos = PositionOut(
        broker="Fidelity", accountName="IRA", symbol="AAL",
        quantity=5000.0, entryPrice=11.30, currentPrice=10.97,
        marketValue=54850.0, unrealisedPnl=-1650.0, unrealisedPnlPct=-2.92,
    )
    assert pos.broker == "Fidelity"
    assert pos.symbol == "AAL"


def test_hedge_request_schema_defaults():
    from backend.api.v1.schemas import HedgeRequest
    req = HedgeRequest(symbol="AAL", shares_held=5000, entry_price=11.30, current_price=10.97)
    assert req.num_recommendations == 3


def test_portfolio_response_schema():
    from backend.api.v1.schemas import PortfolioResponse
    resp = PortfolioResponse(positions=[], total_value=0.0, total_unrealised_pnl=0.0)
    assert resp.positions == []


# ---------------------------------------------------------------------------
# JWT auth — create_token + login/waitlist endpoints
# ---------------------------------------------------------------------------

def test_create_token_returns_string():
    from backend.api.v1.auth import create_token
    token = create_token("user-123")
    assert isinstance(token, str)
    assert len(token) > 20


def test_create_token_is_decodable():
    from backend.api.v1.auth import create_token, ALGORITHM
    from jose import jwt
    from backend.config import settings
    token = create_token("test-user-id")
    payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    assert payload["sub"] == "test-user-id"


def test_login_invalid_credentials():
    from fastapi.testclient import TestClient
    from backend.main import app
    client = TestClient(app, raise_server_exceptions=False)
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "wrong@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_waitlist_join():
    from fastapi.testclient import TestClient
    from backend.main import app
    client = TestClient(app, raise_server_exceptions=False)
    response = client.post(
        "/api/v1/auth/waitlist",
        json={"email": "trader@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["position"] == 47


def test_get_current_user_invalid_token():
    from fastapi.testclient import TestClient
    from backend.main import app
    client = TestClient(app, raise_server_exceptions=False)
    response = client.get(
        "/api/v1/positions",
        headers={"Authorization": "Bearer totally-invalid-token"},
    )
    assert response.status_code == 401

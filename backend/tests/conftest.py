"""Global pytest fixtures for HedgeIQ test suite.

Provides shared DB session, user factories, authenticated HTTP clients,
and domain model factories used across unit, integration, and performance tests.
"""
import pytest
from decimal import Decimal
from datetime import date, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.db.models import Base, User
from backend.db.session import get_db
from backend.api.v1.auth import create_token, get_current_user
from backend.config import settings


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def test_engine():
    """Session-scoped SQLite engine — tables created once, torn down after all tests."""
    engine = create_engine(
        "sqlite:///./test_hedgeiq.db",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)


@pytest.fixture
def db_session(test_engine):
    """Function-scoped DB session — rolled back after each test."""
    Session = sessionmaker(bind=test_engine)
    session = Session()
    yield session
    session.rollback()
    session.close()


# ---------------------------------------------------------------------------
# User factories
# ---------------------------------------------------------------------------

@pytest.fixture
def free_user(db_session):
    """Registered free-tier user with SnapTrade credentials."""
    # Clean up if leftover from previous run
    existing = db_session.query(User).filter(User.id == "free-user-uuid-0001").first()
    if existing:
        db_session.delete(existing)
        db_session.commit()

    user = User(
        id="free-user-uuid-0001",
        email="free@hedgeiq.test",
        hashed_password="salt:dk",  # not used for token-based tests
        is_pro=False,
        is_admin=False,
        daily_ai_calls_used=0,
        snaptrade_user_id="free-user-uuid-0001",
        snaptrade_user_secret="snap-secret-free-0001",
    )
    db_session.add(user)
    db_session.commit()
    yield user
    db_session.delete(user)
    db_session.commit()


@pytest.fixture
def pro_user(db_session):
    """Pro subscriber — no daily AI call limits."""
    existing = db_session.query(User).filter(User.id == "pro-user-uuid-0002").first()
    if existing:
        db_session.delete(existing)
        db_session.commit()

    user = User(
        id="pro-user-uuid-0002",
        email="pro@hedgeiq.test",
        hashed_password="salt:dk",
        is_pro=True,
        is_admin=False,
        daily_ai_calls_used=0,
        snaptrade_user_id="pro-user-uuid-0002",
        snaptrade_user_secret="snap-secret-pro-0002",
    )
    db_session.add(user)
    db_session.commit()
    yield user
    db_session.delete(user)
    db_session.commit()


@pytest.fixture
def admin_user(db_session):
    """Admin user — access to /auth/db-status."""
    existing = db_session.query(User).filter(User.id == "admin-user-uuid-0003").first()
    if existing:
        db_session.delete(existing)
        db_session.commit()

    user = User(
        id="admin-user-uuid-0003",
        email="admin@hedgeiq.test",
        hashed_password="salt:dk",
        is_pro=True,
        is_admin=True,
        daily_ai_calls_used=0,
        snaptrade_user_id="admin-user-uuid-0003",
        snaptrade_user_secret="snap-secret-admin-0003",
    )
    db_session.add(user)
    db_session.commit()
    yield user
    db_session.delete(user)
    db_session.commit()


@pytest.fixture
def free_token(free_user):
    return create_token(free_user.id)


@pytest.fixture
def pro_token(pro_user):
    return create_token(pro_user.id)


@pytest.fixture
def admin_token(admin_user):
    return create_token(admin_user.id)


# ---------------------------------------------------------------------------
# HTTP clients
# ---------------------------------------------------------------------------

@pytest.fixture
async def client(db_session):
    """Async test client — overrides DB dependency."""
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def auth_client(client, free_user, free_token):
    """Client pre-authenticated as free user."""
    client.headers["Authorization"] = f"Bearer {free_token}"
    # Override get_current_user so it resolves without hitting the test DB
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
        id=free_user.id,
        email=free_user.email,
        is_pro=free_user.is_pro,
        is_admin=free_user.is_admin,
        daily_ai_calls_used=free_user.daily_ai_calls_used,
        snaptrade_user_id=free_user.snaptrade_user_id,
        snaptrade_user_secret=free_user.snaptrade_user_secret,
    )
    return client


@pytest.fixture
async def pro_client(client, pro_user, pro_token):
    """Client pre-authenticated as pro user."""
    client.headers["Authorization"] = f"Bearer {pro_token}"
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
        id=pro_user.id,
        email=pro_user.email,
        is_pro=pro_user.is_pro,
        is_admin=pro_user.is_admin,
        daily_ai_calls_used=pro_user.daily_ai_calls_used,
        snaptrade_user_id=pro_user.snaptrade_user_id,
        snaptrade_user_secret=pro_user.snaptrade_user_secret,
    )
    return client


@pytest.fixture
async def admin_client(client, admin_user, admin_token):
    """Client pre-authenticated as admin."""
    client.headers["Authorization"] = f"Bearer {admin_token}"
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(
        id=admin_user.id,
        email=admin_user.email,
        is_pro=admin_user.is_pro,
        is_admin=admin_user.is_admin,
        daily_ai_calls_used=admin_user.daily_ai_calls_used,
        snaptrade_user_id=admin_user.snaptrade_user_id,
        snaptrade_user_secret=admin_user.snaptrade_user_secret,
    )
    return client


# ---------------------------------------------------------------------------
# Domain model factories
# ---------------------------------------------------------------------------

@pytest.fixture
def aal_position():
    """5,000-share AAL position — the canonical midnight hedge scenario."""
    from backend.domain.positions.models import Position
    return Position(
        broker="ROBINHOOD",
        account_name="Robinhood Individual",
        account_id="acc-001",
        symbol="AAL",
        quantity=Decimal("5000"),
        entry_price=Decimal("11.30"),
        current_price=Decimal("10.97"),
    )


@pytest.fixture
def aal_put_chain():
    """Realistic AAL put chain — 3 liquid contracts across 3 expiries."""
    from backend.domain.options.models import OptionContract
    today = date.today()
    return [
        OptionContract(
            symbol="AAL260417P00011000",
            underlying="AAL",
            option_type="PUT",
            strike=Decimal("11.00"),
            expiry_date=(today + timedelta(days=30)).isoformat(),
            bid=Decimal("0.17"),
            ask=Decimal("0.19"),
            volume=500,
            open_interest=17521,
            implied_volatility=Decimal("0.52"),
            delta=Decimal("-0.46"),
            days_to_expiry=30,
        ),
        OptionContract(
            symbol="AAL260618P00010000",
            underlying="AAL",
            option_type="PUT",
            strike=Decimal("10.00"),
            expiry_date=(today + timedelta(days=65)).isoformat(),
            bid=Decimal("0.47"),
            ask=Decimal("0.49"),
            volume=800,
            open_interest=75310,
            implied_volatility=Decimal("0.56"),
            delta=Decimal("-0.25"),
            days_to_expiry=65,
        ),
        OptionContract(
            symbol="AAL260618P00009000",
            underlying="AAL",
            option_type="PUT",
            strike=Decimal("9.00"),
            expiry_date=(today + timedelta(days=45)).isoformat(),
            bid=Decimal("0.25"),
            ask=Decimal("0.27"),
            volume=300,
            open_interest=12000,
            implied_volatility=Decimal("0.61"),
            delta=Decimal("-0.15"),
            days_to_expiry=45,
        ),
    ]


@pytest.fixture
def mock_user_ns():
    """SimpleNamespace mock user for dependency_overrides."""
    return SimpleNamespace(
        id="test-user-uuid",
        email="test@hedgeiq.test",
        is_pro=True,
        is_admin=False,
        daily_ai_calls_used=0,
        snaptrade_user_id="test-user-uuid",
        snaptrade_user_secret="test-snaptrade-secret",
    )

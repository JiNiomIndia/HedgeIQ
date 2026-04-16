# HedgeIQ v0.1 — Session 4 of 6
## Steps 14–17: FastAPI Routes, Auth, Database, Unit Tests to 80%

> **Prerequisite:** Session 3 complete and committed to GitHub.
> **Start by saying:** "Sessions 1–3 complete. 40+ tests passing.
> Now build Session 4, Steps 14–17."

---

## STEP 14 — FastAPI v1 Routes with Full OpenAPI Documentation

### backend/api/v1/schemas.py — all Pydantic request/response models:
```python
"""Pydantic schemas for request/response validation and OpenAPI docs."""
from pydantic import BaseModel, Field
from typing import List, Optional

class PositionOut(BaseModel):
    broker: str; accountName: str; symbol: str
    quantity: float; entryPrice: float; currentPrice: float
    marketValue: float; unrealisedPnl: float; unrealisedPnlPct: float

class PortfolioResponse(BaseModel):
    positions: List[PositionOut]
    total_value: float; total_unrealised_pnl: float

class OptionContractOut(BaseModel):
    symbol: str; expiry_date: str; strike: float; option_type: str
    bid: float; ask: float; volume: int; open_interest: int
    implied_volatility: float; delta: Optional[float] = None
    days_to_expiry: int

class OptionsChainResponse(BaseModel):
    underlying: str; expiry_date: str
    puts: List[OptionContractOut]; calls: List[OptionContractOut]

class HedgeRequest(BaseModel):
    symbol: str = Field(..., example="AAL")
    shares_held: int = Field(..., example=5000)
    entry_price: float = Field(..., example=11.30)
    current_price: float = Field(..., example=10.97)
    num_recommendations: int = Field(default=3, ge=1, le=5)

class HedgeRecommendationOut(BaseModel):
    rank: int; expiry_date: str; strike: float
    ask: float; open_interest: int
    contracts_to_buy: int; total_cost: float
    breakeven_price: float; coverage_at_10pct_drop: float
    value_score: float; ai_explanation: Optional[str] = None

class HedgeResponse(BaseModel):
    recommendations: List[HedgeRecommendationOut]
    strategy: str

class ExplainRequest(BaseModel):
    contract: dict

class ExplainResponse(BaseModel):
    explanation: str; model_used: str; cached: bool = False

class LoginRequest(BaseModel):
    email: str; password: str

class TokenResponse(BaseModel):
    access_token: str; token_type: str = "bearer"

class WaitlistRequest(BaseModel):
    email: str = Field(..., example="trader@example.com")

class WaitlistResponse(BaseModel):
    message: str; position: int
```

### api/v1/positions.py
```python
"""Position endpoints — unified portfolio view across all brokers."""
from fastapi import APIRouter, Depends
from backend.api.v1.schemas import PortfolioResponse
from backend.api.bff.web_bff import shape_portfolio_response
from backend.api.v1.auth import get_current_user

router = APIRouter(prefix="/positions", tags=["Positions"])

@router.get("", response_model=PortfolioResponse, status_code=200,
    summary="Get all positions across connected brokers",
    description="Returns normalised position data from all brokers via SnapTrade. Grouped by broker.")
async def get_positions(current_user=Depends(get_current_user)):
    """Fetch unified portfolio view across all connected brokers."""
    from backend.infrastructure.snaptrade.facade import SnapTradeFacade
    from backend.infrastructure.snaptrade.position_repository import SnapTradePositionRepository
    from backend.adapters.adapter_registry import AdapterRegistry
    from backend.domain.positions.service import PositionService
    from backend.config import settings
    facade = SnapTradeFacade(settings.snaptrade_client_id, settings.snaptrade_consumer_key)
    repo = SnapTradePositionRepository(facade, AdapterRegistry())
    service = PositionService(repo)
    portfolio = await service.get_portfolio(current_user.snaptrade_user_id)
    return shape_portfolio_response(portfolio)
```

### api/v1/options.py
```python
"""Options chain endpoints."""
from fastapi import APIRouter, Depends, Path, Query
from typing import Optional
from backend.api.v1.schemas import OptionsChainResponse, OptionContractOut
from backend.api.v1.auth import get_current_user

router = APIRouter(prefix="/options", tags=["Options"])

@router.get("/{symbol}", response_model=OptionsChainResponse, status_code=200,
    summary="Get options chain for a symbol",
    description="Returns options chain from Polygon.io. Free tier: EOD data. Pro: real-time. Cached 1 hour.")
async def get_options_chain(symbol: str = Path(..., example="AAL"),
                             expiry_date: Optional[str] = Query(None),
                             current_user=Depends(get_current_user)):
    """Fetch options chain with caching."""
    from backend.infrastructure.polygon.facade import PolygonFacade
    from backend.infrastructure.polygon.options_repository import PolygonOptionsRepository
    from backend.domain.options.service import OptionsService
    from backend.infrastructure.cache.chroma_cache import ChromaCache
    from backend.config import settings
    cache = ChromaCache(path=settings.chromadb_path)
    facade = PolygonFacade(settings.polygon_api_key, cache)
    repo = PolygonOptionsRepository(facade)
    service = OptionsService(repo)
    chain = await service.get_chain(symbol.upper(), expiry_date)

    def to_out(c):
        return OptionContractOut(symbol=c.symbol, expiry_date=c.expiry_date,
            strike=float(c.strike), option_type=c.option_type,
            bid=float(c.bid), ask=float(c.ask), volume=c.volume,
            open_interest=c.open_interest, implied_volatility=float(c.implied_volatility),
            delta=float(c.delta) if c.delta else None, days_to_expiry=c.days_to_expiry)

    return OptionsChainResponse(underlying=chain.underlying, expiry_date=chain.expiry_date,
        puts=[to_out(c) for c in chain.puts], calls=[to_out(c) for c in chain.calls])
```

### api/v1/hedge.py
```python
"""Emergency hedge calculation — the core HedgeIQ feature."""
from fastapi import APIRouter, Depends, HTTPException, status
from decimal import Decimal
from backend.api.v1.schemas import HedgeRequest, HedgeResponse
from backend.api.bff.web_bff import shape_hedge_response
from backend.domain.common.errors import InsufficientLiquidityError
from backend.api.v1.auth import get_current_user

router = APIRouter(prefix="/hedge", tags=["Hedging"])

@router.post("/recommend", response_model=HedgeResponse, status_code=200,
    summary="Get hedge recommendations for a position",
    description="Top 3 puts ranked by cost-effectiveness. Free tier: unlimited (pure maths). Pro: includes AI explanation.")
async def get_recommendations(request: HedgeRequest, current_user=Depends(get_current_user)):
    """Calculate top put options to hedge a stock position."""
    from backend.domain.positions.models import Position
    from backend.domain.hedging.service import HedgeService
    from backend.domain.hedging.strategies.protective_put import ProtectivePutStrategy
    from backend.infrastructure.polygon.facade import PolygonFacade
    from backend.infrastructure.polygon.options_repository import PolygonOptionsRepository
    from backend.infrastructure.cache.chroma_cache import ChromaCache
    from backend.config import settings

    position = Position(broker="Manual", account_name="Manual", account_id="manual",
        symbol=request.symbol.upper(), quantity=Decimal(str(request.shares_held)),
        entry_price=Decimal(str(request.entry_price)), current_price=Decimal(str(request.current_price)))

    cache = ChromaCache(path=settings.chromadb_path)
    facade = PolygonFacade(settings.polygon_api_key, cache)
    repo = PolygonOptionsRepository(facade)
    service = HedgeService(options_repo=repo, strategy=ProtectivePutStrategy())

    try:
        recommendations = await service.get_recommendations(position, request.num_recommendations)
    except InsufficientLiquidityError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    return shape_hedge_response(recommendations)
```

### api/v1/ai.py
```python
"""AI explanation endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from backend.api.v1.schemas import ExplainRequest, ExplainResponse
from backend.domain.common.errors import DailyLimitExceededError
from backend.api.v1.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Analysis"])

@router.post("/explain", response_model=ExplainResponse, status_code=200,
    summary="Get plain English explanation of an option",
    description="Claude Haiku explains an option in 3 sentences. Free: 5/day. Pro: unlimited. Cached 24h.")
async def explain_option(request: ExplainRequest, current_user=Depends(get_current_user)):
    """Generate plain English AI explanation for an option."""
    from backend.infrastructure.claude.facade import ClaudeFacade
    from backend.infrastructure.cache.chroma_cache import ChromaCache
    from backend.config import settings
    cache = ChromaCache(path=settings.chromadb_path)
    facade = ClaudeFacade(api_key=settings.anthropic_api_key, cache=cache)
    try:
        content = await facade.explain_option(
            request.contract, calls_today=current_user.daily_ai_calls_used,
            is_free_user=not current_user.is_pro)
        return ExplainResponse(explanation=content, model_used="claude-haiku-4-5-20251001")
    except DailyLimitExceededError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))
```

### Update backend/main.py to register all routes:
```python
"""HedgeIQ FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.v1 import positions, options, hedge, ai, auth

app = FastAPI(title="HedgeIQ API", version="0.1.0",
    description="AI-powered trading assistant — hedge your portfolio at midnight in 60 seconds.")

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router, prefix="/api/v1")
app.include_router(positions.router, prefix="/api/v1")
app.include_router(options.router, prefix="/api/v1")
app.include_router(hedge.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
```

**Gate:** `uvicorn backend.main:app` starts. Visit `http://localhost:8000/docs` — all routes visible in Swagger UI.

---

## STEP 15 — JWT Authentication + Daily AI Limit Enforcement

### db/models.py
```python
"""SQLAlchemy ORM models."""
from sqlalchemy import Column, String, Boolean, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    """User account model.

    Attributes:
        id: UUID primary key
        email: Unique login email
        hashed_password: bcrypt hash
        snaptrade_user_id: For SnapTrade broker connections
        is_pro: Pro subscription flag
        is_admin: Admin access flag
        daily_ai_calls_used: Reset at midnight ET
        daily_ai_calls_reset_date: Date of last reset
    """
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    snaptrade_user_id = Column(String, nullable=True)
    snaptrade_user_secret = Column(String, nullable=True)
    is_pro = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    daily_ai_calls_used = Column(Integer, default=0)
    daily_ai_calls_reset_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class WaitlistEntry(Base):
    """Email waitlist for pre-launch signups."""
    __tablename__ = "waitlist"
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False)
    signed_up_at = Column(DateTime, default=datetime.utcnow)
```

### api/v1/auth.py
```python
"""JWT authentication endpoints and dependency."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.api.v1.schemas import LoginRequest, TokenResponse, WaitlistRequest, WaitlistResponse
import jwt, uuid
from datetime import datetime, timedelta
from backend.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()
ALGORITHM = "HS256"

def create_token(user_id: str) -> str:
    """Create signed JWT access token.

    Args:
        user_id: User database ID
    Returns:
        Signed JWT string
    """
    payload = {"sub": user_id, "iat": datetime.utcnow(),
               "exp": datetime.utcnow() + timedelta(hours=24)}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """JWT dependency — validates token and returns user object.

    Raises:
        HTTPException 401: If token invalid or expired
    """
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        from types import SimpleNamespace
        return SimpleNamespace(id=user_id, email=settings.admin_email,
            is_pro=True, is_admin=True, daily_ai_calls_used=0,
            snaptrade_user_id=settings.snaptrade_personal_user_id or user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/login", response_model=TokenResponse, summary="Login and get JWT token")
async def login(request: LoginRequest):
    """Authenticate with email/password, receive JWT access token."""
    if request.email == settings.admin_email and request.password == settings.admin_password:
        return TokenResponse(access_token=create_token(str(uuid.uuid4())))
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@router.post("/waitlist", response_model=WaitlistResponse, summary="Join waitlist")
async def join_waitlist(request: WaitlistRequest):
    """Add email to pre-launch waitlist."""
    return WaitlistResponse(message="You're on the list! We'll notify you at launch.", position=47)

@router.get("/connect-broker", summary="Get SnapTrade broker connection URL")
async def connect_broker(broker: str, current_user=Depends(get_current_user)):
    """Generate SnapTrade OAuth URL for user to connect their broker."""
    from backend.infrastructure.snaptrade.facade import SnapTradeFacade
    from backend.config import settings
    facade = SnapTradeFacade(settings.snaptrade_client_id, settings.snaptrade_consumer_key)
    url = await facade.get_connection_url(current_user.snaptrade_user_id, broker.upper())
    return {"connection_url": url, "broker": broker.upper()}
```

**Gate:** `POST /api/v1/auth/login` with admin email + password from .env returns JWT access_token.

---

## STEP 16 — SQLite Database + Alembic Migrations

```bash
alembic init db/migrations
```

Update `alembic.ini` sqlalchemy.url to: `sqlite:///./hedgeiq.db`

Update `db/migrations/env.py`:
```python
from backend.db.models import Base
target_metadata = Base.metadata
```

Create and run migrations:
```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

**Gate:** `alembic upgrade head` runs without errors. `hedgeiq.db` file exists.

---

## STEP 17 — Unit Tests to 80% Coverage

### tests/integration/test_hedge_calculation_flow.py
```python
"""Integration test for the full hedge calculation flow."""
import pytest, asyncio
from unittest.mock import AsyncMock, MagicMock
from decimal import Decimal
from datetime import date, timedelta
from backend.domain.hedging.service import HedgeService
from backend.domain.hedging.strategies.protective_put import ProtectivePutStrategy
from backend.domain.options.models import OptionContract
from backend.domain.positions.models import Position
from backend.domain.common.errors import InsufficientLiquidityError

def make_chain():
    return [
        OptionContract(symbol="AAL260417P00011000", underlying="AAL", option_type="PUT",
            strike=Decimal("11.00"), expiry_date=(date.today()+timedelta(days=30)).isoformat(),
            bid=Decimal("0.17"), ask=Decimal("0.19"), volume=500, open_interest=17521,
            implied_volatility=Decimal("0.52"), delta=Decimal("-0.46"), days_to_expiry=30),
        OptionContract(symbol="AAL260618P00010000", underlying="AAL", option_type="PUT",
            strike=Decimal("10.00"), expiry_date=(date.today()+timedelta(days=65)).isoformat(),
            bid=Decimal("0.47"), ask=Decimal("0.49"), volume=800, open_interest=75310,
            implied_volatility=Decimal("0.56"), delta=Decimal("-0.25"), days_to_expiry=65),
        OptionContract(symbol="AAL260618P00009000", underlying="AAL", option_type="PUT",
            strike=Decimal("9.00"), expiry_date=(date.today()+timedelta(days=45)).isoformat(),
            bid=Decimal("0.25"), ask=Decimal("0.27"), volume=300, open_interest=12000,
            implied_volatility=Decimal("0.61"), delta=Decimal("-0.15"), days_to_expiry=45),
    ]

def test_midnight_aal_scenario():
    """The real scenario: 5000 AAL at $11.30, current $10.97. Expect 3 recommendations."""
    mock_repo = MagicMock()
    mock_repo.get_chain = AsyncMock(return_value=make_chain())
    service = HedgeService(options_repo=mock_repo, strategy=ProtectivePutStrategy())
    position = Position("Fidelity","Rollover IRA","***7040","AAL",
                        Decimal("5000"),Decimal("11.30"),Decimal("10.97"))
    result = asyncio.get_event_loop().run_until_complete(service.get_recommendations(position, 3))
    assert len(result) == 3
    assert all(r.contract.option_type.upper() == "PUT" for r in result)
    assert all(r.contracts_to_buy == 50 for r in result)
    assert result[0].value_score >= result[1].value_score

def test_empty_chain_raises_insufficient_liquidity():
    mock_repo = MagicMock()
    mock_repo.get_chain = AsyncMock(return_value=[])
    service = HedgeService(options_repo=mock_repo, strategy=ProtectivePutStrategy())
    position = Position("F","IRA","1","AAL",Decimal("5000"),Decimal("11.30"),Decimal("10.97"))
    with pytest.raises(InsufficientLiquidityError):
        asyncio.get_event_loop().run_until_complete(service.get_recommendations(position))
```

### Run coverage check:
```bash
pytest backend/tests/ -v --cov=backend --cov-report=term-missing --cov-fail-under=80
```

Fix any gaps until 80% overall coverage is reached.

**Gate:** `pytest backend/tests/ --cov=backend --cov-fail-under=80` exits 0. Zero failing tests.

---

## SESSION 4 COMPLETION CHECKLIST

- [ ] `uvicorn backend.main:app` starts without errors
- [ ] `http://localhost:8000/docs` shows all 6 route groups in Swagger UI
- [ ] `POST /api/v1/auth/login` returns JWT access_token
- [ ] `GET /api/v1/health` returns `{"status": "ok"}`
- [ ] `alembic upgrade head` creates `hedgeiq.db` without errors
- [ ] `pytest backend/tests/ --cov=backend --cov-fail-under=80` passes
- [ ] Zero failing tests

**Say "Session 4 complete — all tests passing" and stop.**

```bash
git add .
git commit -m "HedgeIQ v0.1 Session 4: FastAPI routes, JWT auth, database, 80% coverage"
```
**Next:** Session 5 — Steps 18-21: Integration tests, ADRs, React frontend

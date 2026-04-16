# HedgeIQ v0.1 — Session 1 of 6 (Steps 1–4)
# Project Skeleton · Domain Models · Abstract Interfaces · ChromaDB Cache

> **How to use:** Paste this entire file into the Claude Code tab.
> When Claude says "Step 4 complete — tests passing", stop. Commit to Git. Move to Session 2.
> **Do NOT proceed past Step 4 in this session.**

---

## CONTEXT (read before building)

You are a Principal Software Architect and options trading domain expert.

You are building **HedgeIQ v0.1** — a Python FastAPI trading assistant.
Origin: A trader lost $2,355 manually hedging 5,000 AAL shares at midnight across 3 brokers.
This app automates that workflow.

This is Session 1 of 6. Build ONLY Steps 1–4. Stop after Step 4 tests pass.

The full app uses these 7 patterns — keep them in mind as you build foundations:
- **DDD** (4 domains: Positions, Options, Hedging, Analysis)
- **Repository** (abstract data interfaces per domain)
- **Adapter** (one per broker — normalises raw data)
- **Facade** (wraps external services)
- **Strategy** (pluggable hedge algorithms)
- **API Gateway** (rate limiting, API key auth)
- **BFF** (web active, desktop/mobile scaffold)

---

## STEP 1 — Project Skeleton

Create the complete directory structure with all empty `__init__.py` files,
`.env.example`, `requirements.txt`, `Makefile`, and `docker-compose.yml`.

### Directory structure to create:

```
hedgeiq/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── bff/
│   │   │   ├── web_bff.py             # ACTIVE
│   │   │   ├── desktop_bff.py         # SCAFFOLD
│   │   │   ├── mobile_bff.py          # SCAFFOLD
│   │   │   └── README.md
│   │   ├── v1/
│   │   │   ├── positions.py
│   │   │   ├── options.py
│   │   │   ├── hedge.py
│   │   │   ├── ai.py
│   │   │   └── auth.py
│   │   └── gateway/
│   │       ├── middleware.py
│   │       ├── rate_limiter.py
│   │       └── api_key_auth.py
│   ├── domain/
│   │   ├── common/
│   │   │   ├── money.py
│   │   │   ├── ticker.py
│   │   │   └── errors.py
│   │   ├── positions/
│   │   │   ├── models.py
│   │   │   ├── repository.py
│   │   │   └── service.py
│   │   ├── options/
│   │   │   ├── models.py
│   │   │   ├── repository.py
│   │   │   └── service.py
│   │   ├── hedging/
│   │   │   ├── models.py
│   │   │   ├── strategies/
│   │   │   │   ├── base.py
│   │   │   │   ├── protective_put.py
│   │   │   │   └── collar.py
│   │   │   └── service.py
│   │   └── analysis/
│   │       ├── models.py
│   │       └── service.py
│   ├── adapters/
│   │   ├── base.py
│   │   ├── fidelity_adapter.py
│   │   ├── ibkr_adapter.py
│   │   ├── public_adapter.py
│   │   └── adapter_registry.py
│   ├── infrastructure/
│   │   ├── snaptrade/facade.py + position_repository.py
│   │   ├── polygon/facade.py + options_repository.py
│   │   ├── yfinance/facade.py
│   │   ├── claude/facade.py
│   │   └── cache/chroma_cache.py
│   ├── db/
│   │   ├── models.py
│   │   └── migrations/
│   └── tests/
│       ├── unit/domain/
│       ├── unit/adapters/
│       ├── unit/infrastructure/
│       ├── integration/
│       ├── e2e/
│       ├── fixtures/
│       │   ├── mock_positions.json
│       │   ├── mock_options_chain.json
│       │   └── mock_claude_responses.json
│       └── docs/
│           ├── test_plan.md
│           ├── UTC_unit_test_cases.md
│           ├── functional_test_cases.md
│           └── E2E_test_cases.md
├── frontend/src/components/
├── docs/architecture/
│   ├── ADR-001-pattern-selection.md
│   ├── ADR-002-bff-deferral.md
│   ├── ADR-003-ddd-bounded-contexts.md
│   └── ADR-004-api-versioning.md
├── .env.example
├── .gitignore
├── requirements.txt
├── docker-compose.yml
└── Makefile
```

### .env.example:
```bash
ANTHROPIC_API_KEY=
POLYGON_API_KEY=
SNAPTRADE_CLIENT_ID=
SNAPTRADE_CONSUMER_KEY=
SNAPTRADE_PERSONAL_USER_ID=
SECRET_KEY=generate-a-random-32-char-string-here
DATABASE_URL=sqlite:///./hedgeiq.db
CHROMADB_PATH=./data/chroma_cache
ENVIRONMENT=development
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

### requirements.txt:
```
fastapi==0.111.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.30
alembic==1.13.1
fastapi-users[sqlalchemy]==13.0.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.27.0
pydantic==2.7.0
pydantic-settings==2.3.0
anthropic==0.28.0
polygon-api-client==1.13.4
yfinance==0.2.40
snaptrade-python-sdk==11.0.3
chromadb==0.5.0
structlog==24.2.0
pytest==8.2.0
pytest-asyncio==0.23.7
pytest-mock==3.14.0
pytest-cov==5.0.0
```

### main.py stub:
```python
from fastapi import FastAPI
app = FastAPI(title="HedgeIQ API", version="0.1.0",
    description="AI-powered trading assistant.")

@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
```

### config.py:
```python
from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    anthropic_api_key: str = ""
    polygon_api_key: str = ""
    snaptrade_client_id: str = ""
    snaptrade_consumer_key: str = ""
    snaptrade_personal_user_id: str = ""
    secret_key: str = "dev-secret-change-in-production"
    database_url: str = "sqlite:///./hedgeiq.db"
    chromadb_path: str = "./data/chroma_cache"
    environment: str = "development"
    admin_email: str = ""
    admin_password: str = ""
    class Config:
        env_file = ".env"
settings = Settings()
```

**Gate:** `uvicorn backend.main:app` starts. GET /health returns 200.

---

## STEP 2 — Domain Models

Implement all domain models with full Google-style docstrings.
Pure Python — no database, no external imports.

### domain/common/errors.py — all domain exceptions:
```python
class HedgeIQError(Exception): pass
class InsufficientLiquidityError(HedgeIQError):
    def __init__(self, symbol: str, min_oi: int = 5000):
        super().__init__(f"No options for {symbol} meet minimum OI of {min_oi:,}")
class DataUnavailableError(HedgeIQError): pass
class RateLimitError(HedgeIQError): pass
class DailyLimitExceededError(HedgeIQError):
    def __init__(self, limit: int = 5):
        super().__init__(f"Daily AI limit of {limit} reached. Upgrade to Pro.")
```

### domain/positions/models.py — Position entity + Portfolio aggregate:
```python
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional, List

@dataclass
class Position:
    """A stock or options position in a broker account.
    Args:
        broker: e.g. Fidelity, IBKR, Public
        account_name: e.g. Sankar Rollover IRA
        account_id: broker-specific identifier
        symbol: ticker e.g. AAL
        quantity: shares or contracts
        entry_price: average cost basis
        current_price: current market price
        asset_type: STOCK or OPTION
    """
    broker: str
    account_name: str
    account_id: str
    symbol: str
    quantity: Decimal
    entry_price: Decimal
    current_price: Decimal
    asset_type: str = "STOCK"
    option_type: Optional[str] = None
    expiry_date: Optional[str] = None
    strike_price: Optional[Decimal] = None

    @property
    def market_value(self) -> Decimal:
        m = Decimal("100") if self.asset_type == "OPTION" else Decimal("1")
        return (self.quantity * self.current_price * m).quantize(Decimal("0.01"))

    @property
    def unrealised_pnl(self) -> Decimal:
        m = Decimal("100") if self.asset_type == "OPTION" else Decimal("1")
        return ((self.current_price - self.entry_price) * self.quantity * m).quantize(Decimal("0.01"))

    @property
    def unrealised_pnl_pct(self) -> Decimal:
        cost = self.entry_price * self.quantity
        if cost == 0: return Decimal("0")
        return (self.unrealised_pnl / cost * 100).quantize(Decimal("0.01"))

@dataclass
class Portfolio:
    """Aggregate of all positions for one user across all brokers."""
    user_id: str
    positions: List[Position]

    @property
    def total_value(self) -> Decimal:
        return sum(p.market_value for p in self.positions)

    @property
    def total_unrealised_pnl(self) -> Decimal:
        return sum(p.unrealised_pnl for p in self.positions)
```

### domain/options/models.py — OptionContract + OptionsChain:
```python
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Optional, List

@dataclass
class OptionContract:
    """A single option contract in the market.
    Example: AAL Jun 18 $10 Put, ask $0.51, OI 75,310
    """
    symbol: str
    underlying: str
    option_type: str      # PUT or CALL
    strike: Decimal
    expiry_date: str
    bid: Decimal
    ask: Decimal
    volume: int = 0
    open_interest: int = 0
    implied_volatility: Optional[Decimal] = None
    delta: Optional[Decimal] = None
    theta: Optional[Decimal] = None
    days_to_expiry: int = 0

    @property
    def mid_price(self) -> Decimal:
        return ((self.bid + self.ask) / 2).quantize(Decimal("0.01"))

    @property
    def cost_for_50_contracts(self) -> Decimal:
        return (self.ask * 100 * 50).quantize(Decimal("0.01"))

@dataclass
class OptionsChain:
    """Complete options chain for a symbol on a given expiry."""
    underlying: str
    expiry_date: str
    contracts: List[OptionContract] = field(default_factory=list)

    @property
    def puts(self) -> List[OptionContract]:
        return sorted([c for c in self.contracts if c.option_type == "PUT"], key=lambda c: c.strike)

    @property
    def calls(self) -> List[OptionContract]:
        return sorted([c for c in self.contracts if c.option_type == "CALL"], key=lambda c: c.strike)
```

### domain/hedging/models.py — HedgeRecommendation:
```python
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

@dataclass
class HedgeRecommendation:
    """A put option recommended as a hedge, ranked by value_score desc.
    value_score = coverage_at_10pct_drop / total_cost (higher = better value)
    """
    contract: object
    contracts_to_buy: int
    total_cost: Decimal
    breakeven_price: Decimal
    coverage_at_10pct_drop: Decimal
    value_score: Decimal
    ai_explanation: Optional[str] = None
```

### domain/analysis/models.py — AIExplanation:
```python
from dataclasses import dataclass

@dataclass
class AIExplanation:
    """Result of a Claude AI analysis of an option or hedge."""
    content: str
    model_used: str
    cached: bool = False
    disclaimer: str = (
        "AI-generated analysis for informational purposes only, "
        "not investment advice. Options involve risk."
    )

    @property
    def full_content(self) -> str:
        return f"{self.content}\n\n{self.disclaimer}"
```

**Gate:** All model files import cleanly. Run:
```bash
python -c "from backend.domain.positions.models import Position, Portfolio; print('OK')"
python -c "from backend.domain.options.models import OptionContract, OptionsChain; print('OK')"
python -c "from backend.domain.hedging.models import HedgeRecommendation; print('OK')"
```

---

## STEP 3 — Abstract Interfaces

### domain/positions/repository.py:
```python
from abc import ABC, abstractmethod
from typing import List
from backend.domain.positions.models import Position, Portfolio

class AbstractPositionRepository(ABC):
    """Abstract repo for positions. Implementations: SnapTradePositionRepository, MockPositionRepository."""

    @abstractmethod
    async def get_positions(self, user_id: str) -> List[Position]:
        """Get all positions for a user across all connected brokers.
        Raises: DataUnavailableError if broker API unreachable.
        """
        pass

    @abstractmethod
    async def get_portfolio(self, user_id: str) -> Portfolio:
        pass
```

### domain/options/repository.py:
```python
from abc import ABC, abstractmethod
from typing import List, Optional
from backend.domain.options.models import OptionContract

class AbstractOptionsRepository(ABC):
    """Abstract repo for options chains. Implementations: PolygonOptionsRepository, MockOptionsRepository."""

    @abstractmethod
    async def get_chain(self, symbol: str, expiry_date: Optional[str] = None) -> List[OptionContract]:
        """Fetch options chain for a symbol.
        Raises: DataUnavailableError, RateLimitError
        """
        pass

    @abstractmethod
    async def get_contract(self, option_symbol: str) -> OptionContract:
        pass
```

### domain/hedging/strategies/base.py:
```python
from abc import ABC, abstractmethod
from typing import List
from backend.domain.positions.models import Position
from backend.domain.options.models import OptionContract
from backend.domain.hedging.models import HedgeRecommendation

class AbstractHedgeStrategy(ABC):
    """Strategy pattern base. Active: ProtectivePutStrategy. Scaffold: CollarStrategy (v2)."""

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def calculate(self, position: Position, options_chain: List[OptionContract],
                  num_recommendations: int = 3) -> List[HedgeRecommendation]:
        """Calculate hedge recommendations sorted by value_score desc.
        Raises: InsufficientLiquidityError if no options meet OI threshold.
        """
        pass
```

### domain/hedging/strategies/collar.py (SCAFFOLD):
```python
from backend.domain.hedging.strategies.base import AbstractHedgeStrategy

class CollarStrategy(AbstractHedgeStrategy):
    """Collar: buy put + sell call. SCAFFOLD — not active in v0.1."""
    @property
    def name(self) -> str: return "Collar"
    def calculate(self, position, options_chain, num_recommendations=3):
        raise NotImplementedError("CollarStrategy is scaffolded for v2.")
```

**Gate:** All abstract classes import cleanly.

---

## STEP 4 — ChromaDB Cache

### infrastructure/cache/chroma_cache.py:
```python
"""ChromaDB persistent key-value cache. TTL-based. Not using embeddings — pure key-value."""
import json, hashlib
from datetime import datetime, timedelta
from typing import Optional, Any
import chromadb
from chromadb.config import Settings
import structlog
log = structlog.get_logger()

class ChromaCache:
    """Persistent cache backed by ChromaDB local storage.
    Args:
        path: local directory for ChromaDB storage
        collection_name: ChromaDB collection name
    Example:
        cache = ChromaCache(path="./data/chroma_cache")
        cache.set("options_chain:AAL", data, ttl_hours=1)
        result = cache.get("options_chain:AAL")
    """
    def __init__(self, path: str = "./data/chroma_cache", collection_name: str = "hedgeiq_cache"):
        self._client = chromadb.PersistentClient(path=path,
            settings=Settings(anonymized_telemetry=False))
        self._collection = self._client.get_or_create_collection(name=collection_name)
        log.info("ChromaDB cache initialised", path=path)

    def _make_id(self, key: str) -> str:
        return hashlib.md5(key.encode()).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        """Return cached value if exists and not expired, else None."""
        doc_id = self._make_id(key)
        try:
            result = self._collection.get(ids=[doc_id], include=["documents", "metadatas"])
            if not result["ids"]: return None
            expires_at = datetime.fromisoformat(result["metadatas"][0]["expires_at"])
            if datetime.utcnow() > expires_at:
                self._collection.delete(ids=[doc_id]); return None
            return json.loads(result["documents"][0])
        except Exception as e:
            log.warning("Cache get error", key=key, error=str(e)); return None

    def set(self, key: str, value: Any, ttl_hours: int = 24) -> bool:
        """Store value with TTL. Returns True on success."""
        doc_id = self._make_id(key)
        expires_at = (datetime.utcnow() + timedelta(hours=ttl_hours)).isoformat()
        try:
            self._collection.upsert(ids=[doc_id], documents=[json.dumps(value, default=str)],
                metadatas=[{"key": key, "expires_at": expires_at, "ttl_hours": ttl_hours}])
            return True
        except Exception as e:
            log.warning("Cache set error", key=key, error=str(e)); return False

    def invalidate(self, key: str) -> bool:
        """Delete a cache entry. Returns True on success."""
        try:
            self._collection.delete(ids=[self._make_id(key)]); return True
        except: return False
```

### tests/unit/infrastructure/test_chroma_cache.py:
```python
import pytest
from backend.infrastructure.cache.chroma_cache import ChromaCache

@pytest.fixture
def cache(tmp_path):
    return ChromaCache(path=str(tmp_path / "test_cache"), collection_name="test")

def test_cache_miss_returns_none(cache):
    assert cache.get("nonexistent") is None

def test_cache_set_and_get(cache):
    cache.set("key1", {"data": "hello"}, ttl_hours=1)
    assert cache.get("key1") == {"data": "hello"}

def test_cache_set_returns_true(cache):
    assert cache.set("key2", {"v": 1}) is True

def test_cache_upsert_overwrites(cache):
    cache.set("key3", {"version": 1})
    cache.set("key3", {"version": 2})
    assert cache.get("key3") == {"version": 2}

def test_cache_invalidate(cache):
    cache.set("key4", {"data": "value"})
    cache.invalidate("key4")
    assert cache.get("key4") is None

def test_cache_handles_complex_objects(cache):
    data = {"symbol": "AAL", "contracts": [{"strike": "10.00"}], "count": 40}
    cache.set("complex", data)
    assert cache.get("complex") == data

def test_cache_ttl_expiry(cache):
    import json, hashlib
    from datetime import datetime, timedelta
    doc_id = hashlib.md5("expired_key".encode()).hexdigest()
    past = (datetime.utcnow() - timedelta(hours=1)).isoformat()
    cache._collection.upsert(ids=[doc_id], documents=[json.dumps({"data": "old"})],
        metadatas=[{"key": "expired_key", "expires_at": past, "ttl_hours": 0}])
    assert cache.get("expired_key") is None

def test_cache_set_false_on_bad_data(cache):
    # Non-serializable should return False gracefully
    import math
    result = cache.set("bad", {"val": math.inf})
    # Either True (default=str handles it) or False — just no exception
    assert isinstance(result, bool)
```

**Gate:** `pytest backend/tests/unit/infrastructure/test_chroma_cache.py -v`
All tests pass before ending this session.

---

## SESSION 1 COMPLETE CHECKLIST

- [ ] `uvicorn backend.main:app` starts without errors
- [ ] GET /health returns `{"status": "ok", "version": "0.1.0"}`
- [ ] All domain model files import cleanly
- [ ] All abstract repository and strategy interfaces import cleanly
- [ ] All ChromaDB cache tests pass
- [ ] `.env.example` populated with all required keys
- [ ] `requirements.txt` complete

**Commit:** `feat: Session 1 complete — skeleton, domain models, interfaces, ChromaDB cache`
**Next:** Session 2 — Steps 5-8: Claude Facade, Polygon Facade, SnapTrade Facade, Broker Adapters

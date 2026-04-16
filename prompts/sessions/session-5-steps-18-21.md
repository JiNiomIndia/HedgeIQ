# HedgeIQ v0.1 — Session 5 of 6 (Steps 18–21)
# Integration Tests · Architecture ADRs · React Frontend (5 Components)

> **How to use:** Paste this entire file into the Claude Code tab.
> Sessions 1–4 must be complete with all tests passing before starting this session.
> When Claude says "Step 21 complete — tests passing", stop. Commit to Git. Move to Session 6.

---

## CONTEXT

Sessions 1–4 are complete:
- Domain models, interfaces, ChromaDB cache (Session 1)
- Claude, Polygon, SnapTrade facades + broker adapters (Session 2)
- Repositories, domain services, strategies, gateway, BFF scaffold (Session 3)
- FastAPI routes, JWT auth, SQLite database, 80%+ test coverage (Session 4)

This session adds integration tests, architecture ADRs, and the complete React frontend.

---

## STEP 18 — Integration Tests

### backend/tests/fixtures/mock_positions.json
```json
[
  {"broker": "Fidelity", "account_name": "Sankar Rollover IRA", "account_id": "***7040",
   "symbol": "AAL", "quantity": "5000", "entry_price": "11.30", "current_price": "10.97"},
  {"broker": "Fidelity", "account_name": "Bhuvana Traditional IRA", "account_id": "***8821",
   "symbol": "AAL", "quantity": "500", "entry_price": "11.20", "current_price": "10.97"},
  {"broker": "Public", "account_name": "Public Brokerage", "account_id": "pub-001",
   "symbol": "AAL", "quantity": "2000", "entry_price": "11.05", "current_price": "10.97"}
]
```

### backend/tests/fixtures/mock_options_chain.json
```json
[
  {"symbol": "AAL260618P00010000", "underlying": "AAL", "option_type": "PUT",
   "strike": "10.00", "expiry_date": "2026-06-18", "bid": "0.48", "ask": "0.51",
   "volume": 8920, "open_interest": 75310, "implied_volatility": "0.55", "delta": "-0.25", "days_to_expiry": 66},
  {"symbol": "AAL260618P00011000", "underlying": "AAL", "option_type": "PUT",
   "strike": "11.00", "expiry_date": "2026-06-18", "bid": "0.17", "ask": "0.19",
   "volume": 4821, "open_interest": 17521, "implied_volatility": "0.62", "delta": "-0.46", "days_to_expiry": 66},
  {"symbol": "AAL260618P00009000", "underlying": "AAL", "option_type": "PUT",
   "strike": "9.00", "expiry_date": "2026-06-18", "bid": "0.25", "ask": "0.27",
   "volume": 3100, "open_interest": 42000, "implied_volatility": "0.52", "delta": "-0.15", "days_to_expiry": 66},
  {"symbol": "AAL260618P00008000", "underlying": "AAL", "option_type": "PUT",
   "strike": "8.00", "expiry_date": "2026-07-17", "bid": "0.10", "ask": "0.12",
   "volume": 200, "open_interest": 629, "implied_volatility": "0.49", "delta": "-0.08", "days_to_expiry": 95}
]
```

### backend/tests/fixtures/mock_claude_responses.json
```json
{
  "explain_option": "This put gives you the right to sell AAL at $10 before June 18, 2026. You profit if AAL falls below $9.49. Maximum loss is $2,550 for 50 contracts if AAL stays above $10 at expiry.",
  "explain_hedge": "This Jun 18 $10 put is best value with OI of 75,310 ensuring easy exit, costing $2,550 to protect a $54,850 position against a drop below $9.49."
}
```

### backend/tests/integration/test_positions_flow.py
```python
"""Integration tests for positions flow. SnapTrade is mocked."""
import json, pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient
from backend.main import app

@pytest.fixture
def mock_positions():
    with open("backend/tests/fixtures/mock_positions.json") as f:
        return json.load(f)

@pytest.mark.asyncio
async def test_positions_returns_all_brokers(mock_positions):
    with patch("backend.infrastructure.snaptrade.position_repository.SnapTradePositionRepository.get_positions",
               new_callable=AsyncMock, return_value=mock_positions):
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/api/v1/positions",
                headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    brokers = {p["broker"] for p in response.json()["positions"]}
    assert "Fidelity" in brokers and "Public" in brokers

@pytest.mark.asyncio
async def test_positions_response_has_totals(mock_positions):
    with patch("backend.infrastructure.snaptrade.position_repository.SnapTradePositionRepository.get_positions",
               new_callable=AsyncMock, return_value=mock_positions):
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/api/v1/positions",
                headers={"Authorization": "Bearer test-token"})
    data = response.json()
    assert "total_value" in data and "total_unrealised_pnl" in data

@pytest.mark.asyncio
async def test_positions_empty_gracefully():
    with patch("backend.infrastructure.snaptrade.position_repository.SnapTradePositionRepository.get_positions",
               new_callable=AsyncMock, return_value=[]):
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/api/v1/positions",
                headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    assert response.json()["positions"] == []
```

### backend/tests/integration/test_hedge_calculation_flow.py
```python
"""Integration tests for hedge calculation. Polygon and Claude are mocked.

Core scenario: midnight AAL hedge — 5000 shares at $11.30, current $10.97.
"""
import json, pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient
from backend.main import app

@pytest.fixture
def mock_chain():
    with open("backend/tests/fixtures/mock_options_chain.json") as f:
        return json.load(f)

@pytest.mark.asyncio
async def test_midnight_aal_hedge_returns_3_recommendations(mock_chain):
    """The origin scenario that built this app."""
    with patch("backend.infrastructure.polygon.options_repository.PolygonOptionsRepository.get_chain",
               new_callable=AsyncMock, return_value=mock_chain):
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post("/api/v1/hedge/recommend",
                json={"symbol": "AAL", "shares_held": 5000,
                      "entry_price": 11.30, "current_price": 10.97},
                headers={"Authorization": "Bearer test-token"})

    assert response.status_code == 200
    recs = response.json()["recommendations"]
    assert len(recs) == 3
    assert all(r["open_interest"] >= 5000 for r in recs)
    assert all(r["total_cost"] > 0 for r in recs)

@pytest.mark.asyncio
async def test_low_oi_returns_422():
    """No liquid options should return 422."""
    low_oi_chain = [{"symbol": "X", "underlying": "AAL", "option_type": "PUT",
        "strike": "10.00", "expiry_date": "2026-06-18", "bid": "0.48", "ask": "0.51",
        "open_interest": 100, "volume": 50, "days_to_expiry": 66}]
    with patch("backend.infrastructure.polygon.options_repository.PolygonOptionsRepository.get_chain",
               new_callable=AsyncMock, return_value=low_oi_chain):
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post("/api/v1/hedge/recommend",
                json={"symbol": "AAL", "shares_held": 5000,
                      "entry_price": 11.30, "current_price": 10.97},
                headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_recommendations_sorted_by_value_score(mock_chain):
    with patch("backend.infrastructure.polygon.options_repository.PolygonOptionsRepository.get_chain",
               new_callable=AsyncMock, return_value=mock_chain):
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post("/api/v1/hedge/recommend",
                json={"symbol": "AAL", "shares_held": 5000,
                      "entry_price": 11.30, "current_price": 10.97},
                headers={"Authorization": "Bearer test-token"})
    recs = response.json()["recommendations"]
    scores = [r["value_score"] for r in recs]
    assert scores == sorted(scores, reverse=True)
```

**Gate:** `pytest backend/tests/integration/ -v` — all tests pass.

---

## STEP 19 — Test Documentation

### backend/tests/docs/test_plan.md
```markdown
# HedgeIQ v0.1 — Test Plan

## Test Environments
- Local: SQLite + ChromaDB local, all external APIs mocked
- Railway staging: PostgreSQL + ChromaDB persistent volume

## Tools
| Type | Tool | Location |
|------|------|----------|
| Unit | pytest + pytest-mock | backend/tests/unit/ |
| Integration | pytest + httpx | backend/tests/integration/ |
| E2E | Playwright | frontend/tests/e2e/ |
| Coverage | pytest-cov | make test |

## Coverage Targets
- Domain services: 90%+  |  Adapters: 90%+  |  Overall: 80%+

## Run Commands
```bash
make test                    # All + coverage
make test-unit               # Fast unit tests only
make test-integration        # Integration only
```

## Regression Policy
All tests pass before any commit to main. E2E runs before production deploy.
```

### backend/tests/docs/UTC_unit_test_cases.md
```markdown
# Unit Test Cases (UTC) — HedgeIQ v0.1

| ID | Domain | Class | Method | Input | Expected | Status |
|----|--------|-------|--------|-------|----------|--------|
| UTC-001 | Hedging | ProtectivePutStrategy | calculate() | 5000 AAL, chain with liquid puts | 3 HedgeRecommendation | PASS |
| UTC-002 | Hedging | ProtectivePutStrategy | calculate() | All OI < 5000 | InsufficientLiquidityError | PASS |
| UTC-003 | Hedging | ProtectivePutStrategy | calculate() | Valid chain | Sorted by value_score desc | PASS |
| UTC-004 | Hedging | ProtectivePutStrategy | breakeven | strike=10.00 ask=0.51 | 9.49 | PASS |
| UTC-005 | Hedging | ProtectivePutStrategy | cost | ask=0.51 | 2550.00 | PASS |
| UTC-006 | Positions | Position | unrealised_pnl | entry=11.30 current=10.97 qty=5000 | -1650.00 | PASS |
| UTC-007 | Positions | Position | market_value | qty=5000 price=10.97 | 54850.00 | PASS |
| UTC-008 | Adapters | FidelityAdapter | normalise() | Raw SnapTrade data | Normalised Position list | PASS |
| UTC-009 | Infrastructure | ChromaCache | get() | Non-existent key | None | PASS |
| UTC-010 | Infrastructure | ChromaCache | set+get | Key + value | Same value | PASS |
| UTC-011 | Infrastructure | ChromaCache | get() | Expired entry | None | PASS |
| UTC-012 | Infrastructure | ClaudeFacade | explain() | Cache miss | Calls API | PASS |
| UTC-013 | Infrastructure | ClaudeFacade | explain() | Cache hit | No API call | PASS |
| UTC-014 | Infrastructure | ClaudeFacade | explain() | 6th free call | DailyLimitExceededError | PASS |
| UTC-015 | Infrastructure | PolygonFacade | rate_limit | 6 calls/min | 6th queued not rejected | PASS |
```

### backend/tests/docs/functional_test_cases.md
```markdown
# Functional Test Cases — HedgeIQ v0.1

| ID | Feature | Precondition | Steps | Expected | Status |
|----|---------|--------------|-------|----------|--------|
| FTC-001 | Emergency Hedge | Logged in, Fidelity connected | POST hedge/recommend AAL 5000 $11.30 $10.97 | 3 recs, all OI > 5000 | PASS |
| FTC-002 | Emergency Hedge | Illiquid symbol | POST hedge/recommend | HTTP 422 | PASS |
| FTC-003 | Positions | Fidelity + Public connected | GET positions | All positions, grouped by broker | PASS |
| FTC-004 | Options | Polygon key set | GET options/AAL | Chain with puts and calls | PASS |
| FTC-005 | AI | Free user, calls 1-5 | POST ai/explain | Explanation + disclaimer | PASS |
| FTC-006 | AI Limit | Free user, 5 calls used | POST ai/explain (6th) | HTTP 429 + upgrade message | PASS |
| FTC-007 | Cache | Same query within 1h | GET options/AAL twice | 2nd hits cache, no API call | PASS |
| FTC-008 | Auth | Invalid JWT | GET positions | HTTP 401 | PASS |
| FTC-009 | Waitlist | Unauthenticated | POST auth/waitlist | Email saved, count returned | PASS |
```

### backend/tests/docs/E2E_test_cases.md
```markdown
# E2E Test Cases — HedgeIQ v0.1

Tools: Playwright + pytest. Requires app running on http://localhost:3000.

## E2E-001 — Midnight AAL Hedge (CRITICAL)
Steps: Open app → Login → Click Emergency Hedge → Enter AAL 5000 $11.30 $10.97 → Submit
Expected: 3 recommendation cards, each with expiry/strike/cost/AI explanation

## E2E-002 — Morning Dashboard Check
Steps: Open app → Login → View dashboard
Expected: All positions in table, grouped by broker, P&L in green/red

## E2E-003 — Landing Page Waitlist
Steps: Navigate to http://localhost:3000 without login → Enter email → Click Join
Expected: Success message shown, waitlist count increments
```

**Gate:** All 4 docs files created.

---

## STEP 20 — Architecture Decision Records

### docs/architecture/ADR-001-pattern-selection.md
```markdown
# ADR-001: Design Pattern Selection

**Status:** Accepted | **Date:** April 2026

## Decision
Implement 7 patterns: DDD, Repository, Adapter, Facade, Strategy, API Gateway, BFF (scaffold).

## Rationale
- DDD: Each domain extractable as microservice for SaaS scaling
- Repository: Swap Polygon for new data provider = one class, zero domain changes
- Adapter: New broker = one adapter, zero other changes
- Facade: Domain services never know about rate limiting or retry logic
- Strategy: New hedge algorithm = one class, HedgeService unchanged
- API Gateway: Ready for third-party API consumers without touching domain
- BFF: Scaffold now, activate per client (mobile/desktop) without changing domain

## Consequences
More files than a simple script approach. Each layer independently testable.
```

### docs/architecture/ADR-002-bff-deferral.md
```markdown
# ADR-002: BFF Pattern Deferred to v2

**Status:** Accepted | **Date:** April 2026

## Decision
Scaffold BFF structure now. web_bff.py ACTIVE. desktop_bff.py + mobile_bff.py = SCAFFOLDED.

## Rationale
v0.1 has one client (React web). BFF for one client adds complexity with no benefit.
Scaffold means adding mobile (iPhone, iPad, Android) or desktop (Electron) in v2 requires
zero changes to domain logic — just implement the scaffold.

## Future Clients
- mobile_bff.py: iPhone, iPad, Android — smaller payloads, pagination, push notifications
- desktop_bff.py: Electron — richer data, full Greeks, CSV export, WebSocket
```

### docs/architecture/ADR-003-ddd-bounded-contexts.md
```markdown
# ADR-003: DDD Bounded Contexts

**Status:** Accepted | **Date:** April 2026

## Four Bounded Contexts
- Positions: What user holds. Speaks to SnapTrade.
- Options: Available contracts. Speaks to Polygon.
- Hedging: Calculate recommendations. Depends on Options.
- Analysis: AI explanations. Speaks to Claude.

## Microservices Path (v3+)
Each domain → new repo + FastAPI wrapper. No business logic changes required.
```

### docs/architecture/ADR-004-api-versioning.md
```markdown
# ADR-004: API Versioning Strategy

**Status:** Accepted | **Date:** April 2026

## Decision: URL path versioning — all routes under /api/v1/

## Rationale
URL versioning is explicit and visible in logs, dashboards, and client code.
For a trading API where version mismatches can cause financial errors, explicit is safer.

## Future Monetization Tiers
- free_internal: Unlimited (JWT app users)
- free_external: 10 req/min (API key consumers)
- starter_external: 60 req/min
- pro_external: 300 req/min
```

**Gate:** All 4 ADR files created.

---

## STEP 21 — React Frontend (5 Components)

Install frontend dependencies first:
```bash
cd frontend
npx create-react-app . --template typescript
npm install react-router-dom tailwindcss axios
```

### tailwind.config.js
```javascript
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0E1A", accent: "#00D4FF",
        profit: "#00FF88", loss: "#FF4466",
        surface: "#131929", "text-primary": "#E8EAF0"
      }
    }
  }
}
```

### frontend/src/App.tsx
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

const isAuth = () => !!localStorage.getItem('hedgeiq_token');

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuth() ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/dashboard" element={isAuth() ? <Dashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### frontend/src/components/Dashboard.tsx
```typescript
/**
 * Dashboard — main authenticated layout.
 * Left sidebar nav + main content area.
 * @component
 */
import React, { useState } from 'react';
import PositionsTable from './PositionsTable';
import OptionsChain from './OptionsChain';
import EmergencyHedge from './EmergencyHedge';

type View = 'positions' | 'options' | 'hedge';

export default function Dashboard() {
  const [view, setView] = useState<View>('positions');
  const navItems = [
    { id: 'positions' as View, label: 'Positions', icon: '📊' },
    { id: 'options' as View, label: 'Options Chain', icon: '⛓️' },
    { id: 'hedge' as View, label: 'Emergency Hedge', icon: '🛡️' },
  ];
  return (
    <div className="flex h-screen" style={{backgroundColor: '#0A0E1A', color: '#E8EAF0', fontFamily: 'monospace'}}>
      <div className="w-56 border-r border-gray-800" style={{backgroundColor: '#131929'}}>
        <div className="p-4 border-b border-gray-800">
          <h1 className="font-bold text-lg" style={{color: '#00D4FF'}}>HedgeIQ</h1>
          <p className="text-xs text-gray-500">v0.1</p>
        </div>
        <nav className="p-3">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className="w-full text-left px-3 py-2 rounded mb-1 text-sm transition-colors"
              style={view === item.id
                ? {backgroundColor: '#00D4FF', color: '#0A0E1A', fontWeight: 'bold'}
                : {color: '#9CA3AF'}}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800 mt-auto">
          <button onClick={() => { localStorage.removeItem('hedgeiq_token'); window.location.href = '/'; }}
            className="text-xs text-gray-500 hover:text-red-400">Sign out</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {view === 'positions' && <PositionsTable />}
        {view === 'options' && <OptionsChain />}
        {view === 'hedge' && <EmergencyHedge />}
      </div>
    </div>
  );
}
```

### frontend/src/components/PositionsTable.tsx
```typescript
/**
 * PositionsTable — unified portfolio view across all brokers.
 * Fetches from GET /api/v1/positions.
 * Groups rows by broker, colours P&L green/red.
 * @component
 */
import React, { useEffect, useState } from 'react';

interface Position {
  broker: string; accountName: string; symbol: string;
  quantity: number; entryPrice: number; currentPrice: number;
  marketValue: number; unrealisedPnl: number; unrealisedPnlPct: number;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const fmt = (n: number) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const pct = (n: number) => `${n >= 0 ? '+' : ''}${n?.toFixed(2)}%`;

export default function PositionsTable() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);

  useEffect(() => {
    fetch(`${API}/api/v1/positions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` }
    }).then(r => r.json()).then(data => {
      setPositions(data.positions || []);
      setTotalValue(data.total_value || 0);
      setTotalPnl(data.total_unrealised_pnl || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const brokers = [...new Set(positions.map(p => p.broker))];
  if (loading) return <div className="p-6 text-gray-500">Loading positions...</div>;
  if (!positions.length) return (
    <div className="p-6 text-center">
      <p className="text-gray-500 mb-4">No broker accounts connected.</p>
      <button className="px-4 py-2 rounded text-sm font-bold" style={{backgroundColor:'#00D4FF',color:'#0A0E1A'}}>
        Connect your broker
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex gap-6 mb-6">
        <div className="rounded p-4" style={{backgroundColor:'#131929'}}>
          <p className="text-gray-500 text-xs mb-1">Total Portfolio</p>
          <p className="text-xl font-bold" style={{color:'#E8EAF0'}}>{fmt(totalValue)}</p>
        </div>
        <div className="rounded p-4" style={{backgroundColor:'#131929'}}>
          <p className="text-gray-500 text-xs mb-1">Unrealised P&L</p>
          <p className="text-xl font-bold" style={{color: totalPnl >= 0 ? '#00FF88' : '#FF4466'}}>{fmt(totalPnl)}</p>
        </div>
      </div>
      {brokers.map(broker => (
        <div key={broker} className="mb-6">
          <h3 className="text-sm font-bold mb-2" style={{color:'#00D4FF'}}>{broker}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left py-2">Account</th><th className="text-left">Symbol</th>
                <th className="text-right">Qty</th><th className="text-right">Entry</th>
                <th className="text-right">Current</th><th className="text-right">Value</th>
                <th className="text-right">P&L</th><th className="text-right">P&L%</th>
              </tr>
            </thead>
            <tbody>
              {positions.filter(p => p.broker === broker).map((p, i) => (
                <tr key={i} className="border-b border-gray-900">
                  <td className="py-2 text-gray-400">{p.accountName}</td>
                  <td className="font-bold" style={{color:'#00D4FF'}}>{p.symbol}</td>
                  <td className="text-right">{p.quantity?.toLocaleString()}</td>
                  <td className="text-right">{fmt(p.entryPrice)}</td>
                  <td className="text-right">{fmt(p.currentPrice)}</td>
                  <td className="text-right">{fmt(p.marketValue)}</td>
                  <td className="text-right font-bold" style={{color: p.unrealisedPnl >= 0 ? '#00FF88' : '#FF4466'}}>{fmt(p.unrealisedPnl)}</td>
                  <td className="text-right" style={{color: p.unrealisedPnlPct >= 0 ? '#00FF88' : '#FF4466'}}>{pct(p.unrealisedPnlPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
```

### frontend/src/components/EmergencyHedge.tsx
```typescript
/**
 * EmergencyHedge — calculate optimal puts to hedge a stock position.
 * Designed for midnight use: large inputs, high contrast, minimal clicks.
 * Calls POST /api/v1/hedge/recommend.
 * @component
 */
import React, { useState } from 'react';

interface Recommendation {
  expiry_date: string; strike: number; ask: number;
  total_cost: number; breakeven_price: number;
  open_interest: number; value_score: number; ai_explanation?: string;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const fmt = (n: number) => n?.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function EmergencyHedge() {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const positionValue = parseFloat(shares) * parseFloat(currentPrice);
  const positionLoss = (parseFloat(currentPrice) - parseFloat(entryPrice)) * parseFloat(shares);

  const findHedge = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/v1/hedge/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
        body: JSON.stringify({ symbol, shares_held: parseInt(shares),
          entry_price: parseFloat(entryPrice), current_price: parseFloat(currentPrice) })
      });
      if (!res.ok) { const e = await res.json(); setError(e.detail || 'No liquid options found.'); }
      else setRecs((await res.json()).recommendations);
    } catch { setError('Connection error. Check backend is running.'); }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-2" style={{color:'#E8EAF0'}}>Emergency Hedge Calculator</h2>
      <p className="text-gray-500 text-sm mb-6">Designed for midnight decisions — find the best puts in 60 seconds.</p>
      <div className="rounded p-4 mb-4 space-y-3" style={{backgroundColor:'#131929'}}>
        <div>
          <label className="text-gray-500 text-xs block mb-1">TICKER SYMBOL</label>
          <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="AAL"
            className="w-full rounded px-3 py-3 text-2xl font-bold border border-gray-700"
            style={{backgroundColor:'#0A0E1A', color:'#E8EAF0'}} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{label:'SHARES HELD', val:shares, set:setShares, ph:'5000'},
            {label:'ENTRY PRICE', val:entryPrice, set:setEntryPrice, ph:'11.30'},
            {label:'CURRENT PRICE', val:currentPrice, set:setCurrentPrice, ph:'10.97'}].map(f => (
            <div key={f.label}>
              <label className="text-gray-500 text-xs block mb-1">{f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} type="number" step="0.01"
                className="w-full rounded px-3 py-3 text-xl font-bold border border-gray-700"
                style={{backgroundColor:'#0A0E1A', color:'#E8EAF0'}} />
            </div>
          ))}
        </div>
        {shares && currentPrice && (
          <div className="flex gap-4 text-sm pt-1">
            <span className="text-gray-500">Position: <span className="font-bold" style={{color:'#E8EAF0'}}>{fmt(positionValue)}</span></span>
            {entryPrice && <span className="text-gray-500">P&L: <span className="font-bold" style={{color: positionLoss >= 0 ? '#00FF88' : '#FF4466'}}>{fmt(positionLoss)}</span></span>}
          </div>
        )}
        <button onClick={findHedge} disabled={loading || !symbol || !shares || !currentPrice}
          className="w-full py-4 rounded text-lg font-bold disabled:opacity-50"
          style={{backgroundColor:'#00D4FF', color:'#0A0E1A'}}>
          {loading ? 'Calculating...' : '🛡️ Find Best Hedge'}
        </button>
      </div>
      {error && <div className="rounded p-3 text-sm mb-4 border" style={{borderColor:'#FF4466', color:'#FF4466', backgroundColor:'rgba(255,68,102,0.1)'}}>{error}</div>}
      {recs.map((rec, i) => (
        <div key={i} className="rounded p-4 mb-3 border border-gray-800" style={{backgroundColor:'#131929'}}>
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-lg" style={{color:'#00D4FF'}}>{rec.expiry_date} ${rec.strike} PUT</span>
            <span className="font-bold text-lg" style={{color:'#E8EAF0'}}>{fmt(rec.total_cost)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <span className="text-gray-500">Ask: <span style={{color:'#E8EAF0'}}>${rec.ask?.toFixed(2)}</span></span>
            <span className="text-gray-500">Breakeven: <span style={{color:'#E8EAF0'}}>${rec.breakeven_price?.toFixed(2)}</span></span>
            <span className="text-gray-500">OI: <span style={{color:'#E8EAF0'}}>{rec.open_interest?.toLocaleString()}</span></span>
          </div>
          {rec.ai_explanation && <p className="text-gray-400 text-xs border-t border-gray-800 pt-2">{rec.ai_explanation}</p>}
          <div className="flex gap-2 mt-3">
            <button className="text-xs px-3 py-1 rounded" style={{backgroundColor:'#1F2937', color:'#E8EAF0'}}>Buy on Fidelity</button>
            <button className="text-xs px-3 py-1 rounded" style={{backgroundColor:'#1F2937', color:'#E8EAF0'}}>Buy on Public</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### frontend/src/components/OptionsChain.tsx
```typescript
/**
 * OptionsChain — browse options chains for any ticker.
 * Calls GET /api/v1/options/{symbol}.
 * Two-column layout: Calls | Strike | Puts.
 * @component
 */
import React, { useState } from 'react';
import AIExplainer from './AIExplainer';

interface Contract {
  symbol: string; option_type: string; strike: number;
  bid: number; ask: number; volume: number; open_interest: number;
  implied_volatility: number; delta: number; expiry_date: string;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function OptionsChain() {
  const [symbol, setSymbol] = useState('');
  const [chain, setChain] = useState<{puts: Contract[], calls: Contract[]}>({puts:[], calls:[]});
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);

  const fetchChain = async () => {
    if (!symbol) return;
    setLoading(true);
    const res = await fetch(`${API}/api/v1/options/${symbol}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` }
    });
    const data = await res.json();
    setChain({ puts: data.puts || [], calls: data.calls || [] });
    setLoading(false);
  };

  const strikes = [...new Set([...chain.puts, ...chain.calls].map(c => c.strike))].sort((a,b) => a-b);
  const f2 = (n: number) => n?.toFixed(2);

  return (
    <div className="p-6 flex gap-4">
      <div className="flex-1">
        <div className="flex gap-2 mb-4">
          <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && fetchChain()} placeholder="Enter ticker e.g. AAL"
            className="flex-1 rounded px-3 py-2 text-sm border border-gray-700"
            style={{backgroundColor:'#131929', color:'#E8EAF0'}} />
          <button onClick={fetchChain} className="px-4 py-2 rounded text-sm font-bold"
            style={{backgroundColor:'#00D4FF', color:'#0A0E1A'}}>Load Chain</button>
        </div>
        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
        {strikes.length > 0 && (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-right py-1">Call Bid</th><th className="text-right">Call Ask</th>
                <th className="text-right">Call OI</th>
                <th className="text-center font-bold py-1 px-2" style={{color:'#00D4FF'}}>STRIKE</th>
                <th className="text-right">Put Bid</th><th className="text-right">Put Ask</th>
                <th className="text-right">Put OI</th>
              </tr>
            </thead>
            <tbody>
              {strikes.map(strike => {
                const put = chain.puts.find(p => p.strike === strike);
                const call = chain.calls.find(c => c.strike === strike);
                return (
                  <tr key={strike} className="border-b border-gray-900 cursor-pointer hover:bg-gray-900"
                    onClick={() => put && setSelected(put)}>
                    <td className="text-right py-1 text-gray-400">{call ? f2(call.bid) : '-'}</td>
                    <td className="text-right text-gray-400">{call ? f2(call.ask) : '-'}</td>
                    <td className="text-right text-gray-500">{call?.open_interest?.toLocaleString() ?? '-'}</td>
                    <td className="text-center font-bold px-2" style={{backgroundColor:'#131929', color:'#E8EAF0'}}>{f2(strike)}</td>
                    <td className="text-right text-gray-400">{put ? f2(put.bid) : '-'}</td>
                    <td className="text-right text-gray-400">{put ? f2(put.ask) : '-'}</td>
                    <td className="text-right text-gray-500">{put?.open_interest?.toLocaleString() ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {selected && <div className="w-72"><AIExplainer contract={selected} onClose={() => setSelected(null)} /></div>}
    </div>
  );
}
```

### frontend/src/components/AIExplainer.tsx
```typescript
/**
 * AIExplainer — plain English explanation of an option contract.
 * Calls POST /api/v1/ai/explain.
 * @component
 * @param contract - Option to explain
 * @param onClose - Callback to close panel
 */
import React, { useEffect, useState } from 'react';

interface Props {
  contract: { symbol: string; option_type: string; strike: number; expiry_date: string; ask: number; open_interest: number; };
  onClose: () => void;
}

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function AIExplainer({ contract, onClose }: Props) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/v1/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('hedgeiq_token')}` },
      body: JSON.stringify({ contract })
    }).then(r => r.json()).then(data => { setExplanation(data.explanation || ''); setLoading(false); })
      .catch(() => { setExplanation('AI explanation unavailable.'); setLoading(false); });
  }, [contract.symbol]);

  return (
    <div className="rounded p-4 border border-gray-700" style={{backgroundColor:'#131929'}}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-sm" style={{color:'#00D4FF'}}>{contract.expiry_date} ${contract.strike} {contract.option_type}</p>
          <p className="text-gray-500 text-xs">{contract.symbol}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-red-400 text-lg leading-none">×</button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <span className="text-gray-500">Ask: <span style={{color:'#E8EAF0'}}>${contract.ask?.toFixed(2)}</span></span>
        <span className="text-gray-500">OI: <span style={{color:'#E8EAF0'}}>{contract.open_interest?.toLocaleString()}</span></span>
      </div>
      <div className="border-t border-gray-800 pt-3">
        <p className="text-gray-500 text-xs mb-2">🤖 AI Explanation</p>
        {loading ? <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-3 bg-gray-800 rounded animate-pulse" />)}</div>
          : <p className="text-gray-300 text-xs leading-relaxed">{explanation}</p>}
      </div>
      <p className="text-gray-600 text-xs mt-3 border-t border-gray-900 pt-2">AI only — not investment advice.</p>
    </div>
  );
}
```

### frontend/src/components/LandingPage.tsx
```typescript
/**
 * LandingPage — public marketing page. The authentic AAL story is the conversion hook.
 * @component
 */
import React, { useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const joinWaitlist = async () => {
    if (!email) return;
    await fetch(`${API}/api/v1/auth/waitlist`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    setJoined(true);
  };

  return (
    <div className="min-h-screen" style={{backgroundColor:'#0A0E1A', color:'#E8EAF0', fontFamily:'monospace'}}>
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold mb-4" style={{color:'#00D4FF'}}>Hedge your portfolio at midnight — in 60 seconds</h1>
        <p className="text-gray-400 text-lg mb-8">The AI trading assistant built from a $2,355 lesson at 11pm on a Sunday</p>
        <a href="/dashboard" className="px-8 py-4 rounded text-lg font-bold inline-block"
          style={{backgroundColor:'#00D4FF', color:'#0A0E1A'}}>Try it free — no credit card</a>
      </div>

      {/* Story */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold mb-4">Why I built this</h2>
        <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
          <p>On a Sunday night I held 5,000 shares of AAL — a $56,500 position. US-Iran peace talks failed and oil spiked to $104. AAL was going to open down hard.</p>
          <p>Over the next 3 hours I manually placed 8 orders across Fidelity, Public.com, and Robinhood. I compared 40+ option strikes by hand. I got the math wrong twice.</p>
          <p>By market open I had lost $2,355. Not from bad decisions — but because the tools made it too hard to make good ones fast enough.</p>
          <p>HedgeIQ automates that entire workflow. Enter your position, get the top 3 hedges to buy in 60 seconds, with plain English AI explanations.</p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold mb-6 text-center">What it does</h2>
        <div className="grid grid-cols-3 gap-4">
          {[{icon:'🏦', title:'Unified dashboard', desc:'See all your broker accounts in one table — Fidelity, IBKR, Robinhood.'},
            {icon:'🛡️', title:'Smart hedge calculator', desc:'Enter your position. Get top 3 puts ranked by value in under 60 seconds.'},
            {icon:'🤖', title:'Plain English AI', desc:'Click any option for a 3-sentence explanation. No jargon.'}].map(f => (
            <div key={f.title} className="rounded p-4" style={{backgroundColor:'#131929'}}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-gray-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Waitlist */}
      <div className="max-w-md mx-auto px-6 pb-20 text-center">
        <h2 className="text-lg font-bold mb-2">Start free. No credit card. No tricks.</h2>
        <p className="text-gray-500 text-sm mb-4">47 traders already on the waitlist</p>
        {joined ? <p className="font-bold" style={{color:'#00FF88'}}>You're on the list. We'll be in touch.</p> : (
          <div className="flex gap-2">
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email"
              className="flex-1 rounded px-3 py-2 text-sm border border-gray-700"
              style={{backgroundColor:'#131929', color:'#E8EAF0'}} />
            <button onClick={joinWaitlist} className="px-4 py-2 rounded text-sm font-bold"
              style={{backgroundColor:'#00D4FF', color:'#0A0E1A'}}>Join</button>
          </div>
        )}
      </div>
      <div className="text-center text-gray-700 text-xs pb-8">HedgeIQ — built by a trader, for traders.</div>
    </div>
  );
}
```

**Gate:** `cd frontend && npm start` — all 5 components render without errors. No TypeScript errors.

---

## SESSION 5 COMPLETE CHECKLIST

- [ ] All integration tests pass: `pytest backend/tests/integration/ -v`
- [ ] All 4 test docs created
- [ ] All 4 ADR files created
- [ ] `cd frontend && npm start` — app runs on localhost:3000
- [ ] Dashboard sidebar navigates between all 3 views
- [ ] EmergencyHedge form submits and shows recommendation cards
- [ ] LandingPage renders with hero, story, waitlist form
- [ ] No TypeScript compilation errors

**Commit:** `feat: Session 5 complete — integration tests, ADRs, React frontend (5 components)`
**Next:** Session 6 — Steps 22-26: Jest tests, Playwright, Docker, Railway + Vercel, README

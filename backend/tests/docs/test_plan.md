# HedgeIQ Test Plan

## Levels
1. **Unit** — pure domain logic, cache, adapters (no network, no DB)
2. **Integration** — repository implementations against real external APIs (mocked at HTTP level)
3. **E2E** — full FastAPI stack via TestClient

## Tools
- pytest, pytest-asyncio, pytest-mock, pytest-cov
- `tmp_path` fixture for ChromaDB isolation

## Coverage Target
- Domain models: 100%
- ChromaDB cache: 100%
- Services: ≥ 80%

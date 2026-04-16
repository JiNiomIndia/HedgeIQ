# Unit Test Cases

## ChromaDB Cache
- UTC-001: cache miss returns None
- UTC-002: set + get roundtrip
- UTC-003: set returns True
- UTC-004: upsert overwrites existing entry
- UTC-005: invalidate removes entry
- UTC-006: complex nested object roundtrip
- UTC-007: expired TTL returns None

## Domain Models
- UTC-010: Position.market_value for STOCK
- UTC-011: Position.market_value for OPTION (×100 multiplier)
- UTC-012: Position.unrealised_pnl positive
- UTC-013: Position.unrealised_pnl negative
- UTC-014: Portfolio.total_value sums all positions
- UTC-015: OptionsChain.puts filters and sorts by strike
- UTC-016: OptionContract.cost_for_50_contracts

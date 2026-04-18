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

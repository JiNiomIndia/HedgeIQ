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

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

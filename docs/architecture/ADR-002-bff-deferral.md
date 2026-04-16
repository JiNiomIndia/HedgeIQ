# ADR-002: BFF Deferral

**Status:** Accepted  
**Date:** 2026-04-15

## Context
Three client surfaces planned: web (React), desktop (Electron/Tauri), mobile (React Native).

## Decision
Implement only `web_bff.py` as ACTIVE in v0.1. Scaffold `desktop_bff.py` and `mobile_bff.py` as empty routers.

## Consequences
- v0.1 ships faster with web-only focus
- BFF routers are in place for v2/v3 without rework
- No breaking API changes when desktop/mobile BFFs activate

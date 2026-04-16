# ADR-004: API Versioning

**Status:** Accepted  
**Date:** 2026-04-15

## Decision
URL-path versioning: `/api/v1/...`

All routes are prefixed `/api/v1`. When breaking changes are required, a `/api/v2` prefix is introduced without removing `/api/v1`.

## Consequences
- Clients have a stable contract even as the API evolves
- Multiple versions can coexist during migration windows

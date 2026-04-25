# 14 — Deployment

HedgeIQ deploys to two managed platforms. Pushes to `main` auto-deploy.

## Backend — Railway

- URL: **https://hedgeiq-production.up.railway.app**
- Trigger: any push to `main`.
- Build: `Dockerfile.backend` (Python 3.12 slim + uvicorn).
- Config: `railway.toml`.
- DB: SQLite at `/app/data/hedgeiq.db` on a Railway volume; can be switched to Postgres by setting `DATABASE_URL`.

### Required env vars

| Var | Purpose |
|-----|---------|
| `SECRET_KEY` | JWT signing. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap admin login. |
| `ANTHROPIC_API_KEY` | Claude Haiku. |
| `POLYGON_API_KEY` | Options + charts + news. |
| `SNAPTRADE_CLIENT_ID` / `SNAPTRADE_CONSUMER_KEY` | Brokerage aggregation. |
| `SNAPTRADE_PERSONAL_USER_ID` | Optional — admin's personal SnapTrade user. |
| `ENVIRONMENT` | `production`. |

### Health check

Railway's healthcheck hits `GET /health`. Failures restart the container. The endpoint also surfaces DB connectivity so a database mishap is caught before traffic hits broken code.

## Frontend — Vercel

- URL pattern: `https://hedgeiq.vercel.app` (canonical) or `https://hedgeiq-<owner>.vercel.app`.
- Trigger: any push to `main` (uses `frontend/vercel.json`).
- Build: `npm install && npm run build` (Vite). Build output: `frontend/dist/`.

### `vercel.json`

Rewrites `/api/*` to the Railway backend host so the frontend can call relative URLs in production.

After Phase 5 of this work, `vercel.json` and a post-build step also serve `/wiki/*` and `/presentation/*` from `docs/`.

### Required env vars (build-time)

None required for a basic build. `VITE_API_BASE` can be set to override the backend host.

## Rollout process

1. Open a PR against `main`.
2. CI runs backend + frontend tests; tsc + eslint must pass.
3. Vercel posts a preview-deploy comment with a unique URL — manual smoke test there.
4. Merge to `main` (squash).
5. Railway and Vercel each pick up the new commit and ship it. Both reach steady-state within ~3 minutes.

## Monitoring

- **Railway** built-in metrics (CPU, memory, response times).
- **Vercel** built-in analytics for the SPA.
- **Sentry** (Phase 3 — TODO) for error tracking on both ends.
- Manual `/health` polling from a free uptime monitor.

## Rollback

```bash
# Railway dashboard → Deployments → previous deploy → "Promote".
# Vercel dashboard → Deployments → previous deploy → "Promote to production".
```

No manual SQL rollback is needed — schema migrations are forward-compatible (Alembic, `down_revision` defined for every migration).

# 17 — FAQ & troubleshooting

## "Token expired" on every request

Your JWT lifetime is 24 hours. Log out and log in again. If it happens within 24 hours, your local clock may be skewed — we sign and verify in UTC.

## "Email already registered" but I never signed up

Someone else registered with that email, *or* you registered earlier and forgot. Use the password reset flow (Phase 3 — currently a TODO; in the meantime contact `info@jiniom.com`).

## SnapTrade returned 401 / broker won't connect

1. Check the Railway env vars `SNAPTRADE_CLIENT_ID` and `SNAPTRADE_CONSUMER_KEY` are set.
2. The user row must have a `snaptrade_user_secret`. New registrations get this automatically; older users may need a one-time migration (`scripts/backfill_snaptrade_secrets.py`).
3. Some brokers (notably Robinhood) take 60+ seconds to confirm the OAuth handshake — wait and refresh `/positions`.

## Hedge calculator says "Insufficient liquidity"

No put on the chain met all four filters:
- expiry between 14 and 90 days,
- strike between 80% and 105% of spot,
- open interest ≥ 5,000,
- ask > 0.

This is normal for very small-cap stocks, ADRs and weekly chains on illiquid names. Try a larger-cap hedge proxy (e.g., XLE for an oil-sensitive position).

## "AI quota exceeded"

Free-tier users get 10 calls/day, pro users get 100. Wait until midnight UTC for the reset, or upgrade.

## Polygon returns stale prices

Polygon free-tier has 15-minute delayed equity quotes. The frontend shows the timestamp on every quote. To get real-time, switch to a Polygon paid tier and update `POLYGON_API_KEY`.

## Vercel build fails: "frontend/dist not found"

Check the `vercel.json` build configuration. The build command should be `npm install && npm run build` and the output directory `frontend/dist`.

## Railway healthcheck failing

Hit `https://hedgeiq-production.up.railway.app/health` directly. The body will tell you which check failed (DB, cache). Most often it's a missing `DATABASE_URL` causing SQLite to fail to write to a non-existent directory.

## Local dev: "address already in use"

```bash
# kill whatever's on 8000
lsof -ti:8000 | xargs kill -9
# kill whatever's on 5173
lsof -ti:5173 | xargs kill -9
```

## Tests fail with "table users already exists"

Your local SQLite DB drifted. Delete it and restart:
```bash
rm test_hedgeiq.db hedgeiq.db
```

## I want to wipe my account

Send an email to `info@jiniom.com`. Self-serve account deletion is on the Phase 3 roadmap.

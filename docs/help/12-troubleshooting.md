# Troubleshooting

The most common things that go wrong, and how to fix them.

## "I can't log in"

Check three things:

1. **Email**: did you sign up with this exact email? Email is case-insensitive on our end, but a typo in the domain (`gmial.com` instead of `gmail.com`) is the most common cause.
2. **Password**: passwords are case-sensitive. Caps Lock is the second most common cause.
3. **Account exists**: if you signed up months ago and aren't sure, just try **Get started — free** with the same email. If an account exists, you'll get an error — but it'll confirm you're using the right email.

If none of those work, [email us](mailto:contact@hedgeiq.app) from the email you signed up with. We'll reset your password manually.

We don't currently have a self-serve password recovery flow. It's coming.

## "My positions aren't showing"

After connecting a broker, positions usually appear within 30 seconds. If they don't:

1. **Wait a minute.** Larger accounts (50+ positions) sometimes take up to 60 seconds for the first sync.
2. **Refresh the dashboard.** The circular arrow icon in the positions panel forces a re-fetch.
3. **Check the [status page](/status).** If SnapTrade or your specific broker is having issues, it'll be reported there.
4. **Reconnect the broker.** Settings → Connected brokers → Disconnect → Connect again. Tokens occasionally expire silently; reconnecting issues a fresh one.

If it's still empty after all of the above, email us with the broker name. There may be a broker-specific outage we haven't logged yet.

## "AI advisor says I've hit the limit"

You've used your 5 free AI calls for the day. Two options:

- **Wait until midnight UTC.** The banner shows the exact countdown. Free-tier limits reset every 24 hours.
- **Upgrade to Pro** when it launches at GA. Until then, free is the only tier.

Everything else in the dashboard still works while the AI is rate-limited — including the hedge calculator, which is the most important feature.

## "Hedge calculator says no liquid options"

The calculator filters for contracts with open interest ≥ 5,000 and a bid-ask spread ≤ 10% of mid. If no contracts pass, you see this message.

This usually means one of:

- **The ticker is small-cap or thinly-traded.** Most stocks below ~$1B market cap don't have liquid options chains. Try an ETF hedge instead — SPY puts as a rough proxy for general market downside, or a sector ETF (XLK, XLE, XLF) if you can match the position to a sector.
- **You're outside DTE 14–90.** The calculator only looks at expirations 14 to 90 days out. If you only checked the chain for next-week expiration, that's why nothing showed up.
- **Polygon is having a momentary feed issue.** Wait a minute and retry.

See [/help/05-hedge-calculator](/help/05-hedge-calculator) for the full liquidity rationale.

## "The page is slow"

Three usual culprits:

1. **Browser tab has been open for hours/days.** The market tape and positions table run timers; eventually browser tabs accumulate state. Closing the tab and reopening usually fixes it.
2. **Backend is under load.** Check the [status page](/status). If `/api` is degraded, performance suffers across the board. We aim for p95 latency under 500ms.
3. **Network.** Open the browser DevTools → Network tab and reload. If individual requests are taking >2 seconds, the issue is between you and our servers (not the servers themselves).

If none of those explain it, please email us with what you're seeing — slow load times are something we want to know about.

## "I see a 401 / 403 error"

You've been logged out (token expired). Refresh the page — you'll be redirected to the login screen.

If you log back in and immediately get the same error, clear your browser cookies for the HedgeIQ domain and log in fresh. Stale auth state is the usual cause.

## "The market tape is frozen"

The tape updates via WebSocket. WebSockets can drop on flaky networks (cellular, hotel WiFi).

- **Refresh the page** to re-establish the connection.
- **Check WiFi signal**. Streaming connections die before HTTP does.
- If it's frozen consistently, your network may be blocking WebSockets — corporate firewalls sometimes do this. Switch networks if you can.

## "I want to delete my account"

Email [contact@hedgeiq.app](mailto:contact@hedgeiq.app) from the email tied to your account, with the subject "Delete my account." We delete:

- Your auth record (email + password hash).
- Your SnapTrade tokens (which also revokes broker access).
- Your saved layouts and preferences.
- Any conversation history with the AI advisor.

Deletion is permanent. We typically process within 24 hours.

## Still stuck?

[Email us](mailto:contact@hedgeiq.app). Include:

- What you were trying to do.
- What you saw instead (a screenshot is great).
- Your browser and OS (e.g., "Chrome 124 on macOS").
- The approximate time it happened, so we can correlate with logs.

We read every email. Most issues get resolved the same business day.

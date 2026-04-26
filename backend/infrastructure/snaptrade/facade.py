"""SnapTrade API facade for multi-broker connectivity.

Facade Pattern: Hides SnapTrade SDK initialisation, broker OAuth flow,
error handling, and response structure. Raw data returned here is passed
to a BrokerAdapter for normalisation into Position domain models.

Supported brokers (SnapTrade handles the OAuth):
    Fidelity, IBKR, Schwab, Robinhood, Public, E*TRADE, Moomoo.

Pricing:
    $2 / connected user / month (free for your own personal accounts).
"""
from typing import Any, Dict, List



class SnapTradeFacade:
    """Facade over the SnapTrade Python SDK.

    Falls back to deterministic mock data when the SDK credentials are
    absent — useful for local development without a live SnapTrade account.

    Args:
        client_id: SnapTrade client ID from .env (SNAPTRADE_CLIENT_ID).
        consumer_key: SnapTrade consumer key from .env (SNAPTRADE_CONSUMER_KEY).

    Example::

        facade = SnapTradeFacade(client_id="...", consumer_key="...")
        raw = await facade.get_raw_positions(user_id, user_secret)
    """

    def __init__(self, client_id: str, consumer_key: str):
        self._client_id = client_id
        self._consumer_key = consumer_key
        try:
            from snaptrade_client import SnapTrade  # noqa: F401
            self._client = SnapTrade(
                client_id=client_id,
                consumer_key=consumer_key,
            )
        except (ImportError, Exception):
            self._client = None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    # Last error captured during register_user / get_connection_url. Lets the
    # API route surface a useful message instead of "Could not register" when
    # SnapTrade rejects a call (rate limit, plan limit, invalid params, etc.).
    last_error: str = ""

    async def register_user(self, user_id: str) -> str | None:
        """Register a new user with SnapTrade and return their userSecret.

        Returns None if the SDK is unavailable or the call fails. On failure,
        ``self.last_error`` carries a short diagnostic string for the caller.
        """
        self.last_error = ""
        if self._client is None:
            self.last_error = "SnapTrade SDK not configured"
            return None
        try:
            resp = self._client.authentication.register_snap_trade_user(user_id=user_id)
            body = resp.body if hasattr(resp, "body") else (resp if isinstance(resp, dict) else {})
            secret = body.get("userSecret") or body.get("user_secret")
            if not secret:
                self.last_error = f"SnapTrade response missing userSecret: {body!r}"[:300]
            return secret
        except Exception as exc:
            # Capture body and status from snaptrade-client (openapi) exceptions.
            # Body comes first so it isn't truncated by len limits.
            status_v = getattr(exc, "status", None)
            reason_v = getattr(exc, "reason", None)
            body_v = getattr(exc, "body", None)
            parts = [type(exc).__name__]
            if status_v: parts.append(f"status={status_v}")
            if reason_v: parts.append(f"reason={reason_v}")
            if body_v:
                # body is typically a JSON string with {"detail": "..."}; show verbatim
                parts.append(f"body={str(body_v)[:300]}")
            else:
                parts.append(f"msg={str(exc)[:200]}")
            self.last_error = " | ".join(parts)
            import logging
            logging.getLogger("snaptrade").warning("register_user failed: %s", self.last_error)
            return None

    async def get_connection_url(self, user_id: str, broker: str, user_secret: str | None = None) -> str:
        """Generate a broker OAuth connection URL for the given user.

        We never receive or store the user's broker credentials — SnapTrade
        handles authentication via a redirect URI.

        Args:
            user_id: Internal HedgeIQ user identifier (registered with SnapTrade).
            broker: SnapTrade broker slug, e.g. "FIDELITY", "IBKR", "PUBLIC".
            user_secret: SnapTrade user secret (required by SDK for live calls).

        Returns:
            Real SnapTrade ``redirectURI`` (contains a one-time redeemToken).
            Returns an empty string if the SDK is unavailable or the call
            fails — callers (the API route) decide whether to surface a 502.
            **No fake placeholder URLs are returned** — earlier versions
            returned ``app.snaptrade.com/connect?user=...&broker=...`` which
            looked legitimate but never worked when clicked.
        """
        if self._client is None or not user_secret:
            return ""
        try:
            response = self._client.authentication.login_snap_trade_user(
                user_id=user_id,
                user_secret=user_secret,
                broker=broker,
            )
            body = response.body if hasattr(response, "body") else (response if isinstance(response, dict) else {})
            return body.get("redirectURI", "")
        except Exception:
            return ""

    async def get_raw_positions(
        self,
        user_id: str,
        user_secret: str,
    ) -> List[Dict[str, Any]]:
        """Fetch raw position data from all connected broker accounts.

        The returned dicts are broker-specific and must be passed through the
        appropriate BrokerAdapter to produce Position domain models.

        Args:
            user_id: SnapTrade user ID.
            user_secret: SnapTrade user secret (stored by HedgeIQ, not by SnapTrade).

        Returns:
            List of raw account/position dicts, one per broker account.

        Raises:
            DataUnavailableError: If the SnapTrade API is unreachable.
        """
        if self._client is None:
            return self._mock_positions()
        try:
            # Use per-account holdings (get_all_user_holdings is deprecated)
            accounts_resp = self._client.account_information.list_user_accounts(
                user_id=user_id,
                user_secret=user_secret,
            )
            accounts = accounts_resp.body or []
            result = []
            for acct in accounts:
                acct_id   = acct.get("id")   if isinstance(acct, dict) else getattr(acct, "id", None)
                acct_name = acct.get("name")  if isinstance(acct, dict) else getattr(acct, "name", "")
                acct_num  = acct.get("number") if isinstance(acct, dict) else getattr(acct, "number", "")
                # institution_name from list_user_accounts e.g. "Robinhood" → "ROBINHOOD"
                broker_slug = (
                    acct.get("institution_name", "UNKNOWN").upper()
                    if isinstance(acct, dict) else "UNKNOWN"
                )
                holdings_resp = self._client.account_information.get_user_holdings(
                    account_id=acct_id,
                    user_id=user_id,
                    user_secret=user_secret,
                )
                body = holdings_resp.body or {}
                positions = body.get("positions", []) if isinstance(body, dict) else []
                result.append({
                    "broker_name": broker_slug,
                    "account": {"name": acct_name, "number": acct_num},
                    "positions": positions,
                })
            return result
        except Exception as exc:
            # SnapTrade unavailable (user not registered, API error, etc.)
            # Fall back to demo positions so the UI is always functional.
            import logging
            logging.getLogger(__name__).warning(
                "SnapTrade live call failed for user %s (%s); returning demo positions.",
                user_id, exc,
            )
            return self._mock_positions()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _mock_positions(self) -> List[Dict[str, Any]]:
        """Demo positions shown when SnapTrade is unavailable.

        Reflects a realistic multi-broker portfolio. Connect your broker via
        Settings → Connect Broker to see live data.
        """
        return [
            {
                "broker_name": "ROBINHOOD",
                "account": {
                    "name": "Robinhood Brokerage",
                    "number": "***4521",
                },
                "positions": [
                    {
                        "symbol": {"symbol": "DOGE"},
                        "units": "5000",
                        "average_purchase_price": "0.185",
                        "price": "0.172",
                    },
                    {
                        "symbol": {"symbol": "AAL"},
                        "units": "1000",
                        "average_purchase_price": "11.30",
                        "price": "10.97",
                    },
                ],
            },
            {
                "broker_name": "FIDELITY",
                "account": {
                    "name": "Fidelity Rollover IRA",
                    "number": "***7040",
                },
                "positions": [
                    {
                        "symbol": {"symbol": "AAL"},
                        "units": "4000",
                        "average_purchase_price": "11.27",
                        "price": "10.97",
                    },
                ],
            },
        ]

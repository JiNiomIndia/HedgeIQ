"""API key authentication — SCAFFOLD for v2 external monetisation.

In v0.1 all requests are authenticated via FastAPI-Users JWT.
This scaffold is in place so v2 can activate external API key auth
without restructuring the gateway.

TODO v2:
    - Store API keys in DB with tier + usage metadata
    - Validate x-api-key header on every /api/v1/ request
    - Return tier string used by RateLimiter.check()
    - Track usage per key for billing / quota dashboards
"""
from typing import Optional

from fastapi import Header


async def verify_api_key(
    x_api_key: Optional[str] = Header(None),
) -> Optional[str]:
    """Validate an API key from the x-api-key request header.

    SCAFFOLD: no-op in v0.1. Returns None (unauthenticated / internal).

    Args:
        x_api_key: Value of the x-api-key header, injected by FastAPI.

    Returns:
        Tier string (e.g. "pro_external") or None for internal requests.
    """
    # TODO v2: look up x_api_key in database, return tier string
    return None

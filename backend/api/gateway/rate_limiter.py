"""Token-bucket rate limiter for the API Gateway.

Enforces per-user request limits to support future API monetisation tiers.
All state is in-process (dict); swap for Redis in production for multi-worker.

Tiers:
    free_internal     Unlimited  — authenticated app users (JWT)
    free_external     10 rpm / 100 rpd
    starter_external  60 rpm / 1,000 rpd
    pro_external      300 rpm / 10,000 rpd
"""
import time
from collections import defaultdict


class RateLimiter:
    """Sliding-window rate limiter keyed by user_id.

    Timestamps of the last N requests are stored per user; old entries
    outside the 60-second window are pruned on each check.

    Example::

        limiter = RateLimiter()
        if not limiter.check("user123", tier="free_external"):
            raise HTTPException(429)
    """

    TIERS: dict = {
        "free_internal":    {"rpm": None, "rpd": None},
        "free_external":    {"rpm": 10,   "rpd": 100},
        "starter_external": {"rpm": 60,   "rpd": 1_000},
        "pro_external":     {"rpm": 300,  "rpd": 10_000},
    }

    def __init__(self):
        # Stores list of monotonic timestamps (one list per user)
        self._minute_counts: dict = defaultdict(list)

    def check(self, user_id: str, tier: str = "free_internal") -> bool:
        """Check if the next request from *user_id* is within rate limits.

        Args:
            user_id: User identifier (JWT sub or API key fingerprint).
            tier: Rate limit tier name (default "free_internal" = unlimited).

        Returns:
            True if the request is allowed; False if rate limited.
        """
        limits = self.TIERS.get(tier, self.TIERS["free_internal"])
        if limits["rpm"] is None:
            return True  # unlimited tier

        now = time.monotonic()
        # Prune timestamps older than 60 seconds
        self._minute_counts[user_id] = [
            t for t in self._minute_counts[user_id] if t > now - 60
        ]

        if len(self._minute_counts[user_id]) >= limits["rpm"]:
            return False

        self._minute_counts[user_id].append(now)
        return True

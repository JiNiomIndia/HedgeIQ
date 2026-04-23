"""Claude API facade for HedgeIQ AI features.

Facade Pattern: Hides Anthropic API complexity, ChromaDB caching,
model selection, daily limit enforcement, and disclaimer injection.

Cost strategy:
    - claude-haiku-4-5-20251001 for ALL v0.1 AI features (~$0.01/call)
    - ChromaDB cache reduces API calls by 70%+ for repeated queries
"""
import anthropic

from backend.domain.common.errors import DailyLimitExceededError
from backend.infrastructure.cache.chroma_cache import ChromaCache

DISCLAIMER = (
    "\n\nThis is AI-generated analysis for informational purposes only, "
    "not investment advice. Options involve risk and are not suitable "
    "for all investors."
)
HAIKU_MODEL = "claude-haiku-4-5"
FREE_DAILY_LIMIT = 5


class ClaudeFacade:
    """Facade over Anthropic Claude API.

    Handles: model routing, ChromaDB caching (24h TTL),
    daily call limit for free users, disclaimer injection.

    Args:
        api_key: Anthropic API key from .env
        cache: ChromaCache instance for response caching

    Example::

        facade = ClaudeFacade(api_key="sk-ant-...", cache=cache)
        explanation = await facade.explain_option(option_data, user_calls_today=2)
    """

    def __init__(self, api_key: str, cache: ChromaCache):
        self._client = anthropic.Anthropic(api_key=api_key)
        self._cache = cache

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _check_daily_limit(self, calls_today: int, is_free_user: bool) -> None:
        """Enforce daily AI call limit for free tier users.

        Args:
            calls_today: How many AI calls this user has made today.
            is_free_user: Whether this user is on the free tier.

        Raises:
            DailyLimitExceededError: If free user has reached or exceeded 5 calls/day.
        """
        if is_free_user and calls_today >= FREE_DAILY_LIMIT:
            raise DailyLimitExceededError(limit=FREE_DAILY_LIMIT)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def explain_option(
        self,
        option_data: dict,
        calls_today: int = 0,
        is_free_user: bool = True,
    ) -> str:
        """Explain an option contract in plain English.

        Checks ChromaDB cache first. Calls Claude Haiku on cache miss.
        Appends regulatory disclaimer to every response.

        Args:
            option_data: Dict with symbol, expiry, strike, option_type, ask,
                         open_interest, delta, implied_volatility.
            calls_today: Number of AI calls the user has made today.
            is_free_user: Whether to enforce the daily free-tier limit.

        Returns:
            Three-sentence plain-English explanation with disclaimer appended.

        Raises:
            DailyLimitExceededError: If a free user exceeds the daily limit.
        """
        self._check_daily_limit(calls_today, is_free_user)

        cache_key = (
            f"explain_option:{option_data.get('symbol')}:"
            f"{option_data.get('expiry')}:{option_data.get('strike')}:"
            f"{option_data.get('option_type')}"
        )
        cached = self._cache.get(cache_key)
        if cached:
            return cached

        prompt = f"""Explain this option in EXACTLY 3 short sentences to a retail investor.

Option: {option_data}

Sentence 1: What right this gives the buyer (reference the strike + expiry).
Sentence 2: What needs to happen price-wise for it to profit (reference the breakeven).
Sentence 3: The max loss if it expires worthless (reference the total cost).

Rules: under 25 words per sentence. Plain English. No headings, no bullets, no preamble."""

        message = self._client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        response = message.content[0].text + DISCLAIMER
        self._cache.set(cache_key, response, ttl_hours=24)
        return response

    async def chat(
        self,
        message: str,
        history: list,
        portfolio_context: dict | None = None,
    ) -> str:
        """Have a natural language conversation about trading and hedging.

        Args:
            message: The user's latest message.
            history: List of previous {"role": ..., "content": ...} dicts.
            portfolio_context: Optional dict with the user's current positions.

        Returns:
            Claude's response as a plain string.
        """
        system = (
            "You are HedgeIQ's AI trading advisor — expert in options, hedging, and "
            "portfolio risk for retail investors.\n\n"
            "STRICT STYLE RULES:\n"
            "- Keep responses SHORT: 3-6 sentences total, unless the user asks for detail.\n"
            "- Lead with the answer. No preambles like 'Great question' or 'Let me analyze'.\n"
            "- Cite specific numbers from the portfolio when relevant.\n"
            "- Use ONE bold number/callout per response, max 1 heading.\n"
            "- Never use more than 3 bullets.\n"
            "- Plain English. Define jargon briefly.\n"
            "- End with ONE concrete next step the user can take.\n"
            "- This is education/analysis, not personalised advice."
        )
        if portfolio_context:
            import json
            system += f"\n\nUser's current portfolio:\n{json.dumps(portfolio_context, indent=2)}"

        messages = [{"role": m["role"], "content": m["content"]} for m in history]
        messages.append({"role": "user", "content": message})

        response = self._client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=600,
            system=system,
            messages=messages,
        )
        return response.content[0].text

    def stream_chat(
        self,
        message: str,
        history: list,
        portfolio_context: dict | None = None,
        symbol_context: str | None = None,
    ):
        """Stream a chat response via Server-Sent Events.

        Yields SSE-formatted text chunks for use with FastAPI StreamingResponse.
        Each chunk is: ``data: <text>\n\n``
        End of stream is signalled by: ``data: [DONE]\n\n``
        """
        import json as _json
        system = (
            "You are HedgeIQ's AI trading advisor — expert in options, hedging, and "
            "portfolio risk for retail investors.\n\n"
            "STRICT STYLE RULES:\n"
            "- Keep responses SHORT: 3-6 sentences total, unless the user asks for detail.\n"
            "- Lead with the answer. No preambles like 'Great question' or 'Let me analyze'.\n"
            "- Cite specific numbers from the portfolio when relevant.\n"
            "- Use ONE bold number/callout per response, max 1 heading.\n"
            "- Never use more than 3 bullets.\n"
            "- Plain English. Define jargon briefly.\n"
            "- End with ONE concrete next step the user can take.\n"
            "- This is education/analysis, not personalised advice."
        )
        if portfolio_context:
            system += f"\n\nUser's current portfolio:\n{_json.dumps(portfolio_context, indent=2)}"
        if symbol_context:
            system += f"\n\nUser is currently viewing: {symbol_context}"

        messages = [{"role": m["role"], "content": m["content"]} for m in history]
        messages.append({"role": "user", "content": message})

        with self._client.messages.stream(
            model=HAIKU_MODEL,
            max_tokens=600,
            system=system,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                chunk = _json.dumps(text)
                yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    async def explain_hedge_recommendation(
        self,
        position_data: dict,
        recommendation_data: dict,
        calls_today: int = 0,
        is_free_user: bool = True,
    ) -> str:
        """Explain why a specific put is recommended as a hedge.

        Args:
            position_data: Dict with symbol, shares, entry_price, current_price.
            recommendation_data: Dict with expiry, strike, ask, total_cost, breakeven.
            calls_today: Number of AI calls the user has made today.
            is_free_user: Whether to enforce the daily free-tier limit.

        Returns:
            Two-sentence explanation with disclaimer appended.

        Raises:
            DailyLimitExceededError: If a free user exceeds the daily limit.
        """
        self._check_daily_limit(calls_today, is_free_user)

        cache_key = (
            f"hedge_rec:{position_data.get('symbol')}:"
            f"{recommendation_data.get('expiry')}:{recommendation_data.get('strike')}"
        )
        cached = self._cache.get(cache_key)
        if cached:
            return cached

        prompt = f"""You are a trading coach. Be specific.

Trader holds {position_data.get('shares')} shares of {position_data.get('symbol')}
bought at ${position_data.get('entry_price')}, now at ${position_data.get('current_price')}.

Recommended hedge: {recommendation_data.get('expiry')} ${recommendation_data.get('strike')} put
Cost: ${recommendation_data.get('total_cost')} | Breakeven: ${recommendation_data.get('breakeven')}

In exactly 2 sentences, explain why this specific put is the best hedge right now.
Mention the specific numbers. Plain English only."""

        message = self._client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        response = message.content[0].text + DISCLAIMER
        self._cache.set(cache_key, response, ttl_hours=24)
        return response

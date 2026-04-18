"""AI explanation and chat endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.v1.schemas import (
    ExplainRequest, ExplainResponse,
    ChatRequest, ChatResponse,
)
from backend.domain.common.errors import DailyLimitExceededError
from backend.api.v1.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Analysis"])


@router.post(
    "/explain",
    response_model=ExplainResponse,
    status_code=200,
    summary="Get plain English explanation of an option",
    description=(
        "Claude Haiku explains an option in 3 sentences. "
        "Free: 5/day. Pro: unlimited. Cached 24h."
    ),
)
async def explain_option(
    request: ExplainRequest,
    current_user=Depends(get_current_user),
):
    """Generate plain English AI explanation for an option."""
    from backend.infrastructure.claude.facade import ClaudeFacade
    from backend.infrastructure.cache.chroma_cache import ChromaCache
    from backend.config import settings

    cache = ChromaCache(path=settings.chromadb_path)
    facade = ClaudeFacade(api_key=settings.anthropic_api_key, cache=cache)
    try:
        content = await facade.explain_option(
            request.contract,
            calls_today=current_user.daily_ai_calls_used,
            is_free_user=not current_user.is_pro,
        )
        return ExplainResponse(explanation=content, model_used="claude-haiku-4-5-20251001")
    except DailyLimitExceededError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e),
        )


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=200,
    summary="Natural language AI trading advisor",
    description=(
        "Multi-turn conversation with Claude about your portfolio, "
        "hedging strategies, and market events."
    ),
)
async def chat_with_advisor(
    request: ChatRequest,
    current_user=Depends(get_current_user),
):
    """Natural language conversation with Claude trading advisor."""
    from backend.infrastructure.claude.facade import ClaudeFacade
    from backend.infrastructure.cache.chroma_cache import ChromaCache
    from backend.config import settings

    cache = ChromaCache(path=settings.chromadb_path)
    facade = ClaudeFacade(api_key=settings.anthropic_api_key, cache=cache)
    try:
        reply = await facade.chat(
            message=request.message,
            history=[m.model_dump() for m in request.history],
            portfolio_context=request.portfolio_context,
        )
        return ChatResponse(reply=reply, model_used="claude-haiku-4-5-20251001")
    except DailyLimitExceededError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e),
        )

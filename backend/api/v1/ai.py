"""AI explanation endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.v1.schemas import ExplainRequest, ExplainResponse
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

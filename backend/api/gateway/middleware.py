"""API Gateway middleware — request logging and error handling.

Plugged into FastAPI via app.add_middleware() in main.py (Session 4).
"""
import time

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

log = structlog.get_logger()


class LoggingMiddleware(BaseHTTPMiddleware):
    """Structured request/response logging middleware.

    Logs method, path, status code, and latency for every request.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.monotonic()
        response = await call_next(request)
        latency_ms = round((time.monotonic() - start) * 1000, 1)
        log.info(
            "http_request",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            latency_ms=latency_ms,
        )
        return response

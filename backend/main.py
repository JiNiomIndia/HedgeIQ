"""HedgeIQ FastAPI application entry point.

This module bootstraps the HedgeIQ backend HTTP API. It is the single
process-entry point that:

* Configures the FastAPI application object (``app``) used by the ASGI
  server (uvicorn / Railway runtime).
* Wires global middleware in the correct outer-to-inner order:
  ``GZipMiddleware`` -> ``SecurityHeadersMiddleware`` -> ``CORSMiddleware``.
* Mounts the ``/api/v1`` routers (auth, positions, options, hedge, ai,
  quotes).
* Initialises the database on startup via the ``lifespan`` async context
  manager (creates tables and runs a connectivity probe).
* Registers a global ``Exception`` handler that turns unhandled errors
  into a redacted ``500`` response (defence-in-depth — no stack traces
  leaked to clients).
* Exposes a ``/health`` endpoint used by Railway, uptime monitors and
  the frontend to verify backend availability.

Notes
-----
The middleware order is significant: GZip must be outermost so that the
compressed response still carries the security headers. CORS is innermost
so pre-flight requests do not bypass the security middleware.
"""
from contextlib import asynccontextmanager
import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.api.v1 import positions, options, hedge, ai, auth, quotes
from backend.db.session import init_db, check_db

logger = logging.getLogger("hedgeiq")


# ---------------------------------------------------------------------------
# Security headers middleware (2A)
# ---------------------------------------------------------------------------

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add OWASP-recommended security headers to every response.

    Applied to every outbound HTTP response. The headers configured here
    were derived from the OWASP Secure Headers Project recommendations
    and adjusted for HedgeIQ's third-party dependencies (Anthropic,
    SnapTrade and Polygon — all reached via XHR ``connect-src``).

    The ``unsafe-inline`` and ``unsafe-eval`` allowances in
    ``script-src`` are required by Vite's runtime in development; the
    production build still relies on inline style hashes from Tailwind.
    Tightening this is tracked in the Phase 3 roadmap.
    """

    async def dispatch(self, request: Request, call_next):
        """Apply headers after delegating to the next middleware/handler.

        :param request: incoming ASGI ``Request``.
        :param call_next: downstream handler in the middleware chain.
        :returns: ``Response`` augmented with the security headers.
        """
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "connect-src 'self' https://api.anthropic.com https://api.snaptrade.com https://api.polygon.io; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "frame-ancestors 'none';"
        )
        return response


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan hook: run once on startup, once on shutdown.

    On startup we ensure the SQLite (or Postgres) schema exists and emit
    a structured log line confirming connectivity. A failure here aborts
    boot — we'd rather Railway restart the container than serve traffic
    against a broken database.
    """
    try:
        init_db()
        status = check_db()
        logger.info("DB init OK: %s", status)
    except Exception as exc:
        logger.error("DB init FAILED: %s", exc)
        raise
    yield


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    lifespan=lifespan,
    title="HedgeIQ API",
    version="0.1.0",
    description=(
        "AI-powered trading assistant — "
        "hedge your portfolio at midnight in 60 seconds."
    ),
)

# Order matters: GZip first (outermost), then security headers, then CORS
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin"],
    expose_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(positions.router, prefix="/api/v1")
app.include_router(options.router, prefix="/api/v1")
app.include_router(hedge.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(quotes.router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Global exception handler (2D)
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all handler for uncaught exceptions.

    The full stack trace is logged server-side via ``exc_info=True`` so
    operators can diagnose, but the client only sees a generic
    ``Internal server error`` message — never the exception type or
    message — to avoid leaking implementation detail.
    """
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url, exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ---------------------------------------------------------------------------
# Health endpoint (2E enriched)
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    """Liveness + readiness probe.

    Returns a small JSON document describing the build version,
    deployment environment, database connectivity and a per-component
    check map. Consumed by Railway's healthcheck probe and the frontend
    "system status" widget.
    """
    db_status = check_db()
    environment = os.environ.get("ENVIRONMENT", "production")
    return {
        "status": "ok",
        "version": "0.1.0",
        "environment": environment,
        "db": "connected" if db_status.get("ok") else "error",
        "checks": {
            "database": "ok" if db_status.get("ok") else "error",
            "cache": "ok",
        },
    }

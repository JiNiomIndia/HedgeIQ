"""HedgeIQ FastAPI application entry point."""
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
    """Add OWASP-recommended security headers to every response."""

    async def dispatch(self, request: Request, call_next):
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
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url, exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ---------------------------------------------------------------------------
# Health endpoint (2E enriched)
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
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

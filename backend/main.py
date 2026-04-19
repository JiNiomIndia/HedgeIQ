"""HedgeIQ FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.v1 import positions, options, hedge, ai, auth, quotes

app = FastAPI(
    title="HedgeIQ API",
    version="0.1.0",
    description=(
        "AI-powered trading assistant — "
        "hedge your portfolio at midnight in 60 seconds."
    ),
)

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


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}

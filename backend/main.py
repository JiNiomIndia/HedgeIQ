from fastapi import FastAPI

app = FastAPI(
    title="HedgeIQ API",
    version="0.1.0",
    description="AI-powered trading assistant.",
)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}

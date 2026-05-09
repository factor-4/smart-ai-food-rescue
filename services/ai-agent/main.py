from fastapi import FastAPI
from app.mcp.server import mcp
from app.api.routes import router as api_router

app = FastAPI(title="SmartFood AI Agent Service", version="0.1.0")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "ai-agent"}


app.include_router(api_router)
app.mount("/mcp", mcp.http_app())
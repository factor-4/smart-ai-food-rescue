from fastapi import FastAPI
from app.mcp.server import mcp

app = FastAPI(title="SmartFood AI Agent Service", version="0.1.0")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "ai-agent"}


app.mount("/mcp", mcp.http_app())
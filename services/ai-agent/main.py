from fastapi import FastAPI
from app.api.routes import router as api_router
from app.mcp.server import router as mcp_router

app = FastAPI(title="Smart Food Rescue AI Agent", version="1.0.0")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-agent"}

app.include_router(api_router)
app.include_router(mcp_router)
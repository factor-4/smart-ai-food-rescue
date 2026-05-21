"""
MCP Tools — exposed as REST endpoints following MCP semantics.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any
from app.agents.planner import PlannerAgent
from app.agents.rag import RAGAgent
from app.agents.pricing import PricingAgent
from app.core.db import get_user_history, get_available_bags_near, record_click, record_purchase

router = APIRouter(prefix="/mcp", tags=["MCP Tools"])

planner = PlannerAgent()
rag = RAGAgent()
pricing = PricingAgent()

# ── Tool definitions ──────────────────────────────
TOOLS = [
    {"name": "planner_plan", "description": "Plan steps for a user query",
     "inputSchema": {"type":"object","properties":{"user_query":{"type":"string"}},"required":["user_query"]}},
    {"name": "rag_recommend", "description": "Recommend bags using RAG",
     "inputSchema": {"type":"object","properties":{"plan":{"type":"object"},"user_id":{"type":"integer"}},"required":["plan","user_id"]}},
    {"name": "pricing_suggest", "description": "Suggest discount for a bag",
     "inputSchema": {"type":"object","properties":{"bag_id":{"type":"integer"}},"required":["bag_id"]}},
    {"name": "get_user_history", "description": "Recent orders of a user",
     "inputSchema": {"type":"object","properties":{"user_id":{"type":"integer"}},"required":["user_id"]}},
    {"name": "get_available_bags", "description": "Available bags near coordinates",
     "inputSchema": {"type":"object","properties":{"lat":{"type":"number"},"lon":{"type":"number"}}}},
    {"name": "record_click", "description": "Record click feedback",
     "inputSchema": {"type":"object","properties":{"user_id":{"type":"integer"},"bag_id":{"type":"integer"}},"required":["user_id","bag_id"]}},
    {"name": "record_purchase", "description": "Record a completed purchase",
     "inputSchema": {"type":"object","properties":{"user_id":{"type":"integer"},"bag_id":{"type":"integer"},"order_id":{"type":"integer"},"price_paid":{"type":"number"}},"required":["user_id","bag_id","order_id","price_paid"]}},
]

@router.get("/tools")
async def list_tools():
    """MCP: list available tools (industry‑standard endpoint)."""
    return {"tools": TOOLS}

class CallToolRequest(BaseModel):
    name: str
    arguments: dict[str, Any] = {}

@router.post("/tools/call")
async def call_tool(req: CallToolRequest):
    """MCP: call a tool by name with arguments."""
    try:
        if req.name == "planner_plan":
            result = await planner.plan(req.arguments["user_query"])
        elif req.name == "rag_recommend":
            result = await rag.recommend(req.arguments["plan"], req.arguments["user_id"])
        elif req.name == "pricing_suggest":
            discount = await pricing.suggest(req.arguments["bag_id"])
            result = {"bag_id": req.arguments["bag_id"], "discount": discount}
        elif req.name == "get_user_history":
            result = get_user_history(req.arguments["user_id"], req.arguments.get("limit", 20))
        elif req.name == "get_available_bags":
            lat = req.arguments.get("lat", 60.1699)
            lon = req.arguments.get("lon", 24.9384)
            result = get_available_bags_near(lat, lon)
        elif req.name == "record_click":
            record_click(req.arguments["user_id"], req.arguments.get("bag_id"), req.arguments.get("context", "recommendation"))
            result = {"success": True, "message": "Click recorded"}
        elif req.name == "record_purchase":
            record_purchase(
                req.arguments["user_id"],
                req.arguments["bag_id"],
                req.arguments["order_id"],
                req.arguments["price_paid"]
            )
            result = {"success": True, "message": "Purchase recorded"}
        else:
            raise HTTPException(status_code=404, detail=f"Unknown tool: {req.name}")
        return {"result": result}
    except KeyError as e:
        raise HTTPException(status_code=422, detail=f"Missing argument: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
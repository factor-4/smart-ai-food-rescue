from fastmcp import FastMCP
from app.agents.planner import PlannerAgent
from app.agents.rag import RAGAgent
from app.agents.pricing import PricingAgent

mcp = FastMCP("SmartFood Agents")

planner = PlannerAgent()
rag = RAGAgent()
pricing = PricingAgent()


@mcp.tool()
async def planner_plan(user_query: str) -> dict:
    return await planner.plan(user_query)


@mcp.tool()
async def rag_recommend(plan: dict, user_id: int) -> list[int]:
    return await rag.recommend(plan, user_id)


@mcp.tool()
async def pricing_suggest(bag_id: int) -> float:
    return await pricing.suggest(bag_id)
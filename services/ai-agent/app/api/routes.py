from fastapi import APIRouter
from pydantic import BaseModel
from app.agents.planner import PlannerAgent
from app.agents.rag import RAGAgent
from app.agents.pricing import PricingAgent
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse

router = APIRouter(prefix="/api", tags=["recommendations"])

planner = PlannerAgent()
rag = RAGAgent()
pricing = PricingAgent()


class PricingSuggestResponse(BaseModel):
    bag_id: int
    discount: float


@router.post("/recommendations/{user_id}", response_model=RecommendationResponse)
async def get_recommendations(user_id: int, payload: RecommendationRequest) -> RecommendationResponse:
    plan = await planner.plan(payload.query)
    recs = await rag.recommend(plan, user_id)
    return RecommendationResponse(user_id=user_id, plan=plan, recommendations=recs)


@router.post("/pricing/suggest", response_model=PricingSuggestResponse)
async def suggest_pricing(bag_id: int) -> PricingSuggestResponse:
    discount = await pricing.suggest(bag_id)
    return PricingSuggestResponse(bag_id=bag_id, discount=discount)
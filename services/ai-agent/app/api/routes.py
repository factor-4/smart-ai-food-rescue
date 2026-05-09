from fastapi import APIRouter
from app.agents.planner import PlannerAgent
from app.agents.rag import RAGAgent
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse

router = APIRouter(prefix="/api", tags=["recommendations"])

planner = PlannerAgent()
rag = RAGAgent()


@router.post("/recommendations/{user_id}", response_model=RecommendationResponse)
async def get_recommendations(user_id: int, payload: RecommendationRequest) -> RecommendationResponse:
    plan = await planner.plan(payload.query)
    recs = await rag.recommend(plan, user_id)
    return RecommendationResponse(user_id=user_id, plan=plan, recommendations=recs)
from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    query: str = Field(default="recommend food", min_length=3, max_length=200)


class RecommendationResponse(BaseModel):
    user_id: int
    plan: dict
    recommendations: list[int]
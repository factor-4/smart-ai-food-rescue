from typing import Any


class PlannerAgent:
    async def plan(self, user_query: str) -> dict[str, Any]:
        return {
            "goal": user_query,
            "steps": [
                "get_user_history",
                "get_available_bags",
                "compute_similarity",
            ],
        }
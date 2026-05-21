"""
RAG Agent – Retrieval‑Augmented Generation.
Embeds the user query and retrieves the most semantically similar surplus bags
from the vector database (pgvector).
"""
from langsmith import traceable 
from sentence_transformers import SentenceTransformer
from app.core.db import search_similar_bags

class RAGAgent:
    def __init__(self):
        # Load the model once. It’s small (~80 MB) and fast on CPU.
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    @traceable(name="RAGAgent.recommend", project_name="smart-food-rescue")
    async def recommend(self, plan: dict, user_id: int) -> list[int]:
        """
        Accepts the `plan` from the Planner (a dict) and returns relevant bag IDs.
        The plan must contain a 'query' key with the original user request text.
        """
        query_text = plan.get("query") or plan.get("goal") or ""
        if not query_text:
            query_text = "meal"   # fallback for empty queries

        # Convert the query text into a 384‑dimensional embedding
        embedding = self.model.encode(query_text).tolist()

        # Retrieve the top‑5 most similar bags (traced as a child span)
        @traceable(name="vector_similarity_search", project_name="smart-food-rescue")
        def _do_search(emb):
            return search_similar_bags(emb, top_k=5)

        bag_ids = _do_search(embedding)
        return bag_ids
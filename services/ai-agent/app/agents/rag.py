"""
RAG Agent – Retrieval‑Augmented Generation.
Embeds the user query and retrieves the most semantically similar surplus bags
from the vector database (pgvector).
"""
from langsmith import traceable 
from sentence_transformers import SentenceTransformer
from app.core.db import search_similar_bags
import numpy as np
from app.core.db import get_user_history, get_bag_embedding

class RAGAgent:
    def __init__(self):
        # Load the model once. It’s small (~80 MB) and fast on CPU.
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    @traceable(name="RAGAgent.recommend", project_name="smart-food-rescue")
    async def recommend(self, plan: dict, user_id: int) -> list[int]:
        """
        Personalised recommendation using query + user history.
        1. Get user's recent clicks/purchases.
        2. Get embeddings of those interacted bags.
        3. Blend query embedding with average history embedding (60/40).
        4. Search similar bags with the blended embedding.
        5. Exclude bags the user already purchased.
        """
        query_text = plan.get("query") or plan.get("goal") or ""
        if not query_text:
            query_text = "meal"

        # Step 1: get user history
        user_history = get_user_history(user_id, limit=10)

        # Step 2: collect embeddings of previously interacted bags
        history_bag_ids = [item['bag_id'] for item in user_history
                           if item['type'] in ('click', 'purchase')]
        history_embeddings = []
        for bid in history_bag_ids[:5]:  # last 5 interactions
            emb = get_bag_embedding(bid)
            if emb:
                history_embeddings.append(emb)

        # Step 3: compute blended embedding
        query_embedding = self.model.encode(query_text).tolist()
        if history_embeddings:
            # Average of history embeddings
            user_pref = np.mean(history_embeddings, axis=0).tolist()
            # Blend: 60% query, 40% user preference
            blended = np.mean([
                np.array(query_embedding) * 0.6,
                np.array(user_pref) * 0.4
            ], axis=0).tolist()
        else:
            blended = query_embedding

        # Step 4: vector similarity search
        @traceable(name="vector_similarity_search", project_name="smart-food-rescue")
        def _do_search(emb):
            return search_similar_bags(emb, top_k=8)

        bag_ids = _do_search(blended)

        # Step 5: filter out already purchased bags
        purchased_ids = [item['bag_id'] for item in user_history if item['type'] == 'purchase']
        recommended_ids = [bid for bid in bag_ids if bid not in purchased_ids][:5]

        return recommended_ids
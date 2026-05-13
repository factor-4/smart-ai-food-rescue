"""
Database helper for the AI agent.
Connects to the same PostgreSQL + pgvector used by Spring services.
Reads connection parameters from environment variables (with defaults).
"""
import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:admin@localhost:5432/smartfood"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=5)

def search_similar_bags(query_embedding: list[float], top_k: int = 5) -> list[int]:
    """
    Find the top_k most similar bags using pgvector cosine distance.
    Returns a list of bag IDs.
    """
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT bag_id
                FROM bag_embeddings
                ORDER BY embedding <-> cast(:embedding AS vector)
                LIMIT :limit
            """),
            {"embedding": query_embedding, "limit": top_k}
        )
        return [row[0] for row in result]
    


def get_bag_by_id(bag_id: int) -> dict | None:
    """
    Fetch a single bag's details needed for pricing decisions.
    Returns None if the bag doesn't exist.
    """
    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT id, original_price, quantity, pickup_time
                FROM bags
                WHERE id = :bag_id
            """),
            {"bag_id": bag_id}
        ).fetchone()
        if row is None:
            return None
        return {
            "id": row[0],
            "original_price": float(row[1]),
            "quantity": row[2],
            "pickup_time": row[3]
        }
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
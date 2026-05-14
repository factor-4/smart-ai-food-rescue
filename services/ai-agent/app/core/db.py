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
    


def get_user_orders(user_id: int, limit: int = 10) -> list[dict]:
    """
    Retrieve recent orders for a user (from the shared orders table).
    Returns a list of order dicts with id, bag_id, status, created_at.
    """
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT id, bag_id, status, created_at
                FROM orders
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT :limit
            """),
            {"user_id": user_id, "limit": limit}
        ).fetchall()
        return [{"id": row[0], "bag_id": row[1], "status": row[2], "created_at": row[3].isoformat()} for row in rows]


def get_available_bags_near(lat: float, lon: float, radius_km: float = 5.0, limit: int = 20) -> list[dict]:
    """
    Return bags that are available (status='AVAILABLE') and optionally near a location.
    For now, we ignore lat/lon and return all available bags.
    Later you can add a spatial index.
    """
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT b.id, b.name, b.description, b.original_price, b.discounted_price, b.quantity, b.pickup_time
                FROM bags b
                WHERE b.status = 'AVAILABLE'
                ORDER BY b.pickup_time ASC
                LIMIT :limit
            """),
            {"limit": limit}
        ).fetchall()
        return [
            {
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "original_price": float(row[3]),
                "discounted_price": float(row[4]),
                "quantity": row[5],
                "pickup_time": row[6].isoformat() if row[6] else None
            }
            for row in rows
        ]


def insert_click(user_id: int, bag_id: int) -> None:
    """
    Record a click on a recommendation (for future evaluation / CTR tracking).
    """
    with engine.connect() as conn:
        conn.execute(
            text("""
                CREATE TABLE IF NOT EXISTS user_feedback (
                    id BIGSERIAL PRIMARY KEY,
                    user_id BIGINT NOT NULL,
                    bag_id BIGINT NOT NULL,
                    event_type VARCHAR(20) DEFAULT 'click',
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
        )
        conn.execute(
            text("""
                INSERT INTO user_feedback (user_id, bag_id) VALUES (:user_id, :bag_id)
            """),
            {"user_id": user_id, "bag_id": bag_id}
        )
        conn.commit()
import os
import psycopg2
from sentence_transformers import SentenceTransformer

DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "smartfood")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

conn = psycopg2.connect(
    host=DB_HOST, port=DB_PORT, database=DB_NAME,
    user=DB_USER, password=DB_PASSWORD
)
cur = conn.cursor()

cur.execute("SELECT id, name, description FROM bags WHERE status = 'AVAILABLE'")
bags = cur.fetchall()
print(f"Found {len(bags)} bags")

model = SentenceTransformer("all-MiniLM-L6-v2")
texts = [f"{b[1]}. {b[2] or ''}" for b in bags]
embeddings = model.encode(texts, show_progress_bar=False)

for (bag_id, _, _), emb in zip(bags, embeddings):
    cur.execute(
        """
        INSERT INTO bag_embeddings (bag_id, embedding)
        VALUES (%s, %s)
        ON CONFLICT (bag_id) DO UPDATE SET embedding = EXCLUDED.embedding
        """,
        (bag_id, emb.tolist())
    )

conn.commit()
cur.close()
conn.close()
print("Embeddings refreshed.")
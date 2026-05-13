import psycopg2
import os
from psycopg2.extras import execute_values
import openfoodfacts
from faker import Faker
import random
from datetime import datetime, timedelta
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
load_dotenv() 

# ── Database connection  ──────────────────────
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "smartfood")
DB_USER = os.getenv("DB_USERNAME", "admin")      # same var name as Spring Boot
DB_PASSWORD = os.getenv("DB_PASSWORD", "admin")

conn = psycopg2.connect(
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD
)
cur = conn.cursor()

# ── Helpers ────────────────────────────────────────────────────────────────
def fetch_real_products(count=100):
    api = openfoodfacts.API(user_agent="SmartFoodRescue/1.0 (dev@example.com)")
    items = []
    queries = ["meal", "bread", "yogurt", "fruit", "vegetable", "smoothie", "sandwich", "salad", "pasta", "soup", "wrap", "cake", "cookie"]
    for q in queries:
        try:
            res = api.product.text_search(q, page_size=20)
            for p in res.get("products", []):
                name = (p.get("product_name") or "").strip()
                desc = (p.get("generic_name") or "").strip()
                if name and len(name) > 3:
                    items.append({
                        "name": name[:100],
                        "description": desc[:255],
                        "category": q
                    })
                if len(items) >= count:
                    break
        except Exception:
            pass
        if len(items) >= count:
            break
    return items[:count]

fake = Faker("fi_FI")   # Finnish‑sounding data

def generate_bag_name():
    types = ["Lunch Bag", "Bakery Surprise", "Grocery Mix", "Hot Meal", "Salad Box", "Vegan Delight", "Sushi Set", "Breakfast Bag", "Family Pack", "Snack Box"]
    contents = ["Salmon & Potatoes", "Chicken Wrap", "Tofu Bowl", "Assorted Pastries", "Fruit Smoothie", "Pasta & Sauce", "Rice & Curry", "Sandwich & Juice", "Meatball Stew", "Veggie Stir-fry"]
    return f"{random.choice(types)} – {random.choice(contents)}"

def generate_bag_desc():
    ingr = ["fresh vegetables", "organic grains", "locally sourced", "homemade sauce", "seasonal fruit", "free-range eggs", "wild-caught fish", "ripe tomatoes", "crunchy salad", "hearty lentils"]
    return f"Contains {', '.join(random.sample(ingr, 3))}. Surplus from today. Best before 24h."

def generate_restaurants_and_bags(num_rest=20, bags_per=10):
    rests, bags = [], []
    for _ in range(num_rest):
        r = {
            "name": fake.company(),
            "description": f"Cozy place in {fake.city()} rescuing surplus food.",
            "address": fake.address().replace("\n", ", "),
            "phone": fake.phone_number()[:20],
            "email": fake.email(),
            "owner_id": 1
        }
        rests.append(r)
        for _ in range(bags_per):
            b = {
                "name": generate_bag_name(),
                "description": generate_bag_desc(),
                "original_price": round(random.uniform(5, 25), 2),
                "discounted_price": round(random.uniform(2, 15), 2),
                "quantity": random.randint(1, 10),
                "pickup_time": datetime.now() + timedelta(hours=random.randint(1, 48)),
                "status": "AVAILABLE"
            }
            bags.append(b)
    return rests, bags

def insert_restaurants(rests):
    ids = []
    for r in rests:
        cur.execute("""
            INSERT INTO restaurants (name, description, address, phone, email, owner_id, status, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,'ACTIVE',NOW(),NOW())
            RETURNING id
        """, (r["name"], r["description"], r["address"], r["phone"], r["email"], r["owner_id"]))
        ids.append(cur.fetchone()[0])
    conn.commit()
    return ids

def insert_bags(bags, rest_ids):
    for b in bags:
        rid = random.choice(rest_ids)
        cur.execute("""
            INSERT INTO bags (name, description, original_price, discounted_price, quantity, pickup_time, status, restaurant_id, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,'AVAILABLE',%s,NOW(),NOW())
        """, (b["name"], b["description"], b["original_price"], b["discounted_price"], b["quantity"], b["pickup_time"], rid))
    conn.commit()

def setup_vector_table():
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS bag_embeddings (
            bag_id BIGINT PRIMARY KEY REFERENCES bags(id),
            embedding vector(384)
        )
    """)
    conn.commit()

def generate_embeddings():
    model = SentenceTransformer("all-MiniLM-L6-v2")
    cur.execute("SELECT id, name, description FROM bags")
    rows = cur.fetchall()
    texts = [f"{name}. {desc}" for _, name, desc in rows]
    print("Generating embeddings for all bags...")
    embeddings = model.encode(texts, show_progress_bar=True)
    for (bag_id, _, _), emb in zip(rows, embeddings):
        cur.execute("""
            INSERT INTO bag_embeddings (bag_id, embedding)
            VALUES (%s, %s)
            ON CONFLICT (bag_id) DO UPDATE SET embedding = EXCLUDED.embedding
        """, (bag_id, emb.tolist()))
    conn.commit()

# ── Main ───────────────────────────────────────────────────────────────────
def main():
    print("Fetching real Open Food Facts products...")
    real = fetch_real_products(100)
    print(f"Got {len(real)} real products.")

    print("Creating restaurants + bags...")
    rests, bags = generate_restaurants_and_bags(20, 10)
    print(f"Restaurants: {len(rests)} | Bags: {len(bags)}")

    # Overwrite some bag names/descriptions with real data
    for i, prod in enumerate(real):
        if i < len(bags):
            bags[i]["name"] = prod["name"]
            bags[i]["description"] = prod["description"]

    print("Inserting into DB...")
    rest_ids = insert_restaurants(rests)
    print(f"Inserted {len(rest_ids)} restaurants.")
    insert_bags(bags, rest_ids)
    print(f"Inserted {len(bags)} bags.")

    print("Setting up vector table...")
    setup_vector_table()

    print("Embedding & storing...")
    generate_embeddings()

    print("✅ Seeding complete!")
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
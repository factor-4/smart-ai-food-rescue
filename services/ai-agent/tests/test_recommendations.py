from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_recommendations_endpoint():
    response = client.post(
        "/api/recommendations/42",
        json={"query": "recommend me a cheap bag"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == 42
    assert "steps" in body["plan"]
    assert isinstance(body["recommendations"], list)
    assert len(body["recommendations"]) > 0




def test_recommendations_invalid_query_returns_422():
    response = client.post(
        "/api/recommendations/42",
        json={"query": ""},
    )
    assert response.status_code == 422
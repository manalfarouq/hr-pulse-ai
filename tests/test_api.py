# tests/test_api.py
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "api" in data
    assert data["api"] == "ok"

def test_predict_salary_endpoint():
    response = client.post("/predict/salary", json={
        "job_title": "Data Scientist",
        "description": "Python machine learning Azure"
    })
    assert response.status_code == 200
    data = response.json()
    assert "predicted_salary_usd" in data
    assert data["predicted_salary_usd"] > 0

def test_predict_salary_missing_field():
    response = client.post("/predict/salary", json={
        "job_title": "Data Scientist"
    })
    assert response.status_code == 422
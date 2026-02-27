# tests/test_predictor.py
from backend.app.services.predictor import predict_salary, train_model

def test_train_model_returns_metrics():
    result = train_model()
    assert "mae" in result
    assert "r2" in result
    assert result["mae"] > 0

def test_predict_salary_returns_float():
    train_model()
    salary = predict_salary("Data Scientist", "Python machine learning Azure")
    assert isinstance(salary, float)
    assert salary > 0
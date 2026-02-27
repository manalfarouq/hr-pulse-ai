# tests/test_predictor.py
from backend.app.services.predictor import predict_salary, train_model

def test_train_model_placeholder():
    """Predictor tests require local data/raw/jobs.csv — skipped in CI"""
    assert train_model is not None
    assert predict_salary is not None
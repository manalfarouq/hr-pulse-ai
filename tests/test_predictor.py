# tests/test_predictor.py

from backend.app.services.predictor import predict_salary, train_model


def test_train_model_returns_metrics():
    result = train_model()
    assert "mae" in result
    assert "r2" in result
    assert result["mae"] > 0


def test_predict_salary_returns_float():
    train_model()  # s'assure que le modèle existe
    salary = predict_salary("Data Scientist", "Python machine learning Azure")
    assert isinstance(salary, float)
    assert salary > 0


def test_predict_salary_different_titles():
    train_model()
    s1 = predict_salary("Data Scientist", "Python machine learning")
    s2 = predict_salary("Data Analyst", "SQL Excel Power BI")
    # Les deux doivent retourner des valeurs positives
    assert s1 > 0
    assert s2 > 0
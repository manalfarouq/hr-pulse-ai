"""Routes de prédiction salariale"""
from fastapi import APIRouter, HTTPException

from ..schemas.models_schema import SalaryPredictRequest, SalaryPredictResponse
from ..services.predictor import predict_salary

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("/salary", response_model=SalaryPredictResponse)
def predict(request: SalaryPredictRequest):
    """
    Prédit le salaire moyen pour un poste donné.
    Le modèle doit être entraîné au préalable via train_model().
    """
    try:
        salary = predict_salary(request.job_title, request.description)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    confidence = "haute" if salary > 80000 else "moyenne"

    return SalaryPredictResponse(
        job_title=request.job_title,
        predicted_salary_usd=salary,
        confidence=confidence,
    )
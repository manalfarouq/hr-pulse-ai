# backend/app/routes/routes_predict.py
from fastapi import APIRouter, HTTPException

from ..schemas.models_schema import SalaryPredictRequest, SalaryPredictResponse
from ..services.predictor import extract_skills, predict_salary

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("/salary", response_model=SalaryPredictResponse)
def predict(request: SalaryPredictRequest):
    try:
        salary = predict_salary(request.job_title, request.description)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    skills = extract_skills(request.job_title + " " + request.description)

    return SalaryPredictResponse(
        job_title=request.job_title,
        predicted_salary_usd=salary,
        skills_extracted=skills,
    )
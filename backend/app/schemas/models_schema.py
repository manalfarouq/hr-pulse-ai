# backend/app/schemas/models_schema.py
from pydantic import BaseModel, Field


class JobResponse(BaseModel):
    id: int
    job_title: str
    skills_extracted: list[str]

    class Config:
        from_attributes = True


class SalaryPredictRequest(BaseModel):
    job_title: str = Field(..., example="Data Scientist")
    description: str = Field(..., example="Python machine learning Azure")


class SalaryPredictResponse(BaseModel):
    job_title: str
    predicted_salary_usd: float
    skills_extracted: list[str] = []
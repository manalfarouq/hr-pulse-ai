"""Schemas Pydantic pour les offres d'emploi"""
from pydantic import BaseModel, Field


class SkillEntity(BaseModel):
    text: str
    category: str
    subcategory: str | None = None
    confidence_score: float


class JobCreate(BaseModel):
    job_title: str
    skills_extracted: list[SkillEntity]


class JobResponse(BaseModel):
    id: int
    job_title: str
    skills_extracted: list[SkillEntity]

    class Config:
        from_attributes = True


class SalaryPredictRequest(BaseModel):
    job_title: str = Field(..., example="Data Scientist")
    description: str = Field(..., example="Python machine learning experience required")


class SalaryPredictResponse(BaseModel):
    job_title: str
    predicted_salary_usd: float
    confidence: str
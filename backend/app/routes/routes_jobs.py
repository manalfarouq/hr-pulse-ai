# backend/app/routes/routes_jobs.py
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..schemas.models_schema import JobResponse
from ..services import db_service

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def job_to_response(job) -> JobResponse:
    return JobResponse(
        id=job.id,
        job_title=job.job_title,
        skills_extracted=json.loads(job.skills_extracted),
    )


@router.get("/", response_model=list[JobResponse])
def list_jobs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return [job_to_response(j) for j in db_service.get_all_jobs(db, skip, limit)]


@router.get("/search/", response_model=list[JobResponse])
def search_by_skill(skill: str, db: Session = Depends(get_db)):
    return [job_to_response(j) for j in db_service.search_jobs_by_skill(db, skill)]


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db_service.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job introuvable")
    return job_to_response(job)
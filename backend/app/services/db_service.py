# backend/app/services/db_service.py
import json

from sqlalchemy.orm import Session

from ..models.models import Job


def insert_job(db: Session, job_title: str, skills: list) -> Job:
    job = Job(
        job_title=job_title,
        skills_extracted=json.dumps(skills, ensure_ascii=False),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_all_jobs(db: Session, skip: int = 0, limit: int = 100) -> list[Job]:
    return db.query(Job).order_by(Job.id).offset(skip).limit(limit).all()


def get_job_by_id(db: Session, job_id: int) -> Job | None:
    return db.query(Job).filter(Job.id == job_id).first()


def search_jobs_by_skill(db: Session, skill: str) -> list[Job]:
    keyword = f"%{skill}%"
    return db.query(Job).filter(Job.skills_extracted.ilike(keyword)).all()
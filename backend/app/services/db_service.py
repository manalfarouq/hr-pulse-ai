"""CRUD operations for jobs"""
import json

from sqlalchemy.orm import Session

from ..models.models import Job


def insert_job(db: Session, job_title: str, skills: list[dict]) -> Job:
    """Insère un job avec ses compétences extraites."""
    job = Job(
        job_title=job_title,
        skills_extracted=json.dumps(skills, ensure_ascii=False),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_all_jobs(db: Session, skip: int = 0, limit: int = 100) -> list[Job]:
    """Retourne tous les jobs paginés."""
    return db.query(Job).offset(skip).limit(limit).all()


def get_job_by_id(db: Session, job_id: int) -> Job | None:
    """Retourne un job par son ID."""
    return db.query(Job).filter(Job.id == job_id).first()


def search_jobs_by_skill(db: Session, skill: str) -> list[Job]:
    """Recherche les jobs dont skills_extracted contient le mot-clé."""
    keyword = f"%{skill.lower()}%"
    return db.query(Job).filter(Job.skills_extracted.ilike(keyword)).all()


def delete_job(db: Session, job_id: int) -> bool:
    """Supprime un job. Retourne True si supprimé."""
    job = get_job_by_id(db, job_id)
    if not job:
        return False
    db.delete(job)
    db.commit()
    return True
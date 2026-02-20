"""Routes pour les offres d'emploi"""
import json
import logging
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..schemas.models_schema import JobResponse
from ..services import db_service, ingestion, ner_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jobs", tags=["Jobs"])


def _job_to_response(job) -> JobResponse:
    return JobResponse(
        id=job.id,
        job_title=job.job_title,
        skills_extracted=json.loads(job.skills_extracted),
    )


@router.get("/", response_model=list[JobResponse])
def list_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retourne toutes les offres (paginées)."""
    return [_job_to_response(j) for j in db_service.get_all_jobs(db, skip, limit)]


@router.get("/search/", response_model=list[JobResponse])
def search_by_skill(skill: str, db: Session = Depends(get_db)):
    """Recherche des offres par compétence."""
    return [_job_to_response(j) for j in db_service.search_jobs_by_skill(db, skill)]


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Retourne une offre par son ID."""
    job = db_service.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job introuvable")
    return _job_to_response(job)


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    """Supprime une offre."""
    if not db_service.delete_job(db, job_id):
        raise HTTPException(status_code=404, detail="Job introuvable")
    return {"detail": f"Job {job_id} supprimé."}


@router.post("/upload/")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload un CSV → nettoyage → NER Azure AI → insertion Azure SQL.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Fichier CSV attendu.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        df = ingestion.load_and_clean(tmp_path)
        titles = df["job_title_clean"].tolist()
        descriptions = df["description_clean"].tolist()

        skills_per_doc = ner_service.extract_skills_only(descriptions)

        for title, skills in zip(titles, skills_per_doc):
            db_service.insert_job(db, title, skills)

        logger.info(f"{len(titles)} offres insérées.")
        return {"detail": f"{len(titles)} offres insérées avec succès."}
    finally:
        Path(tmp_path).unlink(missing_ok=True)
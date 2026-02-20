"""Database configuration and session management"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from ..core.config import settings


engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """
    Dependency FastAPI — fournit une session DB.

    Usage:
        @router.get("/jobs")
        def get_jobs(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Crée la table jobs si elle n'existe pas (Azure SQL)."""
    with engine.connect() as conn:
        conn.execute(text("""
            IF NOT EXISTS (
                SELECT * FROM sysobjects WHERE name='jobs' AND xtype='U'
            )
            CREATE TABLE jobs (
                id               INT IDENTITY(1,1) PRIMARY KEY,
                job_title        NVARCHAR(255)     NOT NULL,
                skills_extracted NVARCHAR(MAX)     NOT NULL
            )
        """))
        conn.commit()
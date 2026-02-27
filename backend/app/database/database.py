# backend/app/database/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from ..core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    with engine.connect() as conn:
        conn.execute(text("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='jobs' AND xtype='U')
            CREATE TABLE jobs (
                id               INT IDENTITY(1,1) PRIMARY KEY,
                job_title        NVARCHAR(255) NOT NULL,
                skills_extracted NVARCHAR(MAX) NOT NULL
            )
        """))
        conn.commit()


def check_connection() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Erreur connexion : {e}")
        return False
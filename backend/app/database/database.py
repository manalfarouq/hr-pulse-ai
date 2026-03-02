# # backend/app/database/database.py
# from sqlalchemy import create_engine, text
# from sqlalchemy.orm import sessionmaker

# from ..core.config import settings
# from backend.app.models.user import Base  # Base unique, déclarée dans user.py

# engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, echo=False)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# def init_db():
#     # Crée toutes les tables SQLAlchemy (users, etc.)
#     Base.metadata.create_all(bind=engine)

#     # Crée la table jobs si elle n'existe pas (non gérée par SQLAlchemy)
#     with engine.connect() as conn:
#         conn.execute(text("""
#             IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='jobs' AND xtype='U')
#             CREATE TABLE jobs (
#                 id               INT IDENTITY(1,1) PRIMARY KEY,
#                 job_title        NVARCHAR(255) NOT NULL,
#                 skills_extracted NVARCHAR(MAX) NOT NULL
#             )
#         """))
#         conn.commit()


# def check_connection() -> bool:
#     try:
#         with engine.connect() as conn:
#             conn.execute(text("SELECT 1"))
#         return True
#     except Exception as e:
#         print(f"Erreur connexion : {e}")
#         return False

# backend/app/database/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from ..core.config import settings
from backend.app.models.user import Base  # Base unique, déclarée dans user.py

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Crée toutes les tables SQLAlchemy (users, etc.)
    Base.metadata.create_all(bind=engine)

    # Crée la table jobs si elle n'existe pas (syntaxe PostgreSQL)
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS jobs (
                id               SERIAL PRIMARY KEY,
                job_title        VARCHAR(255) NOT NULL,
                skills_extracted TEXT NOT NULL
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
"""Application configuration settings"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Configuration chargée depuis les variables d'environnement.
    Toutes les valeurs sensibles doivent être dans le fichier .env
    """

    # App
    PROJECT_NAME: str = "HR-Pulse API"

    # Azure SQL
    DATABASE_URL: str

    # Azure AI Language
    AZURE_LANGUAGE_ENDPOINT: str
    AZURE_LANGUAGE_KEY: str

    # ML Model
    MODEL_PATH: str = "/app/models/salary_model.pkl"
    DATA_PATH: str = "/app/data/raw/jobs.csv"

    # OpenTelemetry / Jaeger
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://jaeger:4317"
    OTEL_SERVICE_NAME: str = "hr-pulse-backend"

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
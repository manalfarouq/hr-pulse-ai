# backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "HR-Pulse API"
    DATABASE_URL: str
    AZURE_LANGUAGE_ENDPOINT: str
    AZURE_LANGUAGE_KEY: str
    MODEL_PATH: str = "models/salary_model.pkl"
    RAW_DATA_PATH: str = "data/raw/jobs.csv"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
# backend/app/services/ner_service.py
from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

from ..core.config import settings

BATCH_SIZE = 5
SKILL_CATEGORIES = {"Skill", "Product", "PersonType"}

_client: TextAnalyticsClient | None = None


def get_client() -> TextAnalyticsClient:
    global _client
    if _client is None:
        _client = TextAnalyticsClient(
            endpoint=settings.AZURE_LANGUAGE_ENDPOINT,
            credential=AzureKeyCredential(settings.AZURE_LANGUAGE_KEY),
        )
    return _client


def extract_skills_only(documents: list[str]) -> list[list[str]]:
    """Retourne pour chaque document la liste des compétences (strings)."""
    client = get_client()
    all_skills = []

    for i in range(0, len(documents), BATCH_SIZE):
        batch = documents[i: i + BATCH_SIZE]
        response = client.recognize_entities(batch)

        for doc in response:
            if doc.is_error:
                all_skills.append([])
                continue
            skills = [
                e.text for e in doc.entities
                if e.category in SKILL_CATEGORIES
            ]
            all_skills.append(skills)

    return all_skills


# Alias simple pour compatibilité
def extraire_competences(text: str) -> list[str]:
    return extract_skills_only([text])[0]
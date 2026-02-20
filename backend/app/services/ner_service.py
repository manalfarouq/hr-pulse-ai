"""Azure AI Language — Named Entity Recognition"""
import logging

from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential

from ..core.config import settings

logger = logging.getLogger(__name__)

BATCH_SIZE = 5
SKILL_CATEGORIES = {"Skill", "Product", "PersonType"}

# Client singleton
_client: TextAnalyticsClient | None = None


def get_client() -> TextAnalyticsClient:
    """Retourne un client Azure AI Language (singleton)."""
    global _client
    if _client is None:
        _client = TextAnalyticsClient(
            endpoint=settings.AZURE_LANGUAGE_ENDPOINT,
            credential=AzureKeyCredential(settings.AZURE_LANGUAGE_KEY),
        )
    return _client


def extract_entities(documents: list[str]) -> list[list[dict]]:
    """
    Extrait toutes les entités NER pour une liste de textes.

    Args:
        documents: Liste de descriptions de postes

    Returns:
        Liste de listes d'entités par document
    """
    client = get_client()
    all_results: list[list[dict]] = []

    for i in range(0, len(documents), BATCH_SIZE):
        batch = documents[i: i + BATCH_SIZE]
        response = client.recognize_entities(batch)

        for doc in response:
            if doc.is_error:
                logger.warning(f"Erreur NER sur un document : {doc.error}")
                all_results.append([])
                continue

            all_results.append([
                {
                    "text": e.text,
                    "category": e.category,
                    "subcategory": e.subcategory,
                    "confidence_score": round(e.confidence_score, 3),
                }
                for e in doc.entities
            ])

    return all_results


def extract_skills_only(documents: list[str]) -> list[list[dict]]:
    """
    Filtre uniquement les entités de type Skill / Product.

    Args:
        documents: Liste de descriptions de postes

    Returns:
        Liste de compétences extraites par document
    """
    return [
        [e for e in doc_entities if e["category"] in SKILL_CATEGORIES]
        for doc_entities in extract_entities(documents)
    ]
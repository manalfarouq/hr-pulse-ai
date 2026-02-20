"""CSV ingestion and cleaning"""
import re

import pandas as pd

from ..core.config import settings


def clean_salary(salary_str: str) -> float | None:
    """
    Transforme '$137K-$171K' en valeur numérique moyenne.
    Retourne None si non parsable.
    """
    if not isinstance(salary_str, str):
        return None
    numbers = re.findall(r"\d+", salary_str.replace(",", ""))
    if len(numbers) < 2:
        return None
    low = float(numbers[0]) * 1000
    high = float(numbers[1]) * 1000
    return (low + high) / 2


def clean_title(title: str) -> str:
    """Nettoie un intitulé de poste (supprime rating '\n3.5')."""
    if not isinstance(title, str):
        return ""
    title = re.sub(r"\n.*", "", title)
    return title.strip()


def load_and_clean(csv_path: str = None) -> pd.DataFrame:
    """
    Charge le CSV, nettoie les colonnes utiles.
    Retourne un DataFrame avec : job_title_clean, salary_avg, description_clean.

    Args:
        csv_path: Chemin vers le CSV (utilise settings.DATA_PATH si None)
    """
    path = csv_path or settings.DATA_PATH
    df = pd.read_csv(path)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    title_col = next((c for c in df.columns if "title" in c or "job" in c), None)
    salary_col = next((c for c in df.columns if "salary" in c), None)
    desc_col = next(
        (c for c in df.columns if "description" in c or "desc" in c), None
    )

    if not title_col:
        raise ValueError("Colonne 'job title' introuvable dans le CSV.")

    df["job_title_clean"] = df[title_col].apply(clean_title)
    df["salary_avg"] = df[salary_col].apply(clean_salary) if salary_col else None
    df["description_clean"] = df[desc_col].fillna("") if desc_col else ""

    df = df[df["job_title_clean"] != ""].reset_index(drop=True)

    return df[["job_title_clean", "salary_avg", "description_clean"]]
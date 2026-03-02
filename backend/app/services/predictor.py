import pickle
import re

from sklearn.linear_model import Ridge
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline

from ..core.config import settings
from .ingestion import load_and_clean

KNOWN_SKILLS = [
    "python", "machine learning", "computer science", "data science",
    "statistics", "sql", "analytics", "mathematics", "java",
    "data analysis", "data mining", "data analytics", "statistical analysis",
    "scala", "c++", "deep learning", "software development", "big data",
    "quantitative", "predictive modeling", "statistical modeling",
    "business intelligence", "applied mathematics", "software engineering",
    "programming languages", "regression", "neural networks",
    "natural language processing", "data engineering", "sas", "cloud",
    "clustering", "artificial intelligence", "data modeling", "etl",
    "data visualization", "optimization", "r programming", "spark", "tensorflow",
    "pytorch", "docker", "kubernetes", "azure", "aws", "gcp",
    "nlp", "computer vision", "mlops", "devops", "git",
    "pandas", "numpy", "scikit-learn", "tableau", "power bi",
]

def extract_skills(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for skill in KNOWN_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found[:10]
def train_model() -> dict:
    df = load_and_clean()
    df = df.dropna(subset=["salary_avg"])
    X = df["job_title_clean"] + " " + df["description_clean"]
    y = df["salary_avg"]
    print(f"📊 {len(df)} offres avec salaire")
    model = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=500)),
        ("ridge", Ridge()),
    ])
    model.fit(X, y)
    from sklearn.metrics import mean_absolute_error, r2_score
    preds = model.predict(X)
    mae = mean_absolute_error(y, preds)
    r2 = r2_score(y, preds)
    print(f"📈 MAE : ${mae:,.2f}  |  R² : {r2:.4f}")
    with open(settings.MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    return {"mae": round(mae, 2), "r2": round(r2, 4)}


def predict_salary(job_title: str, description: str) -> float:
    try:
        with open(settings.MODEL_PATH, "rb") as f:
            model = pickle.load(f)
    except FileNotFoundError:
        raise FileNotFoundError("Modèle introuvable. Lancez d'abord : python main.py train")
    text = job_title + " " + description
    return round(float(model.predict([text])[0]), 2)


def predire_salaire(job_title: str, description: str) -> float:
    return predict_salary(job_title, description)

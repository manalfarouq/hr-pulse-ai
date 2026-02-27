# backend/app/services/predictor.py
import pickle

from sklearn.linear_model import Ridge
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline

from ..core.config import settings
from .ingestion import load_and_clean


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


# Alias pour compatibilité
def predire_salaire(job_title: str, description: str) -> float:
    return predict_salary(job_title, description)
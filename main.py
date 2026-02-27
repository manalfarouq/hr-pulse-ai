# main.py (racine du projet)
import sys


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else ""

    if command == "ingest":
        from tqdm import tqdm
        from backend.app.services.ingestion import load_and_clean
        from backend.app.services.ner_service import extract_skills_only
        from backend.app.services.db_service import insert_job
        from backend.app.database.database import SessionLocal

        print("── Étape 1 : Chargement et nettoyage ──")
        df = load_and_clean("data/raw/jobs.csv").head(100)

        print("── Étape 2 : Extraction des compétences (Azure NER) ──")
        descriptions = df["description_clean"].tolist()
        skills_list = []
        for desc in tqdm(descriptions):
            skills_list.extend(extract_skills_only([desc]))

        print("── Étape 3 : Sauvegarde dans Azure SQL ──")
        db = SessionLocal()
        for title, skills in zip(df["job_title_clean"].tolist(), skills_list):
            insert_job(db, title, skills)
        db.close()
        print(f"✅ {len(df)} offres sauvegardées en base")

    elif command == "train":
        from backend.app.services.predictor import train_model
        print("── Entraînement du modèle ML ──")
        result = train_model()
        print(f"✅ Modèle sauvegardé → models/salary_model.pkl")
        print(f"   Résultat : {result}")

    else:
        print("Usage : uv run python main.py [ingest|train]")


if __name__ == "__main__":
    main()
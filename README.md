# HR-Pulse AI

Plateforme d'analyse automatique d'offres d'emploi — Azure AI NER, FastAPI, Streamlit, Terraform, Docker & CI/CD.

---

## Résumé du projet

C'est un projet fullstack de 2 semaines qui simule une vraie mission en entreprise. L'objectif : automatiser l'analyse d'offres d'emploi pour une startup RH fictive, de bout en bout.

Le pipeline complet part d'un fichier CSV d'offres d'emploi et passe par 7 phases :

**Phase 1 — Infrastructure (Terraform)** : Provisioning sur Azure d'une base SQL et d'un service IA via du code Terraform (pas à la main sur le portail).

**Phase 2 — Data & IA** : Nettoyage du CSV, envoi des descriptions de postes à Azure AI Language pour extraire automatiquement les compétences (ex: "Python", "SQL", "Agile"), et stockage dans la base SQL.

**Phase 3 — Machine Learning** : Entraînement d'un modèle de régression pour prédire le salaire moyen d'un poste à partir des données.

**Phase 4 — Interfaces** : Exposition via une API FastAPI (backend) et une interface visuelle Streamlit ou NextJS (frontend).

**Phase 5 — Docker** : Conteneurisation avec des Dockerfiles + un docker-compose pour lancer l'appli en une seule commande.

**Phase 6 — Tests** : Tests unitaires avec Pytest pour valider le code.

**Phase 7 — CI/CD (GitHub Actions)** : Automatisation du linting (Ruff/Flake8), des tests et du build Docker à chaque push.

> **Bonus** : Observabilité avec OpenTelemetry + Jaeger pour visualiser les temps de réponse et les erreurs en temps réel.

---

## Architecture

```
hr-pulse-ai/
├── infra/              # Terraform (Azure SQL + Azure AI Language)
├── backend/            # FastAPI + scripts IA/ML
│   ├── main.py
│   ├── ingestion.py    # Nettoyage CSV + NER
│   └── predictor.py    # Modèle ML salaire
├── frontend/           # Streamlit
│   └── app.py
├── tests/              # Pytest
├── .github/
│   └── workflows/      # CI GitHub Actions
├── .env.example
├── docker-compose.yml
└── requirements.txt
```

---

## Prérequis

- Python 3.11+
- [uv](https://github.com/astral-sh/uv)
- Docker & Docker Compose
- Terraform >= 1.7
- Azure CLI

---

## Installation

```bash
# Cloner le repo
git clone https://github.com/TON_USERNAME/hr-pulse-ai.git
cd hr-pulse-ai

# Installer les dépendances avec uv (obligatoire)
uv pip install -r requirements.txt

# Copier et remplir le fichier .env
cp .env.example .env
```

---

## Variables d'environnement

Crée un fichier `.env` à la racine (ne jamais commiter ce fichier) :

```env
# Azure SQL
DATABASE_URL=mssql+pyodbc://<user>:<password>@<server>.database.windows.net/<db>?driver=ODBC+Driver+18+for+SQL+Server

# Azure AI Language
AZURE_LANGUAGE_ENDPOINT=https://<resource>.cognitiveservices.azure.com/
AZURE_LANGUAGE_KEY=your_key_here

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

---

## Lancer avec Docker Compose

```bash
docker-compose up --build
```

| Service    | URL                     |
|------------|-------------------------|
| API        | http://localhost:8000    |
| Frontend   | http://localhost:8501    |
| Jaeger UI  | http://localhost:16686   |

---

## Infrastructure Terraform

```bash
cd infra/
terraform init
terraform plan
terraform apply
```

---

## Tests & Qualité

```bash
# Linting
ruff check .

# Tests unitaires
pytest tests/ -v
```

---

## CI/CD (GitHub Actions)

La pipeline se déclenche à chaque push et effectue :

1. **Linting** — Ruff vérifie la qualité du code
2. **Tests** — Pytest valide les fonctionnalités
3. **Build Docker** — Construction des images Backend & Frontend

---

## Fonctionnalités principales

- **Ingestion** : nettoyage automatique du fichier `jobs.csv`
- **NER (IA)** : extraction des compétences via Azure AI Language
- **ML** : prédiction de la fourchette salariale
- **API REST** : liste des jobs, recherche par compétences, prédiction salaire
- **Frontend** : visualisation et chargement de fichiers
- **Observabilité** : traces OpenTelemetry visualisées dans Jaeger

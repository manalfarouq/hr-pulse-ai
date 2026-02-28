# HR-Pulse AI

> Plateforme d'analyse automatique d'offres d'emploi — Azure AI NER, FastAPI, React/Vite, Terraform, Docker & CI/CD.

---

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancer l'application](#lancer-lapplication)
- [API — Endpoints](#api--endpoints)
- [Infrastructure Terraform](#infrastructure-terraform)
- [Tests & Qualité](#tests--qualité)
- [CI/CD](#cicd)
- [Structure du projet](#structure-du-projet)

---

## Vue d'ensemble

HR-Pulse AI automatise l'analyse d'offres d'emploi de bout en bout pour une startup RH fictive. Le pipeline part d'un fichier CSV brut et enchaîne : nettoyage des données, extraction de compétences par IA (Azure NER), prédiction salariale par ML, exposition via API REST et interface visuelle React.

```
CSV brut → Nettoyage → Azure AI NER → Base SQL → API FastAPI → Frontend React/Vite
                                                ↘ ML (prédiction salaire)
```

---

## Architecture

### Vue globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         HR-Pulse AI                             │
│                                                                 │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐  │
│  │  React/Vite │────▶│  FastAPI     │────▶│  Azure SQL DB   │  │
│  │  :4173      │     │  :8000       │     │  (SQLAlchemy)   │  │
│  └─────────────┘     └──────┬───────┘     └─────────────────┘  │
│                             │                                   │
│                    ┌────────┴────────┐                          │
│                    │                 │                          │
│            ┌───────▼──────┐  ┌───────▼──────┐                  │
│            │ Azure AI     │  │ ML Predictor │                  │
│            │ Language NER │  │ (scikit-learn│                  │
│            └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### Pipeline de données

```
data/raw/jobs.csv
        │
        ▼
┌───────────────┐
│  ingestion.py │  Nettoyage + normalisation
└───────┬───────┘
        │
        ▼
┌───────────────────┐
│  Azure AI NER     │  Extraction des compétences
│  (ner_service.py) │  ex: "Python", "SQL", "Agile"
└───────┬───────────┘
        │
        ▼
┌───────────────┐
│  Azure SQL DB │  Stockage structuré
│  Table: jobs  │
└───────┬───────┘
        │
        ▼
┌───────────────────┐
│  predictor.py     │  Entraînement modèle salaire
│  salary_model.pkl │  (régression, scikit-learn)
└───────────────────┘
```

### Architecture d'authentification (JWT)

```
Client (React)
  │
  ├─ POST /auth/register ──▶ Création compte (hash bcrypt) ──▶ Azure SQL
  │
  ├─ POST /auth/login ─────▶ Vérification password ──────────▶ JWT Access Token
  │                                                                    │
  ├─ GET  /auth/me ────────▶ Bearer Token ───▶ Decode JWT ────▶ User info
  │
  └─ POST /auth/logout ────▶ Bearer Token ───▶ 200 OK (stateless)
```

### Infrastructure Azure (Terraform)

```
Azure
├── Resource Group: hr-pulse-rg
│   ├── Azure SQL Server
│   │   └── Database: hr-pulse-db
│   └── Azure AI Language
│       └── Cognitive Services Account
```

### CI/CD GitHub Actions

```
git push
    │
    ▼
┌───────────────────────────────────────┐
│           GitHub Actions              │
│                                       │
│  Job 1: lint                          │
│  └── ruff check backend/ tests/       │
│           │                           │
│           ▼                           │
│  Job 2: tests (needs: lint)           │
│  ├── Install ODBC Driver 18           │
│  └── pytest tests/ -v                 │
│           │                           │
│           ▼                           │
│  Job 3: docker (needs: tests)         │
│  └── docker build Dockerfile.backend  │
└───────────────────────────────────────┘
```

---

## Stack technique

| Couche          | Technologie                         |
|-----------------|-------------------------------------|
| Backend         | FastAPI, SQLAlchemy, Pydantic        |
| Auth            | JWT (python-jose), bcrypt (passlib)  |
| ML              | scikit-learn, pandas, numpy          |
| IA              | Azure AI Language (NER)              |
| Base de données | Azure SQL Server (pyodbc)            |
| Frontend        | React 18, Vite, TailwindCSS          |
| Infra           | Terraform, Azure                     |
| Conteneurs      | Docker, Docker Compose               |
| Qualité         | Ruff, Pytest, ESLint                 |
| CI/CD           | GitHub Actions                       |
| Dépendances     | uv (Python), npm (Node)              |

---

## Prérequis

- Python **3.11+**
- Node.js **20+**
- [uv](https://github.com/astral-sh/uv) — gestionnaire de dépendances Python
- Docker & Docker Compose
- Terraform >= 1.7
- Azure CLI (`az`)
- ODBC Driver 18 for SQL Server

### Installer uv

```bash
curl -Ls https://astral.sh/uv/install.sh | sh
```

### Installer ODBC Driver 18 (Ubuntu/Debian)

```bash
curl -fsSL https://packages.microsoft.com/keys/microsoft.asc \
  | sudo gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] \
  https://packages.microsoft.com/ubuntu/22.04/prod jammy main" \
  | sudo tee /etc/apt/sources.list.d/mssql-release.list

sudo apt-get update
sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18 unixodbc-dev
```

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/TON_USERNAME/hr-pulse-ai.git
cd hr-pulse-ai
```

### 2. Installer les dépendances Python (backend)

```bash
uv sync --frozen
```

### 3. Installer les dépendances Node (frontend)

```bash
cd frontend && npm install && cd ..
```

### 4. Configurer les variables d'environnement

```bash
cp .env.example .env
# Remplir les valeurs dans .env
```

### 5. Provisionner l'infrastructure Azure

```bash
cd infra/
terraform init
terraform plan
terraform apply
# Copier les outputs (DATABASE_URL, AZURE_LANGUAGE_ENDPOINT, etc.) dans .env
cd ..
```

### 6. Lancer l'ingestion des données

```bash
uv run python -m backend.app.services.ingestion
```

### 7. Entraîner le modèle ML

```bash
uv run python -m backend.app.services.predictor
# Génère models/salary_model.pkl
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

# JWT
SECRET_KEY=change-me-in-production-use-openssl-rand-hex-32
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> Générer une `SECRET_KEY` sécurisée : `openssl rand -hex 32`

La variable `VITE_API_URL` est injectée automatiquement par Docker Compose dans le conteneur frontend.

---

## Lancer l'application

### Avec Docker Compose (recommandé)

```bash
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| API      | http://localhost:8000      |
| Docs     | http://localhost:8000/docs |
| Frontend | http://localhost:4173      |

### En local (sans Docker)

```bash
# Terminal 1 — Backend
uv run uvicorn backend.app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
# Accessible sur http://localhost:5173
```

---

## API — Endpoints

### Health

| Méthode | Route     | Description                  |
|---------|-----------|------------------------------|
| GET     | `/health` | Statut API + base de données |

### Authentification

| Méthode | Route            | Description                     | Auth |
|---------|------------------|---------------------------------|------|
| POST    | `/auth/register` | Créer un compte                 | —    |
| POST    | `/auth/login`    | Connexion → retourne JWT        | —    |
| POST    | `/auth/logout`   | Déconnexion (stateless)         | ✅   |
| GET     | `/auth/me`       | Infos de l'utilisateur connecté | ✅   |

### Jobs

| Méthode | Route   | Description               | Auth |
|---------|---------|---------------------------|------|
| GET     | `/jobs` | Liste des offres d'emploi | —    |
| POST    | `/jobs` | Ajouter une offre         | ✅   |

### Prédiction

| Méthode | Route      | Description                   | Auth |
|---------|------------|-------------------------------|------|
| POST    | `/predict` | Prédire le salaire d'un poste | —    |

> La documentation interactive complète est disponible sur **http://localhost:8000/docs** (Swagger UI).

#### Exemple — Register

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "username": "johndoe", "password": "motdepasse123"}'
```

#### Exemple — Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "motdepasse123"}'
# Réponse : {"access_token": "eyJ...", "token_type": "bearer"}
```

#### Exemple — Prédiction salaire

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"job_title": "Data Engineer", "skills": ["Python", "SQL", "Spark"]}'
```

---

## Infrastructure Terraform

```bash
cd infra/
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"

# Détruire (attention)
terraform destroy
```

Les ressources provisionnées :
- **Azure SQL Server** + base de données `hr-pulse-db`
- **Azure AI Language** (Cognitive Services) pour le NER

---

## Tests & Qualité

### Linting Python

```bash
uv run ruff check backend/ tests/
```

### Linting JavaScript

```bash
cd frontend && npm run lint
```

### Tests unitaires

```bash
uv run pytest tests/ -v
```

### Tests avec couverture

```bash
uv run pytest tests/ -v --cov=backend --cov-report=term-missing
```

---

## CI/CD

La pipeline GitHub Actions (`.github/workflows/ci.yml`) se déclenche sur chaque push vers `main`, `develop` et `feature/**`.

**3 jobs enchaînés :**

1. **lint** — Ruff vérifie la qualité du code Python
2. **tests** — Pytest valide les fonctionnalités (nécessite `lint`)
3. **docker** — Build de l'image backend (nécessite `tests`)

**Secrets GitHub requis :**

| Secret                    | Description                  |
|---------------------------|------------------------------|
| `DATABASE_URL`            | Connexion Azure SQL           |
| `AZURE_LANGUAGE_ENDPOINT` | Endpoint Azure AI Language    |
| `AZURE_LANGUAGE_KEY`      | Clé Azure AI Language         |

---

## Structure du projet

```
hr-pulse-ai/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Pipeline CI/CD
├── backend/
│   └── app/
│       ├── core/
│       │   ├── config.py           # Settings (Pydantic BaseSettings)
│       │   └── security.py         # JWT + hash password
│       ├── database/
│       │   └── database.py         # Engine SQLAlchemy + get_db
│       ├── models/
│       │   ├── models.py           # Modèles SQLAlchemy (jobs)
│       │   └── user.py             # Modèle SQLAlchemy User
│       ├── routes/
│       │   ├── routes_auth.py      # /auth/register /login /logout /me
│       │   ├── routes_jobs.py      # /jobs
│       │   └── routes_predict.py   # /predict
│       ├── schemas/
│       │   ├── models_schema.py    # Schémas Pydantic (jobs)
│       │   └── auth_schema.py      # Schémas Pydantic (auth)
│       ├── services/
│       │   ├── db_service.py       # Requêtes DB
│       │   ├── ingestion.py        # Nettoyage CSV
│       │   ├── ner_service.py      # Azure AI NER
│       │   └── predictor.py        # Modèle ML salaire
│       └── main.py                 # Entrée FastAPI
├── data/
│   └── raw/
│       └── jobs.csv                # Données brutes
├── frontend/                       # React 18 + Vite + TailwindCSS
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── App.jsx                 # Composant principal (Hero, Pipeline, Predict...)
│   │   ├── App.css
│   │   ├── main.jsx                # Entrée React
│   │   └── index.css               # Styles globaux + TailwindCSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
├── infra/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── models/
│   └── salary_model.pkl            # Modèle ML entraîné
├── tests/
│   ├── test_ingestion.py
│   └── test_predictor.py
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── main.py
├── pyproject.toml
├── uv.lock
└── README.md
```

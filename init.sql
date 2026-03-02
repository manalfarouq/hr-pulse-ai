-- init.sql
-- Base de données HR-Pulse AI — PostgreSQL

-- Extension UUID (optionnel mais utile)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Table users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id               SERIAL PRIMARY KEY,
    email            VARCHAR(255) NOT NULL UNIQUE,
    username         VARCHAR(100) NOT NULL UNIQUE,
    hashed_password  VARCHAR(255) NOT NULL,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_username ON users(username);

-- ── Table jobs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
    id               SERIAL PRIMARY KEY,
    job_title        VARCHAR(255) NOT NULL,
    skills_extracted TEXT        NOT NULL
);

-- ── Seed data (optionnel — pour tester) ───────────────────────────
INSERT INTO jobs (job_title, skills_extracted) VALUES
  ('Data Engineer',       'Python, SQL, Spark, Azure, Docker'),
  ('ML Engineer',         'Python, scikit-learn, TensorFlow, MLflow'),
  ('Backend Developer',   'FastAPI, Python, PostgreSQL, Docker, Redis'),
  ('DevOps Engineer',     'Docker, Kubernetes, Terraform, CI/CD, Azure'),
  ('Data Analyst',        'SQL, Python, Power BI, Excel, Tableau')
ON CONFLICT DO NOTHING;
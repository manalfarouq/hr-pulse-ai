# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database.database import check_connection, init_db
from .routes.routes_jobs import router as jobs_router
from .routes.routes_predict import router as predict_router
from .routes.routes_auth import router as auth_router

app = FastAPI(title="HR-Pulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/health", tags=["Health"])
def health():
    return {
        "api": "ok",
        "database": "connected" if check_connection() else "unreachable",
    }


app.include_router(jobs_router)
app.include_router(predict_router)
app.include_router(auth_router)
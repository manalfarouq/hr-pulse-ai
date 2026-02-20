"""FastAPI entry point + OpenTelemetry"""
import logging

from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from app.core.config import settings
from app.database.database import init_db
from app.routes.routes_jobs import router as jobs_router
from app.routes.routes_predict import router as predict_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ── OpenTelemetry ─────────────────────────────────────────────────────────────
def setup_telemetry():
    resource = Resource.create({"service.name": settings.OTEL_SERVICE_NAME})
    provider = TracerProvider(resource=resource)
    exporter = OTLPSpanExporter(
        endpoint=settings.OTEL_EXPORTER_OTLP_ENDPOINT,
        insecure=True,
    )
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)
    logger.info(f"Telemetry configurée → {settings.OTEL_EXPORTER_OTLP_ENDPOINT}")


setup_telemetry()

# ── Application ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Analyse des offres d'emploi avec Azure AI Language",
    version="1.0.0",
)

FastAPIInstrumentor.instrument_app(app)

app.include_router(jobs_router)
app.include_router(predict_router)


@app.on_event("startup")
def on_startup():
    logger.info("Démarrage HR-Pulse API...")
    init_db()
    logger.info("Base de données initialisée.")


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
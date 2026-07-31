"""FastAPI Data Platform application entry point."""

from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.ingest import router as ingest_router
from app.api.query import router as query_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Data ingestion, ETL, and analytics API",
)

app.include_router(health_router, prefix="/api", tags=["health"])
app.include_router(ingest_router, prefix="/api/ingest", tags=["ingest"])
app.include_router(query_router, prefix="/api/query", tags=["query"])

"""FastAPI application entry point."""

from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.ai import router as ai_router
from app.api.billing import router as billing_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="AI inference and document processing API",
)

app.include_router(health_router, prefix="/api", tags=["health"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
app.include_router(billing_router, prefix="/api/billing", tags=["billing"])

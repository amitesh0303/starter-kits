"""Pytest configuration for fastapi-data-platform tests."""

import os

os.environ["APP_ENV"] = "test"
os.environ["JWT_SECRET_KEY"] = "test-secret"

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import create_service_token
from app.main import app


@pytest.fixture
async def client():
    """Create async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def service_token() -> str:
    """Create a valid service JWT token for testing."""
    return create_service_token("test-service")

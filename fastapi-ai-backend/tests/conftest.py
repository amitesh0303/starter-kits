"""Pytest configuration for fastapi-ai-backend tests."""

import os

os.environ["APP_ENV"] = "test"
os.environ["OPENAI_API_KEY"] = "sk-placeholder"
os.environ["STRIPE_SECRET_KEY"] = "sk_test_placeholder"

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.user_store import user_store


@pytest.fixture(autouse=True)
def reset_user_store():
    """Reset in-memory user store between tests."""
    user_store.reset()
    yield
    user_store.reset()


@pytest.fixture
async def client():
    """Create async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def auth_token(client: AsyncClient) -> str:
    """Register a user and return their auth token."""
    await client.post("/api/auth/register", json={"email": "test@example.com", "password": "TestPass123!"})
    resp = await client.post("/api/auth/token", json={"email": "test@example.com", "password": "TestPass123!"})
    return resp.json()["access_token"]

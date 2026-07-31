"""AI endpoint tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_completion_requires_auth(client: AsyncClient):
    """AI completion endpoint requires authentication."""
    response = await client.post("/api/ai/completions", json={"prompt": "Hello"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_completion_success(client: AsyncClient, auth_token: str):
    """AI completion endpoint returns response with fake provider."""
    response = await client.post(
        "/api/ai/completions",
        json={"prompt": "What is AI?", "max_tokens": 100},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "text" in data
    assert "model" in data
    assert "usage" in data
    assert data["usage"]["total_tokens"] > 0

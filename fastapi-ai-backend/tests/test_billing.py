"""Billing endpoint tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_checkout_requires_auth(client: AsyncClient):
    """Checkout endpoint requires authentication."""
    response = await client.post("/api/billing/checkout", json={"price_id": "price_123"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_checkout_session(client: AsyncClient, auth_token: str):
    """Create checkout session returns URL and session ID."""
    response = await client.post(
        "/api/billing/checkout",
        json={"price_id": "price_pro_monthly"},
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert "session_id" in data


@pytest.mark.asyncio
async def test_get_subscription(client: AsyncClient, auth_token: str):
    """Get subscription returns status info."""
    response = await client.get(
        "/api/billing/subscription",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data

"""Analytics query endpoint tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_query_requires_auth(client: AsyncClient):
    """Query endpoint requires service token."""
    response = await client.post(
        "/api/query/execute",
        json={"sql": "SELECT 1"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_execute_query(client: AsyncClient, service_token: str):
    """Query endpoint returns results from analytics engine."""
    response = await client.post(
        "/api/query/execute",
        json={"sql": "SELECT * FROM events", "limit": 10},
        headers={"Authorization": f"Bearer {service_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "columns" in data
    assert "rows" in data
    assert "row_count" in data
    assert data["row_count"] >= 0

"""Data ingestion endpoint tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_ingest_requires_auth(client: AsyncClient):
    """Ingest endpoint requires service token."""
    response = await client.post(
        "/api/ingest/upload",
        json={"source": "s3://bucket/file.csv", "destination_key": "data/file.csv"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_ingest_upload(client: AsyncClient, service_token: str):
    """Ingest endpoint accepts data and returns job ID."""
    response = await client.post(
        "/api/ingest/upload",
        json={"source": "s3://bucket/file.csv", "destination_key": "data/file.csv"},
        headers={"Authorization": f"Bearer {service_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "queued"
    assert data["destination_key"] == "data/file.csv"


@pytest.mark.asyncio
async def test_get_job_status(client: AsyncClient, service_token: str):
    """Job status endpoint returns progress info."""
    response = await client.get(
        "/api/ingest/status/fake-job-123",
        headers={"Authorization": f"Bearer {service_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"

"""Basic health endpoint test to verify project loads correctly."""

import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client() -> APIClient:
    """Create an API test client."""
    return APIClient()


@pytest.mark.django_db
def test_health_returns_200(api_client: APIClient) -> None:
    """Health endpoint returns 200 with status and timestamp."""
    response = api_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data

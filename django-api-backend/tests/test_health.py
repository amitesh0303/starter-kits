"""Health endpoint tests."""

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


@pytest.mark.django_db
def test_health_no_auth_required(api_client: APIClient) -> None:
    """Health endpoint does not require authentication."""
    response = api_client.get("/health")
    assert response.status_code == 200


@pytest.mark.django_db
def test_health_response_shape(api_client: APIClient) -> None:
    """Health endpoint returns exactly the expected fields."""
    response = api_client.get("/health")
    data = response.json()
    assert set(data.keys()) == {"status", "timestamp"}
    assert isinstance(data["timestamp"], str)
    # Timestamp should be ISO format
    assert "T" in data["timestamp"]

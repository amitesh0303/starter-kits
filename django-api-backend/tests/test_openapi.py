"""OpenAPI schema tests.

Verifies that the OpenAPI schema is generated, contains all endpoints,
and documents authentication requirements.
"""

from __future__ import annotations

import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestOpenAPISchema:
    """Tests for OpenAPI schema generation."""

    def test_schema_endpoint_returns_200(self, api_client: APIClient) -> None:
        """The /api/schema/ endpoint returns 200."""
        response = api_client.get("/api/schema/?format=json")
        assert response.status_code == 200

    def test_schema_has_openapi_version(self, api_client: APIClient) -> None:
        """Schema contains OpenAPI version."""
        response = api_client.get("/api/schema/?format=json")
        data = response.json()
        assert "openapi" in data
        assert data["openapi"].startswith("3.")

    def test_schema_has_info(self, api_client: APIClient) -> None:
        """Schema contains info block with title and version."""
        response = api_client.get("/api/schema/?format=json")
        data = response.json()
        assert "info" in data
        assert "title" in data["info"]
        assert "version" in data["info"]

    def test_schema_contains_health_endpoint(self, api_client: APIClient) -> None:
        """Schema documents the /health endpoint."""
        response = api_client.get("/api/schema/?format=json")
        paths = response.json().get("paths", {})
        assert "/health" in paths

    def test_schema_contains_auth_endpoints(self, api_client: APIClient) -> None:
        """Schema documents auth register, login, logout endpoints."""
        response = api_client.get("/api/schema/?format=json")
        paths = response.json().get("paths", {})
        assert "/api/auth/register/" in paths
        assert "/api/auth/login/" in paths
        assert "/api/auth/logout/" in paths

    def test_schema_contains_resources_endpoints(self, api_client: APIClient) -> None:
        """Schema documents resources CRUD endpoints."""
        response = api_client.get("/api/schema/?format=json")
        paths = response.json().get("paths", {})
        assert "/api/resources/" in paths
        assert "/api/resources/{id}/" in paths

    def test_schema_contains_webhook_endpoint(self, api_client: APIClient) -> None:
        """Schema documents the Stripe webhook endpoint."""
        response = api_client.get("/api/schema/?format=json")
        paths = response.json().get("paths", {})
        assert "/api/webhooks/stripe/" in paths

    def test_schema_contains_subscription_endpoint(self, api_client: APIClient) -> None:
        """Schema documents the subscription status endpoint."""
        response = api_client.get("/api/schema/?format=json")
        paths = response.json().get("paths", {})
        assert "/api/subscriptions/me/" in paths

    def test_schema_documents_security(self, api_client: APIClient) -> None:
        """Schema defines security schemes."""
        response = api_client.get("/api/schema/?format=json")
        data = response.json()
        components = data.get("components", {})
        security_schemes = components.get("securitySchemes", {})
        # Should have at least one auth scheme defined
        assert len(security_schemes) > 0

"""Rate limiting tests (Property 7): configurable rate-limit bound."""

from __future__ import annotations

from unittest.mock import patch

import pytest
from django.core.cache import cache
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestRateLimit:
    """Tests for configurable rate limiting on API resources."""

    def setup_method(self) -> None:
        """Clear rate limit cache before each test."""
        cache.clear()

    def test_rate_limit_returns_429(self, authenticated_client: APIClient) -> None:
        """Exceeding rate limit returns 429 with stable error shape."""
        # Set a very low rate limit for testing
        with patch("apps.resources.views.get_rate_limit_rate", return_value="2/60s"):
            # Clear cache before test
            cache.clear()

            # First two requests should succeed
            resp1 = authenticated_client.get("/api/resources/")
            assert resp1.status_code == 200

            resp2 = authenticated_client.get("/api/resources/")
            assert resp2.status_code == 200

            # Third request should be rate limited
            resp3 = authenticated_client.get("/api/resources/")
            assert resp3.status_code == 429
            body = resp3.json()
            assert body["code"] == "rate_limit_exceeded"
            assert "message" in body
            assert "correlationId" in body

    def test_rate_limit_configurable(self, authenticated_client: APIClient) -> None:
        """Rate limit threshold is configurable via settings."""
        with patch("apps.resources.views.get_rate_limit_rate", return_value="5/60s"):
            cache.clear()

            # 5 requests should succeed
            for i in range(5):
                resp = authenticated_client.get("/api/resources/")
                assert resp.status_code == 200, f"Request {i + 1} failed unexpectedly"

            # 6th should be blocked
            resp = authenticated_client.get("/api/resources/")
            assert resp.status_code == 429

    def test_rate_limit_error_shape(self, authenticated_client: APIClient) -> None:
        """Rate limit response conforms to stable error shape."""
        with patch("apps.resources.views.get_rate_limit_rate", return_value="1/60s"):
            cache.clear()

            # Use up the one allowed request
            authenticated_client.get("/api/resources/")

            # Trigger rate limit
            resp = authenticated_client.get("/api/resources/")
            assert resp.status_code == 429
            body = resp.json()

            # Verify stable error shape
            assert "code" in body
            assert "message" in body
            assert "correlationId" in body
            assert body["code"] == "rate_limit_exceeded"

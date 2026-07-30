"""Error shape conformance tests.

Verifies that all error responses conform to the stable shape:
{code: str, message: str, correlationId: str, details?: list}
and that no secrets leak in any error response.
"""

from __future__ import annotations

import json
from typing import Any
from unittest.mock import patch

import pytest
from rest_framework.test import APIClient


def _assert_error_shape(body: dict[str, Any]) -> None:
    """Assert that a response body conforms to the stable error shape."""
    assert "code" in body, f"Missing 'code' in error response: {body}"
    assert "message" in body, f"Missing 'message' in error response: {body}"
    assert "correlationId" in body, f"Missing 'correlationId' in error response: {body}"
    assert isinstance(body["code"], str)
    assert isinstance(body["message"], str)
    assert isinstance(body["correlationId"], str)
    if "details" in body:
        assert isinstance(body["details"], list)


def _assert_no_secrets(body: dict[str, Any]) -> None:
    """Assert no secrets leak in error body."""
    body_str = json.dumps(body)
    secret_patterns = [
        "sk_test",
        "sk_live",
        "whsec_",
        "django-insecure",
        "SECRET_KEY",
        "DATABASE_URL",
    ]
    for pattern in secret_patterns:
        assert pattern not in body_str, f"Secret pattern '{pattern}' found in error: {body_str}"


@pytest.mark.django_db
class TestErrorShapeConformance:
    """Tests that all error responses conform to stable shape."""

    def test_401_error_shape(self, api_client: APIClient) -> None:
        """Unauthenticated request returns stable error shape."""
        response = api_client.get("/api/resources/")
        assert response.status_code == 401
        body = response.json()
        _assert_error_shape(body)
        _assert_no_secrets(body)

    def test_404_error_shape(self, authenticated_client: APIClient) -> None:
        """Not found returns stable error shape."""
        import uuid

        response = authenticated_client.get(f"/api/resources/{uuid.uuid4()}/")
        assert response.status_code == 404
        body = response.json()
        _assert_error_shape(body)
        _assert_no_secrets(body)

    def test_400_validation_error_shape(self, authenticated_client: APIClient) -> None:
        """Validation error returns stable error shape with details."""
        response = authenticated_client.post("/api/resources/", {}, format="json")
        assert response.status_code == 400
        body = response.json()
        _assert_error_shape(body)
        assert "details" in body
        _assert_no_secrets(body)

    def test_login_failure_error_shape(self, api_client: APIClient) -> None:
        """Failed login returns stable error shape."""
        data = {"email": "nobody@example.com", "password": "wrong"}
        response = api_client.post("/api/auth/login/", data, format="json")
        assert response.status_code == 401
        body = response.json()
        _assert_error_shape(body)
        _assert_no_secrets(body)

    def test_webhook_invalid_sig_error_shape(self, api_client: APIClient) -> None:
        """Invalid webhook signature returns stable error shape."""
        event_data = {"id": "evt_test", "type": "test", "data": {}}
        with patch(
            "apps.billing.views.verify_webhook_signature",
            side_effect=ValueError("bad"),
        ):
            response = api_client.post(
                "/api/webhooks/stripe/",
                data=json.dumps(event_data),
                content_type="application/json",
                HTTP_STRIPE_SIGNATURE="bad",
            )
        assert response.status_code == 400
        body = response.json()
        _assert_error_shape(body)
        _assert_no_secrets(body)

    def test_subscription_not_found_error_shape(self, authenticated_client: APIClient) -> None:
        """Subscription not found returns stable error shape."""
        response = authenticated_client.get("/api/subscriptions/me/")
        assert response.status_code == 404
        body = response.json()
        _assert_error_shape(body)
        _assert_no_secrets(body)

    def test_correlation_id_in_response_header(self, api_client: APIClient) -> None:
        """All responses include X-Correlation-ID header."""
        response = api_client.get("/health")
        assert "X-Correlation-ID" in response
        assert len(response["X-Correlation-ID"]) > 0

    def test_correlation_id_passed_through(self, api_client: APIClient) -> None:
        """Provided X-Correlation-ID is echoed back."""
        custom_id = "test-correlation-12345"
        response = api_client.get("/health", HTTP_X_CORRELATION_ID=custom_id)
        assert response["X-Correlation-ID"] == custom_id

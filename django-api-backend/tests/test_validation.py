"""Validation and error sanitization tests (Property 6).

Property 6: API validation rejects invalid data before domain processing,
error response uses stable sanitized shape without secrets/stack traces,
and pre-request state is preserved on validation failure.
"""

from __future__ import annotations

import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestValidationRejectsInvalid:
    """Tests that invalid data is rejected with proper error shape."""

    def test_missing_required_field(self, authenticated_client: APIClient) -> None:
        """Missing required 'name' field returns 400 with validation_error."""
        response = authenticated_client.post("/api/resources/", {}, format="json")
        assert response.status_code == 400
        body = response.json()
        assert body["code"] == "validation_error"
        assert body["message"] == "Validation failed."
        assert "details" in body
        # Should reference the 'name' field
        field_names = [d["field"] for d in body["details"]]
        assert "name" in field_names

    def test_invalid_email_on_register(self, api_client: APIClient) -> None:
        """Invalid email format is rejected."""
        data = {"email": "not-an-email", "username": "user1", "password": "StrongPass99!"}
        response = api_client.post("/api/auth/register/", data, format="json")
        assert response.status_code == 400

    def test_short_password_on_register(self, api_client: APIClient) -> None:
        """Too short password is rejected."""
        data = {"email": "valid@example.com", "username": "user1", "password": "short"}
        response = api_client.post("/api/auth/register/", data, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestErrorSanitization:
    """Tests that error responses are sanitized and contain no secrets."""

    def test_no_stack_trace_in_error(self, authenticated_client: APIClient) -> None:
        """Error responses do not contain stack traces."""
        response = authenticated_client.post("/api/resources/", {}, format="json")
        body = response.json()
        body_str = str(body)
        assert "Traceback" not in body_str
        assert "File " not in body_str

    def test_no_secrets_in_error(self, authenticated_client: APIClient) -> None:
        """Error responses do not contain secret values."""
        response = authenticated_client.post("/api/resources/", {}, format="json")
        body_str = str(response.json())
        assert "sk_test" not in body_str
        assert "whsec_" not in body_str
        assert "DJANGO_SECRET_KEY" not in body_str

    def test_error_has_stable_shape(self, api_client: APIClient) -> None:
        """All error responses have code, message, and correlationId."""
        response = api_client.get("/api/resources/")
        assert response.status_code == 401
        body = response.json()
        assert "code" in body
        assert "message" in body
        assert "correlationId" in body


@pytest.mark.django_db
class TestStatePreservation:
    """Tests that validation failure preserves pre-request state."""

    def test_failed_create_preserves_state(self, authenticated_client: APIClient) -> None:
        """Failed create does not leave partial data in the database."""
        from apps.resources.models import APIResource

        # Count resources before
        count_before = APIResource.objects.count()

        # Attempt invalid create
        response = authenticated_client.post("/api/resources/", {}, format="json")
        assert response.status_code == 400

        # Count resources after - unchanged
        count_after = APIResource.objects.count()
        assert count_after == count_before

    def test_failed_update_preserves_state(self, authenticated_client: APIClient) -> None:
        """Failed update preserves the original resource state."""
        # Create a resource
        create_resp = authenticated_client.post(
            "/api/resources/", {"name": "Immutable"}, format="json"
        )
        resource_id = create_resp.json()["id"]

        # Attempt invalid update (empty name should fail due to blank=False)
        response = authenticated_client.put(
            f"/api/resources/{resource_id}/",
            {"name": ""},
            format="json",
        )
        assert response.status_code == 400

        # Verify resource is unchanged
        get_resp = authenticated_client.get(f"/api/resources/{resource_id}/")
        assert get_resp.json()["name"] == "Immutable"

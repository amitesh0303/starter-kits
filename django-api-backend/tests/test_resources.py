"""APIResource CRUD lifecycle tests."""

from __future__ import annotations

from typing import Any

import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestResourceCreate:
    """Tests for POST /api/resources/."""

    def test_create_resource(self, authenticated_client: APIClient) -> None:
        """Create a resource with valid data returns 201."""
        data = {"name": "My Resource", "description": "A test resource", "data": {"key": "val"}}
        response = authenticated_client.post("/api/resources/", data, format="json")
        assert response.status_code == 201
        body = response.json()
        assert body["name"] == "My Resource"
        assert body["description"] == "A test resource"
        assert body["data"] == {"key": "val"}
        assert "id" in body
        assert "created_at" in body
        assert "updated_at" in body

    def test_create_resource_minimal(self, authenticated_client: APIClient) -> None:
        """Create a resource with only required name field."""
        data = {"name": "Minimal"}
        response = authenticated_client.post("/api/resources/", data, format="json")
        assert response.status_code == 201
        body = response.json()
        assert body["name"] == "Minimal"

    def test_create_resource_missing_name(self, authenticated_client: APIClient) -> None:
        """Create a resource without name returns 400."""
        response = authenticated_client.post("/api/resources/", {}, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestResourceRetrieve:
    """Tests for GET /api/resources/{id}/."""

    def test_retrieve_own_resource(self, authenticated_client: APIClient) -> None:
        """Retrieve a resource the user owns."""
        create_resp = authenticated_client.post(
            "/api/resources/", {"name": "Fetch Me"}, format="json"
        )
        resource_id = create_resp.json()["id"]

        response = authenticated_client.get(f"/api/resources/{resource_id}/")
        assert response.status_code == 200
        assert response.json()["name"] == "Fetch Me"

    def test_retrieve_nonexistent_resource(self, authenticated_client: APIClient) -> None:
        """Retrieve a non-existent resource returns 404."""
        import uuid

        fake_id = str(uuid.uuid4())
        response = authenticated_client.get(f"/api/resources/{fake_id}/")
        assert response.status_code == 404


@pytest.mark.django_db
class TestResourceUpdate:
    """Tests for PUT /api/resources/{id}/."""

    def test_update_own_resource(self, authenticated_client: APIClient) -> None:
        """Full update of own resource succeeds."""
        create_resp = authenticated_client.post(
            "/api/resources/", {"name": "Original"}, format="json"
        )
        resource_id = create_resp.json()["id"]

        update_data = {"name": "Updated", "description": "New desc", "data": {"new": True}}
        response = authenticated_client.put(
            f"/api/resources/{resource_id}/", update_data, format="json"
        )
        assert response.status_code == 200
        body = response.json()
        assert body["name"] == "Updated"
        assert body["description"] == "New desc"
        assert body["data"] == {"new": True}


@pytest.mark.django_db
class TestResourcePartialUpdate:
    """Tests for PATCH /api/resources/{id}/."""

    def test_partial_update_own_resource(self, authenticated_client: APIClient) -> None:
        """Partial update of own resource succeeds."""
        create_resp = authenticated_client.post(
            "/api/resources/",
            {"name": "Partial", "description": "Original desc"},
            format="json",
        )
        resource_id = create_resp.json()["id"]

        response = authenticated_client.patch(
            f"/api/resources/{resource_id}/", {"name": "Patched"}, format="json"
        )
        assert response.status_code == 200
        body = response.json()
        assert body["name"] == "Patched"
        assert body["description"] == "Original desc"  # unchanged


@pytest.mark.django_db
class TestResourceDelete:
    """Tests for DELETE /api/resources/{id}/."""

    def test_delete_own_resource(self, authenticated_client: APIClient) -> None:
        """Delete own resource returns 204."""
        create_resp = authenticated_client.post(
            "/api/resources/", {"name": "Delete Me"}, format="json"
        )
        resource_id = create_resp.json()["id"]

        response = authenticated_client.delete(f"/api/resources/{resource_id}/")
        assert response.status_code == 204

        # Verify it's gone
        response = authenticated_client.get(f"/api/resources/{resource_id}/")
        assert response.status_code == 404


@pytest.mark.django_db
class TestResourceList:
    """Tests for GET /api/resources/."""

    def test_list_only_own_resources(self, create_user: Any) -> None:
        """List only returns resources owned by the authenticated user."""
        from rest_framework.authtoken.models import Token

        user1 = create_user(email="owner1@example.com", username="owner1", password="Pass1234!")
        token1, _ = Token.objects.get_or_create(user=user1)
        client1 = APIClient()
        client1.credentials(HTTP_AUTHORIZATION=f"Token {token1.key}")

        user2 = create_user(email="owner2@example.com", username="owner2", password="Pass5678!")
        token2, _ = Token.objects.get_or_create(user=user2)
        client2 = APIClient()
        client2.credentials(HTTP_AUTHORIZATION=f"Token {token2.key}")

        # User1 creates 2 resources
        client1.post("/api/resources/", {"name": "User1 Res1"}, format="json")
        client1.post("/api/resources/", {"name": "User1 Res2"}, format="json")

        # User2 creates 1 resource
        client2.post("/api/resources/", {"name": "User2 Res1"}, format="json")

        # User1 should see only their 2 resources
        response = client1.get("/api/resources/")
        assert response.status_code == 200
        results = response.json()["results"]
        assert len(results) == 2
        names = {r["name"] for r in results}
        assert names == {"User1 Res1", "User1 Res2"}

        # User2 should see only their 1 resource
        response = client2.get("/api/resources/")
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["name"] == "User2 Res1"

    def test_list_validation_error_on_create(self, authenticated_client: APIClient) -> None:
        """Creating with invalid data returns 400 with stable error shape."""
        response = authenticated_client.post("/api/resources/", {}, format="json")
        assert response.status_code == 400
        body = response.json()
        assert body["code"] == "validation_error"
        assert "correlationId" in body
        assert "details" in body

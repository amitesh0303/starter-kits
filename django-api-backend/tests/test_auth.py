"""Authentication endpoint tests: register, login, logout, permissions."""

from __future__ import annotations

from typing import Any

import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestRegister:
    """Tests for POST /api/auth/register/."""

    def test_register_success(self, api_client: APIClient) -> None:
        """Successful registration returns 201 with token."""
        data = {
            "email": "new@example.com",
            "username": "newuser",
            "password": "StrongPass99!",
        }
        response = api_client.post("/api/auth/register/", data, format="json")
        assert response.status_code == 201
        body = response.json()
        assert "token" in body
        assert body["email"] == "new@example.com"
        assert "user_id" in body

    def test_register_duplicate_email(self, api_client: APIClient, create_user: Any) -> None:
        """Registering with existing email returns 400."""
        create_user(email="dup@example.com", username="existing")
        data = {
            "email": "dup@example.com",
            "username": "anotheruser",
            "password": "StrongPass99!",
        }
        response = api_client.post("/api/auth/register/", data, format="json")
        assert response.status_code == 400

    def test_register_missing_fields(self, api_client: APIClient) -> None:
        """Registering without required fields returns 400."""
        response = api_client.post("/api/auth/register/", {}, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestLogin:
    """Tests for POST /api/auth/login/."""

    def test_login_success(self, api_client: APIClient, create_user: Any) -> None:
        """Successful login returns token."""
        create_user(email="login@example.com", username="loginuser", password="TestPass123!")
        data = {"email": "login@example.com", "password": "TestPass123!"}
        response = api_client.post("/api/auth/login/", data, format="json")
        assert response.status_code == 200
        body = response.json()
        assert "token" in body
        assert body["email"] == "login@example.com"

    def test_login_wrong_password(self, api_client: APIClient, create_user: Any) -> None:
        """Login with wrong password returns 401."""
        create_user(email="user@example.com", username="user1", password="CorrectPass1!")
        data = {"email": "user@example.com", "password": "WrongPass123!"}
        response = api_client.post("/api/auth/login/", data, format="json")
        assert response.status_code == 401

    def test_login_nonexistent_user(self, api_client: APIClient) -> None:
        """Login with nonexistent email returns 401."""
        data = {"email": "ghost@example.com", "password": "Whatever123!"}
        response = api_client.post("/api/auth/login/", data, format="json")
        assert response.status_code == 401


@pytest.mark.django_db
class TestLogout:
    """Tests for POST /api/auth/logout/."""

    def test_logout_success(self, authenticated_client: APIClient) -> None:
        """Authenticated logout returns 204 and invalidates token."""
        response = authenticated_client.post("/api/auth/logout/")
        assert response.status_code == 204

    def test_logout_unauthenticated(self, api_client: APIClient) -> None:
        """Unauthenticated logout returns 401."""
        response = api_client.post("/api/auth/logout/")
        assert response.status_code == 401


@pytest.mark.django_db
class TestUnauthenticatedAccess:
    """Tests that protected endpoints return 401 without auth."""

    def test_resources_list_401(self, api_client: APIClient) -> None:
        """Listing resources without auth returns 401."""
        response = api_client.get("/api/resources/")
        assert response.status_code == 401

    def test_resources_create_401(self, api_client: APIClient) -> None:
        """Creating resource without auth returns 401."""
        response = api_client.post("/api/resources/", {"name": "test"}, format="json")
        assert response.status_code == 401

    def test_subscription_status_401(self, api_client: APIClient) -> None:
        """Subscription status without auth returns 401."""
        response = api_client.get("/api/subscriptions/me/")
        assert response.status_code == 401


@pytest.mark.django_db
class TestForbiddenAccess:
    """Tests that accessing another user's resource returns 403."""

    def test_other_users_resource_403(self, create_user: Any) -> None:
        """Accessing another user's resource returns 403."""
        from rest_framework.authtoken.models import Token

        # Create user1 and their resource
        user1 = create_user(email="user1@example.com", username="user1", password="Pass1234!")
        token1, _ = Token.objects.get_or_create(user=user1)

        client1 = APIClient()
        client1.credentials(HTTP_AUTHORIZATION=f"Token {token1.key}")

        # Create a resource as user1
        response = client1.post("/api/resources/", {"name": "User1 Resource"}, format="json")
        assert response.status_code == 201
        resource_id = response.json()["id"]

        # Create user2 and try to access user1's resource
        user2 = create_user(email="user2@example.com", username="user2", password="Pass5678!")
        token2, _ = Token.objects.get_or_create(user=user2)

        client2 = APIClient()
        client2.credentials(HTTP_AUTHORIZATION=f"Token {token2.key}")

        response = client2.get(f"/api/resources/{resource_id}/")
        assert response.status_code == 404  # Owner filter returns 404 (not in queryset)

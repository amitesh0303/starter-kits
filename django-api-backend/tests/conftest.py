"""Pytest configuration for django-api-backend tests."""

from __future__ import annotations

import os
from typing import Any

import pytest
from django.conf import settings
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient


def pytest_configure() -> None:
    """Configure Django settings for tests."""
    os.environ.setdefault("STRIPE_FAKE_MODE", "true")
    settings.DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }


@pytest.fixture
def api_client() -> APIClient:
    """Create an unauthenticated API test client."""
    return APIClient()


@pytest.fixture
def user_data() -> dict[str, str]:
    """Sample user registration data."""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "SecurePass123!",
    }


@pytest.fixture
def create_user(db: Any) -> Any:
    """Factory fixture to create a user."""
    from django.contrib.auth import get_user_model

    user_model = get_user_model()

    def _create_user(
        email: str = "test@example.com",
        username: str = "testuser",
        password: str = "SecurePass123!",
    ) -> Any:
        user = user_model.objects.create_user(username=username, email=email, password=password)
        return user

    return _create_user


@pytest.fixture
def authenticated_client(create_user: Any) -> APIClient:
    """Create an authenticated API client with a token."""
    user = create_user()
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def user_with_token(create_user: Any) -> tuple[Any, str]:
    """Create a user and return (user, token_key) tuple."""
    user = create_user()
    token, _ = Token.objects.get_or_create(user=user)
    return user, token.key

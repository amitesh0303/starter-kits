"""Pytest configuration for django-api-backend tests."""

from django.conf import settings


def pytest_configure() -> None:
    """Configure Django settings for tests."""
    settings.DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }

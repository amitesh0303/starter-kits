"""Custom User model for allauth integration."""

from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Custom user model extending Django's AbstractUser.

    Provides a foundation for allauth email-based authentication
    and future profile extensions.
    """

    class Meta:
        db_table = "accounts_user"

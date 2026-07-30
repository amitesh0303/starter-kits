"""Account serializers for auth endpoints."""

from typing import Any

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.Serializer[Any]):
    """Registration request serializer."""

    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True, min_length=3, max_length=150)
    password = serializers.CharField(required=True, min_length=8, write_only=True)

    def validate_email(self, value: str) -> str:
        """Ensure email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value: str) -> str:
        """Ensure username is unique."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value


class LoginSerializer(serializers.Serializer[Any]):
    """Login request serializer."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class TokenResponseSerializer(serializers.Serializer[Any]):
    """Token response serializer."""

    token = serializers.CharField()
    user_id = serializers.IntegerField()
    email = serializers.EmailField()

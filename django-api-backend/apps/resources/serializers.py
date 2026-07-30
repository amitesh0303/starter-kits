"""APIResource serializers."""

from typing import Any

from rest_framework import serializers

from apps.resources.models import APIResource


class APIResourceSerializer(serializers.ModelSerializer[Any]):
    """Serializer for APIResource - full representation."""

    class Meta:
        model = APIResource
        fields = ["id", "name", "description", "data", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class APIResourceCreateSerializer(serializers.ModelSerializer[Any]):
    """Serializer for creating an APIResource."""

    class Meta:
        model = APIResource
        fields = ["name", "description", "data"]

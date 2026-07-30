"""APIResource domain model."""

import uuid

from django.conf import settings
from django.db import models


class APIResource(models.Model):
    """A generic API resource owned by a user.

    Demonstrates UUID primary key, JSON field, ownership,
    and timestamp patterns.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="api_resources",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "resources_apiresource"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name

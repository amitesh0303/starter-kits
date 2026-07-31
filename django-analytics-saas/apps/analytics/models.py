from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Dashboard(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="dashboards")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "analytics"


class Report(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending"
        RUNNING = "running"
        COMPLETED = "completed"
        FAILED = "failed"

    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE, related_name="reports")
    title = models.CharField(max_length=255)
    query = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    result_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "analytics"

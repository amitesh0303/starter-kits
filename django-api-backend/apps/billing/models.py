"""Billing domain models: Subscription and ProcessedEvent."""

import uuid

from django.conf import settings
from django.db import models


class SubscriptionStatus(models.TextChoices):
    """Subscription status enum."""

    ACTIVE = "active", "Active"
    CANCELED = "canceled", "Canceled"
    PAST_DUE = "past_due", "Past Due"
    INCOMPLETE = "incomplete", "Incomplete"


class Subscription(models.Model):
    """Stripe subscription linked to a user.

    Tracks the state of a user's subscription including
    Stripe identifiers and billing period.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscription",
    )
    stripe_subscription_id = models.CharField(max_length=255, unique=True)
    stripe_customer_id = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.INCOMPLETE,
    )
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "billing_subscription"

    def __str__(self) -> str:
        return f"Subscription({self.stripe_subscription_id}, {self.status})"


class ProcessedEvent(models.Model):
    """Tracks processed webhook events for idempotency.

    Prevents duplicate processing of the same webhook event
    from a payment provider.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider_event_id = models.CharField(max_length=255, unique=True)
    event_type = models.CharField(max_length=255)
    payload = models.JSONField(default=dict)
    processed_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "billing_processedevent"

    def __str__(self) -> str:
        return f"ProcessedEvent({self.provider_event_id}, {self.event_type})"

"""Billing serializers."""

from typing import Any

from rest_framework import serializers

from apps.billing.models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer[Any]):
    """Serializer for user subscription status."""

    class Meta:
        model = Subscription
        fields = [
            "id",
            "stripe_subscription_id",
            "stripe_customer_id",
            "status",
            "current_period_start",
            "current_period_end",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

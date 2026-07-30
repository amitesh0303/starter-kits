"""Billing views: Stripe webhook and subscription status."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any, cast

import structlog
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.billing.models import ProcessedEvent, Subscription, SubscriptionStatus
from apps.billing.serializers import SubscriptionSerializer
from apps.billing.stripe_provider import verify_webhook_signature
from apps.core.middleware import get_correlation_id

logger = structlog.get_logger()


def _map_stripe_status(stripe_status: str) -> str:
    """Map Stripe subscription status to our enum."""
    mapping: dict[str, str] = {
        "active": SubscriptionStatus.ACTIVE,
        "canceled": SubscriptionStatus.CANCELED,
        "past_due": SubscriptionStatus.PAST_DUE,
        "incomplete": SubscriptionStatus.INCOMPLETE,
        "trialing": SubscriptionStatus.ACTIVE,
        "unpaid": SubscriptionStatus.PAST_DUE,
    }
    return mapping.get(stripe_status, SubscriptionStatus.INCOMPLETE)


def _timestamp_to_datetime(ts: int | None) -> datetime | None:
    """Convert Unix timestamp to datetime."""
    if ts is None:
        return None
    return datetime.fromtimestamp(ts, tz=UTC)


def _process_subscription_event(event_data: dict[str, Any]) -> None:
    """Process a subscription lifecycle event from Stripe."""
    subscription_data = event_data.get("data", {}).get("object", {})
    stripe_sub_id: str = subscription_data.get("id", "")
    stripe_customer_id: str = subscription_data.get("customer", "")
    stripe_status: str = subscription_data.get("status", "incomplete")
    period_start: int | None = subscription_data.get("current_period_start")
    period_end: int | None = subscription_data.get("current_period_end")

    event_type: str = event_data.get("type", "")

    if event_type == "customer.subscription.deleted":
        Subscription.objects.filter(stripe_subscription_id=stripe_sub_id).update(
            status=SubscriptionStatus.CANCELED,
        )
        logger.info(
            "stripe.subscription.canceled",
            stripe_subscription_id=stripe_sub_id,
        )
        return

    # For created/updated events
    Subscription.objects.update_or_create(
        stripe_subscription_id=stripe_sub_id,
        defaults={
            "stripe_customer_id": stripe_customer_id,
            "status": _map_stripe_status(stripe_status),
            "current_period_start": _timestamp_to_datetime(period_start),
            "current_period_end": _timestamp_to_datetime(period_end),
        },
    )
    logger.info(
        "stripe.subscription.updated",
        stripe_subscription_id=stripe_sub_id,
        status=stripe_status,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def stripe_webhook(request: Request) -> Response:
    """Stripe webhook endpoint.

    Verifies raw body signature, checks idempotency via ProcessedEvent,
    and updates Subscription state based on event type.
    """
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
    payload = request.body

    try:
        event_data = verify_webhook_signature(payload, sig_header)
    except Exception:
        return Response(
            {
                "code": "webhook_signature_invalid",
                "message": "Invalid webhook signature.",
                "correlationId": get_correlation_id(),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    event_id: str = event_data.get("id", "")
    event_type: str = event_data.get("type", "")

    # Idempotency check
    if ProcessedEvent.objects.filter(provider_event_id=event_id).exists():
        logger.info("stripe.webhook.duplicate", event_id=event_id)
        return Response({"status": "already_processed"})

    # Process within a transaction for pre-commit rollback guarantee
    with transaction.atomic():
        ProcessedEvent.objects.create(
            provider_event_id=event_id,
            event_type=event_type,
            payload=event_data,
        )

        subscription_events = {
            "customer.subscription.created",
            "customer.subscription.updated",
            "customer.subscription.deleted",
        }

        if event_type in subscription_events:
            _process_subscription_event(event_data)

    logger.info("stripe.webhook.processed", event_id=event_id, event_type=event_type)
    return Response({"status": "processed"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def subscription_status(request: Request) -> Response:
    """Get the current user's subscription status."""
    user = cast(Any, request.user)
    try:
        sub = Subscription.objects.get(user=user)
    except Subscription.DoesNotExist:
        return Response(
            {
                "code": "not_found",
                "message": "No subscription found.",
                "correlationId": get_correlation_id(),
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = SubscriptionSerializer(sub)
    return Response(serializer.data)

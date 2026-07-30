"""Stripe webhook tests (Property 5): webhook authenticity gates state transition."""

from __future__ import annotations

import json
from typing import Any
from unittest.mock import patch

import pytest
from rest_framework.test import APIClient

from apps.billing.models import ProcessedEvent, Subscription


@pytest.fixture
def webhook_client() -> APIClient:
    """Create an API client for webhook calls."""
    return APIClient()


def _build_subscription_event(
    event_id: str = "evt_test_001",
    event_type: str = "customer.subscription.created",
    sub_id: str = "sub_test_123",
    customer_id: str = "cus_test_456",
    status: str = "active",
) -> dict[str, Any]:
    """Build a fake Stripe subscription event payload."""
    return {
        "id": event_id,
        "type": event_type,
        "data": {
            "object": {
                "id": sub_id,
                "customer": customer_id,
                "status": status,
                "current_period_start": 1700000000,
                "current_period_end": 1702600000,
            }
        },
    }


@pytest.mark.django_db
class TestWebhookValidSignature:
    """Tests that valid signature processes event and transitions state."""

    def test_valid_webhook_creates_subscription(self, webhook_client: APIClient) -> None:
        """Valid webhook with subscription.created creates a Subscription."""
        event_data = _build_subscription_event(
            event_id="evt_create_001",
            event_type="customer.subscription.created",
            sub_id="sub_new_123",
            status="active",
        )

        response = webhook_client.post(
            "/api/webhooks/stripe/",
            data=json.dumps(event_data),
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="fake_sig",
        )
        assert response.status_code == 200
        assert response.json()["status"] == "processed"

        # Verify subscription was created
        sub = Subscription.objects.get(stripe_subscription_id="sub_new_123")
        assert sub.status == "active"
        assert sub.stripe_customer_id == "cus_test_456"

    def test_valid_webhook_updates_subscription(self, webhook_client: APIClient) -> None:
        """Valid webhook with subscription.updated updates status."""
        # First create
        create_event = _build_subscription_event(
            event_id="evt_up_001",
            event_type="customer.subscription.created",
            sub_id="sub_upd_123",
            status="active",
        )
        webhook_client.post(
            "/api/webhooks/stripe/",
            data=json.dumps(create_event),
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="sig",
        )

        # Then update to past_due
        update_event = _build_subscription_event(
            event_id="evt_up_002",
            event_type="customer.subscription.updated",
            sub_id="sub_upd_123",
            status="past_due",
        )
        response = webhook_client.post(
            "/api/webhooks/stripe/",
            data=json.dumps(update_event),
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="sig",
        )
        assert response.status_code == 200

        sub = Subscription.objects.get(stripe_subscription_id="sub_upd_123")
        assert sub.status == "past_due"

    def test_valid_webhook_deletes_subscription(self, webhook_client: APIClient) -> None:
        """Valid webhook with subscription.deleted cancels subscription."""
        # Create first
        create_event = _build_subscription_event(
            event_id="evt_del_001",
            event_type="customer.subscription.created",
            sub_id="sub_del_123",
            status="active",
        )
        webhook_client.post(
            "/api/webhooks/stripe/",
            data=json.dumps(create_event),
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="sig",
        )

        # Delete
        delete_event = _build_subscription_event(
            event_id="evt_del_002",
            event_type="customer.subscription.deleted",
            sub_id="sub_del_123",
            status="canceled",
        )
        response = webhook_client.post(
            "/api/webhooks/stripe/",
            data=json.dumps(delete_event),
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="sig",
        )
        assert response.status_code == 200

        sub = Subscription.objects.get(stripe_subscription_id="sub_del_123")
        assert sub.status == "canceled"


@pytest.mark.django_db
class TestWebhookInvalidSignature:
    """Tests that invalid signature returns 400 and preserves state."""

    def test_invalid_signature_returns_400(self, webhook_client: APIClient) -> None:
        """Invalid signature returns 400 with error shape."""
        event_data = _build_subscription_event(event_id="evt_bad_001")

        with patch(
            "apps.billing.views.verify_webhook_signature",
            side_effect=ValueError("Invalid signature"),
        ):
            response = webhook_client.post(
                "/api/webhooks/stripe/",
                data=json.dumps(event_data),
                content_type="application/json",
                HTTP_STRIPE_SIGNATURE="invalid_sig",
            )

        assert response.status_code == 400
        body = response.json()
        assert body["code"] == "webhook_signature_invalid"
        assert "correlationId" in body

    def test_invalid_signature_no_state_change(self, webhook_client: APIClient) -> None:
        """Invalid signature does not create ProcessedEvent or Subscription."""
        event_data = _build_subscription_event(
            event_id="evt_bad_002",
            sub_id="sub_should_not_exist",
        )

        with patch(
            "apps.billing.views.verify_webhook_signature",
            side_effect=ValueError("Bad sig"),
        ):
            webhook_client.post(
                "/api/webhooks/stripe/",
                data=json.dumps(event_data),
                content_type="application/json",
                HTTP_STRIPE_SIGNATURE="bad",
            )

        # No ProcessedEvent created
        assert not ProcessedEvent.objects.filter(provider_event_id="evt_bad_002").exists()
        # No Subscription created
        assert not Subscription.objects.filter(
            stripe_subscription_id="sub_should_not_exist"
        ).exists()


@pytest.mark.django_db
class TestWebhookIdempotency:
    """Tests that duplicate events are processed only once (idempotent)."""

    def test_duplicate_event_is_idempotent(self, webhook_client: APIClient) -> None:
        """Same event_id processed twice results in only one state transition."""
        event_data = _build_subscription_event(
            event_id="evt_dup_001",
            event_type="customer.subscription.created",
            sub_id="sub_idem_123",
            status="active",
        )

        # Process first time
        resp1 = webhook_client.post(
            "/api/webhooks/stripe/",
            data=json.dumps(event_data),
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="sig",
        )
        assert resp1.status_code == 200
        assert resp1.json()["status"] == "processed"

        # Process second time (same event_id)
        resp2 = webhook_client.post(
            "/api/webhooks/stripe/",
            data=json.dumps(event_data),
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="sig",
        )
        assert resp2.status_code == 200
        assert resp2.json()["status"] == "already_processed"

        # Only one ProcessedEvent record
        assert ProcessedEvent.objects.filter(provider_event_id="evt_dup_001").count() == 1
        # Subscription still exists and is unchanged
        sub = Subscription.objects.get(stripe_subscription_id="sub_idem_123")
        assert sub.status == "active"

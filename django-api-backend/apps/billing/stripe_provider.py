"""Stripe provider adapter with fake mode support."""

from __future__ import annotations

import json
import os
from typing import Any

import stripe
import structlog

logger = structlog.get_logger()

# Secrets that must never appear in logs
_SECRET_FIELDS = {"stripe_secret_key", "stripe_webhook_secret", "secret_key"}


def is_fake_mode() -> bool:
    """Check if Stripe fake mode is enabled."""
    fake_mode = os.environ.get("STRIPE_FAKE_MODE", "false").lower() in ("true", "1", "yes")
    secret_key = os.environ.get("STRIPE_SECRET_KEY", "")
    return fake_mode or secret_key.startswith("sk_test_fake")


def verify_webhook_signature(payload: bytes, sig_header: str) -> dict[str, Any]:
    """Verify Stripe webhook signature and return the event.

    In fake mode, accepts any signature and parses the payload directly.
    In real mode, uses stripe.Webhook.construct_event for verification.
    """
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

    if is_fake_mode():
        logger.info("stripe.webhook.fake_mode", action="accepting_without_verification")
        event_data: dict[str, Any] = json.loads(payload)
        return event_data

    try:
        event = stripe.Webhook.construct_event(  # type: ignore[no-untyped-call]
            payload, sig_header, webhook_secret
        )
        return dict(event)
    except stripe.SignatureVerificationError:
        logger.warning("stripe.webhook.signature_invalid")
        raise
    except ValueError:
        logger.warning("stripe.webhook.invalid_payload")
        raise

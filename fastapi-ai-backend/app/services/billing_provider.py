"""Billing provider with fake adapter for testing."""

from __future__ import annotations

from abc import ABC, abstractmethod

from app.core.config import is_fake_mode


class BillingProvider(ABC):
    """Abstract billing provider interface."""

    @abstractmethod
    def create_checkout_session(self, user_id: str, price_id: str) -> dict:
        """Create a checkout session."""
        ...

    @abstractmethod
    def get_subscription(self, user_id: str) -> dict:
        """Get user subscription info."""
        ...


class FakeBillingProvider(BillingProvider):
    """Fake billing provider for testing."""

    def create_checkout_session(self, user_id: str, price_id: str) -> dict:
        return {
            "url": "https://checkout.stripe.com/fake-session",
            "session_id": "cs_fake_123",
        }

    def get_subscription(self, user_id: str) -> dict:
        return {
            "user_id": user_id,
            "status": "active",
            "plan": "pro",
            "current_period_end": "2025-12-31T23:59:59Z",
        }


class StripeBillingProvider(BillingProvider):
    """Real Stripe billing provider."""

    def __init__(self, secret_key: str) -> None:
        import stripe
        stripe.api_key = secret_key
        self._stripe = stripe

    def create_checkout_session(self, user_id: str, price_id: str) -> dict:
        session = self._stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            metadata={"user_id": user_id},
            success_url="http://localhost:3000/success",
            cancel_url="http://localhost:3000/cancel",
        )
        return {"url": session.url, "session_id": session.id}

    def get_subscription(self, user_id: str) -> dict:
        subscriptions = self._stripe.Subscription.list(limit=1)
        if subscriptions.data:
            sub = subscriptions.data[0]
            return {
                "user_id": user_id,
                "status": sub.status,
                "plan": sub["items"]["data"][0]["price"]["id"],
                "current_period_end": sub.current_period_end,
            }
        return {"user_id": user_id, "status": "none", "plan": None, "current_period_end": None}


def get_billing_provider() -> BillingProvider:
    """Get billing provider - fake for testing, real for production."""
    if is_fake_mode():
        return FakeBillingProvider()
    from app.core.config import get_settings
    settings = get_settings()
    return StripeBillingProvider(secret_key=settings.stripe_secret_key)

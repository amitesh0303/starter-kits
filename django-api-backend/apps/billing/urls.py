"""Billing URL configuration."""

from django.urls import path

from apps.billing.views import stripe_webhook, subscription_status

urlpatterns = [
    path("webhooks/stripe/", stripe_webhook, name="stripe-webhook"),
    path("subscriptions/me/", subscription_status, name="subscription-status"),
]

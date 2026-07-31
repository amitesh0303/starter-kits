"""Billing endpoints."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import get_current_user_id
from app.services.billing_provider import get_billing_provider

router = APIRouter()


class CreateCheckoutRequest(BaseModel):
    price_id: str


class CheckoutResponse(BaseModel):
    url: str
    session_id: str


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    request: CreateCheckoutRequest,
    user_id: str = Depends(get_current_user_id),
) -> CheckoutResponse:
    """Create a Stripe checkout session."""
    provider = get_billing_provider()
    result = provider.create_checkout_session(user_id=user_id, price_id=request.price_id)
    return CheckoutResponse(**result)


@router.get("/subscription")
async def get_subscription(
    user_id: str = Depends(get_current_user_id),
) -> dict:
    """Get current user subscription status."""
    provider = get_billing_provider()
    return provider.get_subscription(user_id=user_id)

"""Stable error response shape for all API errors."""

from __future__ import annotations

from typing import Any

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

from apps.core.middleware import get_correlation_id

# Secrets that must never appear in error responses
_REDACTED_KEYS = {
    "stripe_secret_key",
    "stripe_webhook_secret",
    "secret_key",
    "database_url",
    "password",
    "token",
}


def _redact_value(key: str, value: Any) -> Any:
    """Redact sensitive values from error details."""
    if isinstance(key, str) and key.lower() in _REDACTED_KEYS:
        return "[REDACTED]"
    return value


def _build_error_response(
    code: str,
    message: str,
    details: list[dict[str, Any]] | None = None,
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
) -> Response:
    """Build the stable error shape response."""
    body: dict[str, Any] = {
        "code": code,
        "message": message,
        "correlationId": get_correlation_id(),
    }
    if details:
        body["details"] = details
    return Response(body, status=status_code)


def _extract_validation_details(detail: Any) -> list[dict[str, Any]]:
    """Extract validation error details from DRF exception detail."""
    details: list[dict[str, Any]] = []
    if isinstance(detail, dict):
        for field, errors in detail.items():
            if isinstance(errors, list):
                for error in errors:
                    details.append(
                        {
                            "field": field,
                            "message": str(_redact_value(field, error)),
                        }
                    )
            else:
                details.append(
                    {
                        "field": field,
                        "message": str(_redact_value(field, errors)),
                    }
                )
    elif isinstance(detail, list):
        for error in detail:
            details.append({"message": str(error)})
    else:
        details.append({"message": str(detail)})
    return details


def custom_exception_handler(exc: Exception, context: dict[str, Any]) -> Response | None:
    """Custom DRF exception handler producing stable error shape."""
    response = drf_exception_handler(exc, context)

    if response is None:
        return None

    default_code = getattr(exc, "default_code", "error")
    detail = getattr(exc, "detail", str(exc))

    # Validation errors get detailed field-level information
    if default_code == "invalid":
        return _build_error_response(
            code="validation_error",
            message="Validation failed.",
            details=_extract_validation_details(detail),
            status_code=response.status_code,
        )

    return _build_error_response(
        code=str(default_code),
        message=str(detail),
        status_code=response.status_code,
    )

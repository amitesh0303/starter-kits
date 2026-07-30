"""Core middleware: correlation ID tracking."""

import threading
import uuid
from collections.abc import Callable

from django.http import HttpRequest, HttpResponse

_correlation_id: threading.local = threading.local()


def get_correlation_id() -> str:
    """Get the current correlation ID from thread-local storage."""
    return getattr(_correlation_id, "value", "")


class CorrelationIdMiddleware:
    """Middleware to generate or read X-Correlation-ID header.

    Attaches correlation ID to the request, thread-local storage,
    and the response header.
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        correlation_id = request.META.get("HTTP_X_CORRELATION_ID", "")
        if not correlation_id:
            correlation_id = str(uuid.uuid4())

        _correlation_id.value = correlation_id
        request.correlation_id = correlation_id  # type: ignore[attr-defined]

        response = self.get_response(request)
        response["X-Correlation-ID"] = correlation_id
        return response

"""Core views: health endpoint."""

from datetime import UTC, datetime

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request: Request) -> Response:
    """Health check endpoint. Returns 200 with status and timestamp."""
    return Response(
        {
            "status": "healthy",
            "timestamp": datetime.now(tz=UTC).isoformat(),
        }
    )

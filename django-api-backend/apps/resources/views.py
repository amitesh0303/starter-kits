"""APIResource CRUD viewset."""

from __future__ import annotations

from typing import Any, cast

from django.conf import settings
from django.db import transaction
from django.db.models import QuerySet
from django_ratelimit.exceptions import Ratelimited
from rest_framework import permissions, serializers, status, viewsets
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.error_handling import _build_error_response
from apps.resources.models import APIResource
from apps.resources.serializers import APIResourceCreateSerializer, APIResourceSerializer


class IsOwner(permissions.BasePermission):
    """Permission: only the resource owner can access it."""

    def has_object_permission(self, request: Request, view: Any, obj: Any) -> bool:
        """Check if the requesting user owns the resource."""
        return bool(obj.owner == request.user)


def get_rate_limit_rate() -> str:
    """Return the rate limit string from settings."""
    requests = getattr(settings, "RATE_LIMIT_REQUESTS", 100)
    window = getattr(settings, "RATE_LIMIT_WINDOW", 60)
    return f"{requests}/{window}s"


class APIResourceViewSet(viewsets.ModelViewSet):  # type: ignore[type-arg]
    """ViewSet for APIResource CRUD operations.

    - list: paginated, filtered by authenticated owner
    - create: creates resource owned by authenticated user
    - retrieve: owner only
    - update/partial_update: owner only
    - delete: owner only

    All write operations use atomic transactions.
    Returns 401 for unauthenticated, 403 for non-owner.
    Rate-limited per user based on RATE_LIMIT_REQUESTS/RATE_LIMIT_WINDOW settings.
    """

    serializer_class = APIResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    lookup_field = "id"

    def initial(self, request: Request, *args: Any, **kwargs: Any) -> None:
        """Apply rate limiting before dispatching."""
        super().initial(request, *args, **kwargs)
        self._check_rate_limit(request)

    def _check_rate_limit(self, request: Request) -> None:
        """Check rate limit and raise 429 if exceeded."""
        from django_ratelimit.core import is_ratelimited

        rate = get_rate_limit_rate()

        # Use django-ratelimit's core function to check rate
        django_request = request._request
        is_limited = is_ratelimited(
            request=django_request,
            group="api_resources",
            key="user_or_ip",
            rate=rate,
            increment=True,
        )

        if is_limited:
            raise Ratelimited()

    def handle_exception(self, exc: Exception) -> Response:
        """Override to catch Ratelimited before DRF converts it."""
        if isinstance(exc, Ratelimited):
            return _build_error_response(
                code="rate_limit_exceeded",
                message="Rate limit exceeded. Please try again later.",
                status_code=429,
            )
        return super().handle_exception(exc)

    def get_queryset(self) -> QuerySet[APIResource]:
        """Filter resources to those owned by the requesting user."""
        if not self.request.user.is_authenticated:
            return APIResource.objects.none()
        return APIResource.objects.filter(owner=self.request.user)

    def get_serializer_class(self) -> type[serializers.Serializer[Any]]:
        """Use create serializer for create actions."""
        if self.action == "create":
            return APIResourceCreateSerializer
        return APIResourceSerializer

    @transaction.atomic
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Create a new APIResource owned by the authenticated user."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = cast(Any, request.user)
        resource = APIResource.objects.create(
            owner=user,
            **serializer.validated_data,
        )
        output = APIResourceSerializer(resource)
        return Response(output.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Update an APIResource (full update)."""
        instance = self.get_object()
        serializer = APIResourceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        for attr, value in serializer.validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        output = APIResourceSerializer(instance)
        return Response(output.data)

    @transaction.atomic
    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Partially update an APIResource."""
        instance = self.get_object()
        serializer = APIResourceCreateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        for attr, value in serializer.validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        output = APIResourceSerializer(instance)
        return Response(output.data)

    @transaction.atomic
    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Delete an APIResource."""
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

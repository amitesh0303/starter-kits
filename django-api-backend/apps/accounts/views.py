"""Authentication views: register, login, logout."""

from __future__ import annotations

from typing import Any, cast

from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.accounts.serializers import LoginSerializer, RegisterSerializer

User = get_user_model()


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request: Request) -> Response:
    """Register a new user and return an auth token."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    with transaction.atomic():
        user = User.objects.create_user(
            username=serializer.validated_data["username"],
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {"token": token.key, "user_id": user.pk, "email": user.email},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request: Request) -> Response:
    """Authenticate user and return token."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user: Any = authenticate(
        request,
        username=serializer.validated_data["email"],
        password=serializer.validated_data["password"],
    )

    if user is None:
        # Try with username lookup by email
        try:
            user_obj = User.objects.get(email=serializer.validated_data["email"])
            user = authenticate(
                request,
                username=user_obj.username,
                password=serializer.validated_data["password"],
            )
        except User.DoesNotExist:
            pass

    if user is None:
        return Response(
            {
                "code": "authentication_failed",
                "message": "Invalid email or password.",
                "correlationId": getattr(request, "correlation_id", ""),
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user_id": user.pk, "email": user.email})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request: Request) -> Response:
    """Logout by deleting the user's auth token."""
    user = cast(Any, request.user)
    Token.objects.filter(user=user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

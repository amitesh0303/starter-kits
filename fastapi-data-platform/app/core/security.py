"""JWT authentication for service-to-service communication."""

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import get_settings

security = HTTPBearer()


def create_service_token(service_name: str, expires_delta: timedelta | None = None) -> str:
    """Create a signed service JWT token."""
    settings = get_settings()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=1))
    payload = {"sub": service_name, "type": "service", "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def verify_service_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Verify a service JWT token and return service name."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        service_name: str | None = payload.get("sub")
        if service_name is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return service_name
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

"""Authentication endpoints."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.security import create_access_token, get_password_hash, verify_password
from app.services.user_store import user_store

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str
    password: str


class TokenRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest) -> dict:
    """Register a new user."""
    if user_store.get_by_email(request.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = get_password_hash(request.password)
    user = user_store.create(email=request.email, hashed_password=hashed)
    return {"id": user["id"], "email": user["email"]}


@router.post("/token", response_model=TokenResponse)
async def login(request: TokenRequest) -> TokenResponse:
    """Authenticate and return JWT token."""
    user = user_store.get_by_email(request.email)
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    token = create_access_token(data={"sub": user["id"]})
    return TokenResponse(access_token=token)

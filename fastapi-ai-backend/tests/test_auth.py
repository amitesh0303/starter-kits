"""Authentication tests."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    """Registration with valid data returns user info."""
    response = await client.post(
        "/api/auth/register",
        json={"email": "new@example.com", "password": "SecurePass123!"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@example.com"
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Registration with duplicate email returns 400."""
    await client.post("/api/auth/register", json={"email": "dup@example.com", "password": "Pass123!"})
    response = await client.post("/api/auth/register", json={"email": "dup@example.com", "password": "Pass456!"})
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Login with valid credentials returns token."""
    await client.post("/api/auth/register", json={"email": "user@example.com", "password": "Pass123!"})
    response = await client.post("/api/auth/token", json={"email": "user@example.com", "password": "Pass123!"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Login with wrong password returns 401."""
    await client.post("/api/auth/register", json={"email": "user@example.com", "password": "Pass123!"})
    response = await client.post("/api/auth/token", json={"email": "user@example.com", "password": "WrongPass!"})
    assert response.status_code == 401

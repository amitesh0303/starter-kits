"""S3-compatible storage provider with fake adapter for testing."""

from __future__ import annotations

import uuid
from abc import ABC, abstractmethod

from app.core.config import is_fake_mode


class StorageProvider(ABC):
    """Abstract storage provider interface."""

    @abstractmethod
    def store(self, key: str, data: str) -> str:
        """Store data and return a job ID."""
        ...

    @abstractmethod
    def retrieve(self, key: str) -> str | None:
        """Retrieve stored data by key."""
        ...

    @abstractmethod
    def list_keys(self, prefix: str = "") -> list[str]:
        """List all keys with optional prefix filter."""
        ...


class FakeStorageProvider(StorageProvider):
    """In-memory storage provider for testing."""

    def __init__(self) -> None:
        self._store: dict[str, str] = {}

    def store(self, key: str, data: str) -> str:
        job_id = str(uuid.uuid4())
        self._store[key] = data
        return job_id

    def retrieve(self, key: str) -> str | None:
        return self._store.get(key)

    def list_keys(self, prefix: str = "") -> list[str]:
        return [k for k in self._store if k.startswith(prefix)]


class S3StorageProvider(StorageProvider):
    """S3-compatible storage provider."""

    def __init__(self, endpoint_url: str, access_key: str, secret_key: str, bucket: str) -> None:
        import boto3
        self._client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )
        self._bucket = bucket

    def store(self, key: str, data: str) -> str:
        job_id = str(uuid.uuid4())
        self._client.put_object(Bucket=self._bucket, Key=key, Body=data.encode())
        return job_id

    def retrieve(self, key: str) -> str | None:
        try:
            response = self._client.get_object(Bucket=self._bucket, Key=key)
            return response["Body"].read().decode()
        except Exception:
            return None

    def list_keys(self, prefix: str = "") -> list[str]:
        response = self._client.list_objects_v2(Bucket=self._bucket, Prefix=prefix)
        return [obj["Key"] for obj in response.get("Contents", [])]


_fake_instance: FakeStorageProvider | None = None


def get_storage_provider() -> StorageProvider:
    """Get storage provider - fake for testing, S3 for production."""
    global _fake_instance
    if is_fake_mode():
        if _fake_instance is None:
            _fake_instance = FakeStorageProvider()
        return _fake_instance
    from app.core.config import get_settings
    settings = get_settings()
    return S3StorageProvider(
        endpoint_url=settings.s3_endpoint_url,
        access_key=settings.s3_access_key,
        secret_key=settings.s3_secret_key,
        bucket=settings.s3_bucket,
    )

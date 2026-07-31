# FastAPI Data Platform

Data ingestion, ETL, and analytics platform built with FastAPI, PostgreSQL, DuckDB, S3-compatible storage, Celery, and Redis.

## Features

- Service-to-service JWT authentication
- Data ingestion API with S3-compatible storage
- DuckDB-based analytics query engine
- Celery task queue for async ETL processing
- Redis caching layer
- PostgreSQL with SQLAlchemy for metadata
- Fake adapters for testing without external services

## Quick Start

```bash
# Install dependencies
uv sync

# Copy environment variables
cp .env.example .env

# Run development server
uv run uvicorn app.main:app --reload

# Run tests
uv run pytest
```

## Project Structure

```
app/
  api/          - Route handlers (health, ingest, query)
  core/         - Configuration, security (JWT)
  models/       - SQLAlchemy database models
  services/     - Provider adapters (storage, analytics)
  storage/      - Storage layer utilities
  tasks/        - Celery async ETL tasks
tests/          - Pytest test suite
```

## Environment Variables

See `.env.example` for all required configuration values.

## Testing

Tests use fake adapters automatically when APP_ENV=test:

```bash
uv run pytest
```

# FastAPI AI Backend

AI inference and document processing backend built with FastAPI, OAuth2/JWT authentication, PostgreSQL, Redis, Celery, and Stripe billing.

## Features

- OAuth2/JWT authentication with password hashing
- OpenAI-compatible AI inference API
- Stripe subscription billing
- Celery task queue for async processing
- Redis caching layer
- PostgreSQL with SQLAlchemy ORM
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
  api/          - Route handlers (health, auth, ai, billing)
  core/         - Configuration, security utilities
  models/       - SQLAlchemy database models
  services/     - Provider adapters (AI, billing, user store)
  tasks/        - Celery async tasks
tests/          - Pytest test suite
```

## Environment Variables

See `.env.example` for all required configuration values.

## Testing

Tests use fake adapters automatically when placeholder credentials are detected:

```bash
uv run pytest
```

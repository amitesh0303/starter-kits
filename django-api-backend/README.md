# Django API Backend

A production-ready REST API backend starter built with Django + Django REST Framework, featuring token authentication via django-allauth, Stripe billing integration, OpenAPI documentation, and structured logging.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/register/` | No | Register new user |
| POST | `/api/auth/login/` | No | Login and get token |
| POST | `/api/auth/logout/` | Yes | Logout (delete token) |
| GET | `/api/resources/` | Yes | List user's resources (paginated) |
| POST | `/api/resources/` | Yes | Create a new resource |
| GET | `/api/resources/{id}/` | Yes | Get resource by ID |
| PUT | `/api/resources/{id}/` | Yes | Update resource |
| PATCH | `/api/resources/{id}/` | Yes | Partial update resource |
| DELETE | `/api/resources/{id}/` | Yes | Delete resource |
| GET | `/api/subscriptions/me/` | Yes | Get current subscription |
| POST | `/api/webhooks/stripe/` | No* | Stripe webhook receiver |
| GET | `/api/schema/` | No | OpenAPI schema (JSON) |
| GET | `/api/docs/` | No | Swagger UI |

*Stripe webhooks are verified via signature, not token auth.

## Authentication

This starter uses token-based authentication:

1. Register: `POST /api/auth/register/` with `{email, username, password}`
2. Login: `POST /api/auth/login/` with `{email, password}` - returns `{token, user_id, email}`
3. Use the token: Include `Authorization: Token <your-token>` header in requests

All `/api/resources/` and `/api/subscriptions/` endpoints require authentication.

## Schema Initialization

```bash
# Apply database migrations
uv run python manage.py migrate

# Create a superuser (optional)
uv run python manage.py createsuperuser
```

## Rate Limiting

Rate limits are configurable via environment variables:

- `RATE_LIMIT_REQUESTS`: Maximum requests per window (default: 100)
- `RATE_LIMIT_WINDOW`: Window duration in seconds (default: 60)

When exceeded, returns `429 Too Many Requests` with the stable error shape.

## Observability

- **Structured logging**: All logs are JSON-formatted via structlog
- **Correlation IDs**: Every request gets an `X-Correlation-ID` header (generated or passed through)
- **Error shape**: All errors return `{code, message, correlationId, details?}`
- **Secret redaction**: Sensitive values are never exposed in logs or error responses

## Local Startup

```bash
# Install dependencies
uv sync

# Copy environment variables
cp .env.example .env

# Run migrations
uv run python manage.py migrate

# Start development server
uv run python manage.py runserver
```

The API will be available at `http://localhost:8000`.

## Container Startup

```bash
# Build the Docker image
docker build -t django-api-backend .

# Run the container
docker run -p 8000:8000 --env-file .env django-api-backend
```

The API will be available at `http://localhost:8000`.

## Deployment Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DJANGO_SECRET_KEY` | insecure-dev-key | Django secret key |
| `DJANGO_DEBUG` | True | Debug mode |
| `DJANGO_ALLOWED_HOSTS` | localhost,127.0.0.1 | Comma-separated allowed hosts |
| `DB_ENGINE` | sqlite3 | Database engine |
| `DB_NAME` | db.sqlite3 | Database name |
| `DB_USER` | | Database user |
| `DB_PASSWORD` | | Database password |
| `DB_HOST` | | Database host |
| `DB_PORT` | | Database port |
| `CORS_ALLOWED_ORIGINS` | http://localhost:3000 | Comma-separated CORS origins |
| `STRIPE_SECRET_KEY` | sk_test_fake_placeholder | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | whsec_test_fake_placeholder | Stripe webhook secret |
| `STRIPE_FAKE_MODE` | true | Use fake Stripe provider |
| `RATE_LIMIT_REQUESTS` | 100 | Rate limit max requests |
| `RATE_LIMIT_WINDOW` | 60 | Rate limit window (seconds) |

### Production Checklist

- Set `DJANGO_DEBUG=False`
- Set a strong `DJANGO_SECRET_KEY`
- Configure PostgreSQL via `DB_*` variables
- Set `STRIPE_FAKE_MODE=false` and provide real Stripe keys
- Set `DJANGO_ALLOWED_HOSTS` to your domain
- Configure `CORS_ALLOWED_ORIGINS` for your frontend

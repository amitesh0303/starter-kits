# django-analytics-saas

A Django starter for analytics and reporting SaaS with Celery background tasks.

## Tech Stack

- **Framework:** Django
- **Auth:** django-allauth
- **Data:** PostgreSQL
- **Background Jobs:** Celery + Redis
- **Billing:** Stripe

## Getting Started

1. Copy `.env.example` to `.env`
2. Run `uv sync`
3. Run `uv run python manage.py runserver`

## Scripts

- `uv run python manage.py runserver` - Start development server
- `uv run pytest` - Run tests
- `uv run celery -A config worker` - Start Celery worker

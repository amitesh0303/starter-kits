# Multi-stage Docker build for Django API backend
# Stage 1: Build
FROM python:3.12-slim AS builder

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency files first for layer caching
COPY pyproject.toml uv.lock .python-version ./

# Install dependencies (frozen lock, no dev deps)
RUN uv sync --frozen --no-dev --no-install-project

# Copy application code
COPY . .

# Install the project itself
RUN uv sync --frozen --no-dev

# Collect static files
RUN DJANGO_SECRET_KEY=build-placeholder uv run --no-dev python manage.py collectstatic --noinput

# Stage 2: Runtime
FROM python:3.12-slim AS runtime

WORKDIR /app

# Copy the virtual environment and application from builder
COPY --from=builder /app /app

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings
ENV PATH="/app/.venv/bin:$PATH"

# Expose port
EXPOSE 8000

# Run with gunicorn
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]

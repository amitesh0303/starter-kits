# Go Webhook Service

High-throughput webhook processing service built with Go, Chi router, JWT authentication, PostgreSQL/pgx, and Redis.

## Features

- JWT authentication middleware
- Webhook subscription management
- Webhook delivery with retry logic
- In-memory store (swap with PostgreSQL/pgx for production)
- Redis queue for async delivery
- OpenAPI documentation support

## Quick Start

```bash
# Install dependencies
go mod download

# Run development server
make run

# Build binary
make build

# Run tests
make test
```

## Project Structure

```
cmd/server/     - Application entry point
internal/
  handler/      - HTTP request handlers
  middleware/   - JWT auth middleware
  domain/       - Business entities and interfaces
  repository/   - Data persistence (PostgreSQL/pgx)
  queue/        - Redis-backed job queue
```

## Environment Variables

See `.env.example` for all required configuration values.

# Fastify Realtime API

Notifications, presence, and realtime communication API built with Fastify, JWT authentication, PostgreSQL/Drizzle, WebSockets, and Redis pub/sub.

## Features

- JWT authentication
- Real-time notifications API
- User presence tracking
- WebSocket support for live updates
- Redis pub/sub for event distribution
- PostgreSQL with Drizzle ORM
- Fake adapters for testing without external services

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Run development server
pnpm dev

# Run tests
pnpm test
```

## Project Structure

```
src/
  routes/       - Route handlers (health, notifications, presence)
  plugins/      - Fastify plugins (auth)
  domain/       - Business logic (notification store, presence store)
  lib/          - Configuration, Redis
  ws/           - WebSocket handlers
  middleware/   - Request middleware
tests/
  unit/         - Unit tests
  integration/  - Integration tests
```

## Environment Variables

See `.env.example` for all required configuration values.

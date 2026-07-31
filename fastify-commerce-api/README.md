# Fastify Commerce API

Products, carts, and orders API built with Fastify, JWT authentication, PostgreSQL/Prisma, Redis caching, and Stripe Checkout.

## Features

- JWT authentication
- Products CRUD API
- Shopping cart management
- Stripe Checkout integration
- Redis caching layer
- PostgreSQL with Prisma ORM
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
  routes/       - Route handlers (health, products, cart, checkout)
  plugins/      - Fastify plugins (auth)
  domain/       - Business logic (product store, cart store)
  lib/          - Configuration, billing provider, Redis
  middleware/   - Request middleware
tests/
  unit/         - Unit tests
  integration/  - Integration tests
```

## Environment Variables

See `.env.example` for all required configuration values.

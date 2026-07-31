# NestJS B2B API

Multi-tenant enterprise backend built with NestJS, Passport JWT authentication, PostgreSQL/Prisma, Stripe billing, BullMQ job queue, and Redis.

## Features

- Passport JWT authentication
- Multi-tenant architecture
- Stripe subscription billing
- BullMQ background job processing
- Redis caching
- PostgreSQL with Prisma ORM
- Modular NestJS architecture

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
  modules/
    auth/       - Authentication (JWT, Passport)
    tenants/    - Multi-tenant management
    billing/    - Stripe subscription billing
    queue/      - BullMQ job processing
  common/       - Shared guards, decorators, pipes
test/           - E2E tests
```

## Environment Variables

See `.env.example` for all required configuration values.

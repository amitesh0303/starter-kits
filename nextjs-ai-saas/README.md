# nextjs-ai-saas

AI chat and content generation SaaS starter built with Next.js App Router, Clerk, Neon Postgres (Prisma), OpenAI-compatible API, and Lemon Squeezy.

## Architecture

```
app/                  # Next.js App Router pages and API routes
  api/chat/           # Server-only AI generation endpoint
  api/webhooks/       # Lemon Squeezy webhook handler
  auth/               # Clerk sign-in/sign-up pages
  dashboard/          # Protected workspace dashboard
domain/               # Business logic
  entities.ts         # Core domain types
  policies.ts         # Deny-by-default authorization
lib/server/           # Server-only adapters
  ai.ts              # OpenAI-compatible AI port
  ai-fake.ts         # Deterministic fake for tests
  auth.ts            # Clerk identity extraction
  billing.ts         # Lemon Squeezy billing port
  billing-fake.ts    # In-memory fake for tests
  config.ts          # Typed config boundary
  database.ts        # Prisma repository interfaces
  errors.ts          # Sanitized error hierarchy
  providers.ts       # Real vs fake adapter selection
prisma/               # Database schema and migrations
tests/                # Test suite
  unit/              # Unit tests for domain and server modules
  integration/       # Integration tests for auth and actions
  property/          # Property-based tests (fast-check)
  smoke/             # Module resolution verification
```

## Setup

1. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run database migrations (requires real DATABASE_URL):
   ```bash
   pnpm exec prisma migrate deploy
   ```

4. Start development server:
   ```bash
   pnpm dev
   ```

## Authentication

Uses Clerk for authentication. Protected routes are handled via middleware.

## Database

Uses Neon Postgres with Prisma ORM. Schema includes:
- Workspaces (owned by users)
- Conversations and Messages
- Generations (usage tracking)
- Entitlements (subscription state)
- ProcessedEvents (webhook idempotency)

## AI Provider

Server-only OpenAI-compatible API integration. API keys are never exposed to the client bundle. When OPENAI_API_KEY is a placeholder value, a deterministic fake adapter is used.

## Monetization

Lemon Squeezy subscription billing with:
- Webhook signature verification (HMAC-SHA256)
- Idempotent event processing
- Entitlement state machine: active, past_due, cancelled, trialing

## Tests

```bash
pnpm test          # Run all tests
pnpm lint          # ESLint
pnpm typecheck     # TypeScript checking
pnpm build         # Production build
```

Property tests verify:
- Property 3: No server secrets leak to client bundle
- Property 4: Authentication and access consistency
- Property 5: Webhook authenticity gates one state transition

## Deployment

Deploy to Vercel, Netlify, or any Node.js platform. Set all environment variables from `.env.example` with real values.

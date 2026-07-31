# Next.js Automation SaaS Starter

Workflow automation platform with manual/scheduled/webhook triggers, bounded-retry job
execution, and Stripe subscription billing.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: Clerk
- **Database**: Neon (PostgreSQL) + Drizzle ORM
- **Jobs**: Inngest (durable step functions with bounded retries)
- **Billing**: Stripe (subscriptions, webhooks)
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + fast-check (property-based testing)

## Features

- Workflow CRUD, gated by plan-based workflow-count limits
- Run triggering gated by subscription status and monthly run quota
- Bounded-retry job execution: every run attempts at most `maxAttempts` times,
  and always reaches a terminal `completed` or `failed` state (never stuck
  `pending`/`running`)
- Every attempt is recorded as a `StepAttempt` for observability
- Stripe subscription webhook processing with HMAC signature verification
- Deny-by-default authorization policies
- Idempotent webhook processing with event deduplication

## Domain Model

- **Workflow** - A user-owned automation with a trigger type (`manual`, `scheduled`, `webhook`)
- **Trigger** - Configuration for how a workflow is invoked
- **Run** - A single execution of a workflow (`pending` -> `running` -> `completed`/`failed`/`cancelled`)
- **StepAttempt** - One attempt within a run (`pending` -> `running` -> `succeeded`/`failed`)
- **Subscription** - Stripe-backed plan with `maxRunsPerMonth` and status (`active`, `past_due`, `cancelled`, `trialing`)

## Getting Started

### Prerequisites

- Node.js LTS (20+)
- pnpm 10.x
- Neon (or any PostgreSQL) database
- Clerk account
- Stripe account (test mode)
- Inngest account (or local Inngest dev server)

### Setup

1. Clone and install:

```bash
cd nextjs-automation-saas
cp .env.example .env.local
pnpm install
```

2. Configure environment variables in `.env.local` (see sections below).

3. Set up the database:

```bash
pnpm db:push
```

4. Start the development server:

```bash
pnpm dev
```

5. In a separate terminal, start the Inngest dev server so scheduled/run
   functions execute locally:

```bash
npx inngest-cli@latest dev
```

The Inngest dev server discovers functions served from `/api/inngest`.

## Clerk Configuration

Clerk handles authentication. Every authenticated user owns their own
workflows (no additional role distinction).

Environment variables:
- `CLERK_SECRET_KEY` - Clerk server-side secret key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (client-safe)

## Database Schema

The Drizzle schema (`drizzle/schema.ts`) defines five main tables:

- **workflows** - User-owned automations
- **triggers** - Trigger configuration per workflow
- **runs** - Workflow execution history
- **step_attempts** - Per-attempt retry history for each run
- **subscriptions** - Stripe subscription state and plan limits
- **processed_events** - Idempotent webhook event tracking

Run migrations:

```bash
pnpm db:migrate
```

## Retry and Terminal-Failure Behavior

`lib/server/jobs.ts` exposes `executeStepWithBoundedRetry`, a shared state
machine used by both the real Inngest function (`app/api/inngest/route.ts`)
and the in-memory fake adapter (`lib/server/jobs-fake.ts`). Its guarantees:

- A run attempts at most `maxAttempts` times.
- If any attempt within the budget succeeds, the run transitions to
  `completed` exactly once and stops.
- If every attempt within the budget fails, the run transitions to the
  terminal `failed` state after the last attempt, recording the error - it
  never remains indefinitely `pending` or `running`.
- Every attempt (success or failure) is persisted as a `StepAttempt`.

This is covered by `tests/property/retry-termination.test.ts` (Property 8),
which exercises random `maxAttempts` values in `[1, 10]` and random outcome
sequences.

## Stripe Webhook

Configure your Stripe webhook endpoint to point to `/api/webhooks/stripe`.

Required events:
- `customer.subscription.updated`
- `customer.subscription.deleted`

Environment variables:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

For local development, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Plan Gating

`domain/policies.ts` enforces:
- `canCreateWorkflow` - denied once the caller's workflow count reaches the plan limit
- `canTriggerRun` - denied unless the caller owns the workflow, the subscription
  status is `active`/`trialing`, and the caller is under `maxRunsPerMonth` for
  the current billing period

## Testing

Run the full test suite:

```bash
pnpm test
```

Tests include:
- **Unit tests** - Domain policies (plan gating, ownership), billing adapter, job adapter retry behavior
- **Integration tests** - Create workflow -> trigger run -> terminal state flow, auth access control
- **Property tests** - Auth consistency (Property 4), webhook authenticity (Property 5), job retry termination (Property 8)
- **Smoke tests** - Module resolution and adapter instantiation

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test` | Run test suite |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run database migrations |

## Deployment

1. Set all environment variables in your hosting platform
2. Run `pnpm db:migrate` to apply database migrations
3. Register the deployed `/api/inngest` endpoint with your Inngest app
4. Deploy with `pnpm build && pnpm start`

The app uses fake adapters when credentials are placeholder values, allowing
development without external services.

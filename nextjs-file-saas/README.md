# Next.js File SaaS Starter

File conversion, storage, and media processing platform with quota-gated
uploads and bounded-retry conversion jobs.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: Clerk
- **Database**: Neon (PostgreSQL) + Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **Jobs**: Inngest (durable step functions with bounded retries)
- **Billing**: Stripe (subscriptions, webhooks)
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + fast-check (property-based testing)

## Features

- Upload validation (MIME type allowlist + byte size limit) enforced
  **before** any object is written to storage
- Storage-quota enforcement tied to the caller's Stripe subscription
- Bounded-retry conversion jobs: every job attempts at most `maxAttempts`
  times and always reaches a terminal `completed` or `failed` state (never
  stuck `pending`/`processing`)
- Successful conversions record an `OutputAsset`; exhausted jobs record a
  terminal error with no partial output
- Stripe subscription webhook processing with HMAC signature verification
- Deny-by-default authorization policies
- Idempotent webhook processing with event deduplication

## Domain Model

- **FileAsset** - An uploaded file owned by a user (`uploaded` -> `processing` -> `ready`/`failed`)
- **ConversionJob** - A conversion request for a `FileAsset` (`pending` -> `processing` -> `completed`/`failed`), with an `attempts`/`maxAttempts` counter
- **OutputAsset** - The converted file produced by a completed `ConversionJob`
- **Subscription** - Stripe-backed plan with `storageQuotaBytes` and status (`active`, `past_due`, `cancelled`, `trialing`)

## Getting Started

### Prerequisites

- Node.js LTS (20+)
- pnpm 10.x
- Neon (or any PostgreSQL) database
- Clerk account
- Stripe account (test mode)
- Cloudflare R2 bucket
- Inngest account (or local Inngest dev server)

### Setup

1. Clone and install:

```bash
cd nextjs-file-saas
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

5. In a separate terminal, start the Inngest dev server so conversion
   functions execute locally:

```bash
npx inngest-cli@latest dev
```

The Inngest dev server discovers functions served from `/api/inngest`.

## Clerk Configuration

Clerk handles authentication. Every authenticated user owns their own files
and conversion jobs.

Environment variables:
- `CLERK_SECRET_KEY` - Clerk server-side secret key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (client-safe)

## Database Schema

The Drizzle schema (`drizzle/schema.ts`) defines five main tables:

- **file_assets** - Uploaded files owned by a user
- **conversion_jobs** - Conversion requests with attempt/retry tracking
- **output_assets** - Converted output files
- **subscriptions** - Stripe subscription state and storage quota
- **processed_events** - Idempotent webhook event tracking

Run migrations:

```bash
pnpm db:migrate
```

## Upload Validation

`domain/policies.ts` defines `ALLOWED_MIME_TYPES` and `MAX_FILE_SIZE_BYTES`.
`lib/server/storage.ts` exposes `validateFile()`, which both the real R2
adapter and the in-memory fake call **before** any write to storage. Uploads
that fail validation return `413` (too large) or `415` (unsupported type)
and never touch the storage layer or persist a `FileAsset` row - covered by
`tests/integration/upload.test.ts` and `tests/unit/server/storage.test.ts`.

Storage-quota enforcement (`canUploadFile` in `domain/policies.ts`) is
separate from file-type/size validation: it compares the caller's current
usage plus the incoming file size against `subscription.storageQuotaBytes`.

## Retry and Terminal-Failure Behavior

`lib/server/jobs.ts` exposes `executeConversionWithBoundedRetry`, a shared
state machine used by both the real Inngest function
(`app/api/inngest/route.ts`) and the in-memory fake adapter
(`lib/server/jobs-fake.ts`). Its guarantees:

- A conversion job attempts at most `maxAttempts` times.
- If any attempt within the budget succeeds, the job transitions to
  `completed` exactly once and records an `OutputAsset`.
- If every attempt within the budget fails, the job transitions to the
  terminal `failed` state after the last attempt, recording the error - it
  never remains indefinitely `pending` or `processing`.

This is covered by `tests/property/retry-termination.test.ts` (Property 8),
which exercises random `maxAttempts` values in `[1, 10]` and random outcome
sequences.

## Cloudflare R2 Setup

1. Create an R2 bucket in the Cloudflare dashboard
2. Generate an S3-compatible API token (Access Key ID + Secret Access Key)
3. Note your account ID and the bucket's public URL (or a custom domain)

Environment variables:
- `R2_ACCOUNT_ID` - Cloudflare account ID
- `R2_ACCESS_KEY_ID` - R2 API access key ID
- `R2_SECRET_ACCESS_KEY` - R2 API secret access key
- `R2_BUCKET_NAME` - Target bucket name
- `R2_PUBLIC_URL` - Public base URL for serving uploaded/converted objects

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

## Testing

Run the full test suite:

```bash
pnpm test
```

Tests include:
- **Unit tests** - Domain policies (quota, MIME/size allowlist, ownership), billing adapter, storage validation, job adapter retry behavior
- **Integration tests** - Upload -> conversion -> output flow (including rejected uploads that never reach storage), auth access control
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

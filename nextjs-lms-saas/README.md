# LMS SaaS Starter

A full-featured Learning Management System starter built with Next.js App Router, featuring courses with video streaming, membership subscriptions, and progress tracking.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Authentication:** Clerk
- **Database:** Neon (PostgreSQL) + Prisma ORM
- **Video:** Mux (streaming and processing)
- **Payments:** Stripe (memberships/subscriptions)
- **File Upload:** UploadThing
- **Styling:** Tailwind CSS 4

## Features

- Course creation and management (creator role)
- Video lesson upload via UploadThing with Mux processing
- Membership subscriptions via Stripe
- Enrollment and progress tracking
- Role-based access: Creator and Learner
- Webhook handlers for Stripe and Mux events
- Deny-by-default authorization policies

## Getting Started

### Prerequisites

- Node.js LTS (20.x)
- pnpm 10.28.1
- PostgreSQL database (Neon recommended)
- Clerk account
- Stripe account
- Mux account
- UploadThing account

### Setup

1. Clone and install:

```bash
cd nextjs-lms-saas
cp .env.example .env.local
pnpm install
```

2. Fill in all environment variables in `.env.local`

3. Set up the database:

```bash
pnpm db:generate
pnpm db:push
```

4. Run the development server:

```bash
pnpm dev
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `CLERK_SECRET_KEY` | Clerk backend secret key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend publishable key |
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `MUX_TOKEN_ID` | Mux API token ID |
| `MUX_TOKEN_SECRET` | Mux API token secret |
| `MUX_WEBHOOK_SECRET` | Mux webhook signing secret |
| `UPLOADTHING_TOKEN` | UploadThing API token |
| `NEXT_PUBLIC_APP_URL` | Public application URL |

## Database Schema

- **Course** - Creator publishes courses with lessons
- **Lesson** - Part of a course, has video via Mux, ordered by position
- **Enrollment** - Learner enrolls in a course
- **Progress** - Tracks lesson completion per enrollment
- **Subscription** - Stripe membership that unlocks content
- **ProcessedEvent** - Idempotent webhook event tracking

## Authentication (Clerk)

This starter uses Clerk for authentication. The middleware protects `/dashboard` routes and redirects unauthenticated users to the Clerk sign-in page.

Roles are stored in Clerk's `publicMetadata`:
- `creator` - Can create and manage courses
- `learner` - Can enroll in courses and access lessons

## Stripe Webhooks

Configure your Stripe webhook endpoint to point to:
```
https://your-domain.com/api/webhooks/stripe
```

Events handled:
- `customer.subscription.updated` - Subscription status changes
- `customer.subscription.deleted` - Subscription cancellation

## Mux Webhooks

Configure your Mux webhook endpoint to point to:
```
https://your-domain.com/api/webhooks/mux
```

Events handled:
- `video.asset.ready` - Video processing complete
- `video.asset.errored` - Video processing failed

## Testing

```bash
pnpm test          # Run all tests
pnpm lint          # ESLint
pnpm typecheck     # TypeScript type checking
```

Test structure:
- `tests/unit/` - Domain policies, adapter unit tests
- `tests/integration/` - Auth flows, enrollment + payment flows
- `tests/property/` - Property-based tests with fast-check
- `tests/smoke/` - Build validation

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | TypeScript type check |
| `pnpm test` | Run Vitest tests |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Deploy migrations |

## Deployment

1. Set all environment variables in your hosting provider
2. Run `pnpm db:migrate` to apply database migrations
3. Configure Stripe and Mux webhook endpoints
4. Deploy with `pnpm build && pnpm start`

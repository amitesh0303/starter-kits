# Next.js Booking SaaS Starter

Appointments and reservations platform with integrated payments, calendar sync, and email notifications.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: Auth.js (next-auth v5)
- **Database**: PostgreSQL + Prisma ORM
- **Payments**: Stripe (payment intents, webhooks, refunds)
- **Calendar**: Google Calendar API (event creation and cancellation)
- **Email**: Resend (booking confirmations, cancellation notices)
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + fast-check (property-based testing)

## Features

- Provider availability management (weekly time slots)
- Customer booking with concurrency protection (no double-booking)
- Stripe payment processing with webhook verification
- Google Calendar event sync (auto-create/cancel events)
- Email notifications via Resend (confirmation and cancellation)
- Deny-by-default authorization policies
- Idempotent webhook processing with event deduplication

## Getting Started

### Prerequisites

- Node.js LTS (20+)
- pnpm 10.x
- PostgreSQL database
- Stripe account (test mode)
- Google Cloud project with Calendar API enabled
- Resend account

### Setup

1. Clone and install:

```bash
cd nextjs-booking-saas
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

## Auth.js Configuration

Auth.js (next-auth v5) handles authentication. Configure your preferred provider(s) in `lib/server/auth.ts`.

Required environment variables:

- `NEXTAUTH_SECRET` - Random secret for session encryption
- `NEXTAUTH_URL` - Your app URL (e.g., http://localhost:3000)

## Database Schema

The Prisma schema defines five main models:

- **Provider** - Service providers who offer appointments
- **Availability** - Weekly time slot configuration per provider
- **Booking** - Reservations linking customers to provider time slots
- **Payment** - Stripe payment intents linked to bookings
- **ProcessedEvent** - Idempotent webhook event tracking

Run migrations:

```bash
pnpm db:migrate
```

## Stripe Webhook

Configure your Stripe webhook endpoint to point to `/api/webhooks/stripe`.

Required events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

Environment variables:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

For local development, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Google Calendar Setup

1. Create a Google Cloud project
2. Enable the Google Calendar API
3. Create OAuth2 credentials
4. Generate a refresh token with calendar scope

Environment variables:
- `GOOGLE_CLIENT_ID` - OAuth2 client ID
- `GOOGLE_CLIENT_SECRET` - OAuth2 client secret
- `GOOGLE_REFRESH_TOKEN` - Long-lived refresh token

## Resend Configuration

Sign up at resend.com and create an API key.

Environment variable:
- `RESEND_API_KEY` - Your Resend API key

## Testing

Run the full test suite:

```bash
pnpm test
```

Tests include:
- **Unit tests** - Domain policies, billing adapter verification
- **Integration tests** - Booking flow with concurrency, auth access control
- **Property tests** - Auth consistency (Property 4), webhook authenticity (Property 5)
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
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run database migrations |

## Deployment

1. Set all environment variables in your hosting platform
2. Run `pnpm db:migrate` to apply database migrations
3. Deploy with `pnpm build && pnpm start`

The app uses fake adapters when credentials are placeholder values, allowing development without external services.

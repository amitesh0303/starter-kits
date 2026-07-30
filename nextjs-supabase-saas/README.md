# Next.js + Supabase SaaS Starter

A production-ready multi-tenant SaaS boilerplate built with Next.js 15 App Router, Supabase (Auth + Postgres), Stripe subscriptions, and Resend transactional email.

## Differentiators

- **Multi-tenant architecture** with tenant isolation via Postgres Row-Level Security (RLS)
- **Deny-by-default authorization** enforced at both database and application layers
- **Stripe subscription lifecycle** with idempotent webhook processing and state machine
- **Typed configuration boundary** with aggregate validation (fails fast listing all missing vars)
- **Provider adapters with fake defaults** so install, lint, test, and build work without real credentials
- **Property-based tests** verifying auth consistency and webhook authenticity invariants

## Supported Runtime

| Tool   | Version          |
|--------|------------------|
| Node   | 22 LTS (22.x)   |
| pnpm   | 10.x             |

## Folder Structure

```
nextjs-supabase-saas/
├── app/                    # Next.js App Router pages and API routes
│   ├── auth/               # Login, signup, OAuth callback
│   ├── dashboard/          # Protected tenant dashboard
│   │   └── tenants/        # Tenant management, projects, members, billing
│   └── api/webhooks/       # Stripe webhook endpoint
├── domain/                 # Business entities, authorization policies
│   ├── entities.ts         # Tenant, Membership, Project, Subscription
│   └── policies.ts         # Deny-by-default access checks
├── lib/
│   ├── server/             # Server-only adapters and config
│   │   ├── config.ts       # Typed aggregate config validator
│   │   ├── auth.ts         # Supabase Auth identity port
│   │   ├── database.ts     # Repository interfaces + Supabase adapter
│   │   ├── billing.ts      # Stripe billing port + webhook verifier
│   │   ├── billing-fake.ts # In-memory billing adapter for tests
│   │   ├── mail.ts         # Resend mail port
│   │   ├── mail-fake.ts    # In-memory mail adapter for tests
│   │   └── errors.ts       # Sanitized domain errors
│   └── supabase/           # Supabase client factories (browser, server, middleware)
├── supabase/migrations/    # SQL migrations for schema + RLS policies
├── tests/                  # All test types
│   ├── unit/               # Domain logic and adapter unit tests
│   ├── integration/        # Auth flow and server action tests
│   ├── property/           # fast-check property-based tests
│   └── smoke/              # Build verification tests
├── middleware.ts           # Next.js middleware (session refresh, route protection)
├── vitest.config.ts        # Test runner configuration
├── starter.json            # Starter kit catalog metadata
└── package.json            # Project dependencies (exact-pinned)
```

## Setup Procedure

### 1. Install Dependencies

```bash
pnpm install --frozen-lockfile
```

Expected: all dependencies installed without network errors.

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials. See the Environment section below.

### 3. Initialize Database Schema

Run Supabase migrations (requires Supabase CLI or managed project):

```bash
supabase db push
```

This creates the `tenants`, `memberships`, `projects`, `subscriptions`, and `processed_events` tables with RLS policies.

### 4. Start Development Server

```bash
pnpm run dev
```

Expected: application running at `http://localhost:3000`.

## Environment Variables

### Development (`.env.local`)

| Variable | Classification | Required | Description |
|----------|---------------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | client-safe | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client-safe | Yes | Supabase anonymous key |
| `NEXT_PUBLIC_APP_URL` | client-safe | Yes | Application base URL |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | Yes | Supabase service role key (bypasses RLS) |
| `STRIPE_SECRET_KEY` | server-only | Yes | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | server-only | Yes | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | server-only | Yes | Stripe price ID for subscription plan |
| `RESEND_API_KEY` | server-only | No | Resend API key (fake mode when absent) |

### Production

Same variables with production values. Use platform-level secrets management (e.g., Vercel Environment Variables). Never commit real secrets to source control.

## Schema Initialization

The `supabase/migrations/` directory contains ordered SQL migrations:

1. `001_tenants.sql` - Tenants table with RLS
2. `002_memberships.sql` - Memberships with role enforcement
3. `003_projects.sql` - Projects scoped to tenants
4. `004_subscriptions.sql` - Stripe subscription state tracking
5. `005_processed_events.sql` - Idempotent webhook event log

Each migration creates tables with appropriate indexes, constraints, and RLS policies that enforce tenant isolation at the database level.

## Authentication and Authorization

### Authentication

Uses Supabase Auth with email/password and OAuth providers. The Next.js middleware (`middleware.ts`) refreshes sessions and redirects unauthenticated users away from `/dashboard/*` routes.

### Authorization (Deny-by-Default)

All access checks (`domain/policies.ts`) return `false` unless an explicit allow condition is met:

- **Tenant access**: requires active membership in the tenant
- **Tenant management**: requires `owner` or `admin` role
- **Project access**: requires membership in the owning tenant
- **Member management** (invite/remove): requires `owner` or `admin` role

RLS policies at the Postgres level provide a second enforcement layer.

## Stripe Setup

### Console Configuration

1. Create a product and price in the Stripe Dashboard
2. Copy the price ID to `STRIPE_PRICE_ID`
3. Copy your secret key to `STRIPE_SECRET_KEY`

### Webhook Configuration

1. In Stripe Dashboard, add a webhook endpoint: `{NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`
2. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Local Development

Use the Stripe CLI to forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Resend Setup

### With Credentials

Set `RESEND_API_KEY` to your Resend API key. The application sends:
- Welcome emails when a tenant is created
- Invite emails when members are invited

### Fake Mode (No Credentials)

When `RESEND_API_KEY` is absent or set to a placeholder value, the application uses an in-memory fake adapter that captures emails without sending them. This allows development and testing without a Resend account.

## Representative Flow

1. **User signs up** via `/auth/signup`
2. **Creates a tenant** via the dashboard (becomes `owner`)
3. **Creates a project** within the tenant
4. **Invites a member** via email (requires `owner`/`admin` role)
5. **Subscribes** via Stripe Checkout (redirected to Stripe-hosted page)
6. **Webhook fires** (`checkout.session.completed`) and creates subscription record
7. **Entitlement granted** (subscription status: `active`)
8. **Welcome email sent** (via Resend or captured in fake mode)

## One-Shot Commands

```bash
# Install dependencies (CI/CD)
pnpm install --frozen-lockfile

# Lint
pnpm run lint

# Type-check
pnpm run typecheck

# Run tests
pnpm run test

# Production build
pnpm run build
```

All commands are non-interactive and terminate with appropriate exit codes.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Missing required environment variables` | Copy `.env.example` to `.env.local` and fill in all required values |
| Build fails with type errors | Run `pnpm run typecheck` to see specific issues |
| Webhook events not processing | Verify `STRIPE_WEBHOOK_SECRET` matches your endpoint signing secret |
| Emails not sending | Check `RESEND_API_KEY` is set; if absent, emails are captured in fake mode |
| RLS permission denied | Ensure the user has a membership record for the tenant being accessed |
| `pnpm install` fails | Ensure you are using pnpm 10.x and Node 22 LTS |

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set all environment variables in Vercel project settings
3. Vercel auto-detects the Next.js framework and builds with `next build`

### Supabase (Managed)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migrations via `supabase db push` or the Supabase Dashboard SQL editor
3. Copy connection details to environment variables

### Stripe

1. Switch from test keys to live keys in production
2. Update webhook endpoint URL to your production domain
3. Verify webhook signatures use the production signing secret

## License

This starter kit is provided as a boilerplate template. See the repository root for license terms.

## Attribution

This project integrates with third-party services including Supabase, Stripe, and Resend. These are independent products and services; this starter kit is not endorsed by or affiliated with any of them. Refer to each provider's documentation for their terms of service and pricing.

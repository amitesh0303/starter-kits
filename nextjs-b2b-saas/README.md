# nextjs-b2b-saas

Multi-tenant B2B SaaS starter with organizations, teams, and role-based access control (RBAC). Built with Next.js 15 App Router, Auth0, PostgreSQL + Drizzle ORM, Paddle billing, and Postmark email.

## Features

- **Organizations** - Multi-tenant workspace with slug-based routing
- **Role-Based Access Control** - Deny-by-default RBAC with owner > admin > member hierarchy
- **Team Management** - Invite members via email (Postmark), assign roles, revoke access
- **Subscription Billing** - Paddle integration with webhook signature verification
- **Subscription State Machine** - active, past_due, cancelled, trialing states
- **Auth0 Authentication** - Enterprise-grade identity with organization context

## RBAC Model

| Action | member | admin | owner |
|--------|--------|-------|-------|
| org:read | yes | yes | yes |
| org:update | - | yes | yes |
| org:delete | - | - | yes |
| member:invite | - | yes | yes |
| member:remove | - | yes | yes |
| member:update_role | - | - | yes |
| billing:manage | - | - | yes |
| billing:view | - | yes | yes |
| customer:create | - | yes | yes |
| customer:view | yes | yes | yes |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict)
- **Auth**: Auth0 (@auth0/nextjs-auth0)
- **Database**: PostgreSQL + Drizzle ORM
- **Billing**: Paddle
- **Email**: Postmark
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + fast-check

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Run database migrations (requires running PostgreSQL)
pnpm db:push

# Start development server
pnpm dev
```

## Auth0 Configuration

1. Create an Auth0 application (Regular Web Application)
2. Set the callback URL to `http://localhost:3000/api/auth/callback`
3. Set the logout URL to `http://localhost:3000`
4. Enable Organizations in your Auth0 tenant
5. Copy the credentials to `.env.local`

## Database Schema

The Drizzle schema defines:
- `organizations` - Multi-tenant workspaces
- `memberships` - User-to-org relationships with roles
- `customers` - Paddle customer records per org
- `subscriptions` - Subscription state per org
- `processed_events` - Idempotent webhook event tracking

## Paddle Webhook

The `/api/webhooks/paddle` endpoint:
1. Reads the raw request body
2. Verifies the Paddle-Signature header (HMAC-SHA256)
3. Processes subscription lifecycle events idempotently
4. Rejects requests with invalid signatures (returns 400)

## Postmark Email

Team invitations are sent via Postmark:
- Invite endpoint at `/api/invite`
- Requires admin+ role to send invites
- Sends structured HTML + text emails

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage
```

### Test Categories

- `tests/unit/` - Unit tests for policies, config, billing, and mail
- `tests/integration/` - Auth flow and action workflow tests
- `tests/property/` - Property-based tests with fast-check
  - Property 4: Auth and RBAC consistency
  - Property 5: Webhook authenticity gates state transitions
- `tests/smoke/` - Module import and build verification

## Deployment

1. Set all environment variables in your hosting platform
2. Run `pnpm db:push` to apply schema to production database
3. Configure Auth0 with production URLs
4. Set up Paddle webhook endpoint pointing to `/api/webhooks/paddle`
5. Deploy with `pnpm build && pnpm start`

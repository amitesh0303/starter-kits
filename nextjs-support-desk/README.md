# Support Desk - Next.js SaaS Starter

A customer support ticketing system built with Next.js App Router, Auth.js, PostgreSQL/Prisma, Cloudflare R2, and Resend.

> **Note:** This starter has **no monetization** provider. It is a free-to-use support desk solution.

## Features

- **Ticket Management** - Customers create tickets, agents manage the queue
- **Team-based Access** - Agents organized in teams with admin/agent roles
- **File Attachments** - Upload files to Cloudflare R2 with MIME type and size validation
- **Email Notifications** - Ticket creation and reply notifications via Resend
- **Ownership-based Access** - Customers see only their tickets, agents see team tickets
- **Priority & Status Tracking** - Low/medium/high/urgent priority, open/in_progress/resolved/closed status

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Auth:** Auth.js (next-auth v5)
- **Database:** PostgreSQL + Prisma ORM
- **Storage:** Cloudflare R2 (S3-compatible)
- **Email:** Resend
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest + fast-check

## Getting Started

### Prerequisites

- Node.js LTS (v20+)
- pnpm 10.x
- PostgreSQL database
- Cloudflare R2 bucket
- Resend account

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate

# Start development server
pnpm dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Auth.js session encryption secret |
| `NEXTAUTH_URL` | Application URL for Auth.js |
| `DATABASE_URL` | PostgreSQL connection string |
| `RESEND_API_KEY` | Resend API key for email |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key ID |
| `R2_SECRET_ACCESS_KEY` | R2 secret access key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | R2 public URL for file access |
| `NEXT_PUBLIC_APP_URL` | Public application URL |

## Architecture

```
app/             - Next.js pages and API routes
domain/          - Business entities and authorization policies
lib/server/      - Server adapters (auth, storage, mail, database)
prisma/          - Database schema and migrations
tests/           - Unit, integration, property, and smoke tests
```

### Domain Models

- **Team** - Support team (groups agents)
- **Agent** - Team member with admin or agent role
- **Ticket** - Customer support request with status and priority
- **Message** - Reply on a ticket (by customer or agent)
- **Attachment** - File attached to a message (stored in R2)

### Authorization

Deny-by-default ownership-based access:
- Any authenticated user can create tickets
- Ticket customer can view, reply to, and close their own tickets
- Team agents can view, reply to, and close all team tickets
- Only admin agents can assign tickets

### File Upload

Files are validated BEFORE upload to R2:
- Maximum size: 10 MB
- Allowed types: images, PDFs, documents, spreadsheets, CSV, ZIP

## Testing

```bash
# Run all tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Production build
pnpm build
```

### Test Coverage

- **Unit tests** - Domain policies, storage validation, mail adapter
- **Integration tests** - Ticket lifecycle, auth flows
- **Property tests** - Auth consistency (Property 4), file limits enforcement
- **Smoke tests** - Module resolution and import verification

## Deployment

1. Set up a PostgreSQL database (Neon, Supabase, or self-hosted)
2. Create a Cloudflare R2 bucket with public access
3. Set up a Resend account and verify your domain
4. Configure Auth.js providers (Google, GitHub, email, etc.)
5. Deploy to Vercel, Railway, or any Node.js hosting platform
6. Run `pnpm db:migrate` against your production database

## License

MIT

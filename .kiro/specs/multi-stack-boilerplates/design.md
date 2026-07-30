# Design Document

## Overview

The repository delivers the finalized catalog of 52 independently installable, runnable, testable, buildable, and documented starters. A family architecture standardizes outcomes and file roles, not source reuse: every starter owns all runtime code, provider adapters, schemas, migrations, fixtures, assets, validation configuration, and documentation it needs. No starter imports from the repository root or another starter, and no root package is a runtime/build dependency of a starter.

Implementation uses current stable, redistributable releases available when each starter is built and pins exact direct dependency versions in the project-local manifest and lockfile. JavaScript/TypeScript projects use pnpm, Python projects use uv, Go uses modules, .NET uses dotnet tooling, and Spring uses a committed Maven Wrapper. Scaffold generators are invoked at pinned versions and their commands are recorded in each Starter_README.

## Architecture

### Repository organization

```text
Repository_Root/
├── README.md                    # visible 52-entry catalog, comparison guide, statuses
├── LICENSE                      # original repository code license
├── catalog/
│   ├── starters.json            # authoritative machine-readable catalog/status metadata
│   └── starters.schema.json     # closed schema and enumerations
├── scripts/
│   └── validate-catalog.mjs     # read-only, Windows-compatible one-shot validator
├── package.json                 # root metadata-validation command only
├── pnpm-lock.yaml               # root validator dependency lock (validator prefers Node stdlib)
├── .github/workflows/           # phased catalog and per-starter CI matrices
├── .kiro/                       # specification artifacts, not application code
└── <52 exact starter folders>/  # direct children; each is independently complete
```

`catalog/starters.json` contains exactly 52 objects with `id`, `folder`, `family`, `useCase`, `framework`, `runtime`, `technologies`, `choices`, `auth`, `data`, `monetization`, `integrations`, `readsEnvironment`, `manifest`, `lockfile`, `readme`, `familyRequirement`, and `status`. `status` is exactly one of `pending`, `in progress`, or `complete`. Each starter contains a project-local `starter.json` projection of its immutable identity and chosen alternatives. Root metadata may be read by repository tooling, but starter commands never read it.

### Catalog validation interface

The one-shot command is `pnpm catalog:validate`, implemented by `node scripts/validate-catalog.mjs` with `node:path`, `node:fs/promises`, and URL-safe path normalization only; it uses no shell syntax and behaves identically in PowerShell, cmd.exe, Linux, and macOS. It is read-only and emits all discrepancies before setting a nonzero exit code.

```ts
interface CatalogDiagnostic {
  starter?: string;
  category: "folder" | "metadata" | "family" | "readme" | "status" |
    "manifest" | "lockfile" | "environment" | "license" | "independence";
  field?: string;
  expected: string;
  observed: string;
  correctiveAction: string;
  requirement?: string;
}
```

Validation loads and schema-checks the root catalog; proves catalog folder uniqueness and exact expected set/counts; checks all expected folders and rejects extra starter-like root folders; compares each project-local `starter.json`; checks exactly one family mapping; verifies Starter_README, required Environment_Template, manifest, idiomatic lockfile, license notices, and ignored artifacts; parses Root_README markers to prove one exact status and entry per starter, correct family section, visible field values, and resolvable folder/README/setup links; detects `file:`, `link:`, `workspace:`, parent-path runtime imports, and repository application-package dependencies; and reports all failures. Successful output states that all 52 entries were checked. Final-completion mode additionally requires all statuses to be `complete` and zero applicable-criterion failures.
### Family architecture and project-local patterns

All provider clients are behind project-local interfaces so default tests use deterministic in-memory/fake adapters. Real credentials are never required for install, lint, unit/property tests, or default builds; provider test-mode and manual verification are separate README procedures.

#### 1. Web SaaS blueprint

```text
<starter>/
├── app|src/                 # public page, auth routes, protected dashboard, domain UI/actions
├── domain/                  # entities, policies, pure state transitions
├── server|lib/server/       # auth, persistence, provider adapters, config boundary
├── migrations|prisma|drizzle|supabase|db/
├── jobs/                    # only when applicable; bounded retries and terminal state
├── api/webhooks/            # verified before dispatch
├── tests/                   # authn/authz, action, billing/webhook, jobs
├── .env.example
├── starter.json
├── README.md
└── project-local manifests, lockfile, lint/type/build config
```

Every starter has a public product page, sign-in/enrollment flow, protected dashboard, one persisted use-case action, repeatable schema initialization, and the assigned monetization. `IdentityPort`, `Repository`, `BillingPort`, `MailPort`, `ObjectStorePort`, and `JobPort` are local interfaces only when applicable. Webhooks pass raw body plus signature to `WebhookVerifier` before an idempotent domain transition. Subscription starters persist customer, entitlement, renewal/expiry, and cancellation state; usage starters persist a unique usage key; booking/commerce starters bind payment state to booking/order state.

#### 2. API/backend blueprint

```text
<starter>/
├── src|app/<modules>/        # transport -> application -> domain -> infrastructure
├── migrations/              # repeatable persistent schema
├── openapi/                 # generated contract or checked-in source
├── workers|jobs/            # where assigned
├── tests/                   # contract, auth, validation, state, rate limit, restart
├── Dockerfile
├── .dockerignore
├── .env.example
├── starter.json
└── README.md + local manifests/lockfile/tool config
```

A request receives/generates a correlation ID, passes configurable rate limiting, authentication/authorization, and typed validation, then enters a transaction. Errors use stable `{ code, message, correlationId, details? }` responses with sanitized details. Commit occurs only after all preconditions; failures before it roll back. Every service exposes `/health`, structured JSON logs, OpenAPI for every public route, container and local startup, and a documented error-reporting adapter. Jobs have submission, processing, bounded retry, idempotency, and terminal failure. Restart tests use a real ephemeral persistent store, not process memory.

#### 3. Expo Android-first blueprint

```text
<starter>/
├── app/                      # Expo Router groups and deep-link destinations
├── src/domain/               # pure use-case and eligibility rules
├── src/adapters/             # auth, API, permission, push, purchase, maps/device adapters
├── src/storage/              # SecureStore and SQLite repositories
├── src/sync/                 # persisted bounded queue, stable action IDs, conflict policy
├── __tests__/                # routes, lifecycle deep links, states, permissions, queue, purchase
├── app.config.ts
├── eas.json                  # development, preview, production
├── .env.example
├── starter.json
└── README.md + pnpm manifest/lockfile
```

All twelve use Expo Router, unique `com.example.<starterToken>` Android package placeholders, a documented scheme/route, Android adaptive-icon/permission config, and EAS profiles. Sensitive local values use SecureStore; durable domain/cache/queue state uses SQLite. Mutable offline actions use a capacity-bounded queue with stable UUID idempotency keys and states `pending|syncing|applied|conflict|failed|cancelled`; acknowledgement retries cannot create a second domain effect. Cold-start links wait for config/auth hydration; warm/background links push or replace only the destination branch. Permission adapters model explanation, request, denial, settings/retry, and grant. Digital goods use RevenueCat/assigned store purchase boundary; Stripe is allowed only for eligible physical transactions.

#### 4. Content/AdSense blueprint

```text
<starter>/
├── src/content|content|data/ # typed records/front matter/imports
├── src/pages|app|pages/      # static/SSR indexable routes
├── src/seo/                  # metadata, canonical, robots, sitemap, structured data, RSS
├── src/components/Ad.*       # shared consent-aware reserved-size ad component
├── src/analytics/            # one consent-consuming initializer
├── tests/                    # metadata/schema/feed/ads/routes/disclosures
├── scripts/validate-site.*   # built-output checks, no watch mode
├── .env.example              # only when configuration is read
├── starter.json
└── README.md + local manifests/lockfile/config
```

A shared `IndexableDocument` projection drives canonical metadata, robots, sitemap, structured data, and RSS to prevent divergent eligibility rules. Each subtype adds its schema vocabulary. The ad component reserves configured mobile/tablet/desktop dimensions before any provider call and keeps them when blocked, delayed, unavailable, or denied consent. One consent store gates both ads and analytics. Production-output validation checks metadata bounds/uniqueness, schema fields, links, sitemap/robots, feed eligibility/order, ad geometry, CLS <= 0.10, a documented weight/loading budget, and serious/critical accessibility findings.

#### 5. Beginner static blueprint

Each project has only `src/pages|app`, a shared layout, navigation, footer, at least two reusable content components, public assets, SEO/sitemap config, tests, and README. It renders three or four pages (home, about, contact, and optional projects), uses no service account or runtime secret, includes comments at the root layout, one component, and static-output setting, and exports deployable static files. Contact is a replaceable `mailto:` link or an explicitly non-submitting demo. Playwright-based built-output checks cover links, keyboard/focus semantics, accessibility, and horizontal overflow at documented mobile/tablet/desktop viewports.

### Common local interfaces

```ts
interface ConfigSpec { name: string; visibility: "client-safe" | "server-only"; required: boolean }
interface AuthContext { subject: string; tenantId?: string; roles: string[] }
interface Authorizer<R, A> { can(context: AuthContext, resource: R, action: A): boolean }
interface VerifiedEvent<T> { providerEventId: string; type: string; payload: T }
interface WebhookVerifier<T> { verify(rawBody: Uint8Array, headers: Headers): VerifiedEvent<T> }
interface RetryPolicy { maxAttempts: number; baseDelayMs: number }
interface PendingAction<T> { id: string; kind: string; payload: T; state: string; attempts: number }
interface ConsentState { advertising: boolean; analytics: boolean; updatedAt: string }
```

Equivalent interfaces are implemented independently and idiomatically in each folder; these definitions describe contracts, not a shared package.
## Concrete Starter Design Matrix

The matrix is normative for implementation planning. “Scaffold” means generate at the exact pinned stable version selected during implementation, then commit the resulting local manifest and lockfile. Provider SDK versions are also exact-pinned. Validation profile abbreviations expand as follows:

- **NXT**: pnpm; Vitest + Testing Library + fast-check, Playwright smoke where UI applies; ESLint, `tsc --noEmit`, `next build`.
- **VRT**: pnpm; Vitest + Testing Library + fast-check; ESLint, `tsc --noEmit`, `vite build`.
- **SVK**: pnpm; Vitest + fast-check + Playwright; ESLint/Prettier, `svelte-check`, `vite build`.
- **NUX**: pnpm; Vitest + fast-check + Nuxt test utils/Playwright; ESLint, `nuxi typecheck`, `nuxi build|generate`.
- **AST**: pnpm; Vitest + fast-check + Playwright; ESLint, `astro check`, `astro build`.
- **PYD/PYF**: uv; pytest + Hypothesis; Ruff format/check, mypy, Django `check` or FastAPI import check, package/container build.
- **NFT/NES**: pnpm; Vitest/Jest + fast-check + Supertest; ESLint, `tsc --noEmit`, production compile.
- **GO**: Go modules; `go test` + rapid, golangci-lint, `go vet`, `go build`.
- **DOT**: dotnet; xUnit + FsCheck, `dotnet format --verify-no-changes`, `dotnet test`, `dotnet publish`.
- **SPR**: Maven Wrapper; JUnit + jqwik, Spotless/Checkstyle, `mvnw.cmd test`, `mvnw.cmd package`.
- **EXP**: pnpm; Jest + React Native Testing Library + fast-check, ESLint, `tsc --noEmit`, `expo export --platform android` plus EAS config smoke.
- **ELV/HUG**: pnpm Eleventy tests + fast-check/Playwright, or Go-based Hugo with Node Playwright checks; lint/config check, static production build.

### Web SaaS (1–15)

| # | Folder | Exact framework/runtime and scaffold | Primary domain models | Auth; persistence/content | Monetization; other providers | Representative flow | Tests/lint/build |
|---:|---|---|---|---|---|---|---|
| 1 | `nextjs-supabase-saas` | Next.js App Router + Node LTS + TS; `create-next-app` | Tenant, Membership, Project, Subscription | Supabase Auth; Supabase Postgres SQL migrations/RLS | Stripe subscriptions; Resend | owner creates tenant/project, invites member, subscribes, webhook grants entitlement, welcome email | NXT + RLS/authz, Stripe signature/state, Resend fake |
| 2 | `nextjs-ai-saas` | Next.js App Router + Node LTS + TS; `create-next-app` | Workspace, Conversation, Message, Generation, Entitlement | Clerk; Neon Postgres + Prisma | Lemon Squeezy subscription; OpenAI-compatible server adapter | signed-in user generates response through server, usage recorded, entitlement synced by verified webhook | NXT + AI fake, secret-boundary and webhook tests |
| 3 | `nextjs-b2b-saas` | Next.js App Router + Node LTS + TS; `create-next-app` | Organization, Membership, Role, Customer, Subscription | Auth0; PostgreSQL + Drizzle | Paddle; Postmark | admin assigns role and creates customer; Paddle webhook updates org plan; Postmark invites | NXT + RBAC matrix, Paddle verification, mail fake |
| 4 | `nextjs-booking-saas` | Next.js App Router + Node LTS + TS; `create-next-app` | Provider, Availability, Booking, Payment | Auth.js; PostgreSQL + Prisma | Stripe payments; Google Calendar, Resend | user reserves slot, payment confirms booking, calendar event/email created; cancellation remains consistent | NXT + concurrency/booking-payment/webhook tests |
| 5 | `nextjs-lms-saas` | Next.js App Router + Node LTS + TS; `create-next-app` | Course, Lesson, Enrollment, Progress, Subscription | Clerk; Neon + Prisma | Stripe memberships; Mux, UploadThing | creator uploads video, learner enrolls, verified payment unlocks lesson and progress | NXT + upload/video fakes, entitlement tests |
| 6 | `nextjs-support-desk` | Next.js App Router + Node LTS + TS; `create-next-app` | Team, Agent, Ticket, Message, Attachment | Auth.js; PostgreSQL + Prisma | None; Resend, Cloudflare R2 | customer opens ticket with attachment, agent replies, transactional notification sent | NXT + ownership, file limits, R2/Resend fakes |
| 7 | `nextjs-automation-saas` | Next.js App Router + Node LTS + TS; `create-next-app`; **Inngest chosen** | Workflow, Trigger, Run, StepAttempt, Subscription | Clerk; Neon + Drizzle | Stripe; Inngest | user defines workflow, event starts run, bounded retries end success/terminal failure, plan gates runs | NXT + Inngest test harness, retry/property tests |
| 8 | `nextjs-file-saas` | Next.js App Router + Node LTS + TS; `create-next-app`; **R2 + Inngest chosen** | FileAsset, ConversionJob, OutputAsset, Subscription | Clerk; Neon + Drizzle; Cloudflare R2 | Stripe; Inngest jobs | validated upload enters R2, conversion job emits output, quota/entitlement displayed | NXT + size/type, job terminal state, R2 fake |
| 9 | `react-admin-saas` | React + Vite + Node LTS + TS; `create-vite`; **Supabase Postgres chosen** | Organization, UserRole, Customer, Deal, Invoice | Auth0; Supabase Postgres; TanStack Query | Stripe; shadcn/ui | authorized staff advances deal and starts customer billing; dashboard invalidates query cache | VRT + MSW, RBAC, Stripe adapter, production build |
| 10 | `react-collaboration-saas` | React + Vite + Node LTS + TS; `create-vite` | Workspace, Document, Board, Member, Subscription | Clerk; Convex | Stripe; Liveblocks | members co-edit document/board presence; plan controls collaborators | VRT + Convex/Liveblocks fakes, conflict/authz tests |
| 11 | `sveltekit-ai-saas` | SvelteKit + Node LTS + TS; `sv create` | Account, Dataset, Generation, UsageEvent, MeterState | Supabase Auth/Postgres | Stripe Billing Meters; OpenAI-compatible adapter | authenticated generation records unique usage then sends current Billing Meter event and displays total | SVK + meter idempotency/webhook tests; no retired usage-record API |
| 12 | `nuxt-community-saas` | Nuxt + Node LTS + TS; `nuxi init` | Community, Membership, Thread, Post, Subscription | Better Auth; PostgreSQL + Drizzle | Paddle; Tailwind | member subscribes, joins community, creates moderated thread, webhook updates access | NUX + policy, Paddle signature/state tests |
| 13 | `django-analytics-saas` | Django + Python stable; `uv init` + `django-admin startproject` | Account, Dashboard, DataSource, Report, ImportJob, Subscription | django-allauth; PostgreSQL | Stripe; Celery, Redis, Django Admin | user queues data import, report aggregates data, retries terminate, plan gates reports | PYD + pytest-django/Hypothesis, Celery eager/fake Redis |
| 14 | `remix-commerce-saas` | Remix + Node LTS + TS; `create-remix`; **Shopify API + Auth.js chosen** | Merchant, ProductRef, Cart, Order, Payment | Auth.js; Shopify API with local order state | Stripe; Shopify | merchant syncs products, buyer checks out physical goods, verified event binds payment to order | NXT-equivalent Remix build + Vitest/Playwright/fast-check |
| 15 | `astro-membership-site` | Astro SSR + Node LTS + TS; `create astro`; **Turso chosen** | Member, Article, AccessGrant, Subscription | Clerk; Turso/LibSQL | Stripe; Resend | visitor subscribes, webhook grants premium article access, welcome email previews locally | AST SSR + auth/access, webhook, mail fake tests |
### API/Backend (16–24)

| # | Folder | Exact framework/runtime and scaffold | Primary domain models | Auth; persistence | Monetization; other providers | Representative flow | Tests/lint/build |
|---:|---|---|---|---|---|---|---|
| 16 | `django-api-backend` | Django + DRF + Python stable; uv + `django-admin` | User, APIResource, Subscription, ProcessedEvent | allauth/token auth; PostgreSQL ORM/migrations | Stripe; drf-spectacular OpenAPI | authorized CRUD commits resource; Stripe event updates subscription | PYD + DRF contract, rate/state/restart/webhook tests |
| 17 | `fastapi-ai-backend` | FastAPI + Python stable; uv scaffold | User, Document, InferenceJob, Usage, Subscription | OAuth2/JWT; SQLAlchemy + PostgreSQL | Stripe; Redis, Celery, OpenAI-compatible adapter | validated document queues inference, worker retries, result/usage persists | PYF + Hypothesis, Celery/provider fakes, OpenAPI contract |
| 18 | `fastapi-data-platform` | FastAPI + Python stable; uv scaffold | Dataset, Ingestion, TransformRun, Artifact | signed service JWT; PostgreSQL + SQLAlchemy, DuckDB; S3-compatible object adapter | None; Celery + Redis selected workers | upload reference starts ingestion, DuckDB transform writes versioned artifact | PYF + object/worker fakes, persistence/restart tests |
| 19 | `fastify-commerce-api` | Fastify + Node LTS + TS; project-local scaffold | Product, Cart, CartItem, Order, Payment | JWT; PostgreSQL + Prisma; Redis | Stripe Checkout | authorized cart becomes order; verified checkout atomically marks payment/order | NFT + Supertest/fast-check, OpenAPI, rate/webhook/state |
| 20 | `fastify-realtime-api` | Fastify + Node LTS + TS; project-local scaffold | User, Channel, Membership, Message, Presence | JWT; PostgreSQL + Drizzle; Redis | None; WebSockets | authorized join publishes message/presence and persists message | NFT + WebSocket integration, authz/rate/restart tests |
| 21 | `nestjs-b2b-api` | NestJS + Node LTS + TS; Nest CLI | Tenant, Membership, Role, Customer, Job, Subscription | Passport JWT; PostgreSQL + Prisma | Stripe; BullMQ/Redis | tenant admin mutates customer, queues export, bounded retries; plan synced | NES + Jest/fast-check/Supertest, BullMQ/Stripe fakes |
| 22 | `go-webhook-service` | Go stable; `go mod init`; **Chi chosen** | Client, WebhookEndpoint, Delivery, Attempt, ProcessedEvent | JWT; PostgreSQL + pgx; Redis | None | authenticated client registers endpoint; signed inbound event dedupes and delivery retries terminate | GO + rapid, httptest, OpenAPI comparison, restart test |
| 23 | `dotnet-enterprise-api` | ASP.NET Core current LTS; `dotnet new webapi`; **PostgreSQL chosen** | IdentityUser, Organization, Contact, Opportunity, Subscription | ASP.NET Identity/JWT; EF Core + PostgreSQL | Stripe | permitted user advances opportunity; billing webhook updates organization entitlement | DOT + WebApplicationFactory/FsCheck, EF container restart |
| 24 | `spring-enterprise-api` | Spring Boot current stable + Java LTS; Spring Initializr + Maven Wrapper; **Redis chosen** | User, Organization, Plan, Subscription, AuditEvent | Spring Security JWT; JPA + PostgreSQL; Redis | Stripe | admin changes plan, verified payment event updates subscription and audit log | SPR + MockMvc/Testcontainers/jqwik, wrapper package |

### Expo Mobile (25–36)

| # | Folder | Exact framework/runtime and scaffold | Primary domain models | Auth; persistence | Monetization; other providers | Representative flow | Tests/lint/build |
|---:|---|---|---|---|---|---|---|
| 25 | `expo-subscription-app` | Expo/React Native + Expo Router + Node LTS/TS; `create-expo-app` Router template | Profile, Feature, Entitlement, PendingAction | Supabase Auth; Supabase + SQLite cache/SecureStore | RevenueCat; Sentry | sign in, purchase/restore digital premium, entitlement unlocks feature, errors reported redacted | EXP + RevenueCat/Sentry fakes, deep-link/queue tests |
| 26 | `expo-admob-utility` | Expo Router Android-first; `create-expo-app` | Calculation, ScanResult, History, AdRemoval | anonymous/local identity; SQLite | AdMob + optional store ad removal via RevenueCat; Firebase Analytics | use calculator/converter offline, scanner permission flow, consent-aware ad or paid removal | EXP + permission/ad eligibility/analytics-consent tests |
| 27 | `expo-ai-companion` | Expo Router Android-first; `create-expo-app` | Conversation, Message, TutorSession, Entitlement | Supabase Auth; Supabase + SQLite/SecureStore | RevenueCat; server AI API only | user sends queued prompt to secure backend, response caches, premium limits enforced | EXP + no-client-secret, AI fake, purchase/queue tests |
| 28 | `expo-social-community` | Expo Router Android-first; `create-expo-app` | Profile, Post, Comment, Conversation, PendingAction | Clerk; Convex + SecureStore/SQLite queue | None; Stream Chat, Expo push | user posts/comment offline then syncs once; chat notification deep-links to thread | EXP + Convex/Stream/push fakes, auth/deep-link/queue |
| 29 | `expo-marketplace-app` | Expo Router Android-first; `create-expo-app`; Google Maps chosen | Profile, Listing, Order, ConnectAccount, PendingAction | Supabase Auth/data + SQLite/SecureStore | Stripe Connect physical services/goods; Algolia, Google Maps | search nearby listing, book/buy physical offering, Connect payment updates order | EXP + physical-eligibility, maps/search/payment fakes |
| 30 | `expo-booking-app` | Expo Router Android-first; `create-expo-app`; **Supabase chosen**, expo-calendar + Google Maps | Provider, Availability, Booking, Payment, PendingAction | Supabase Auth/data + SQLite/SecureStore | Stripe eligible appointment/rental; Calendar, Maps, push | select slot/map, pay for service, add calendar event, receive reminder | EXP + slot/payment consistency, permission/push tests |
| 31 | `expo-habit-fitness-app` | Expo Router Android-first; `create-expo-app` | Habit, Workout, HealthSample, Streak, Entitlement | Firebase Auth/Firestore + SQLite/SecureStore | RevenueCat; Health Connect, push | granted health permission imports metrics, queues habit completion, premium plan unlocks analytics | EXP + Health adapter granted/denied/retry, purchase |
| 32 | `expo-content-reader` | Expo Router Android-first; `create-expo-app`; **Sanity chosen** | Article, Category, Bookmark, Download | optional local profile; Sanity + SQLite offline cache | AdMob; Firebase Messaging | sync articles, read saved content offline, notification opens article, consent gates ads | EXP + cache/push/deep-link/ad-consent tests |
| 33 | `expo-local-first-app` | Expo Router Android-first; `create-expo-app` | Workspace, Note, InventoryItem, Mutation, SyncConflict | Supabase Auth/data; SQLite source of truth + SecureStore | None; Expo background task | edit offline, persist bounded mutations across restart, sync idempotently/conflict visibly | EXP + model/property queue/restart/idempotency tests |
| 34 | `expo-delivery-tracker` | Expo Router Android-first; `create-expo-app`; Google Maps chosen | Driver, Delivery, RouteStop, LocationSample | Firebase Auth/Firestore + SQLite/SecureStore | None; Maps, background location, push | driver grants background location, updates route offline, dispatcher push opens delivery | EXP + permission lifecycle, bounded queue, push/deep-link |
| 35 | `expo-event-app` | Expo Router Android-first; `create-expo-app` | Event, Ticket, Attendee, Scan, Connection | Supabase Auth/data + SQLite/SecureStore | Stripe only eligible physical-event tickets; QR scanner, push | buy physical-event ticket, scan QR once offline, sync attendance, notification opens event | EXP + QR permission, duplicate scan, eligibility/push |
| 36 | `expo-ecommerce-app` | Expo Router Android-first; `create-expo-app`; Shopify predictive search | Product, Cart, Checkout, Order, Favorite | Shopify customer token in SecureStore; Storefront API + SQLite cache | Shopify native checkout for physical goods; push | search/add physical item offline, resume Shopify checkout, order notification deep-links | EXP + Storefront/checkout fakes, cart queue/deep-link |
### Content/AdSense (37–50)

| # | Folder | Exact framework/runtime and scaffold | Primary content/domain models | Auth; source | Monetization; other providers | Representative flow | Tests/lint/build |
|---:|---|---|---|---|---|---|---|
| 37 | `astro-adsense-blog` | Astro static + Node LTS/TS; `create astro` | Author, Article, Category | None; MDX content collections | AdSense; analytics, RSS | publish article with Article schema; feed/sitemap include it; consent enables ads/analytics | AST + built-output SEO/feed/ad/a11y/perf |
| 38 | `astro-affiliate-site` | Astro static + Node LTS/TS | Review, Product, Comparison | None; MDX | affiliate links + AdSense; analytics | publish disclosed comparison with Product/Review schema and relationship attributes | AST + disclosure/link/schema/ad tests |
| 39 | `nextjs-directory-site` | Next.js App Router + Node LTS/TS; **Meilisearch chosen** | Listing, Category, Location, Claim | None; Supabase Postgres + Drizzle | AdSense; Meilisearch | browse/search listing, canonical detail emits LocalBusiness schema | NXT + DB/search fake, SEO/ad/perf built-output |
| 40 | `nextjs-programmatic-seo` | Next.js App Router + Node LTS/TS; **Drizzle chosen**, Inngest imports | Dataset, ImportRun, LandingPage | None; PostgreSQL + Drizzle | AdSense; Inngest | scheduled validated import upserts pages; eligible unique pages enter sitemap | NXT + import retry/idempotency, metadata uniqueness |
| 41 | `nextjs-tools-site` | Next.js static generation + Node LTS/TS | ToolDefinition, ToolInput, ToolResult | None; static typed data | AdSense; analytics; optional local route handler API | user runs pure calculator/generator; result stays client-local; consent gates providers | NXT export + fast-check tool invariants, SEO/ad |
| 42 | `nextjs-job-board` | Next.js App Router + Node LTS/TS; **Clerk chosen** | Employer, Job, ApplicationLink, ListingPayment | Clerk; PostgreSQL + Drizzle | Stripe paid listings + AdSense | employer pays to publish job; verified event indexes JobPosting page; feed updates | NXT + authz/webhook/feed/disclosure/ad tests |
| 43 | `nuxt-magazine-site` | Nuxt static/hybrid + Node LTS/TS; **Nuxt Content chosen** | Author, Article, Section, NewsletterSignup | None; Nuxt Content Markdown | AdSense; image optimization, Resend newsletter | editor publishes news item, optimized page/feed/sitemap update, signup uses server boundary | NUX + content/feed/image/email fake/ad/perf |
| 44 | `nuxt-local-directory` | Nuxt hybrid + Node LTS/TS; **MapLibre/OpenStreetMap + Meilisearch chosen** | Business, Category, Location, Sponsorship | None; Supabase Postgres | AdSense + sponsored listings; maps/search | search map directory, sponsored result visibly disclosed, LocalBusiness schema emitted | NUX + ranking disclosure, map/search fakes, SEO/ad |
| 45 | `eleventy-static-site` | Eleventy + Node LTS; local config | Document, NavigationItem, Update | None; Markdown/data files | AdSense; RSS, sitemap | author adds Markdown page/update; static build links it in navigation/feed/sitemap | ELV + HTML/link/feed/ad/a11y/perf checks |
| 46 | `hugo-content-site` | Hugo extended stable; `hugo new site`; **Pagefind chosen** | Page, Section, Author, Update | None; Markdown | AdSense + affiliate links; Pagefind | large content build creates search index, RSS, sitemap, disclosed affiliate pages | HUG + `hugo --panicOnWarning`, Pagefind/link/ad checks |
| 47 | `astro-recipe-site` | Astro static + Node LTS/TS | Recipe, Ingredient, Instruction, Tutorial | None; Astro content collections | AdSense | publish recipe/tutorial, validated Recipe or HowTo JSON-LD and RSS/sitemap appear | AST + schema generators/feed/ad/perf |
| 48 | `astro-comparison-site` | Astro static + Node LTS/TS | Product, Comparison, Criterion, Offer | None; content collections | affiliate links + AdSense | render disclosed best-of table with Product/ItemList schema and rel attributes | AST + table/schema/disclosure/ad tests |
| 49 | `nextjs-coupon-site` | Next.js App Router + Node LTS/TS; **Meilisearch + Inngest chosen** | Merchant, Coupon, FeedImport, ClickAttribution | None; PostgreSQL + Drizzle | affiliate tracking + AdSense; search/scheduled feeds | import dedupes coupons, user searches and follows disclosed tracked offer, feed ordered | NXT + import retry/idempotency, link/feed/SEO/ad |
| 50 | `nextjs-real-estate-directory` | Next.js App Router + Node LTS/TS; **MapLibre/OpenStreetMap + Cloudflare R2 chosen** | Property, Agent, Image, Promotion | None; PostgreSQL + Drizzle; R2 images | AdSense + promoted listings; maps | publish image-validated listing, promoted placement disclosed, RealEstateListing schema/map page | NXT + upload limits/R2/map fakes, disclosure/SEO/ad |

### Beginner Static (51–52)

| # | Folder | Exact framework/runtime and scaffold | Primary models/pages | Auth; source | Monetization/providers | Representative flow | Tests/lint/build |
|---:|---|---|---|---|---|---|---|
| 51 | `astro-beginner-static-site` | Astro static + Node LTS/TS; `create astro`; **plain CSS chosen** | SiteConfig; Home, About, Contact, Projects | None; local TS/Markdown | None | beginner edits content/component, builds static pages and sitemap, deploys to Cloudflare Pages or GitHub Pages | AST without service tests + Playwright overflow/a11y/link checks |
| 52 | `nextjs-beginner-static-site` | Next.js static export + Node LTS/TS; `create-next-app`; **CSS Modules chosen** | SiteConfig; Home, About, Contact, Projects | None; local TS | None | beginner edits component/page, exports `out/` with sitemap, deploys to Vercel static or Netlify | NXT static-export profile + dependency allowlist/overflow/a11y/link checks |

## Concise Data Model Rules

The “Primary domain models” column is the complete minimum model set for each starter. Implementations may add join/value objects needed by their ORM, but may not replace those named concepts with generic `Item` or `Record` models. Every mutable server-side model has an ID, ownership/tenant key where applicable, timestamps, and a concurrency/version or uniqueness mechanism appropriate to the stack. Billing/webhook models store provider IDs uniquely and processed-event IDs for deduplication. Mobile queued actions store stable IDs, payload version, attempts, timestamps, and state. Content models carry slug, canonical URL, title, description, publication/indexability state, schema fields, and deterministic publication ordering fields.
## Root README and Metadata Representation

The root README is a visible, searchable catalog, not a generated-only application. Family sections are delimited by validator markers and contain exactly the required counts. Each row includes status, exact folder link, Starter_README/setup anchor link, family, use case, framework, auth or `None`, data/content source or `None`, monetization or `None`, and integrations. A comparison guide maps each family to Requirements 3–7, explains optional capabilities, states independence and intentional framework reuse, and uses factual non-endorsement language.

`catalog/starters.json` is the normalized source for exact values; README rows must match it. During phased delivery all 52 rows always remain present and each has exactly one status. A status can become `complete` only after that starter's standalone CI and all mapped criteria pass. Root validation never silently rewrites README or metadata.

## Environment and Security Boundaries

Each starter that reads configuration commits `.env.example` (or a framework-required equivalent) with one declared variable per actual read. Every line is documented as `client-safe|server-only`, `required|optional`, development/production scope, and a recognizable nonfunctional placeholder for secrets. A local typed config loader aggregates all missing/placeholder required names into one startup error; optional absence selects the documented fake/disabled fallback. It never prints values. `.gitignore` excludes local env files, credentials, keys, generated secrets, dependencies, caches, logs, and build artifacts.

Client-safe values are limited to public origins, public provider identifiers, and publishable keys expressly designed for clients. Database URLs, service roles, signing secrets, AI keys, payment secrets, private tokens, and provider administration operations live in server-only modules/platform secret stores. Client/server frameworks enforce separate import roots and bundle checks. Expo apps call a secured backend for privileged AI/provider operations and store sessions in SecureStore. Untrusted input is parsed into typed domain values before auth, persistence, provider, rendering, upload, or command boundaries. File starters enforce MIME/extension agreement and configurable byte limits before storage.

Authorization is deny-by-default and checks tenant/owner/role at the repository/action boundary, not only in UI. Logs redact authorization headers, cookies, passwords, tokens, keys, payment data, and starter-documented sensitive fields. Provider errors are mapped to stable sanitized outcomes. Webhook verification consumes the raw request and precedes parsing/dispatch that can mutate state. State-changing operations use transactions or compensating state machines with an explicit commit point.

## Error Handling and State Machines

- **Configuration:** aggregate missing/placeholder required names and refuse startup; optional providers become explicit disabled/fake modes.
- **Authentication/authorization:** web UI redirects or renders documented 401/403 outcomes; APIs use stable error codes; neither reveals resource existence across tenant boundaries.
- **Validation:** field/path/query/header failures occur before transactions and return stable typed details.
- **Providers:** timeout, rate limit, decline, and malformed responses become sanitized retryable/non-retryable errors; existing persistent state is preserved before commit.
- **Webhooks:** missing/invalid proof returns non-success with no event record/domain mutation; valid duplicate provider event is acknowledged without duplicate effect.
- **Jobs:** `queued -> running -> succeeded`, or `running -> retry_scheduled` while `attempts < maxAttempts`, then `terminal_failed`; max attempts is configurable and finite.
- **Mobile sync:** capacity overflow rejects only the new action while preserving queued records; retries use stable IDs; conflicts are surfaced and never silently overwrite.
- **Content:** invalid metadata/schema/feed records fail validation with source path and rule; ad/analytics denial is a normal non-loading state.

## Deployment Recommendations

| Stack | Primary deployment | Alternatives/notes |
|---|---|---|
| Next.js/Remix | Vercel or container-capable Fly.io/Render | Use managed Postgres/provider secrets; static Next.js beginner may use Netlify |
| React Vite | Cloudflare Pages/Netlify plus separately deployed API/provider backends | Static assets only; Auth0/Supabase origins configured per environment |
| SvelteKit | Vercel adapter or Node container on Fly.io | Pin adapter locally |
| Nuxt | NuxtHub/Cloudflare or Node container; static content on Netlify | Choose one adapter per starter |
| Astro | Cloudflare Pages/Netlify for static; Vercel/Node adapter for SSR membership | Adapter stays project-local |
| Django/FastAPI | Render/Fly.io/AWS container with managed PostgreSQL/Redis | Separate web and worker process definitions |
| Fastify/NestJS | Fly.io/Render/AWS container | Managed PostgreSQL/Redis and health checks |
| Go | Distroless container on Cloud Run/Fly.io | Single compiled service plus managed data stores |
| ASP.NET Core | Azure App Service/Container Apps | Managed PostgreSQL and Key Vault |
| Spring Boot | AWS App Runner/ECS or Azure Container Apps | Maven-built container, managed PostgreSQL/Redis |
| Expo | EAS Build/Submit for Android Play testing/production | iOS EAS profile where capability is portable; backend deployed separately |
| Eleventy/Hugo | Cloudflare Pages, Netlify, or GitHub Pages | Built output only; Pagefind generated in build |

Every Starter_README names at least one compatible target with prerequisites, exact build/output/start command, environment/provider configuration, callback URLs, and a post-deploy health/page/API check. Beginner READMEs name and fully describe two static hosts.

## Scale and Delivery Waves

Implementation is incremental while catalog tracking remains complete:

1. **Wave 0 — contracts/tooling:** root catalog/schema/validator/README skeleton; CI matrix; starter metadata and license policy.
2. **Wave 1 — reference slices:** one representative of each family proves blueprints and standalone-copy CI.
3. **Wave 2 — Web SaaS:** starters 1–15 in provider-similar batches, with billing/webhook and job suites.
4. **Wave 3 — APIs:** starters 16–24, including persistent restart and container tests.
5. **Wave 4 — Expo:** starters 25–36, emphasizing Android config, lifecycle links, permissions, offline queues, and purchase eligibility.
6. **Wave 5 — content/static:** starters 37–52, built-output SEO/feed/ad/performance/accessibility validation.
7. **Wave 6 — final completion:** copy each folder into an isolated CI workspace, install with frozen lockfile, run one-shot validation/build, verify provider manuals in test mode, complete licensing review, and require 52 complete statuses.

CI uses fake adapters, ephemeral local containers/emulators where persistence matters, and deterministic clocks/IDs. External credentials are not required by default CI. Separate opt-in provider test-mode jobs/manual checklists verify consoles, callbacks, webhooks, EAS purchases, notifications, maps, and deployment; live production transactions are never part of default CI.
## Correctness Properties

*A property is a characteristic or behavior that must hold across all valid executions. These properties are the nonredundant result of acceptance-criteria testability analysis; external tooling and provider behavior are covered separately by integration and smoke tests.*

### Property 1: Catalog set equality and family partition

For all observed catalog and root starter-folder sets, validation succeeds only when the starter identity set equals the 52-name normative set, every identity is unique, each immutable metadata field matches, and the family partition is exactly 15 Web_SaaS, 9 API_Backend, 12 Expo_Mobile, 14 Content_Adsense, and 2 Beginner_Static; otherwise every discrepancy is reported and validation fails.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 10.15, 10.16, 10.18, 13.1, 13.2**

### Property 2: Standalone dependency closure

For any starter and every runtime import, configuration reference, script input, fixture, schema, migration, asset, manifest dependency, or documentation dependency reachable from its commands, the resolved path is inside that starter folder and is not a `file:`, `link:`, `workspace:`, parent-path, repository application-package, or other-starter dependency.

**Validates: Requirements 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 13.4**

### Property 3: Secret and client boundary preservation

For all configuration values, source dependency graphs, provider operations, logs, and errors, values classified as server-only or sensitive never enter browser/mobile bundles or serialized logs/errors, privileged AI/provider calls cross a server boundary, secret examples remain nonfunctional placeholders, and secret-scan diagnostics identify file/rule without reproducing the secret.

**Validates: Requirements 2.12, 8.1, 8.2, 8.4, 8.5, 8.6, 8.11, 8.13, 8.14, 8.15, 9.3, 9.4**

### Property 4: Authentication and access consistency

For any protected resource/action and any identity state, access is granted if and only if authentication is valid and the starter's tenant, owner, role, or resource policy authorizes the action; absent identities receive the documented unauthenticated outcome and authenticated but disallowed identities receive the documented unauthorized outcome without protected data or mutation.

**Validates: Requirements 3.2, 3.3, 3.4, 4.2, 8.8, 10.9, 10.10**

### Property 5: Webhook authenticity gates one state transition

For any webhook payload, proof, and prior persistent state, invalid or missing authenticity proof produces a non-success outcome and identical persistent state, while a valid recognized event may produce its documented transition no more than once for a unique provider event identity.

**Validates: Requirements 3.11, 3.12, 3.13, 4.24, 8.9, 8.10, 10.11**

### Property 6: API validation, error sanitization, and state preservation

For any API request, validation or domain failure before the commit point returns the documented stable machine-readable, correlation-aware, sanitized error and leaves persistent state equal to its pre-request snapshot; a successful commit is observable through the documented read interface and survives process restart.

**Validates: Requirements 4.6, 4.7, 4.8, 4.9, 4.16, 4.26, 8.7, 8.16, 8.17**

### Property 7: Configurable rate-limit bound

For any positive threshold `L`, window `W`, identity/key, and request sequence evaluated by the configured clock, no more than `L` requests are accepted within `W`, and every excess request receives the documented limit-exceeded status and stable error code without domain mutation.

**Validates: Requirements 4.10, 4.11, 4.19, 4.27**

### Property 8: Job retry termination

For any finite positive retry limit and any sequence of retryable outcomes, a job attempts no more than the configured limit, succeeds exactly once when an attempt succeeds, and otherwise records terminal failure after exhaustion without remaining indefinitely queued or retrying.

**Validates: Requirements 3.14, 3.15, 4.12, 4.13, 4.21, 10.14**

### Property 9: Mobile pending-action capacity and idempotency

For any configured queue capacity, pending-action set, stable action identities, restart, and delivery/acknowledgement retry sequence, accepted actions persist until success or cancellation, overflow preserves all existing actions while rejecting only the new one with a recoverable outcome, and each action identity produces at most one persistent domain effect.

**Validates: Requirements 5.10, 5.11, 5.21, 5.28, 5.29, 5.30**

### Property 10: Mobile monetization eligibility

For any mobile product or transaction classification, digital features/services/content route only through the assigned mobile purchase provider, Stripe routes only eligible physical goods, physical services, marketplace, booking, rental, or physical-event transactions, and no unassigned mandatory payment provider is invoked.

**Validates: Requirements 5.17, 5.18, 5.19, 5.24, 13.3, 13.14**

### Property 11: Indexability, metadata, schema, sitemap, and robots consistency

For any generated content record, an indexable page has bounded unique title/description/canonical metadata and valid subtype structured data and appears exactly once in the sitemap, while a draft, non-indexable, robots-excluded, invalid, or noncanonical page never appears in the sitemap.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.25, 6.28**

### Property 12: RSS eligibility and deterministic order

For any feed-compatible content collection and evaluation time, the RSS feed contains exactly entries that are published, not future-dated, indexable, and canonically public, ordered newest-to-oldest by publication time with the documented deterministic tie-breaker.

**Validates: Requirements 6.7, 6.26, 6.27, 6.28**

### Property 13: Ad reserved space and shared consent

For any documented mobile, tablet, or desktop viewport and any advertising state (loading, loaded, unavailable, blocked, delayed, or withheld), the Ad_Component reserves the configured dimensions unchanged; for any consent state that disallows processing, neither advertising nor analytics initializes, and both consume the same consent state.

**Validates: Requirements 6.8, 6.9, 6.10, 6.12, 6.13, 6.16, 6.28**

### Property 14: Beginner static no-service build and dependency allowlist

For any Beginner_Static manifest and configuration, validation succeeds only when every direct runtime dependency maps to framework, selected styling, SEO, sitemap, or static-output capability and the production export requires no authentication, database, payment, queue, email, provider account, runtime secret, or external backend service; any unmapped dependency is identified and fails validation.

**Validates: Requirements 7.1, 7.2, 7.3, 7.11, 7.12, 7.15, 7.16, 13.3, 13.6**

### Property 15: Reproducible manifest, lockfile, configuration, and one-shot commands

For any starter, the declared environment-name set equals actual configuration reads, each required value is classified and validated together, the idiomatic lockfile represents the exact manifest dependency set, frozen installation leaves both unchanged, and every documented validation/build command is noninteractive and returns a process status.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.15, 9.16, 9.17, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.17, 10.19**

### Property 16: Exact root README status, field, grouping, and link mapping

For all 52 catalog identities and any allowed status assignment, the Root_README contains exactly one matching row in the correct family section with exactly one valid status, visible catalog-equal fields, and links resolving to that identity's root folder, Starter_README, and setup instructions; status transitions preserve the full identity set, and any mismatch receives the required classification.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.10, 11.11, 11.12, 11.13, 11.14, 13.9, 13.10, 13.12, 13.15, 13.16**
## Testing Strategy

Testing is dual-layered: unit/example tests prove named flows and edge states, while property tests exercise the universal properties above with at least 100 generated cases per property (more for cheap pure reducers). Every property test includes the tag `Feature: multi-stack-boilerplates, Property N: <property title>`. Shrunk counterexamples are retained in test output.

| Ecosystem | Property library | Example/unit and integration tools | Primary property targets |
|---|---|---|---|
| JS/TS web/API/content | fast-check | Vitest/Jest, Testing Library, Supertest, Playwright, MSW | policies, metadata/feed projections, retries, rate limits, webhook reducers, config/catalog parsers |
| Python | Hypothesis | pytest, pytest-django, HTTPX/TestClient, Testcontainers | validation/state preservation, auth policy, retries, redaction |
| Go | rapid (gopter is acceptable only if rapid lacks needed generators) | `testing`, httptest, Testcontainers | webhook dedupe, retry/rate policies, validation |
| .NET | FsCheck | xUnit, WebApplicationFactory, Testcontainers | authorization matrices, API state/limits, billing event reducers |
| Java/Spring | jqwik | JUnit 5, MockMvc, Testcontainers | validation, retry/rate policies, subscription transitions |
| Expo | fast-check | Jest, React Native Testing Library, mocked Expo modules, Maestro/manual device smoke | navigation reducers, queue traces, permission and purchase eligibility |
| Static output | fast-check for projections | Playwright, axe-core, Lighthouse CI or equivalent one-shot budget runner, HTML/schema/link parsers | SEO uniqueness, sitemap/feed sets, ad dimensions, dependency allowlist |

### Test layers

1. **Pure unit/property:** provider-free domain policies, state reducers, validators, metadata/feed generation, queue/retry/rate-limit algorithms, and root catalog parser.
2. **Component/request examples:** required loading/empty/offline/error/retry UI states; accepted/rejected auth; one domain action; stable API errors; webhook signed fixture; permission outcomes.
3. **Integration:** ephemeral PostgreSQL/Redis/SQLite/DuckDB/Convex test adapters as appropriate; migrations from empty state; transaction rollback; process restart persistence; OpenAPI comparison; background worker success/exhaustion; built-output crawling.
4. **Smoke:** frozen install, framework startup/health or page entry, lint/type/static analysis, production build/export, Docker build/start for APIs, `expo config`/export and EAS profile validation, README/config/artifact checks.
5. **Browser/device quality:** content and beginner production output at documented mobile/tablet/desktop widths; serious/critical accessibility failures; horizontal overflow; ad geometry and attributable CLS; notification/deep-link and protected-capability manual device checks.
6. **Provider verification:** default CI uses local fakes and signed deterministic webhook fixtures. Opt-in test-mode/manual jobs verify provider console objects, callbacks, products, entitlements, test purchases, email previews, maps/search, push credentials, and sandbox webhooks without live credentials in the repository.

### Reproducibility artifact mapping

| Ecosystem | Required project-local artifacts | Frozen/one-shot validation |
|---|---|---|
| pnpm JS/TS/Expo/Eleventy | `package.json`, `pnpm-lock.yaml`, pinned `packageManager` | `pnpm install --frozen-lockfile`; project scripts use `--run`/CI mode, never watch |
| Python uv | `pyproject.toml`, `uv.lock`, `.python-version` or README range | `uv sync --frozen`; `uv run pytest`, Ruff, mypy, build/check |
| Go | `go.mod`, `go.sum` | `go mod verify`, `go test ./...`, lint/vet/build |
| .NET | project/solution files, `packages.lock.json`, pinned SDK in `global.json` | `dotnet restore --locked-mode`, test, format verify, publish |
| Spring/Maven | `pom.xml` with exact managed/plugin versions, Maven Wrapper including `mvnw.cmd`, wrapper checksum, generated dependency-lock/checksum artifact verified by a pinned lock plugin | `mvnw.cmd`/`./mvnw` lock verification, test, package |
| Hugo | pinned Hugo version file plus local `package.json`/`pnpm-lock.yaml` for Pagefind/browser validators | Hugo production build and frozen validator install |

CI never starts watch mode. Long-running app servers used in smoke tests are launched by test harnesses with explicit readiness/timeout/teardown; documented developer servers remain manual commands.

## Documentation and Licensing

Every Starter_README follows a family-tailored template: purpose and differentiators; exact supported runtime/package manager; folder map; ordered clean setup with command and expected outcome; environment table and dev/production separation; schema/content initialization; auth/authorization; provider console/test-mode configuration and verification; representative flow; applicable jobs/sync/retries; one-shot test/lint/type/build commands; troubleshooting and sanitized failures; deployment and post-deployment check; license/attribution notes. Optional integrations are labeled and include no-config fallback behavior.

The repository root includes the original-code license. Each starter includes `THIRD_PARTY_NOTICES.md` only when incorporated material requires it, identifying material, source, license, and retained notice. Generated/scaffolded code, assets, icons, fonts, datasets, and templates are inventoried; non-redistributable material is replaced. Provider/framework names use factual compatibility wording and no affiliation claim. Catalog validation checks required notice presence but legal/license review remains a release gate.

## Design Decisions and Constraints

- Alternatives are finalized as shown in the matrix; exactly one listed alternative is implemented unless the catalog explicitly combines providers.
- Project-local duplication is intentional. Family blueprints may guide generation, but generated results are committed and self-contained; no root generator output is needed at runtime or build time.
- Root scripts inspect metadata/files only and never provide source, configuration defaults, test helpers, CSS, schema, or build plugins to a starter.
- “Complete” is a validated state, not a manual label: status promotion is blocked until applicable family, security, documentation, reproducibility, standalone-copy, licensing, and cross-cutting checks pass.
- External service availability is not conflated with application correctness. CI proves adapters and domain behavior with fakes; provider test-mode and deployment verification provide separate evidence.
- No implementation is performed by this design; it defines the artifacts and behaviors from which per-starter tasks can be generated.

## Components and Interfaces

The component boundaries and interfaces are defined in **Family architecture and project-local patterns** and **Common local interfaces**. Each starter implements those contracts locally in its own language; there is no shared runtime interface package. Concrete provider, transport, persistence, synchronization, content, and validation component selections are assigned per starter in the **Concrete Starter Design Matrix**.

## Data Models

The complete minimum per-starter model inventory is the **Primary domain models** or **Primary content/domain models** column of the 52-row matrix, together with the cross-family field invariants in **Concise Data Model Rules**. Project migrations and typed schemas are implementation sources of truth and remain project-local.

## Error Handling

Error categories, sanitized outcomes, commit behavior, webhook rejection, bounded retry, mobile queue overflow/conflict handling, and content-validation failures are defined in **Error Handling and State Machines**. These behaviors are exercised by Correctness Properties 3–9 and by the example/integration layers of the testing strategy.
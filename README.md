# Starter Kits

A curated collection of 52 independently installable, runnable, testable, buildable, and documented starter projects spanning five product families. Each starter owns all of its runtime code, provider adapters, schemas, migrations, and documentation. No starter imports from the repository root or another starter.

## How to Use

1. Browse the catalog below to find a starter that matches your use case
2. Copy or clone the starter folder into your own project
3. Follow the starter's own README for setup instructions
4. Each starter works independently with its own dependencies and configuration

## Comparison Guide

Starters are organized into five families, each governed by a dedicated requirement section:

| Family | Requirement | Count | Focus |
|--------|-------------|-------|-------|
| Web SaaS | Requirement 3 | 15 | Full-stack web applications with authentication, persistence, and billing |
| API/Backend | Requirement 4 | 9 | Server-side APIs with structured validation, rate limiting, and container deployment |
| Expo Mobile | Requirement 5 | 12 | Android-first mobile apps with offline sync, permissions, and native capabilities |
| Content/AdSense | Requirement 6 | 14 | SEO-optimized content sites with ad monetization and structured data |
| Beginner Static | Requirement 7 | 2 | Simple static sites with no external services or runtime secrets |

### Independence

Every starter is fully self-contained. You can copy any single folder out of this repository and it will install, build, test, and run without any reference to the repository root or other starters. There are no shared packages, no workspace dependencies, and no root-level runtime code.

### Intentional Framework Reuse

Multiple starters may use the same framework (e.g., Next.js App Router) because they target different use cases, domain models, and provider integrations. The framework is a starting point; the value is in the complete, tested implementation of each specific product type.

## Catalog Validation

Run the catalog validator to check that all metadata, folders, and README entries are consistent:

```bash
pnpm catalog:validate
```

The validator checks:
- Exact 52-entry catalog with correct family counts
- Folder existence and naming conventions
- Project-local starter.json consistency with catalog metadata
- README row presence and field accuracy
- Independence (no cross-starter or root dependencies)

## Starter Convention

Each starter contains a project-local `starter.json` with:

- **Immutable identity:** id, folder, family, useCase, framework, runtime
- **Selected alternatives:** choices (finalized technology decisions)
- **Local paths:** manifest, lockfile, readme
- **Environment:** readsEnvironment (whether the starter reads .env configuration)
- **Integrations:** list of external service integrations
- **Family requirement:** reference to the governing requirement section

This file is used by the catalog validator to verify consistency between the root catalog and each starter's local metadata.

## Catalog

<!-- FAMILY:Web SaaS START -->
### Web SaaS

| Status | Folder | Use Case | Framework | Auth | Data | Monetization | Integrations |
|--------|--------|----------|-----------|------|------|--------------|---------------|
| ⏳ pending | [`nextjs-supabase-saas`](./nextjs-supabase-saas) | General multi-tenant SaaS | Next.js App Router | Supabase Auth | Supabase Postgres | Stripe subscriptions | Resend |
| ⏳ pending | [`nextjs-ai-saas`](./nextjs-ai-saas) | AI chat and content generation | Next.js App Router | Clerk | Neon Postgres + Prisma | Lemon Squeezy | OpenAI-compatible API |
| ⏳ pending | [`nextjs-b2b-saas`](./nextjs-b2b-saas) | Organizations, teams, and RBAC | Next.js App Router | Auth0 | PostgreSQL + Drizzle | Paddle | Postmark |
| ⏳ pending | [`nextjs-booking-saas`](./nextjs-booking-saas) | Appointments and reservations | Next.js App Router | Auth.js | PostgreSQL + Prisma | Stripe payments | Google Calendar, Resend |
| ⏳ pending | [`nextjs-lms-saas`](./nextjs-lms-saas) | Courses, memberships, and video | Next.js App Router | Clerk | Neon + Prisma | Stripe memberships | Mux, UploadThing |
| ⏳ pending | [`nextjs-support-desk`](./nextjs-support-desk) | Support and ticketing | Next.js App Router | Auth.js | PostgreSQL + Prisma | None | Resend, S3/R2 |
| ⏳ pending | [`nextjs-automation-saas`](./nextjs-automation-saas) | Workflows and scheduled jobs | Next.js App Router | Clerk | Neon + Drizzle | Stripe | Inngest |
| ⏳ pending | [`nextjs-file-saas`](./nextjs-file-saas) | File conversion, storage, media processing | Next.js App Router | Clerk | Neon + Drizzle | Stripe | Cloudflare R2, Inngest |
| ⏳ pending | [`react-admin-saas`](./react-admin-saas) | CRM, ERP, internal admin | React + Vite | Auth0 | Supabase Postgres | Stripe | TanStack Query, shadcn/ui |
| ⏳ pending | [`react-collaboration-saas`](./react-collaboration-saas) | Collaborative documents and boards | React + Vite | Clerk | Convex | Stripe | Liveblocks |
| ⏳ pending | [`sveltekit-ai-saas`](./sveltekit-ai-saas) | Usage-metered AI and data tooling | SvelteKit | Supabase Auth | Supabase Postgres | Stripe Billing Meters | AI provider |
| ⏳ pending | [`nuxt-community-saas`](./nuxt-community-saas) | Membership community and forum | Nuxt | Better Auth | PostgreSQL + Drizzle | Paddle | None |
| ⏳ pending | [`django-analytics-saas`](./django-analytics-saas) | Analytics and reporting | Django | django-allauth | PostgreSQL | Stripe | Celery, Redis |
| ⏳ pending | [`remix-commerce-saas`](./remix-commerce-saas) | Merchant storefront and D2C commerce | Remix | Auth.js | Shopify API | Stripe | Shopify API |
| ⏳ pending | [`astro-membership-site`](./astro-membership-site) | Paid newsletter and premium content | Astro SSR | Clerk | Turso/LibSQL | Stripe | Resend |

<!-- FAMILY:Web SaaS END -->

<!-- FAMILY:API/Backend START -->
### API/Backend

| Status | Folder | Use Case | Framework | Auth | Data | Monetization | Integrations |
|--------|--------|----------|-----------|------|------|--------------|---------------|
| ⏳ pending | [`django-api-backend`](./django-api-backend) | General REST backend | Django + DRF | allauth/token auth | PostgreSQL | Stripe | OpenAPI |
| ⏳ pending | [`fastapi-ai-backend`](./fastapi-ai-backend) | AI inference and document processing | FastAPI | OAuth2/JWT | PostgreSQL + SQLAlchemy | Stripe | Redis, Celery, OpenAI-compatible API |
| ⏳ pending | [`fastapi-data-platform`](./fastapi-data-platform) | Ingestion, ETL, analytics | FastAPI | signed service JWT | PostgreSQL + SQLAlchemy + DuckDB | None | S3-compatible storage, Celery, Redis |
| ⏳ pending | [`fastify-commerce-api`](./fastify-commerce-api) | Products, carts, orders | Fastify | JWT | PostgreSQL + Prisma | Stripe Checkout | Redis |
| ⏳ pending | [`fastify-realtime-api`](./fastify-realtime-api) | Notifications, presence, realtime | Fastify | JWT | PostgreSQL + Drizzle | None | WebSockets, Redis |
| ⏳ pending | [`nestjs-b2b-api`](./nestjs-b2b-api) | Multi-tenant enterprise backend | NestJS | Passport JWT | PostgreSQL + Prisma | Stripe | BullMQ, Redis |
| ⏳ pending | [`go-webhook-service`](./go-webhook-service) | High-throughput API and webhook processing | Go + Chi | JWT | PostgreSQL + pgx | None | Redis, OpenAPI |
| ⏳ pending | [`dotnet-enterprise-api`](./dotnet-enterprise-api) | Enterprise CRM and line-of-business | ASP.NET Core | ASP.NET Identity/JWT | PostgreSQL + EF Core | Stripe | None |
| ⏳ pending | [`spring-enterprise-api`](./spring-enterprise-api) | Enterprise subscriptions | Spring Boot | Spring Security JWT | PostgreSQL + JPA | Stripe | Redis |

<!-- FAMILY:API/Backend END -->

<!-- FAMILY:Expo Mobile START -->
### Expo Mobile

| Status | Folder | Use Case | Framework | Auth | Data | Monetization | Integrations |
|--------|--------|----------|-----------|------|------|--------------|---------------|
| ⏳ pending | [`expo-subscription-app`](./expo-subscription-app) | Premium mobile SaaS | Expo Router | Supabase Auth | Supabase + SQLite | RevenueCat | Sentry |
| ⏳ pending | [`expo-admob-utility`](./expo-admob-utility) | Calculator, scanner, converter | Expo Router | anonymous/local | SQLite | AdMob + optional RevenueCat | Firebase Analytics |
| ⏳ pending | [`expo-ai-companion`](./expo-ai-companion) | AI assistant or tutor | Expo Router | Supabase Auth | Supabase + SQLite | RevenueCat | AI API |
| ⏳ pending | [`expo-social-community`](./expo-social-community) | Feed, profiles, comments, chat | Expo Router | Clerk | Convex + SQLite | None | Stream Chat, push notifications |
| ⏳ pending | [`expo-marketplace-app`](./expo-marketplace-app) | Local services and physical goods | Expo Router | Supabase Auth | Supabase + SQLite | Stripe Connect | Algolia, Google Maps |
| ⏳ pending | [`expo-booking-app`](./expo-booking-app) | Appointments and rentals | Expo Router | Supabase Auth | Supabase + SQLite | Stripe | Calendar, Google Maps, push notifications |
| ⏳ pending | [`expo-habit-fitness-app`](./expo-habit-fitness-app) | Habits, workouts, wellness | Expo Router | Firebase Auth | Firebase Firestore + SQLite | RevenueCat | Android Health Connect, push notifications |
| ⏳ pending | [`expo-content-reader`](./expo-content-reader) | News, articles, recipes, education | Expo Router | optional local | Sanity + SQLite | AdMob | Firebase Messaging |
| ⏳ pending | [`expo-local-first-app`](./expo-local-first-app) | Notes, inventory, field work | Expo Router | Supabase Auth | SQLite + Supabase | None | Expo background task |
| ⏳ pending | [`expo-delivery-tracker`](./expo-delivery-tracker) | Delivery, fleet, field service | Expo Router | Firebase Auth | Firebase Firestore + SQLite | None | Google Maps, background location, push notifications |
| ⏳ pending | [`expo-event-app`](./expo-event-app) | Tickets and attendee networking | Expo Router | Supabase Auth | Supabase + SQLite | Stripe | QR scanning, push notifications |
| ⏳ pending | [`expo-ecommerce-app`](./expo-ecommerce-app) | Physical-goods storefront | Expo Router | Shopify customer token | Shopify Storefront API + SQLite | Shopify native checkout | Shopify Storefront API, push notifications |

<!-- FAMILY:Expo Mobile END -->

<!-- FAMILY:Content/AdSense START -->
### Content/AdSense

| Status | Folder | Use Case | Framework | Auth | Data | Monetization | Integrations |
|--------|--------|----------|-----------|------|------|--------------|---------------|
| 🚧 in progress | [`astro-adsense-blog`](./astro-adsense-blog) | Niche blog | Astro | None | MDX content collections | AdSense | analytics, RSS |
| ⏳ pending | [`astro-affiliate-site`](./astro-affiliate-site) | Reviews and comparisons | Astro | None | MDX | affiliate links + AdSense | analytics |
| ⏳ pending | [`nextjs-directory-site`](./nextjs-directory-site) | Business, tools, places directory | Next.js App Router | None | Supabase Postgres + Drizzle | AdSense | Meilisearch |
| ⏳ pending | [`nextjs-programmatic-seo`](./nextjs-programmatic-seo) | Data-generated landing pages | Next.js App Router | None | PostgreSQL + Drizzle | AdSense | Inngest |
| ⏳ pending | [`nextjs-tools-site`](./nextjs-tools-site) | Calculators, generators, free tools | Next.js | None | static typed data | AdSense | analytics |
| ⏳ pending | [`nextjs-job-board`](./nextjs-job-board) | Jobs and recruitment directory | Next.js App Router | Clerk | PostgreSQL + Drizzle | Stripe paid listings + AdSense | Stripe |
| ⏳ pending | [`nuxt-magazine-site`](./nuxt-magazine-site) | News and multi-author magazine | Nuxt | None | Nuxt Content Markdown | AdSense | image optimization, Resend newsletter |
| ⏳ pending | [`nuxt-local-directory`](./nuxt-local-directory) | Local business and city directory | Nuxt | None | Supabase Postgres | AdSense + sponsored listings | MapLibre/OpenStreetMap, Meilisearch |
| ⏳ pending | [`eleventy-static-site`](./eleventy-static-site) | Minimal niche or documentation site | Eleventy | None | Markdown/data files | AdSense | RSS, sitemap |
| ⏳ pending | [`hugo-content-site`](./hugo-content-site) | Large static blog or documentation | Hugo | None | Markdown | AdSense + affiliate links | Pagefind |
| ⏳ pending | [`astro-recipe-site`](./astro-recipe-site) | Recipes and tutorials | Astro | None | Astro content collections | AdSense | RSS, sitemap |
| ⏳ pending | [`astro-comparison-site`](./astro-comparison-site) | Comparison tables and best-of content | Astro | None | content collections | affiliate links + AdSense | analytics |
| ⏳ pending | [`nextjs-coupon-site`](./nextjs-coupon-site) | Deals and coupons | Next.js App Router | None | PostgreSQL + Drizzle | affiliate tracking + AdSense | Meilisearch, Inngest |
| ⏳ pending | [`nextjs-real-estate-directory`](./nextjs-real-estate-directory) | Property and rental listings | Next.js App Router | None | PostgreSQL + Drizzle | AdSense + promoted listings | MapLibre/OpenStreetMap, Cloudflare R2 |

<!-- FAMILY:Content/AdSense END -->

<!-- FAMILY:Beginner Static START -->
### Beginner Static

| Status | Folder | Use Case | Framework | Auth | Data | Monetization | Integrations |
|--------|--------|----------|-----------|------|------|--------------|---------------|
| 🚧 in progress | [`astro-beginner-static-site`](./astro-beginner-static-site) | Very simple beginner static site | Astro | None | local TS/Markdown | None | None |
| ⏳ pending | [`nextjs-beginner-static-site`](./nextjs-beginner-static-site) | Very simple beginner static portfolio | Next.js | None | local TS | None | None |

<!-- FAMILY:Beginner Static END -->

## License

This repository is licensed under the [MIT License](./LICENSE).

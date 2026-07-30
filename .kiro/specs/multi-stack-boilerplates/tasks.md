# Implementation Plan: Multi-Stack Boilerplates

## Overview

Build the exact 52-folder normative catalog as independent, project-local starters. Root tooling defines and inspects contracts only; it never supplies runtime, build, test, schema, style, or configuration code to a starter. Work starts with repository contracts, then proves five family reference slices, proceeds through the remaining starters in family delivery order, and ends with cross-family isolation and exact-completion gates.

## Tasks

- [x] 1. Establish repository contracts and read-only tooling
  - [x] 1.1 Create `catalog/starters.json` and its closed JSON schema with exactly 52 immutable identities, exact family counts, finalized alternative choices, technology/provider fields, and initial `pending` status
    - Add schema validation for all required catalog fields and the three allowed statuses without creating starter runtime dependencies.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 11.14, 13.1, 13.9, 13.14_
  - [x] 1.2 Define the project-local `starter.json` convention and family-readiness mapping contract
    - Specify immutable identity projection, selected alternatives, local manifest/lockfile/README paths, environment reads, integrations, and exactly one family requirement.
    - _Requirements: 1.2, 2.2, 2.9, 10.15, 13.1, 13.2, 13.14_
  - [x] 1.3 Write the root `README.md` skeleton with all 52 exact rows marked `pending`
    - Include exact family sections/counts, searchable comparison fields, folder/README/setup links, comparison guide, independence statement, intentional framework reuse, and validator markers.
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.14_
  - [x] 1.4 Add the repository `LICENSE` and attribution/notice policy
    - Define per-starter inventory and conditional `THIRD_PARTY_NOTICES.md`, retained-text rules, redistributable-material gate, and factual non-endorsement wording.
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  - [x] 1.5 Implement the Windows-compatible, read-only Node catalog validator and root one-shot command
    - Validate exact sets/counts, metadata, family mapping, README rows/links/statuses, local required artifacts, package identifiers, lockfile/manifests, env/notice rules, and independence; aggregate every discrepancy without mutating files.
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 5.3, 10.15, 10.16, 10.17, 10.18, 11.10, 11.11, 11.12, 11.13_
  - [x] 1.6 Add required root validator example and property tests
    - Cover **Property 1: Catalog set equality and family partition**, **Property 2: Standalone dependency closure**, **Property 15: Reproducible manifest, lockfile, configuration, and one-shot commands**, and **Property 16: Exact root README status, field, grouping, and link mapping**, including the read-only filesystem invariant.
    - _Requirements: 1.3, 1.5, 1.6, 1.7, 2.6, 2.7, 10.15, 10.16, 10.17, 10.18, 11.10, 11.11, 11.12, 11.13_
  - [x] 1.7 Create phased CI matrices for root validation, reference slices, family starters, and final completion
    - Use Windows/Linux root jobs, project-local frozen installs, provider-fake defaults, isolated copied-folder jobs, explicit timeout/teardown smoke harnesses, and no watch/interactive commands.
    - _Requirements: 2.3, 2.4, 10.2, 10.3, 10.5, 10.6, 10.7, 10.19, 13.11, 13.13_

- [ ] 2. Build reference starter `nextjs-supabase-saas`
  - [x] 2.1 Generate the exact-pinned Next.js App Router/Node LTS/TypeScript/Tailwind scaffold, commit project-local pnpm manifest/lockfile, ignore artifacts, and add matching `starter.json`
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [x] 2.2 Implement local Web SaaS infrastructure and migrations for Tenant, Membership, Project, and Subscription with IDs, tenant ownership, timestamps, concurrency, RLS, authn/authz policies, config boundary, sanitized errors, and commit behavior
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.7, 8.8, 8.16, 8.17_
  - [-] 2.3 Implement project-local Supabase Auth/Postgres, Stripe subscription/webhook, and Resend adapters with verified idempotent events, entitlement/renewal/cancellation state, welcome email preview, fake defaults, and secret redaction
    - _Requirements: 3.7, 3.8, 3.9, 3.11, 3.16, 3.21, 8.1, 8.9, 8.10, 8.11, 13.4, 13.8_
  - [~] 2.4 Build the public product entry and protected dashboard flow where an owner creates a tenant/project, invites a member, subscribes, receives webhook-granted entitlement, and triggers a welcome email
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10, 3.21_
  - [~] 2.5 Add required unit, integration, smoke, RLS/authz, Stripe valid/invalid signature and dedupe, Resend-fake tests plus **Property 4: Authentication and access consistency** and **Property 5: Webhook authenticity gates one state transition**
    - _Requirements: 3.12, 3.13, 3.17, 8.10, 10.8, 10.9, 10.10, 10.11_
  - [~] 2.6 Add `.env.example`, typed aggregate config validation, setup/schema/provider/deployment/attribution README, and one-shot frozen install, lint, typecheck, test, build, and entry smoke commands
    - _Requirements: 3.16, 3.18, 3.19, 8.2, 8.3, 8.18, 9.1, 9.3, 9.4, 9.5, 9.6, 9.8, 9.9, 9.10, 9.13, 10.2, 10.3, 10.4, 10.19, 12.5_
  - [~] 2.7 Copy only `nextjs-supabase-saas` to an isolated path, run all documented commands with fakes, verify no root/other-starter dependency, and emit project-local status-promotion evidence only after all mapped checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 3. Build reference starter `django-api-backend`
  - [x] 3.1 Generate exact-pinned uv/Django/DRF Python scaffold, commit `pyproject.toml`, `uv.lock`, runtime pin, local ignores, and matching `starter.json`
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [x] 3.2 Implement User, APIResource, Subscription, and ProcessedEvent migrations plus transport/application/domain/infrastructure layers, transactions, stable correlation-aware errors, rate limiting, JSON logs, `/health`, OpenAPI, Dockerfile, and local/container startup
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.14, 4.15, 4.16, 4.17, 4.18_
  - [~] 3.3 Implement allauth/token authorization and Stripe adapters with raw-body webhook verification, idempotent subscription transition, fake provider mode, redaction, and pre-commit rollback
    - _Requirements: 4.1, 4.2, 4.22, 4.24, 8.1, 8.8, 8.9, 8.10, 8.11, 13.4_
  - [~] 3.4 Build authorized CRUD for APIResource and subscription state through documented REST/OpenAPI routes, including validation, 401/403, stable failures, committed reads, and restart persistence
    - _Requirements: 4.5, 4.6, 4.7, 4.8, 4.16, 4.26_
  - [~] 3.5 Add required DRF contract/auth/rate/health/state/restart/webhook tests plus **Property 5: Webhook authenticity gates one state transition**, **Property 6: API validation, error sanitization, and state preservation**, and **Property 7: Configurable rate-limit bound**
    - _Requirements: 4.19, 4.20, 4.24, 4.26, 4.28, 10.8, 10.11, 10.12_
  - [~] 3.6 Add `.env.example`, aggregate config validation, endpoint/schema/rate/observability/provider/container/deployment README, and one-shot uv sync, Ruff, mypy, pytest, Django check, package/container build, and health smoke commands
    - _Requirements: 4.25, 4.27, 8.18, 9.1, 9.3, 9.4, 9.5, 9.6, 9.8, 9.9, 9.10, 9.13, 10.2, 10.3, 10.4, 10.19_
  - [~] 3.7 Run copied-folder frozen install and all local/container validations with ephemeral persistence and fakes, reject external dependencies, and promote status only after every mapped check passes
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 4. Build reference starter `expo-subscription-app`
  - [x] 4.1 Generate exact-pinned Expo Router/React Native/Node LTS/TypeScript scaffold, commit local pnpm manifest/lockfile, unique Android package placeholder, EAS profiles, ignores, and matching `starter.json`
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1, 13.1_
  - [x] 4.2 Implement Profile, Feature, Entitlement, and PendingAction using Supabase, SQLite cache, SecureStore, local router/deep-link lifecycle, bounded persistent queue, loading/empty/offline/error/retry states, and redacted Sentry boundary
    - _Requirements: 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.28, 5.29, 8.11_
  - [~] 4.3 Implement Supabase Auth, RevenueCat purchase/restore, and Sentry adapters with fake defaults, authenticated entitlement reconciliation, digital-goods eligibility, sanitized failures, and no privileged client secret
    - _Requirements: 5.17, 5.18, 5.24, 8.1, 8.4, 8.15, 13.4_
  - [~] 4.4 Build sign-in, purchase/restore, premium feature unlock, error reporting, cold/warm deep-link destination, and offline retry UI flows without resetting unrelated navigation
    - _Requirements: 5.6, 5.7, 5.8, 5.9, 5.17, 5.18_
  - [~] 4.5 Add required route/state/deep-link/queue/restart/RevenueCat/Sentry tests plus **Property 9: Mobile pending-action capacity and idempotency** and **Property 10: Mobile monetization eligibility**
    - _Requirements: 5.20, 5.21, 5.24, 5.28, 5.29, 10.8_
  - [~] 4.6 Add `.env.example`, aggregate config validation, Android/iOS/EAS/deep-link/queue/Supabase/RevenueCat/Sentry/deployment README, and one-shot frozen install, lint, typecheck, Jest, Expo Android export, EAS config, and entry smoke commands
    - _Requirements: 5.26, 5.27, 5.30, 8.18, 9.1, 9.3, 9.4, 9.5, 9.6, 9.8, 9.9, 9.13, 10.2, 10.3, 10.4, 10.19_
  - [~] 4.7 Validate the copied folder with fakes and no repository access, verify package/deep-link/EAS artifacts, and promote status only after all mapped checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 5. Build reference starter `astro-adsense-blog`
  - [x] 5.1 Generate exact-pinned Astro static/Node LTS/TypeScript scaffold, commit project-local pnpm manifest/lockfile, ignores, and matching `starter.json`
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [x] 5.2 Implement Author, Article, and Category content collections and local IndexableDocument/SEO/schema/sitemap/robots/RSS projections with bounded unique metadata and deterministic ordering
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.25, 6.26, 6.27_
  - [~] 5.3 Implement local AdSense responsive reserved-space Ad component, shared ads/analytics consent store, centralized analytics initializer, Article JSON-LD, and blocked/delayed/unavailable behavior
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.16, 13.4_
  - [~] 5.4 Build the publish flow so an MDX article appears on canonical index/detail pages, Article schema, sitemap, and RSS while consent controls ads and analytics
    - _Requirements: 6.1, 6.3, 6.5, 6.7, 6.12, 6.13_
  - [~] 5.5 Add required built-output SEO/schema/feed/link/ad/consent/CLS/performance/accessibility tests plus **Property 11: Indexability, metadata, schema, sitemap, and robots consistency**, **Property 12: RSS eligibility and deterministic order**, and **Property 13: Ad reserved space and shared consent**
    - _Requirements: 6.4, 6.11, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 10.8, 10.13_
  - [~] 5.6 Add `.env.example` for actual client-safe IDs only, config fallback, authoring/metadata/schema/ad/consent/analytics/deployment README, and one-shot frozen install, lint, Astro check/build, output crawl, accessibility, CLS/performance, and smoke commands
    - _Requirements: 6.17, 6.18, 6.21, 8.2, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.13, 10.2, 10.3, 10.4, 10.19_
  - [~] 5.7 Validate the copied folder and generated output without root access or live providers, then promote status only after all content and cross-cutting checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 6. Build minimal reference starter `astro-beginner-static-site`
  - [x] 6.1 Generate exact-pinned Astro static/Node LTS/TypeScript scaffold with plain CSS, project-local pnpm manifest/lockfile, ignores, and matching `starter.json`
    - _Requirements: 1.2, 2.1, 2.2, 7.1, 7.2, 7.3, 10.1, 13.1_
  - [x] 6.2 Implement only SiteConfig, shared layout/navigation/footer, two reusable components, public assets, SEO/sitemap config, and beginner comments for the layout, one component, and static output
    - _Requirements: 7.3, 7.4, 7.7, 7.8, 7.11, 7.12_
  - [~] 6.3 Add a comment-only `.env.example` declaring no required values, preserve zero auth/database/payment/queue/email/provider services, and implement semantic keyboard/focus/responsive behavior
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 8.3, 13.3_
  - [~] 6.4 Build Home, About, Contact, and Projects pages with replaceable `mailto:` contact, reusable content, and static deployable output
    - _Requirements: 7.4, 7.9, 7.10, 7.12_
  - [~] 6.5 Add required static link/route, viewport overflow, keyboard/focus, accessibility, dependency-allowlist tests plus **Property 14: Beginner static no-service build and dependency allowlist**
    - _Requirements: 7.5, 7.6, 7.15, 7.16, 7.17, 10.8, 10.13_
  - [~] 6.6 Document structure/content/styling/dependency purposes and Cloudflare Pages/GitHub Pages deployment; add one-shot frozen install, lint, Astro check/build, Playwright output, accessibility/overflow, and smoke commands
    - _Requirements: 7.13, 7.14, 7.15, 7.17, 9.5, 9.6, 9.13, 10.2, 10.3, 10.4, 10.19_
  - [~] 6.7 Validate a standalone copy with no env values or external services and promote status only after the no-service gate and all mapped checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 7.1, 7.12, 13.10, 13.11_

- [ ] 7. Build `nextjs-ai-saas`
  - [~] 7.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json` for Clerk, Neon/Prisma, OpenAI-compatible API, and Lemon Squeezy
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 7.2 Implement Workspace, Conversation, Message, Generation, and Entitlement migrations, protected Web SaaS blueprint, tenant policy, config loader, sanitized errors, and commit boundaries
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 8.7, 8.8, 8.16_
  - [~] 7.3 Implement local Clerk, Neon/Prisma, server-only AI, and Lemon Squeezy verified subscription adapters with fakes, usage recording, entitlement state, dedupe, and secret-boundary enforcement
    - _Requirements: 3.7, 3.8, 3.11, 3.16, 3.21, 8.4, 8.5, 8.6, 8.9, 13.4_
  - [~] 7.4 Build public entry and protected chat/generation dashboard where a signed-in user generates through the server, records usage, and receives webhook-synced entitlement
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10_
  - [~] 7.5 Add required auth/authz, AI-fake, client-secret bundle, usage, Lemon Squeezy signature/dedupe and smoke tests plus Properties 3, 4, and 5
    - _Requirements: 3.12, 3.13, 3.17, 8.6, 10.8, 10.9, 10.10, 10.11_
  - [~] 7.6 Add classified `.env.example`, clean setup/provider/deployment README, and one-shot frozen install, lint, typecheck, test, build, and smoke commands
    - _Requirements: 3.16, 3.18, 3.19, 8.18, 9.1, 9.3, 9.4, 9.5, 9.6, 9.8, 9.9, 9.13, 10.19_
  - [~] 7.7 Run copied-folder fake-provider validation and promote status only after every applicable check passes
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 8. Build `nextjs-b2b-saas`
  - [~] 8.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json` for Auth0, PostgreSQL/Drizzle, Paddle, and Postmark
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 8.2 Implement Organization, Membership, Role, Customer, and Subscription schema, migrations, deny-by-default RBAC repository/actions, config, sanitized errors, and transactional state
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 8.7, 8.8, 8.16_
  - [~] 8.3 Implement local Auth0, Drizzle, Paddle webhook/subscription, and Postmark invite adapters with fakes, idempotency, plan/renewal/cancellation state, and redaction
    - _Requirements: 3.7, 3.8, 3.9, 3.11, 3.16, 3.21, 8.9, 8.11, 13.4_
  - [~] 8.4 Build public entry and protected admin dashboard where an admin assigns roles, creates a customer, syncs the org plan, and sends a Postmark invite
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10_
  - [~] 8.5 Add required RBAC matrix, auth, Paddle valid/invalid proof/dedupe, Postmark-fake and smoke tests plus Properties 4 and 5
    - _Requirements: 3.12, 3.13, 3.17, 10.8, 10.9, 10.10, 10.11_
  - [~] 8.6 Add `.env.example`, schema/auth/RBAC/provider/deployment README, and one-shot frozen install, lint, typecheck, test, build, and smoke commands
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.10, 9.13, 10.19_
  - [~] 8.7 Run copied-folder fake-provider validation and promote status only after all mapped checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 9. Build `nextjs-booking-saas`
  - [~] 9.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json` for Auth.js, Prisma/PostgreSQL, Stripe, Google Calendar, and Resend
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 9.2 Implement Provider, Availability, Booking, and Payment migrations, slot concurrency, authorization, booking/payment state machine, config, and rollback behavior
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.23, 8.7, 8.16_
  - [~] 9.3 Implement local Auth.js, Stripe verified payment, Google Calendar, and Resend adapters with fakes, idempotency, compensation, sanitized failures, and secret boundaries
    - _Requirements: 3.7, 3.9, 3.11, 3.16, 3.23, 8.9, 8.15, 13.4_
  - [~] 9.4 Build public booking entry and protected flow to reserve a slot, confirm payment, create calendar event/email, and preserve a consistent cancellation outcome
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10, 3.23_
  - [~] 9.5 Add required auth, concurrent-slot, booking/payment failure, webhook proof/dedupe, calendar/mail fake, smoke tests plus Properties 4 and 5
    - _Requirements: 3.12, 3.13, 3.17, 10.8, 10.9, 10.10, 10.11_
  - [~] 9.6 Add `.env.example`, booking/schema/provider/deployment README, and one-shot frozen install, lint, typecheck, test, build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.10, 9.13, 10.19_
  - [~] 9.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 10. Build `nextjs-lms-saas`
  - [~] 10.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json` for Clerk, Neon/Prisma, Mux, Stripe, and UploadThing
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 10.2 Implement Course, Lesson, Enrollment, Progress, and Subscription migrations, creator/learner policies, membership entitlement, config, and transactional progress state
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.21, 8.7, 8.8_
  - [~] 10.3 Implement local Clerk, Stripe webhook, Mux, and UploadThing adapters with fakes, upload type/size checks, video state, idempotent entitlement, and secret boundaries
    - _Requirements: 3.7, 3.11, 3.16, 3.21, 8.4, 8.9, 8.12, 13.4_
  - [~] 10.4 Build public course entry and protected creator upload/learner enrollment/payment-unlock/progress dashboard flow
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10, 3.21_
  - [~] 10.5 Add required authz, upload/video fake, entitlement/webhook proof/dedupe, progress and smoke tests plus Properties 4 and 5
    - _Requirements: 3.12, 3.13, 3.17, 8.12, 10.8, 10.10, 10.11_
  - [~] 10.6 Add `.env.example`, LMS/schema/provider/deployment README, and one-shot frozen install, lint, typecheck, test, build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.10, 9.13, 10.19_
  - [~] 10.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 11. Build `nextjs-support-desk`
  - [~] 11.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json` for Auth.js, Prisma/PostgreSQL, Resend, and Cloudflare R2
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 11.2 Implement Team, Agent, Ticket, Message, and Attachment migrations, ownership/agent policy, ticket state, config, upload limits, and sanitized failure behavior
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 8.7, 8.8, 8.12, 8.16_
  - [~] 11.3 Implement local Auth.js, R2, and Resend adapters with fakes, MIME/size enforcement before storage, notification preview, secret boundaries, and no unassigned monetization
    - _Requirements: 3.9, 3.16, 8.4, 8.12, 8.15, 13.3, 13.4_
  - [~] 11.4 Build public support entry and protected flow where a customer opens a ticket with attachment and an authorized agent replies and sends notification
    - _Requirements: 3.3, 3.4, 3.6, 3.10_
  - [~] 11.5 Add required auth/ownership, file-limit/R2, Resend-fake, ticket transition, provider failure and smoke tests plus Properties 3 and 4
    - _Requirements: 3.17, 8.12, 10.8, 10.9, 10.10_
  - [~] 11.6 Add `.env.example`, support/schema/storage/email/deployment README, and one-shot frozen install, lint, typecheck, test, build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.10, 9.13, 10.19_
  - [~] 11.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 12. Build `nextjs-automation-saas`
  - [~] 12.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json`, selecting Neon/Drizzle and Inngest with Clerk and Stripe
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 12.2 Implement Workflow, Trigger, Run, StepAttempt, and Subscription migrations, authorization, finite retry state machine, terminal failure, plan limits, config, and redaction
    - _Requirements: 3.1, 3.2, 3.5, 3.14, 3.15, 8.7, 8.11_
  - [~] 12.3 Implement local Clerk, Inngest, and Stripe verified subscription adapters with deterministic fakes, stable run/event IDs, idempotency, and secret boundaries
    - _Requirements: 3.7, 3.11, 3.14, 3.16, 3.21, 8.9, 13.4_
  - [~] 12.4 Build public entry and protected workflow editor/dashboard where an event starts a run, retries terminate, and plan entitlement gates runs
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10, 3.14_
  - [~] 12.5 Add required auth, Inngest harness success/exhaustion, Stripe proof/dedupe, plan-gating and smoke tests plus **Property 8: Job retry termination** and Property 5
    - _Requirements: 3.12, 3.13, 3.17, 10.8, 10.11, 10.14_
  - [~] 12.6 Add `.env.example`, jobs/retry/billing/deployment README, and one-shot frozen install, lint, typecheck, test, build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.11, 9.13, 10.19_
  - [~] 12.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 13. Build `nextjs-file-saas`
  - [~] 13.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json`, selecting Neon/Drizzle, Cloudflare R2, Inngest, Clerk, and Stripe
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 13.2 Implement FileAsset, ConversionJob, OutputAsset, and Subscription migrations, ownership/quota, upload limits, finite job states/retries, config, and rollback
    - _Requirements: 3.1, 3.2, 3.5, 3.14, 3.15, 8.8, 8.12, 8.16_
  - [~] 13.3 Implement local Clerk, R2, Inngest, and Stripe adapters with fakes, MIME/extension/byte validation before storage, stable jobs, verified deduped billing events, and sanitized errors
    - _Requirements: 3.7, 3.11, 3.14, 3.16, 3.21, 8.9, 8.12, 8.15, 13.4_
  - [~] 13.4 Build public entry and protected upload/conversion dashboard showing validated input, queued/terminal output, quota, and entitlement
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10_
  - [~] 13.5 Add required auth/ownership, upload limits, R2 fake, job success/exhaustion, Stripe proof/dedupe and smoke tests plus Properties 5 and 8
    - _Requirements: 3.12, 3.13, 3.17, 8.12, 10.8, 10.11, 10.14_
  - [~] 13.6 Add `.env.example`, storage/jobs/billing/deployment README, and one-shot frozen install, lint, typecheck, test, build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.11, 9.13, 10.19_
  - [~] 13.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 14. Build `react-admin-saas`
  - [~] 14.1 Scaffold pinned React/Vite/TypeScript with local pnpm lockfile and `starter.json`, selecting Auth0, TanStack Query, Supabase Postgres, Stripe, and shadcn/ui
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 14.2 Implement Organization, UserRole, Customer, Deal, and Invoice persistence, RBAC policies, local API/provider boundary, config, query-state rules, and sanitized commit behavior
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 8.7, 8.8, 8.16_
  - [~] 14.3 Implement local Auth0, Supabase, Stripe adapters and MSW fakes with server-authorized operations outside the Vite bundle and billing state/dedupe
    - _Requirements: 3.7, 3.11, 3.16, 8.4, 8.5, 8.9, 13.4_
  - [~] 14.4 Build public entry and protected admin dashboard where authorized staff advances a deal, starts customer billing, and invalidates/refetches TanStack Query data
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10_
  - [~] 14.5 Add required MSW auth/RBAC, cache invalidation, Stripe adapter/webhook, bundle-boundary and smoke tests plus Properties 3, 4, and 5
    - _Requirements: 3.12, 3.13, 3.17, 8.4, 10.8, 10.10, 10.11_
  - [~] 14.6 Add `.env.example`, API/RBAC/billing/deployment README, and one-shot frozen install, lint, typecheck, test, Vite build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 14.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 15. Build `react-collaboration-saas`
  - [~] 15.1 Scaffold pinned React/Vite/TypeScript with local pnpm lockfile and `starter.json` for Clerk, Convex, Liveblocks, and Stripe
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 15.2 Implement Workspace, Document, Board, Member, and Subscription models, membership authorization, conflict/version policy, entitlement limits, config, and sanitized state transitions
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.21, 8.8, 8.16_
  - [~] 15.3 Implement local Clerk, Convex, Liveblocks, and Stripe adapters with deterministic fakes, presence/collaboration isolation, verified deduped billing, and secret boundaries
    - _Requirements: 3.7, 3.11, 3.16, 3.21, 8.4, 8.9, 13.4_
  - [~] 15.4 Build public entry and protected collaborative document/board dashboard with presence, edits, conflicts, and plan-controlled collaborator limits
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10_
  - [~] 15.5 Add required authz, Convex/Liveblocks fake, conflict, collaborator limit, Stripe proof/dedupe and smoke tests plus Properties 4 and 5
    - _Requirements: 3.12, 3.13, 3.17, 10.8, 10.10, 10.11_
  - [~] 15.6 Add `.env.example`, collaboration/conflict/billing/deployment README, and one-shot frozen install, lint, typecheck, test, build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 15.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 16. Build `sveltekit-ai-saas`
  - [~] 16.1 Scaffold pinned SvelteKit/TypeScript/Tailwind with local pnpm lockfile and `starter.json` for Supabase, Stripe Billing Meters, and OpenAI-compatible API
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 16.2 Implement Account, Dataset, Generation, UsageEvent, and MeterState schema, authz, unique usage key, meter/subscription state, config, and sanitized transitions
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.20, 3.22, 8.7, 8.16_
  - [~] 16.3 Implement local Supabase, server-only AI, and current Stripe Billing Meters adapters with fake defaults, customer-linked idempotent meter events, verified webhook, and no retired usage-record API
    - _Requirements: 3.11, 3.20, 3.22, 8.4, 8.6, 8.9, 13.4_
  - [~] 16.4 Build public entry and protected generation/data dashboard that records one unique billable usage event and displays synchronized total usage
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10, 3.22_
  - [~] 16.5 Add required auth, AI fake, Billing Meters customer association/idempotency, webhook proof/dedupe, secret-boundary and smoke tests plus Properties 3, 4, and 5
    - _Requirements: 3.12, 3.13, 3.17, 3.20, 3.22, 10.8, 10.11_
  - [~] 16.6 Add `.env.example`, meter/API/schema/deployment README, and one-shot frozen install, lint/format, svelte-check, test, build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 16.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 17. Build `nuxt-community-saas`
  - [~] 17.1 Scaffold pinned Nuxt/TypeScript/Tailwind with local pnpm lockfile and `starter.json` for Better Auth, PostgreSQL/Drizzle, and Paddle
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 17.2 Implement Community, Membership, Thread, Post, and Subscription schema, moderation/membership authorization, entitlement state, config, and sanitized transactional errors
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.21, 8.7, 8.8_
  - [~] 17.3 Implement local Better Auth, Drizzle, and Paddle adapters with fakes, verified deduped plan events, renewal/cancellation state, and secret boundaries
    - _Requirements: 3.7, 3.11, 3.16, 3.21, 8.1, 8.9, 13.4_
  - [~] 17.4 Build public community entry and protected subscribe/join/create/moderate-thread dashboard flow
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10_
  - [~] 17.5 Add required auth/policy, moderation, Paddle proof/dedupe/entitlement and smoke tests plus Properties 4 and 5
    - _Requirements: 3.12, 3.13, 3.17, 10.8, 10.10, 10.11_
  - [~] 17.6 Add `.env.example`, community/moderation/billing/deployment README, and one-shot frozen install, lint, Nuxt typecheck, test, build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 17.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 18. Build `django-analytics-saas`
  - [~] 18.1 Scaffold pinned uv/Django Python project with local lock/runtime files and `starter.json` for allauth, PostgreSQL, Celery, Redis, Stripe, and Django Admin
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 18.2 Implement Account, Dashboard, DataSource, Report, ImportJob, and Subscription migrations, authorization, finite Celery retry/terminal states, plan gates, config, and redaction
    - _Requirements: 3.1, 3.2, 3.5, 3.14, 3.15, 3.21, 8.8, 8.11_
  - [~] 18.3 Implement local allauth, PostgreSQL, Celery/Redis, and Stripe adapters with eager/fake modes, idempotent imports/webhooks, and sanitized provider outcomes
    - _Requirements: 3.7, 3.11, 3.14, 3.16, 3.21, 8.9, 8.15, 13.4_
  - [~] 18.4 Build public entry and protected dashboard/admin flow that queues import, aggregates report data, exposes retry outcome, and gates reports by plan
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10, 3.14_
  - [~] 18.5 Add required auth/authz, Celery success/exhaustion, report, Stripe proof/dedupe and smoke tests plus Properties 4, 5, and 8
    - _Requirements: 3.12, 3.13, 3.17, 10.8, 10.10, 10.11, 10.14_
  - [~] 18.6 Add `.env.example`, schema/jobs/admin/billing/deployment README, and one-shot uv sync, Ruff, mypy, pytest, Django check, build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.10, 9.11, 9.13, 10.19_
  - [~] 18.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 19. Build `remix-commerce-saas`
  - [~] 19.1 Scaffold pinned Remix/TypeScript with local pnpm lockfile and `starter.json`, selecting Shopify API, Auth.js, and Stripe
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 19.2 Implement Merchant, ProductRef, Cart, Order, and Payment local state, merchant/order authorization, checkout consistency, config, and sanitized commit/compensation behavior
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.24, 8.7, 8.8, 8.16_
  - [~] 19.3 Implement local Auth.js, Shopify product sync, and Stripe checkout/webhook adapters with fakes, unique provider events, physical-goods order binding, and secret boundaries
    - _Requirements: 3.7, 3.11, 3.16, 3.24, 8.4, 8.9, 13.4, 13.14_
  - [~] 19.4 Build public storefront and protected merchant sync/order dashboard where checkout result displays consistent payment and order status
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10, 3.24_
  - [~] 19.5 Add required authz, Shopify fake, checkout/order consistency, Stripe proof/dedupe and smoke tests plus Properties 4 and 5
    - _Requirements: 3.12, 3.13, 3.17, 3.24, 10.8, 10.10, 10.11_
  - [~] 19.6 Add `.env.example`, merchant/sync/checkout/deployment README, and one-shot frozen install, lint, typecheck, test, Remix build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 19.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 20. Build `astro-membership-site`
  - [~] 20.1 Scaffold pinned Astro SSR/TypeScript with local pnpm lockfile and `starter.json`, selecting Clerk, Turso/LibSQL, Stripe, and Resend
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 20.2 Implement Member, Article, AccessGrant, and Subscription schema, premium-access authorization, entitlement/expiry/cancellation state, config, and sanitized transactional errors
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.21, 8.7, 8.8_
  - [~] 20.3 Implement local Clerk, Turso, Stripe verified webhook, and Resend adapters with fakes, idempotent grants, welcome preview, and server-only secrets
    - _Requirements: 3.7, 3.9, 3.11, 3.16, 3.21, 8.1, 8.9, 13.4_
  - [~] 20.4 Build public newsletter/article entry and protected premium flow where subscription grants access and sends welcome email
    - _Requirements: 3.3, 3.4, 3.6, 3.8, 3.10, 3.21_
  - [~] 20.5 Add required auth/access, Stripe proof/dedupe/entitlement, mail fake and smoke tests plus Properties 4 and 5
    - _Requirements: 3.12, 3.13, 3.17, 10.8, 10.9, 10.10, 10.11_
  - [~] 20.6 Add `.env.example`, membership/content/schema/provider/deployment README, and one-shot frozen install, lint, Astro check, test, SSR build, and smoke validation
    - _Requirements: 3.16, 3.18, 3.19, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.10, 9.13, 10.19_
  - [~] 20.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 21. Build `fastapi-ai-backend`
  - [~] 21.1 Scaffold pinned uv/FastAPI Python project with local lock/runtime files and `starter.json` for OAuth2/JWT, SQLAlchemy/PostgreSQL, Redis/Celery, Stripe, and AI adapter
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 21.2 Implement User, Document, InferenceJob, Usage, and Subscription migrations plus API blueprint: validation, authz, transaction, configurable rate limit, correlation logs/errors, health/OpenAPI, Docker, retry/terminal job state, and restart persistence
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.7, 4.10, 4.12, 4.13, 4.14, 4.15, 4.17, 4.26_
  - [~] 21.3 Implement local JWT, SQLAlchemy, Redis/Celery, Stripe webhook, and server-only AI adapters with fakes, idempotency, redaction, and rollback
    - _Requirements: 4.1, 4.22, 4.24, 8.4, 8.6, 8.9, 8.11, 13.4_
  - [~] 21.4 Build validated document submission, queued inference, persisted result/usage, subscription state, and documented REST/OpenAPI read flow
    - _Requirements: 4.5, 4.6, 4.8, 4.9, 4.16, 4.26_
  - [~] 21.5 Add required auth/contract/rate/state/restart, worker success/exhaustion, AI fake, Stripe proof tests plus Properties 5, 6, 7, and 8
    - _Requirements: 4.19, 4.20, 4.21, 4.22, 4.24, 4.28, 10.8, 10.12, 10.14_
  - [~] 21.6 Add `.env.example`, API/jobs/observability/provider/container/deployment README, and one-shot uv sync, Ruff, mypy, pytest, import/package/container build, and health smoke validation
    - _Requirements: 4.25, 4.27, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.11, 9.13, 10.19_
  - [~] 21.7 Validate a copied folder with ephemeral stores/fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 22. Build `fastapi-data-platform`
  - [~] 22.1 Scaffold pinned uv/FastAPI Python project with local lock/runtime files and `starter.json`, selecting service JWT, PostgreSQL/SQLAlchemy, DuckDB, S3-compatible storage, Celery, and Redis
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 22.2 Implement Dataset, Ingestion, TransformRun, and Artifact migrations plus API validation/authz/rate/correlation/health/OpenAPI/Docker blueprint, finite workers, versioned artifacts, and restart persistence
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.7, 4.10, 4.12, 4.13, 4.14, 4.15, 4.17, 4.26_
  - [~] 22.3 Implement local JWT, PostgreSQL, DuckDB, S3-compatible object, Celery/Redis adapters with fakes, upload validation, idempotent jobs, redaction, and no monetization
    - _Requirements: 4.23, 8.7, 8.11, 8.12, 8.15, 13.3, 13.4_
  - [~] 22.4 Build upload-reference ingestion and DuckDB transform API that writes and reads a versioned artifact through documented OpenAPI routes
    - _Requirements: 4.5, 4.6, 4.8, 4.9, 4.16, 4.26_
  - [~] 22.5 Add required auth/contract/rate/state/restart, object fake, worker success/exhaustion and smoke tests plus Properties 6, 7, and 8
    - _Requirements: 4.19, 4.20, 4.21, 4.28, 8.12, 10.8, 10.12, 10.14_
  - [~] 22.6 Add `.env.example`, ingestion/jobs/observability/container/deployment README, and one-shot uv sync, Ruff, mypy, pytest, build/container, and health smoke validation
    - _Requirements: 4.25, 4.27, 9.1, 9.3, 9.4, 9.5, 9.6, 9.10, 9.11, 9.13, 10.19_
  - [~] 22.7 Validate a copied folder with ephemeral stores/fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 23. Build `fastify-commerce-api`
  - [~] 23.1 Scaffold pinned Fastify/Node LTS/TypeScript with local pnpm lockfile and `starter.json` for JWT, Prisma/PostgreSQL, Redis, and Stripe Checkout
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 23.2 Implement Product, Cart, CartItem, Order, and Payment migrations plus API validation/authz/rate/correlation/health/OpenAPI/Docker blueprint, atomic checkout state, and restart persistence
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.7, 4.10, 4.14, 4.15, 4.17, 4.26_
  - [~] 23.3 Implement local JWT, Prisma, Redis, and Stripe Checkout/webhook adapters with fakes, raw-body verification, event dedupe, order/payment atomicity, and redaction
    - _Requirements: 4.1, 4.22, 4.24, 8.9, 8.10, 8.11, 13.4_
  - [~] 23.4 Build authorized cart-to-order REST flow where verified checkout atomically marks payment/order and failures preserve prior state
    - _Requirements: 4.5, 4.6, 4.8, 4.9, 4.16, 4.26_
  - [~] 23.5 Add required Supertest contract/auth/rate/state/restart and Stripe proof/dedupe tests plus Properties 5, 6, and 7
    - _Requirements: 4.19, 4.20, 4.22, 4.24, 4.28, 10.8, 10.11, 10.12_
  - [~] 23.6 Add `.env.example`, commerce/API/rate/observability/container/deployment README, and one-shot frozen install, lint, typecheck, test, compile/container, and health smoke validation
    - _Requirements: 4.25, 4.27, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 23.7 Validate a copied folder with ephemeral stores/fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 24. Build `fastify-realtime-api`
  - [~] 24.1 Scaffold pinned Fastify/Node LTS/TypeScript with local pnpm lockfile and `starter.json` for JWT, WebSockets, PostgreSQL/Drizzle, and Redis
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 24.2 Implement User, Channel, Membership, Message, and Presence migrations plus API validation/authz/rate/correlation/health/OpenAPI/Docker blueprint and restart persistence
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.7, 4.10, 4.14, 4.15, 4.17, 4.26_
  - [~] 24.3 Implement local JWT, Drizzle, Redis pub/sub, and WebSocket adapters with fakes, channel authorization, sanitized disconnect/errors, and no monetization
    - _Requirements: 4.1, 4.2, 4.23, 8.8, 8.11, 13.3, 13.4_
  - [~] 24.4 Build authorized join/message/presence flow that persists messages and broadcasts only within permitted channels
    - _Requirements: 4.5, 4.6, 4.8, 4.9, 4.16, 4.26_
  - [~] 24.5 Add required REST/WebSocket contract, authz isolation, rate/state/restart/health and smoke tests plus Properties 4, 6, and 7
    - _Requirements: 4.19, 4.20, 4.28, 10.8, 10.10, 10.12_
  - [~] 24.6 Add `.env.example`, realtime/API/rate/observability/container/deployment README, and one-shot frozen install, lint, typecheck, test, compile/container, and health smoke validation
    - _Requirements: 4.25, 4.27, 9.1, 9.3, 9.4, 9.5, 9.6, 9.13, 10.19_
  - [~] 24.7 Validate a copied folder with ephemeral stores/fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 25. Build `nestjs-b2b-api`
  - [~] 25.1 Scaffold pinned NestJS/Node LTS/TypeScript with local pnpm lockfile and `starter.json` for Passport, Prisma/PostgreSQL, Stripe, BullMQ, and Redis
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 25.2 Implement Tenant, Membership, Role, Customer, Job, and Subscription migrations plus API authz/validation/rate/correlation/health/OpenAPI/Docker blueprint, finite jobs, and restart persistence
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.10, 4.12, 4.13, 4.14, 4.15, 4.17, 4.26_
  - [~] 25.3 Implement local Passport JWT, Prisma, BullMQ/Redis, and Stripe adapters with fakes, tenant isolation, job idempotency, verified plan events, and redaction
    - _Requirements: 4.1, 4.2, 4.22, 4.24, 8.8, 8.9, 8.11, 13.4_
  - [~] 25.4 Build tenant-admin customer mutation, export submission/status, and subscription entitlement REST flow
    - _Requirements: 4.5, 4.6, 4.8, 4.9, 4.16, 4.26_
  - [~] 25.5 Add required Supertest auth/RBAC/rate/state/restart, BullMQ success/exhaustion, Stripe proof/dedupe tests plus Properties 4–8 as applicable
    - _Requirements: 4.19, 4.20, 4.21, 4.22, 4.24, 4.28, 10.8, 10.10, 10.11, 10.14_
  - [~] 25.6 Add `.env.example`, B2B/jobs/billing/observability/container/deployment README, and one-shot frozen install, lint, typecheck, Jest, compile/container, and health smoke validation
    - _Requirements: 4.25, 4.27, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.11, 9.13, 10.19_
  - [~] 25.7 Validate a copied folder with ephemeral stores/fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 26. Build `go-webhook-service`
  - [~] 26.1 Scaffold pinned Go module with Chi, committed `go.mod`/`go.sum`, local tool pins/ignores, and `starter.json` for PostgreSQL/pgx, Redis, JWT, and OpenAPI
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 26.2 Implement Client, WebhookEndpoint, Delivery, Attempt, and ProcessedEvent migrations plus API validation/authz/rate/correlation/health/OpenAPI/container blueprint, finite delivery retry, and restart persistence
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.10, 4.12, 4.13, 4.14, 4.15, 4.17, 4.26_
  - [~] 26.3 Implement local JWT, pgx, Redis, signature verifier, and delivery adapters with fakes, inbound dedupe, sanitized errors, and no monetization
    - _Requirements: 4.1, 4.23, 4.24, 8.9, 8.10, 8.11, 13.3, 13.4_
  - [~] 26.4 Build authenticated endpoint registration and signed inbound-event flow that dedupes and records successful or terminal delivery outcomes
    - _Requirements: 4.5, 4.6, 4.8, 4.9, 4.16, 4.26_
  - [~] 26.5 Add required httptest/OpenAPI/auth/rate/state/restart, signature/dedupe, delivery exhaustion tests plus Properties 5, 6, 7, and 8 with rapid
    - _Requirements: 4.19, 4.20, 4.21, 4.24, 4.28, 10.8, 10.11, 10.12, 10.14_
  - [~] 26.6 Add `.env.example`, webhook/retry/rate/observability/container/deployment README, and one-shot module verify, go test, golangci-lint, vet, build/container, and health smoke validation
    - _Requirements: 4.25, 4.27, 9.1, 9.3, 9.4, 9.5, 9.6, 9.11, 9.13, 10.19_
  - [~] 26.7 Validate a copied folder with ephemeral stores/fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 27. Build `dotnet-enterprise-api`
  - [~] 27.1 Scaffold pinned ASP.NET Core LTS Web API with PostgreSQL choice, project/solution files, `global.json`, locked packages, ignores, and `starter.json`
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 27.2 Implement IdentityUser, Organization, Contact, Opportunity, and Subscription EF migrations plus API authz/validation/rate/correlation/health/OpenAPI/container blueprint and restart persistence
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.10, 4.14, 4.15, 4.17, 4.26_
  - [~] 27.3 Implement local Identity/JWT, EF Core/PostgreSQL, and Stripe adapters with fakes, organization authorization, verified deduped entitlement transitions, and redaction
    - _Requirements: 4.1, 4.2, 4.22, 4.24, 8.8, 8.9, 8.11, 13.4_
  - [~] 27.4 Build permitted opportunity-advance and organization subscription REST flow with stable failures and committed reads
    - _Requirements: 4.5, 4.6, 4.8, 4.9, 4.16, 4.26_
  - [~] 27.5 Add required WebApplicationFactory auth/RBAC/rate/state/restart and Stripe proof/dedupe tests plus FsCheck Properties 4, 5, 6, and 7
    - _Requirements: 4.19, 4.20, 4.22, 4.24, 4.28, 10.8, 10.10, 10.11, 10.12_
  - [~] 27.6 Add `.env.example`, enterprise/API/billing/observability/container/deployment README, and one-shot locked restore, format verify, test, publish/container, and health smoke validation
    - _Requirements: 4.25, 4.27, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 27.7 Validate a copied folder with ephemeral PostgreSQL/fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 28. Build `spring-enterprise-api`
  - [~] 28.1 Scaffold pinned Spring Boot/Java LTS with PostgreSQL and Redis choices, Maven Wrapper including `mvnw.cmd`, dependency lock/checksums, ignores, and `starter.json`
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 28.2 Implement User, Organization, Plan, Subscription, and AuditEvent JPA migrations plus security/validation/rate/correlation/health/OpenAPI/container blueprint and restart persistence
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.10, 4.14, 4.15, 4.17, 4.26_
  - [~] 28.3 Implement local Spring Security JWT, JPA/PostgreSQL, Redis, and Stripe adapters with fakes, admin authorization, verified deduped subscription/audit transition, and redaction
    - _Requirements: 4.1, 4.2, 4.22, 4.24, 8.8, 8.9, 8.11, 13.4_
  - [~] 28.4 Build admin plan-change and payment-event subscription/audit REST flow with stable errors and committed reads
    - _Requirements: 4.5, 4.6, 4.8, 4.9, 4.16, 4.26_
  - [~] 28.5 Add required MockMvc/Testcontainers auth/RBAC/rate/state/restart and Stripe proof/dedupe tests plus jqwik Properties 4, 5, 6, and 7
    - _Requirements: 4.19, 4.20, 4.22, 4.24, 4.28, 10.8, 10.10, 10.11, 10.12_
  - [~] 28.6 Add `.env.example`, enterprise/API/billing/observability/container/deployment README, and one-shot wrapper lock verification, tests, lint, package/container, and health smoke validation on Windows and Unix
    - _Requirements: 4.25, 4.27, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 28.7 Validate a copied folder with ephemeral stores/fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 29. Build `expo-admob-utility`
  - [~] 29.1 Scaffold pinned Expo Router/TypeScript with local pnpm lockfile, unique Android package, EAS profiles, ignores, and `starter.json` for Firebase Analytics, AdMob, SQLite, and optional RevenueCat ad removal
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1_
  - [~] 29.2 Implement Calculation, ScanResult, History, and AdRemoval in SQLite with router/deep links, explicit UI states, scanner permission lifecycle, local consent/ad eligibility, config, and sanitized errors
    - _Requirements: 5.6, 5.7, 5.8, 5.9, 5.12, 5.13, 8.7, 8.11_
  - [~] 29.3 Implement local AdMob, Firebase Analytics, scanner, and RevenueCat adapters with fakes; one consent state gates ads/analytics and digital ad removal uses the assigned mobile purchase boundary
    - _Requirements: 5.17, 5.18, 5.24, 8.15, 13.4, 13.5_
  - [~] 29.4 Build offline calculator/converter/history and scanner flow showing consent-aware ads or restored paid removal plus cold/warm deep-link behavior
    - _Requirements: 5.7, 5.8, 5.9, 5.12, 5.17_
  - [~] 29.5 Add required route/deep-link/state, scanner granted/denied/retry, ad/analytics consent, purchase eligibility and smoke tests plus Property 10
    - _Requirements: 5.20, 5.22, 5.24, 10.8_
  - [~] 29.6 Add `.env.example`, Android/iOS/EAS/deep-link/permission/ads/analytics/purchase/deployment README, and one-shot frozen install, lint, typecheck, Jest, Android export/EAS config, and smoke validation
    - _Requirements: 5.26, 5.27, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 29.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 30. Build `expo-ai-companion`
  - [~] 30.1 Scaffold pinned Expo Router/TypeScript with local pnpm lockfile, unique Android package, EAS profiles, ignores, and `starter.json` for Supabase, secure backend AI API, and RevenueCat
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1_
  - [~] 30.2 Implement Conversation, Message, TutorSession, Entitlement, and persisted bounded pending prompts using SQLite/SecureStore, deep links, explicit states, conflict/retry/cancel behavior, and config
    - _Requirements: 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.28, 5.29_
  - [~] 30.3 Implement local Supabase, server AI API, and RevenueCat adapters with fakes, no client AI secret, stable action IDs, digital purchase eligibility, and sanitized failures
    - _Requirements: 5.17, 5.18, 5.24, 8.4, 8.6, 8.15, 13.4_
  - [~] 30.4 Build sign-in and queued tutor prompt/response cache flow with offline recovery, premium limits, and cold/warm deep-link navigation
    - _Requirements: 5.7, 5.8, 5.9, 5.10, 5.17, 5.18_
  - [~] 30.5 Add required route/deep-link/state, queue restart/idempotency/capacity, no-client-secret, AI fake, RevenueCat tests plus Properties 3, 9, and 10
    - _Requirements: 5.20, 5.21, 5.24, 5.28, 5.29, 8.6, 10.8_
  - [~] 30.6 Add `.env.example`, Android/iOS/EAS/deep-link/queue/AI/purchase/deployment README, and one-shot frozen install, lint, typecheck, Jest, Android export/EAS config, and smoke validation
    - _Requirements: 5.26, 5.27, 5.30, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 30.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 31. Build `expo-social-community`
  - [~] 31.1 Scaffold pinned Expo Router/TypeScript with local pnpm lockfile, unique Android package, EAS profiles, ignores, and `starter.json` for Clerk, Convex, Stream Chat, and Expo push
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1_
  - [~] 31.2 Implement Profile, Post, Comment, Conversation, and PendingAction with SecureStore/SQLite bounded queue, deep links, explicit states, authz, conflicts, and retry/cancel behavior
    - _Requirements: 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.28, 5.29_
  - [~] 31.3 Implement local Clerk, Convex, Stream Chat, and push adapters with fakes, permission/token registration, foreground/background/tap routing, stable action IDs, and no monetization
    - _Requirements: 5.14, 5.15, 5.16, 5.17, 13.3, 13.4_
  - [~] 31.4 Build feed/profile/comment offline sync and chat notification deep-link flow that applies posts/comments once and preserves unrelated navigation
    - _Requirements: 5.7, 5.8, 5.10, 5.11, 5.16_
  - [~] 31.5 Add required route/deep-link/state, queue restart/idempotency/capacity, auth, Convex/Stream/push notification-routing tests plus Property 9
    - _Requirements: 5.20, 5.21, 5.23, 5.28, 5.29, 10.8_
  - [~] 31.6 Add `.env.example`, Android/iOS/EAS/deep-link/queue/chat/push/deployment README, and one-shot frozen install, lint, typecheck, Jest, Android export/EAS config, and smoke validation
    - _Requirements: 5.26, 5.27, 5.30, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 31.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 32. Build `expo-marketplace-app`
  - [~] 32.1 Scaffold pinned Expo Router/TypeScript with local pnpm lockfile, unique Android package, EAS profiles, ignores, and `starter.json`, selecting Supabase, Algolia, Google Maps, and Stripe Connect
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1, 13.14_
  - [~] 32.2 Implement Profile, Listing, Order, ConnectAccount, and PendingAction using Supabase/SQLite/SecureStore, bounded queue, deep links, explicit states, maps permission, and physical-order consistency
    - _Requirements: 5.5, 5.6, 5.9, 5.10, 5.11, 5.12, 5.28, 5.29_
  - [~] 32.3 Implement local Supabase, Algolia, Google Maps, and Stripe Connect adapters with fakes, eligible physical transaction classification, idempotent order/payment sync, and sanitized secrets/errors
    - _Requirements: 5.17, 5.19, 5.24, 8.1, 8.15, 13.4_
  - [~] 32.4 Build nearby search/map/listing detail and physical service/goods purchase flow whose Connect result updates the order and supports deep-link recovery
    - _Requirements: 5.7, 5.8, 5.9, 5.17, 5.19_
  - [~] 32.5 Add required route/deep-link/state, queue, maps permission, search/map/payment fake, physical-eligibility/idempotency tests plus Properties 9 and 10
    - _Requirements: 5.20, 5.21, 5.22, 5.24, 5.29, 10.8_
  - [~] 32.6 Add `.env.example`, Android/iOS/EAS/deep-link/queue/maps/search/Connect/deployment README, and one-shot frozen install, lint, typecheck, Jest, Android export/EAS config, and smoke validation
    - _Requirements: 5.26, 5.27, 5.30, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 32.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 33. Build `expo-booking-app`
  - [~] 33.1 Scaffold pinned Expo Router/TypeScript with local pnpm lockfile, unique Android package, EAS profiles, ignores, and `starter.json`, selecting Supabase, expo-calendar, Google Maps, notifications, and Stripe
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1, 13.14_
  - [~] 33.2 Implement Provider, Availability, Booking, Payment, and PendingAction with Supabase/SQLite/SecureStore, bounded queue, deep links, explicit states, calendar/maps/notification permissions, and booking-payment consistency
    - _Requirements: 5.5, 5.6, 5.9, 5.10, 5.11, 5.12, 5.14, 5.28, 5.29_
  - [~] 33.3 Implement local Supabase, Calendar, Maps, push, and Stripe adapters with fakes, eligible appointment/rental classification, idempotent payment/booking sync, and sanitized errors
    - _Requirements: 5.15, 5.16, 5.17, 5.19, 5.24, 13.4_
  - [~] 33.4 Build slot/map selection, eligible service payment, calendar event, reminder notification, and cold/warm deep-link flow
    - _Requirements: 5.7, 5.8, 5.13, 5.16, 5.17, 5.19_
  - [~] 33.5 Add required route/state/deep-link, queue, calendar/maps/notification permission, push routing, slot/payment consistency and eligibility tests plus Properties 9 and 10
    - _Requirements: 5.20, 5.21, 5.22, 5.23, 5.24, 10.8_
  - [~] 33.6 Add `.env.example`, Android/iOS/EAS/deep-link/queue/permissions/push/Stripe/deployment README, and one-shot frozen install, lint, typecheck, Jest, Android export/EAS config, and smoke validation
    - _Requirements: 5.26, 5.27, 5.30, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 33.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 34. Build `expo-habit-fitness-app`
  - [~] 34.1 Scaffold pinned Expo Router/TypeScript with local pnpm lockfile, unique Android package, EAS profiles, ignores, and `starter.json` for Firebase, Health Connect, RevenueCat, and notifications
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1_
  - [~] 34.2 Implement Habit, Workout, HealthSample, Streak, Entitlement, and pending completion state using Firestore/SQLite/SecureStore, bounded queue, deep links, explicit states, and health/push permissions
    - _Requirements: 5.5, 5.6, 5.9, 5.10, 5.11, 5.12, 5.14, 5.28, 5.29_
  - [~] 34.3 Implement local Firebase, Health Connect, RevenueCat, and push adapters with fakes, Android-only capability labeling, digital purchase eligibility, stable sync IDs, and sanitized errors
    - _Requirements: 5.15, 5.17, 5.18, 5.24, 5.25, 8.15, 13.4_
  - [~] 34.4 Build health permission/import, offline habit completion sync, streak display, premium analytics unlock, notification, and deep-link flow
    - _Requirements: 5.7, 5.8, 5.13, 5.16, 5.18_
  - [~] 34.5 Add required route/state/deep-link, queue, Health granted/denied/retry, push routing, RevenueCat eligibility tests plus Properties 9 and 10
    - _Requirements: 5.20, 5.21, 5.22, 5.23, 5.24, 10.8_
  - [~] 34.6 Add `.env.example`, Android/EAS/deep-link/queue/Health/push/purchase/deployment README with iOS limitations, and one-shot frozen install, lint, typecheck, Jest, Android export/EAS config, and smoke validation
    - _Requirements: 5.26, 5.27, 5.30, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 34.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 35. Build `expo-content-reader`
  - [~] 35.1 Scaffold pinned Expo Router/TypeScript with local pnpm lockfile, unique Android package, EAS profiles, ignores, and `starter.json`, selecting Sanity, AdMob, and Firebase Messaging
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1, 13.14_
  - [~] 35.2 Implement Article, Category, Bookmark, and Download in SQLite offline cache with deep links, explicit states, bounded download/action behavior, config, and push permission lifecycle
    - _Requirements: 5.6, 5.7, 5.8, 5.9, 5.10, 5.12, 5.14, 5.28_
  - [~] 35.3 Implement local Sanity, AdMob consent, and Firebase Messaging adapters with fakes, foreground/background/tap routing, offline cache consistency, and sanitized errors
    - _Requirements: 5.15, 5.16, 5.17, 5.23, 13.4_
  - [~] 35.4 Build article sync/save/offline read flow where notification opens the article after initialization and consent gates ads
    - _Requirements: 5.7, 5.8, 5.9, 5.16_
  - [~] 35.5 Add required route/state/deep-link, cache/restart, notification permission/routing, Sanity/AdMob consent tests plus Property 9 where mutable actions queue
    - _Requirements: 5.20, 5.21, 5.22, 5.23, 10.8_
  - [~] 35.6 Add `.env.example`, Android/iOS/EAS/deep-link/cache/push/ads/deployment README, and one-shot frozen install, lint, typecheck, Jest, Android export/EAS config, and smoke validation
    - _Requirements: 5.26, 5.27, 5.30, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 35.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 36. Build `expo-local-first-app`
  - [~] 36.1 Scaffold pinned Expo Router/TypeScript with local pnpm lockfile, unique Android package, EAS profiles, ignores, and `starter.json` for SQLite, Supabase, and Expo background sync
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1_
  - [~] 36.2 Implement Workspace, Note, InventoryItem, Mutation, and SyncConflict with SQLite source of truth, SecureStore, capacity-bounded persistent queue, stable IDs, visible conflict/cancel/retry states, and deep links
    - _Requirements: 5.5, 5.6, 5.9, 5.10, 5.11, 5.28, 5.29_
  - [~] 36.3 Implement local Supabase and background-sync adapters with deterministic fakes, idempotent delivery/acknowledgement, restart hydration, conflict policy, sanitized errors, and no monetization
    - _Requirements: 5.17, 5.21, 5.29, 8.15, 13.3, 13.4_
  - [~] 36.4 Build offline note/inventory editing, restart persistence, background sync, visible conflict resolution, capacity overflow recovery, and cold/warm deep-link flow
    - _Requirements: 5.7, 5.8, 5.9, 5.10, 5.11, 5.28, 5.29_
  - [~] 36.5 Add required model/route/state/deep-link and queue trace tests for restart, capacity, cancellation, conflicts, retry and exactly-once effect plus **Property 9**
    - _Requirements: 5.20, 5.21, 5.28, 5.29, 10.8_
  - [~] 36.6 Add `.env.example`, Android/iOS/EAS/deep-link/queue/conflict/background-sync/deployment README, and one-shot frozen install, lint, typecheck, Jest, Android export/EAS config, and smoke validation
    - _Requirements: 5.26, 5.27, 5.30, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.11, 9.13, 10.19_
  - [~] 36.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 37. Build `expo-delivery-tracker`
  - [~] 37.1 Scaffold pinned Expo Router/TypeScript with local pnpm lockfile, unique Android package, EAS profiles, ignores, and `starter.json`, selecting Firebase, Google Maps, background location, and push
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1, 13.14_
  - [~] 37.2 Implement Driver, Delivery, RouteStop, and LocationSample with Firestore/SQLite/SecureStore, bounded location/action queue, deep links, explicit states, and foreground/background location permissions
    - _Requirements: 5.5, 5.6, 5.9, 5.10, 5.11, 5.12, 5.14, 5.28, 5.29_
  - [~] 37.3 Implement local Firebase, Google Maps, background-location, and push adapters with fakes, token registration/routing, stable samples, redaction, and no monetization
    - _Requirements: 5.15, 5.16, 5.17, 8.11, 13.3, 13.4_
  - [~] 37.4 Build driver permission flow, offline route/location updates, sync, dispatcher notification, and delivery deep-link navigation
    - _Requirements: 5.7, 5.8, 5.13, 5.16, 5.29_
  - [~] 37.5 Add required route/state/deep-link, bounded queue, location granted/denied/retry, push routing/idempotency tests plus Property 9
    - _Requirements: 5.20, 5.21, 5.22, 5.23, 5.28, 5.29, 10.8_
  - [~] 37.6 Add `.env.example`, Android/EAS/deep-link/queue/location/push/deployment README with iOS portability, and one-shot frozen install, lint, typecheck, Jest, Android export/EAS config, and smoke validation
    - _Requirements: 5.26, 5.27, 5.30, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 37.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 38. Build `expo-event-app`
  - [~] 38.1 Scaffold pinned Expo Router/TypeScript with local pnpm lockfile, unique Android package, EAS profiles, ignores, and `starter.json` for Supabase, QR scanning, notifications, and eligible Stripe event tickets
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1_
  - [~] 38.2 Implement Event, Ticket, Attendee, Scan, and Connection with Supabase/SQLite/SecureStore, bounded offline scans, stable IDs, deep links, explicit states, scanner/push permissions, and duplicate prevention
    - _Requirements: 5.5, 5.6, 5.9, 5.10, 5.11, 5.12, 5.14, 5.28, 5.29_
  - [~] 38.3 Implement local Supabase, QR, push, and Stripe adapters with fakes, physical-event eligibility, idempotent purchase/scan sync, token routing, and sanitized failures
    - _Requirements: 5.15, 5.16, 5.17, 5.19, 5.24, 13.4_
  - [~] 38.4 Build eligible ticket purchase, one-time offline QR scan, attendance sync, networking, notification, and event deep-link flow
    - _Requirements: 5.7, 5.8, 5.13, 5.16, 5.19, 5.29_
  - [~] 38.5 Add required route/state/deep-link, queue, QR granted/denied/retry, duplicate-scan, push routing and physical eligibility tests plus Properties 9 and 10
    - _Requirements: 5.20, 5.21, 5.22, 5.23, 5.24, 5.29, 10.8_
  - [~] 38.6 Add `.env.example`, Android/iOS/EAS/deep-link/queue/QR/push/Stripe/deployment README, and one-shot frozen install, lint, typecheck, Jest, Android export/EAS config, and smoke validation
    - _Requirements: 5.26, 5.27, 5.30, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 38.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 39. Build `expo-ecommerce-app`
  - [~] 39.1 Scaffold pinned Expo Router/TypeScript with local pnpm lockfile, unique Android package, EAS profiles, ignores, and `starter.json` for Shopify Storefront API, predictive search, push, and native checkout
    - _Requirements: 1.2, 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 10.1_
  - [~] 39.2 Implement Product, Cart, Checkout, Order, and Favorite using Shopify customer token in SecureStore and SQLite cache/queue, deep links, explicit states, stable cart actions, and order consistency
    - _Requirements: 5.5, 5.6, 5.9, 5.10, 5.11, 5.28, 5.29_
  - [~] 39.3 Implement local Shopify Storefront/search/native-checkout and push adapters with fakes, physical-goods eligibility, foreground/background/tap routing, idempotent cart/order sync, and sanitized errors
    - _Requirements: 5.14, 5.15, 5.16, 5.17, 5.19, 5.24, 13.4_
  - [~] 39.4 Build product search, offline add/favorite, resumed Shopify checkout, order status, notification, and order deep-link flow
    - _Requirements: 5.7, 5.8, 5.9, 5.16, 5.19, 5.29_
  - [~] 39.5 Add required route/state/deep-link, cart queue restart/idempotency, Storefront/search/checkout fakes, push routing and physical eligibility tests plus Properties 9 and 10
    - _Requirements: 5.20, 5.21, 5.23, 5.24, 5.29, 10.8_
  - [~] 39.6 Add `.env.example`, Android/iOS/EAS/deep-link/queue/Shopify/push/deployment README, and one-shot frozen install, lint, typecheck, Jest, Android export/EAS config, and smoke validation
    - _Requirements: 5.26, 5.27, 5.30, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 39.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 40. Build `astro-affiliate-site`
  - [~] 40.1 Scaffold pinned Astro static/TypeScript with local pnpm lockfile, ignores, and `starter.json` for MDX, affiliate links, AdSense, and analytics
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 40.2 Implement Review, Product, and Comparison content collections plus local SEO/canonical/robots/sitemap/feed and Product/Review schema projections with metadata bounds
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.25, 6.26, 6.27_
  - [~] 40.3 Implement local responsive reserved AdSense component, shared consent/analytics, visible affiliate disclosures, and required outbound relationship attributes
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.14, 6.15, 6.16, 13.4_
  - [~] 40.4 Build a disclosed review/comparison flow with Product/Review JSON-LD, canonical pages, feed/sitemap inclusion, and consent-gated ads/analytics
    - _Requirements: 6.3, 6.5, 6.7, 6.14, 6.15_
  - [~] 40.5 Add required disclosure/link/schema/feed/ad/consent/CLS/performance/accessibility tests plus Properties 11, 12, and 13
    - _Requirements: 6.4, 6.11, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 10.13_
  - [~] 40.6 Add `.env.example`, authoring/schema/affiliate/ad/deployment README, and one-shot frozen install, lint, Astro check/build, output crawl, a11y, CLS/performance, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.13, 10.19_
  - [~] 40.7 Validate copied output with no live providers and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 41. Build `nextjs-directory-site`
  - [~] 41.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json`, selecting Supabase/PostgreSQL/Drizzle, Meilisearch, and AdSense
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 41.2 Implement Listing, Category, Location, and Claim migrations plus local indexability/SEO/LocalBusiness schema/sitemap rules, claim state, metadata bounds, and sanitized data errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.25, 8.7_
  - [~] 41.3 Implement local Supabase/Drizzle, Meilisearch, AdSense, shared consent/analytics adapters with fakes and reserved ad geometry
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.16, 13.4_
  - [~] 41.4 Build browse/search/filter and canonical listing-detail flow emitting LocalBusiness JSON-LD and consent-aware ads
    - _Requirements: 6.1, 6.3, 6.5, 6.25_
  - [~] 41.5 Add required DB/search fake, metadata/schema/sitemap/ad/consent/CLS/performance/a11y tests plus Properties 11 and 13
    - _Requirements: 6.4, 6.11, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 10.13_
  - [~] 41.6 Add `.env.example`, schema/search/content/ad/deployment README, and one-shot frozen install, lint, typecheck, test, build, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 41.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 42. Build `nextjs-programmatic-seo`
  - [~] 42.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json`, selecting PostgreSQL/Drizzle, Inngest imports, and AdSense
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 42.2 Implement Dataset, ImportRun, and LandingPage migrations plus indexability/metadata/schema/sitemap rules, deterministic uniqueness, finite import retry/terminal states, and config
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.25, 8.7_
  - [~] 42.3 Implement local Drizzle, Inngest, AdSense, shared consent/analytics adapters with fakes, validated idempotent upserts, reserved ad geometry, and sanitized failures
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.16, 8.15, 13.4_
  - [~] 42.4 Build scheduled import flow that validates/upserts unique landing pages and exposes only eligible canonical pages in sitemap/searchable routes
    - _Requirements: 6.1, 6.5, 6.6, 6.25_
  - [~] 42.5 Add required import retry/idempotency, metadata uniqueness/schema/sitemap/ad/performance/a11y tests plus Properties 8, 11, and 13
    - _Requirements: 6.4, 6.11, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 10.14_
  - [~] 42.6 Add `.env.example`, data/import/retry/SEO/ad/deployment README, and one-shot frozen install, lint, typecheck, test, build, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.11, 9.13, 10.19_
  - [~] 42.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 43. Build `nextjs-tools-site`
  - [~] 43.1 Scaffold pinned Next.js static-generation/TypeScript with local pnpm lockfile, ignores, and `starter.json` for static typed tools, AdSense, analytics, and optional local route handler
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 43.2 Implement ToolDefinition, ToolInput, and ToolResult pure models plus local SEO/schema/sitemap projections, metadata bounds, typed validation, and static export configuration
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.25, 8.7_
  - [~] 43.3 Implement local reserved AdSense component and shared consent/analytics adapters with disabled fallback; keep calculator results client-local and optional API unconfigured by default
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.16, 9.12, 13.4_
  - [~] 43.4 Build calculator/generator index and detail flow with validated pure results, canonical metadata, static pages, and consent-gated providers
    - _Requirements: 6.1, 6.3, 6.5, 6.24_
  - [~] 43.5 Add required fast-check calculator invariants, validation, SEO/schema/sitemap/ad/consent/CLS/performance/a11y tests plus Properties 11 and 13
    - _Requirements: 6.4, 6.11, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 10.13_
  - [~] 43.6 Add `.env.example`, tool authoring/optional API/ad/deployment README, and one-shot frozen install, lint, typecheck, test, static build, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.12, 9.13, 10.19_
  - [~] 43.7 Validate a standalone copy with providers disabled and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 44. Build `nextjs-job-board`
  - [~] 44.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json`, selecting Clerk, PostgreSQL/Drizzle, Stripe paid listings, and AdSense
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 44.2 Implement Employer, Job, ApplicationLink, and ListingPayment migrations plus employer authz, paid-publication state, JobPosting schema, feed/sitemap/indexability, metadata bounds, and rollback
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.7, 6.23, 8.8, 8.16_
  - [~] 44.3 Implement local Clerk, Drizzle, Stripe verified paid-listing, AdSense, and consent/analytics adapters with fakes, event dedupe, disclosures, and reserved dimensions
    - _Requirements: 6.8, 6.10, 6.12, 6.14, 6.16, 6.23, 8.9, 13.4_
  - [~] 44.4 Build employer-authenticated pay-to-publish flow where verified payment indexes a JobPosting page and updates deterministic feed/sitemap; render paid placement disclosure
    - _Requirements: 6.5, 6.7, 6.14, 6.23, 6.26, 6.27_
  - [~] 44.5 Add required employer authz, Stripe valid/invalid proof/dedupe, paid-publication/feed/schema/disclosure/ad/performance/a11y tests plus Properties 4, 5, 11, 12, and 13
    - _Requirements: 6.4, 6.18, 6.21, 6.28, 8.10, 10.9, 10.10, 10.11, 10.13_
  - [~] 44.6 Add `.env.example`, employer/payment/content/ad/deployment README, and one-shot frozen install, lint, typecheck, test, build, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 44.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 45. Build `nuxt-magazine-site`
  - [~] 45.1 Scaffold pinned Nuxt static/hybrid TypeScript with local pnpm lockfile and `starter.json`, selecting Nuxt Content, AdSense, image optimization, and Resend newsletter
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 45.2 Implement Author, Article, Section, and NewsletterSignup plus content validation, SEO/Article schema/sitemap/RSS projections, metadata bounds, image rules, and deterministic order
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.25, 6.26, 6.27_
  - [~] 45.3 Implement local Resend server boundary/fake, image optimization, reserved AdSense, and shared consent/analytics adapters with sanitized fallback
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.16, 8.4, 13.4_
  - [~] 45.4 Build multi-author publish flow updating optimized page/feed/sitemap and a server-only newsletter signup with consent-gated ads
    - _Requirements: 6.1, 6.5, 6.7, 6.13, 8.7_
  - [~] 45.5 Add required content/feed/image/email fake/ad/consent/CLS/performance/a11y tests plus Properties 3, 11, 12, and 13
    - _Requirements: 6.4, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 10.13_
  - [~] 45.6 Add `.env.example`, authoring/image/newsletter/ad/deployment README, and one-shot frozen install, lint, Nuxt typecheck/test/build, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 45.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 46. Build `nuxt-local-directory`
  - [~] 46.1 Scaffold pinned Nuxt hybrid TypeScript with local pnpm lockfile and `starter.json`, selecting Supabase, MapLibre/OpenStreetMap, Meilisearch, AdSense, and sponsored listings
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 46.2 Implement Business, Category, Location, and Sponsorship persistence plus LocalBusiness schema, ranking/disclosure rules, metadata bounds, sitemap/indexability, and sanitized data behavior
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.14, 6.25, 8.7_
  - [~] 46.3 Implement local Supabase, MapLibre, Meilisearch, AdSense, sponsored-ranking, and consent/analytics adapters with fakes and reserved geometry
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.14, 6.16, 13.4_
  - [~] 46.4 Build search/map directory flow with canonical detail schema and visibly disclosed sponsored ranking
    - _Requirements: 6.1, 6.3, 6.5, 6.14_
  - [~] 46.5 Add required ranking/disclosure, map/search/data fake, SEO/schema/sitemap/ad/CLS/performance/a11y tests plus Properties 11 and 13
    - _Requirements: 6.4, 6.11, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 10.13_
  - [~] 46.6 Add `.env.example`, content/maps/search/sponsorship/ad/deployment README, and one-shot frozen install, lint, Nuxt typecheck/test/build, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 46.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 47. Build `eleventy-static-site`
  - [~] 47.1 Scaffold pinned Eleventy/Node project with local pnpm manifest/lockfile, ignores, and `starter.json` for Markdown/data, AdSense, RSS, and sitemap
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 47.2 Implement Document, NavigationItem, and Update sources plus local SEO/schema/sitemap/robots/RSS projections, metadata bounds, link validation, and deterministic order
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.25, 6.26, 6.27_
  - [~] 47.3 Implement local responsive reserved AdSense component and shared consent/analytics initializer with blocked/delayed/unavailable fallback
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.16, 13.4_
  - [~] 47.4 Build Markdown page/update flow that links new content in navigation, feed, sitemap, canonical output, and consent-aware ad slots
    - _Requirements: 6.1, 6.5, 6.7, 6.13_
  - [~] 47.5 Add required HTML/link/feed/schema/ad/consent/CLS/performance/a11y tests plus Properties 11, 12, and 13
    - _Requirements: 6.4, 6.11, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 10.13_
  - [~] 47.6 Add `.env.example`, content/metadata/feed/ad/deployment README, and one-shot frozen install, lint/config check, test, static build, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.13, 10.19_
  - [~] 47.7 Validate copied static output and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 48. Build `hugo-content-site`
  - [~] 48.1 Scaffold pinned Hugo Extended project with pinned version file and local pnpm lockfile for Pagefind/browser validators, ignores, and `starter.json`
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 48.2 Implement Page, Section, Author, and Update Markdown/front matter plus SEO/schema/sitemap/robots/RSS projections, metadata bounds, and deterministic order
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.25, 6.26, 6.27_
  - [~] 48.3 Implement local Pagefind search, reserved AdSense, affiliate disclosures/relationship attributes, and shared consent/analytics behavior
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.14, 6.15, 6.16, 13.4_
  - [~] 48.4 Build large content flow producing search index, canonical pages, deterministic RSS/sitemap, and disclosed affiliate content with consent-aware ads
    - _Requirements: 6.1, 6.5, 6.7, 6.14, 6.15_
  - [~] 48.5 Add required Hugo warning, Pagefind/link/feed/disclosure/ad/CLS/performance/a11y tests plus Properties 11, 12, and 13
    - _Requirements: 6.4, 6.11, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 10.13_
  - [~] 48.6 Add `.env.example`, content/search/affiliate/ad/deployment README, and one-shot frozen validator install, Hugo production build, Pagefind, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.13, 10.19_
  - [~] 48.7 Validate copied static output and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 49. Build `astro-recipe-site`
  - [~] 49.1 Scaffold pinned Astro static/TypeScript with local pnpm lockfile, ignores, and `starter.json` for content collections, AdSense, and recipe/tutorial publishing
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 49.2 Implement Recipe, Ingredient, Instruction, and Tutorial schemas with required Recipe/HowTo fields plus SEO/canonical/sitemap/robots/RSS projections, bounds, and deterministic order
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.25, 6.26, 6.27_
  - [~] 49.3 Implement local Recipe/HowTo JSON-LD generators, reserved AdSense component, and shared consent/analytics behavior with no auth/payment
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.16, 6.24, 13.3, 13.4_
  - [~] 49.4 Build recipe/tutorial authoring flow whose validated subtype schema, canonical page, RSS, and sitemap update together
    - _Requirements: 6.3, 6.4, 6.5, 6.7_
  - [~] 49.5 Add required recipe field/unit/instruction and Recipe-vs-HowTo schema, feed, ad, CLS/performance/a11y tests plus Properties 11, 12, and 13
    - _Requirements: 6.4, 6.11, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 10.13_
  - [~] 49.6 Add `.env.example`, recipe fields/images/schema/feed/ad/deployment README, and one-shot frozen install, lint, Astro check/build, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.13, 10.19_
  - [~] 49.7 Validate copied static output and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 50. Build `astro-comparison-site`
  - [~] 50.1 Scaffold pinned Astro static/TypeScript with local pnpm lockfile, ignores, and `starter.json` for content collections, affiliate links, and AdSense
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1_
  - [~] 50.2 Implement Product, Comparison, Criterion, and Offer collections plus Product/ItemList schema, SEO/canonical/sitemap rules, metadata bounds, and deterministic ranking fields
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.25_
  - [~] 50.3 Implement local comparison table, affiliate disclosure/relationship attributes, reserved AdSense component, and shared consent/analytics behavior
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.14, 6.15, 6.16, 13.4_
  - [~] 50.4 Build disclosed best-of comparison flow with accessible table, Product/ItemList JSON-LD, canonical pages, and consent-aware ads
    - _Requirements: 6.3, 6.5, 6.14, 6.15_
  - [~] 50.5 Add required table/ranking/schema/disclosure/link/ad/CLS/performance/a11y tests plus Properties 11 and 13
    - _Requirements: 6.4, 6.11, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 10.13_
  - [~] 50.6 Add `.env.example`, comparison/schema/affiliate/ad/deployment README, and one-shot frozen install, lint, Astro check/build, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.13, 10.19_
  - [~] 50.7 Validate copied static output and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 51. Build `nextjs-coupon-site`
  - [~] 51.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json`, selecting PostgreSQL/Drizzle, Meilisearch, Inngest feeds, affiliate tracking, and AdSense
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 51.2 Implement Merchant, Coupon, FeedImport, and ClickAttribution migrations plus SEO/schema/sitemap/RSS projections, metadata bounds, expiry/indexability, deterministic order, and finite import retries
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.25, 6.26, 6.27_
  - [~] 51.3 Implement local Drizzle, Meilisearch, Inngest, affiliate attribution, reserved AdSense, and consent/analytics adapters with fakes, deduped imports/clicks, disclosures, and rel attributes
    - _Requirements: 6.8, 6.10, 6.12, 6.14, 6.15, 6.16, 8.15, 13.4_
  - [~] 51.4 Build scheduled feed import, deduplicated coupon search, disclosed tracked offer click, and deterministic public feed flow
    - _Requirements: 6.5, 6.7, 6.14, 6.15, 6.26, 6.27_
  - [~] 51.5 Add required import retry/idempotency, search, attribution, disclosure/link, feed/SEO/schema/ad/performance/a11y tests plus Properties 8, 11, 12, and 13
    - _Requirements: 6.4, 6.18, 6.21, 6.28, 10.13, 10.14_
  - [~] 51.6 Add `.env.example`, feeds/search/affiliate/ad/deployment README, and one-shot frozen install, lint, typecheck, test, build, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.11, 9.13, 10.19_
  - [~] 51.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 52. Build `nextjs-real-estate-directory`
  - [~] 52.1 Scaffold pinned Next.js/TypeScript with local pnpm lockfile and `starter.json`, selecting PostgreSQL/Drizzle, MapLibre/OpenStreetMap, Cloudflare R2, AdSense, and promoted listings
    - _Requirements: 1.2, 2.1, 2.2, 10.1, 13.1, 13.14_
  - [~] 52.2 Implement Property, Agent, Image, and Promotion migrations plus RealEstateListing schema, SEO/sitemap/indexability, metadata bounds, promotion/disclosure state, upload limits, and sanitized errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.14, 6.25, 8.12_
  - [~] 52.3 Implement local Drizzle, MapLibre, R2, promoted-ranking, reserved AdSense, and consent/analytics adapters with fakes, pre-storage image validation, disclosures, and fallback
    - _Requirements: 6.8, 6.9, 6.10, 6.12, 6.13, 6.14, 6.16, 8.12, 13.4_
  - [~] 52.4 Build image-validated property publication, map/search detail, disclosed promoted placement, and RealEstateListing JSON-LD flow
    - _Requirements: 6.1, 6.3, 6.5, 6.14_
  - [~] 52.5 Add required upload-limit/R2/map fakes, promotion disclosure, schema/SEO/sitemap/ad/CLS/performance/a11y tests plus Properties 11 and 13
    - _Requirements: 6.4, 6.11, 6.18, 6.19, 6.20, 6.21, 6.22, 6.28, 8.12, 10.13_
  - [~] 52.6 Add `.env.example`, property/images/maps/promotion/ad/deployment README, and one-shot frozen install, lint, typecheck, test, build, output quality, and smoke validation
    - _Requirements: 6.17, 9.1, 9.3, 9.4, 9.5, 9.6, 9.9, 9.13, 10.19_
  - [~] 52.7 Validate a standalone copy with fakes and promote status only after all checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 13.10, 13.11_

- [ ] 53. Build minimal `nextjs-beginner-static-site`
  - [~] 53.1 Scaffold pinned Next.js static-export/Node LTS/TypeScript with CSS Modules, local pnpm lockfile, ignores, and matching `starter.json`
    - _Requirements: 1.2, 2.1, 2.2, 7.1, 7.2, 7.3, 10.1, 13.1_
  - [~] 53.2 Implement only SiteConfig, shared layout/navigation/footer, two reusable components, public assets, SEO/sitemap/static export config, and beginner comments for layout/component/export
    - _Requirements: 7.3, 7.4, 7.7, 7.8, 7.11, 7.12_
  - [~] 53.3 Add a comment-only `.env.example` declaring no required values, preserve zero auth/database/payment/queue/email/provider services, and implement semantic keyboard/focus/responsive behavior
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 8.3, 13.3_
  - [~] 53.4 Build Home, About, Contact, and Projects pages with replaceable `mailto:` contact, reusable content, and deployable `out/` static export
    - _Requirements: 7.4, 7.9, 7.10, 7.12_
  - [~] 53.5 Add required static link/route, viewport overflow, keyboard/focus, accessibility, dependency-allowlist tests plus **Property 14: Beginner static no-service build and dependency allowlist**
    - _Requirements: 7.5, 7.6, 7.15, 7.16, 7.17, 10.8, 10.13_
  - [~] 53.6 Document structure/content/CSS Modules/dependency purposes and Vercel static/Netlify deployment; add one-shot frozen install, lint, typecheck, test, static export, Playwright a11y/overflow, and smoke validation
    - _Requirements: 7.13, 7.14, 7.15, 7.17, 9.5, 9.6, 9.13, 10.2, 10.3, 10.4, 10.19_
  - [~] 53.7 Validate a standalone copy with no env values or external services and promote status only after the no-service gate and all mapped checks pass
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 7.1, 7.12, 13.10, 13.11_

- [ ] 54. Complete cross-family validation and exact-52 release gates
  - [~] 54.1 Implement the standalone copied-folder matrix for all 52 exact catalog identities
    - Copy one folder at a time into an isolated workspace, frozen-install locally, execute its documented test/lint/type/static/build/smoke commands, and fail parent-path, workspace, link, file, root-package, or cross-starter dependencies.
    - _Requirements: 1.1, 1.3, 2.3, 2.4, 2.5, 2.6, 2.7, 10.2, 10.7, 13.13_
  - [~] 54.2 Implement provider-fake default CI across every applicable starter
    - Prove installs, tests, builds, migrations, restarts, workers, webhooks, mobile boundaries, and content output without external credentials; use deterministic clocks/IDs and ephemeral local stores where persistence matters.
    - _Requirements: 2.9, 4.21, 4.24, 4.28, 5.21, 5.24, 6.28, 8.15, 10.7, 13.4_
  - [~] 54.3 Add opt-in provider sandbox verification scripts or executable documented checklists
    - Cover provider consoles, callbacks/webhooks, email previews, maps/search, EAS purchases, notifications, physical-payment eligibility, and deployment checks without live production transactions or committed credentials.
    - _Requirements: 3.9, 5.18, 5.19, 9.8, 9.9, 9.14, 9.18, 9.19, 13.5_
  - [~] 54.4 Add repository-wide secret, private-key, environment parity, and client-bundle scans
    - Fail safely with file/rule diagnostics but never print secret values; verify required placeholders aggregate at startup and every actual environment read is declared/classified.
    - _Requirements: 2.12, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.13, 8.14, 8.18, 9.1, 9.2, 9.3, 9.4, 9.15, 9.16_
  - [~] 54.5 Implement license inventory and notice validation for root and all starters
    - Check original-code license, conditional attribution records/retained texts, redistributable assets/scaffolds/fonts/icons/data, and factual compatibility wording.
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  - [~] 54.6 Run README/catalog link, field, family, status, manifest/lockfile, environment, metadata, unique Expo package, and exact-set validation
    - Require exactly 52 rows/folders with 15/9/12/14/2 partition, no extras/duplicates, resolvable setup links, and status `complete` only for starters whose standalone and mapped criteria pass.
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 5.3, 10.15, 10.16, 10.17, 10.18, 11.1, 11.4, 11.10, 11.11, 11.12, 11.13, 13.11_
  - [~] 54.7 Implement and run the final exact-52 completion command
    - Require all 52 statuses `complete`, zero unresolved applicable-criterion failures, full standalone matrix success, and aggregate every affected starter/requirement/expected/observed failure without mutating repository contents.
    - _Requirements: 1.6, 1.7, 13.12, 13.13, 13.15, 13.16_

## Notes

- Every starter task group owns its scaffold, runtime/build/test code, lockfile, metadata, provider adapters, fixtures, schema, documentation, and validation. Root tooling only inspects these artifacts.
- Statuses progress `pending` → `in progress` → `complete`; `complete` is permitted only after that starter passes all applicable family, security, documentation, reproducibility, licensing, and standalone-copy checks. Each starter's `.7` leaf emits unique project-local completion evidence and requests promotion without editing shared root metadata; task 54.6 serially applies eligible catalog/README status changes.
- The five reference slices establish family patterns first. Afterward, starters in the same graph wave are independent and may execute in parallel because they write only inside their own folders.
- All test tasks are required. Each starter includes named example/integration coverage and at least one applicable approved correctness property; provider sandbox checks remain opt-in, while provider-fake CI is mandatory.
- The two beginner starters intentionally remain zero-service static exports with dependency allowlists, four small pages, and no mandatory auth, database, payment, queue, email, or provider account.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.5"] },
    { "id": 2, "tasks": ["1.6", "1.7"] },
    { "id": 3, "tasks": ["2.1", "3.1", "4.1", "5.1", "6.1"] },
    { "id": 4, "tasks": ["2.2", "3.2", "4.2", "5.2", "6.2"] },
    { "id": 5, "tasks": ["2.3", "3.3", "4.3", "5.3", "6.3"] },
    { "id": 6, "tasks": ["2.4", "3.4", "4.4", "5.4", "6.4"] },
    { "id": 7, "tasks": ["2.5", "3.5", "4.5", "5.5", "6.5"] },
    { "id": 8, "tasks": ["2.6", "3.6", "4.6", "5.6", "6.6"] },
    { "id": 9, "tasks": ["2.7", "3.7", "4.7", "5.7", "6.7"] },
    { "id": 10, "tasks": ["7.1", "8.1", "9.1", "10.1", "11.1", "12.1", "13.1", "14.1", "15.1", "16.1", "17.1", "18.1", "19.1", "20.1", "21.1", "22.1", "23.1", "24.1", "25.1", "26.1", "27.1", "28.1", "29.1", "30.1", "31.1", "32.1", "33.1", "34.1", "35.1", "36.1", "37.1", "38.1", "39.1", "40.1", "41.1", "42.1", "43.1", "44.1", "45.1", "46.1", "47.1", "48.1", "49.1", "50.1", "51.1", "52.1", "53.1"] },
    { "id": 11, "tasks": ["7.2", "8.2", "9.2", "10.2", "11.2", "12.2", "13.2", "14.2", "15.2", "16.2", "17.2", "18.2", "19.2", "20.2", "21.2", "22.2", "23.2", "24.2", "25.2", "26.2", "27.2", "28.2", "29.2", "30.2", "31.2", "32.2", "33.2", "34.2", "35.2", "36.2", "37.2", "38.2", "39.2", "40.2", "41.2", "42.2", "43.2", "44.2", "45.2", "46.2", "47.2", "48.2", "49.2", "50.2", "51.2", "52.2", "53.2"] },
    { "id": 12, "tasks": ["7.3", "8.3", "9.3", "10.3", "11.3", "12.3", "13.3", "14.3", "15.3", "16.3", "17.3", "18.3", "19.3", "20.3", "21.3", "22.3", "23.3", "24.3", "25.3", "26.3", "27.3", "28.3", "29.3", "30.3", "31.3", "32.3", "33.3", "34.3", "35.3", "36.3", "37.3", "38.3", "39.3", "40.3", "41.3", "42.3", "43.3", "44.3", "45.3", "46.3", "47.3", "48.3", "49.3", "50.3", "51.3", "52.3", "53.3"] },
    { "id": 13, "tasks": ["7.4", "8.4", "9.4", "10.4", "11.4", "12.4", "13.4", "14.4", "15.4", "16.4", "17.4", "18.4", "19.4", "20.4", "21.4", "22.4", "23.4", "24.4", "25.4", "26.4", "27.4", "28.4", "29.4", "30.4", "31.4", "32.4", "33.4", "34.4", "35.4", "36.4", "37.4", "38.4", "39.4", "40.4", "41.4", "42.4", "43.4", "44.4", "45.4", "46.4", "47.4", "48.4", "49.4", "50.4", "51.4", "52.4", "53.4"] },
    { "id": 14, "tasks": ["7.5", "8.5", "9.5", "10.5", "11.5", "12.5", "13.5", "14.5", "15.5", "16.5", "17.5", "18.5", "19.5", "20.5", "21.5", "22.5", "23.5", "24.5", "25.5", "26.5", "27.5", "28.5", "29.5", "30.5", "31.5", "32.5", "33.5", "34.5", "35.5", "36.5", "37.5", "38.5", "39.5", "40.5", "41.5", "42.5", "43.5", "44.5", "45.5", "46.5", "47.5", "48.5", "49.5", "50.5", "51.5", "52.5", "53.5"] },
    { "id": 15, "tasks": ["7.6", "8.6", "9.6", "10.6", "11.6", "12.6", "13.6", "14.6", "15.6", "16.6", "17.6", "18.6", "19.6", "20.6", "21.6", "22.6", "23.6", "24.6", "25.6", "26.6", "27.6", "28.6", "29.6", "30.6", "31.6", "32.6", "33.6", "34.6", "35.6", "36.6", "37.6", "38.6", "39.6", "40.6", "41.6", "42.6", "43.6", "44.6", "45.6", "46.6", "47.6", "48.6", "49.6", "50.6", "51.6", "52.6", "53.6"] },
    { "id": 16, "tasks": ["7.7", "8.7", "9.7", "10.7", "11.7", "12.7", "13.7", "14.7", "15.7", "16.7", "17.7", "18.7", "19.7", "20.7", "21.7", "22.7", "23.7", "24.7", "25.7", "26.7", "27.7", "28.7", "29.7", "30.7", "31.7", "32.7", "33.7", "34.7", "35.7", "36.7", "37.7", "38.7", "39.7", "40.7", "41.7", "42.7", "43.7", "44.7", "45.7", "46.7", "47.7", "48.7", "49.7", "50.7", "51.7", "52.7", "53.7"] },
    { "id": 17, "tasks": ["54.1", "54.3", "54.4", "54.5"] },
    { "id": 18, "tasks": ["54.2"] },
    { "id": 19, "tasks": ["54.6"] },
    { "id": 20, "tasks": ["54.7"] }
  ]
}
```

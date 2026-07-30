# Requirements Document

## Introduction

The Multi_Stack_Boilerplates_Repository delivers 52 standalone Starter projects across Web_SaaS, API_Backend, Expo_Mobile, Content_Adsense, and Beginner_Static families. Each Starter occupies one root-level folder, implements the use case and technology combination in the Normative_Catalog, and satisfies readiness criteria tailored to the Starter_Family. The repository supports repeated primary frameworks when the use case and integration combination differ, while preserving complete folder independence.

## Glossary

- **Multi_Stack_Boilerplates_Repository**: The complete repository containing the Root_README and all Starter folders.
- **Repository_Root**: The top-level directory of the Multi_Stack_Boilerplates_Repository.
- **Starter**: One self-contained project in a folder directly under Repository_Root.
- **Starter_Family**: One of Web_SaaS, API_Backend, Expo_Mobile, Content_Adsense, or Beginner_Static.
- **Normative_Catalog**: The authoritative list of 52 folder names, Starter_Families, use cases, and required technologies in Requirement 1.
- **Required_Technology_Set**: The technologies and provider choices assigned to one Starter by the Normative_Catalog, including an explicitly permitted alternative where the catalog uses “or” or a slash.
- **Applicable_Integration**: A capability or provider explicitly included in a Starter's Required_Technology_Set or explicitly required for the Starter's use case by the relevant family requirement.
- **Root_README**: The `README.md` file at Repository_Root that indexes and compares all Starters.
- **Starter_README**: The `README.md` file inside one Starter folder.
- **Environment_Template**: A committed example environment file that lists configuration names with non-secret placeholder values.
- **Provider_Abstraction**: A local interface or adapter that isolates application code from an external provider within one Starter.
- **Production_Build**: The framework-idiomatic optimized build, export, package, or compile operation documented by a Starter.
- **Clean_Environment**: A supported development environment containing only the documented operating-system tools, language runtime, package manager, and external service prerequisites.
- **Web_SaaS**: The family of 15 browser-based product starters numbered 1 through 15 in the Normative_Catalog.
- **API_Backend**: The family of 9 service/API starters numbered 16 through 24 in the Normative_Catalog.
- **Expo_Mobile**: The family of 12 Android-first Expo starters numbered 25 through 36 in the Normative_Catalog.
- **Content_Adsense**: The family of 14 content, directory, search, and advertising starters numbered 37 through 50 in the Normative_Catalog.
- **Beginner_Static**: The family of 2 introductory static-site starters numbered 51 and 52 in the Normative_Catalog.
- **Authentication**: Identity enrollment or sign-in, session or token handling, sign-out, and protected-resource enforcement.
- **Authorization**: Enforcement that an authenticated identity can access only permitted resources and actions.
- **Data_Layer**: The database, schema, migrations, object storage, local storage, content source, or external commerce data source assigned to a Starter.
- **Monetization**: Subscriptions, usage billing, paid listings, marketplace payments, advertising, affiliate tracking, promoted listings, or optional ad removal assigned to a Starter.
- **Webhook_Verification**: Validation of a provider signature or equivalent authenticity proof before processing a webhook event.
- **OpenAPI_Description**: A machine-readable API contract and rendered API reference generated for an API_Backend Starter.
- **Observability**: Structured logs, health reporting, error reporting, and request correlation appropriate to a Starter.
- **Android_First_Config**: Expo application identifiers, Android permissions, icons, adaptive icons, package name, and platform settings required for an Android build.
- **EAS_Profile**: A named Expo Application Services build or submission configuration for development, preview, or production.
- **Secure_Storage**: Platform-protected storage for session tokens or other sensitive device-local values.
- **Deep_Link**: A configured URI or verified-link route that opens a defined screen in an Expo_Mobile Starter.
- **Structured_Data**: Machine-readable schema markup applicable to the content type, such as Article, Recipe, HowTo, JobPosting, Product, LocalBusiness, or RealEstateListing.
- **CLS**: Cumulative Layout Shift, including movement caused by advertising slots after initial rendering.
- **Ad_Component**: A responsive reusable advertising unit that reserves layout space and supports consent-aware loading.
- **SEO_Basics**: Unique page titles, meta descriptions, canonical URLs, robots directives, social metadata, and sitemap generation.
- **License_Attribution_Record**: Documentation identifying the license and required attribution for incorporated code, assets, fonts, icons, datasets, or templates.
- **Validation_Command**: A documented non-watch command that verifies a Starter through tests, linting, type checking, Production_Build, static export, or an equivalent stack-specific check.
- **Development_Environment**: The local or preview configuration used for development data, provider test modes, and non-production callbacks.
- **Production_Environment**: The deployed configuration used for production data, provider live modes, production callbacks, and restricted production secrets.
- **Permission_Flow**: A user-facing sequence that explains, requests, handles denial of, and supports retrying a platform permission.
- **Protected_Device_Capability**: A mobile platform capability that requires runtime user permission, including camera, location, notifications, calendar, health data, media library, or nearby-device access.
- **Final_Catalog_Completion**: The repository milestone at which catalog validation evaluates delivery of all 52 Starters, regardless of the order or phases used to implement the Starters.
- **Catalog_Validation**: The read-only repository check that compares catalog metadata, root-level Starter folders, family assignments, required files, and Root_README entries with the Normative_Catalog.
- **Standalone_Validation**: Installation, test, lint, and Production_Build execution from a copied Starter folder without access to Repository_Root or another Starter folder.
- **One_Shot_Command**: A non-watch, non-interactive command that terminates with a process status after one execution.
- **Commit_Point**: The documented point at which a state-changing operation atomically makes persistent state visible.
- **Placeholder_Value**: A recognizable non-functional configuration value that cannot authenticate to or authorize access to a provider.
- **Family_Readiness_Mapping**: The single association from a Starter to one Starter_Family and the corresponding family-specific acceptance criteria.

## Requirements

### Requirement 1: Complete normative catalog

**User Story:** As a repository evaluator, I want an explicit and complete catalog, so that every approved Starter is delivered without omission or substitution.

#### Acceptance Criteria

1. THE Multi_Stack_Boilerplates_Repository SHALL contain exactly 52 distinct root-level Starter folders matching the 52 Starters listed in the Normative_Catalog.
2. WHEN Catalog_Validation checks a Starter, THE Multi_Stack_Boilerplates_Repository SHALL require the exact folder name, Starter_Family, use case, and Required_Technology_Set specified by the matching Normative_Catalog entry.
3. WHEN Catalog_Validation compares the set of root-level Starter folder names with the set of Normative_Catalog folder names, THE Multi_Stack_Boilerplates_Repository SHALL require exact set equality.
4. WHEN Catalog_Validation counts Starters by Starter_Family, THE Multi_Stack_Boilerplates_Repository SHALL require exactly 15 Web_SaaS, 9 API_Backend, 12 Expo_Mobile, 14 Content_Adsense, and 2 Beginner_Static Starters.
5. IF Catalog_Validation detects a missing folder, extra Starter folder, duplicate Starter identity, duplicate catalog or Root_README entry, renamed folder, substituted Starter, incorrect metadata value, or incorrect Starter_Family assignment, THEN THE Multi_Stack_Boilerplates_Repository SHALL return a failed process status.
6. IF Catalog_Validation fails, THEN THE Multi_Stack_Boilerplates_Repository SHALL identify every detected discrepancy by folder name or catalog entry, metadata field where applicable, expected value, observed value, and discrepancy type.
7. WHEN Catalog_Validation executes, THE Multi_Stack_Boilerplates_Repository SHALL leave repository files and directories unchanged.

#### Normative Catalog

##### Web SaaS (15)

| # | Root folder | Use case | Required technology set |
|---:|---|---|---|
| 1 | `nextjs-supabase-saas` | General multi-tenant SaaS | Next.js, Supabase Auth/Postgres, Stripe, Resend, Tailwind |
| 2 | `nextjs-ai-saas` | AI chat and content generation | Next.js, Clerk, Neon, Prisma, OpenAI-compatible API, Lemon Squeezy |
| 3 | `nextjs-b2b-saas` | Organizations, teams, and role-based access control | Next.js, Auth0, PostgreSQL, Drizzle, Paddle, Postmark |
| 4 | `nextjs-booking-saas` | Appointments and reservations | Next.js, Auth.js, Prisma, PostgreSQL, Stripe, Google Calendar, Resend |
| 5 | `nextjs-lms-saas` | Courses, memberships, and video | Next.js, Clerk, Neon, Mux, Stripe, UploadThing |
| 6 | `nextjs-support-desk` | Support and ticketing | Next.js, Auth.js, PostgreSQL, Prisma, Resend, S3/R2 |
| 7 | `nextjs-automation-saas` | Workflows and scheduled jobs | Next.js, Clerk, Neon, Trigger.dev or Inngest, Stripe |
| 8 | `nextjs-file-saas` | File conversion, storage, and media processing | Next.js, Clerk, Cloudflare R2/S3, background jobs, Stripe |
| 9 | `react-admin-saas` | Customer relationship management, enterprise resource planning, and internal administration | React, Vite, Auth0, TanStack Query, Supabase/Postgres, Stripe, shadcn/ui |
| 10 | `react-collaboration-saas` | Collaborative documents and boards | React, Clerk, Convex, Liveblocks, Stripe |
| 11 | `sveltekit-ai-saas` | Usage-metered AI and data tooling | SvelteKit, Supabase, Stripe Billing Meters, AI provider, Tailwind |
| 12 | `nuxt-community-saas` | Membership community and forum | Nuxt, Better Auth, PostgreSQL, Drizzle, Paddle, Tailwind |
| 13 | `django-analytics-saas` | Analytics and reporting | Django, allauth, PostgreSQL, Celery, Redis, Stripe, Django Admin |
| 14 | `remix-commerce-saas` | Merchant storefront and direct-to-consumer commerce | Remix, Shopify API or PostgreSQL, Clerk/Auth.js, Stripe |
| 15 | `astro-membership-site` | Paid newsletter and premium content | Astro, Clerk, Turso/Postgres, Stripe, Resend |

##### API/Backend (9)

| # | Root folder | Use case | Required technology set |
|---:|---|---|---|
| 16 | `django-api-backend` | General REST backend as a service | Django, Django REST Framework, allauth, PostgreSQL, Stripe, OpenAPI |
| 17 | `fastapi-ai-backend` | AI inference and document processing | FastAPI, OAuth2/JWT, SQLAlchemy, PostgreSQL, Redis, Celery, Stripe |
| 18 | `fastapi-data-platform` | Ingestion, extract-transform-load, and analytics | FastAPI, PostgreSQL, DuckDB, object storage, background workers |
| 19 | `fastify-commerce-api` | Products, carts, orders, and physical goods | Fastify, JWT, Prisma, PostgreSQL, Redis, Stripe Checkout |
| 20 | `fastify-realtime-api` | Notifications, presence, and realtime communication | Fastify, WebSockets, Redis, PostgreSQL, JWT |
| 21 | `nestjs-b2b-api` | Multi-tenant enterprise backend | NestJS, Passport, Prisma, PostgreSQL, Stripe, BullMQ |
| 22 | `go-webhook-service` | High-throughput API and webhook processing | Go, Fiber or Chi, PostgreSQL, Redis, JWT, OpenAPI |
| 23 | `dotnet-enterprise-api` | Enterprise customer relationship management and line-of-business API | ASP.NET Core, Identity, EF Core, PostgreSQL or SQL Server, Stripe |
| 24 | `spring-enterprise-api` | Enterprise subscriptions | Spring Boot, Spring Security, JPA, PostgreSQL, Kafka/Redis, Stripe |

##### Android-First Expo Mobile (12)

| # | Root folder | Use case | Required technology set |
|---:|---|---|---|
| 25 | `expo-subscription-app` | Premium mobile SaaS | Expo, Supabase, RevenueCat, Sentry |
| 26 | `expo-admob-utility` | Calculator, scanner, or converter | Expo, Firebase Analytics, AdMob, SQLite, optional ad removal |
| 27 | `expo-ai-companion` | AI assistant or tutor | Expo, Supabase, secure backend AI API, RevenueCat |
| 28 | `expo-social-community` | Feed, profiles, comments, and chat | Expo, Clerk, Convex, Stream Chat, push notifications |
| 29 | `expo-marketplace-app` | Local services and physical goods | Expo, Supabase, Algolia, Stripe Connect, Maps |
| 30 | `expo-booking-app` | Appointments and rentals | Expo, Clerk or Supabase, Calendar, Maps, notifications, Stripe |
| 31 | `expo-habit-fitness-app` | Habits, workouts, and wellness | Expo, Firebase, Android Health Connect, RevenueCat, notifications |
| 32 | `expo-content-reader` | News, articles, recipes, and education | Expo, headless content management system, offline cache, AdMob, Firebase Messaging |
| 33 | `expo-local-first-app` | Notes, inventory, and field work | Expo, SQLite, offline queue and synchronization, Supabase, background sync |
| 34 | `expo-delivery-tracker` | Delivery, fleet, and field service | Expo, Maps, background location, Firebase, push notifications |
| 35 | `expo-event-app` | Tickets and attendee networking | Expo, Supabase, QR scanning, notifications, Stripe for eligible physical events |
| 36 | `expo-ecommerce-app` | Physical-goods storefront | Expo, Shopify Storefront API, search, push notifications, native checkout |

##### Content/AdSense (14)

| # | Root folder | Use case | Required technology set |
|---:|---|---|---|
| 37 | `astro-adsense-blog` | Niche blog | Astro, MDX/content collections, AdSense, analytics, RSS |
| 38 | `astro-affiliate-site` | Reviews and comparisons | Astro, MDX, schema, affiliate links, AdSense |
| 39 | `nextjs-directory-site` | Business, tools, and places directory | Next.js, Supabase/Postgres, Meilisearch/Algolia, AdSense |
| 40 | `nextjs-programmatic-seo` | Data-generated landing pages | Next.js, PostgreSQL, Prisma/Drizzle, scheduled imports, AdSense |
| 41 | `nextjs-tools-site` | Calculators, generators, and free tools | Next.js, static generation, AdSense, analytics, optional API |
| 42 | `nextjs-job-board` | Jobs and recruitment directory | Next.js, Clerk/Auth.js, PostgreSQL, Stripe paid listings, AdSense |
| 43 | `nuxt-magazine-site` | News and multi-author magazine | Nuxt Content or Sanity, AdSense, image optimization, newsletter |
| 44 | `nuxt-local-directory` | Local business and city directory | Nuxt, Supabase, Maps, search, AdSense, sponsored listings |
| 45 | `eleventy-static-site` | Minimal niche or documentation site | Eleventy, Markdown, AdSense, RSS, sitemap |
| 46 | `hugo-content-site` | Large static blog or documentation site | Hugo, Markdown, AdSense, search, affiliate links |
| 47 | `astro-recipe-site` | Recipes and tutorials | Astro content collections, Recipe/HowTo schema, AdSense |
| 48 | `astro-comparison-site` | Comparison tables and best-of content | Astro, structured data, affiliate links, AdSense |
| 49 | `nextjs-coupon-site` | Deals and coupons | Next.js, PostgreSQL, scheduled feeds, search, AdSense, affiliate tracking |
| 50 | `nextjs-real-estate-directory` | Property and rental listings | Next.js, PostgreSQL, Maps, image storage, AdSense, promoted listings |

##### Beginner Static Sites (2)

| # | Root folder | Use case | Required technology set |
|---:|---|---|---|
| 51 | `astro-beginner-static-site` | Very simple beginner marketing, personal, or static site | Astro, plain CSS or minimal Tailwind, reusable layouts/components, static pages, contact-link or form placeholder, SEO basics, sitemap; no required authentication, database, or payment provider |
| 52 | `nextjs-beginner-static-site` | Very simple beginner static marketing or portfolio site | Next.js static export, TypeScript, Tailwind or CSS Modules, reusable components, static pages, contact-link or form placeholder, SEO basics, sitemap; no required authentication, database, or payment provider |

### Requirement 2: Standalone organization and meaningful differentiation

**User Story:** As a developer selecting one Starter, I want each folder to operate independently and represent a distinct product foundation, so that I can copy or maintain one Starter without hidden repository dependencies.

#### Acceptance Criteria

1. THE Multi_Stack_Boilerplates_Repository SHALL place each Starter in the matching kebab-case folder directly under Repository_Root.
2. THE Starter SHALL contain project-local source, configuration, dependency manifests, lockfiles, documentation, and automated checks required by the documented workflows.
3. WHEN a Starter folder is copied to a filesystem location without Repository_Root, THE Starter SHALL complete the documented dependency installation from the copied folder.
4. WHEN Standalone_Validation runs from a copied Starter folder without Repository_Root, THE Starter SHALL complete documented tests, linting, and Production_Build commands from the copied folder.
5. WHEN Standalone_Validation runs, THE Starter SHALL resolve configuration, scripts, fixtures, schemas, migrations, assets, and documentation from files within the copied Starter folder.
6. IF a Starter imports runtime source from another Starter folder or Repository_Root, THEN THE Multi_Stack_Boilerplates_Repository SHALL report Standalone_Validation as failed.
7. IF a Starter declares a file, workspace, link, or package dependency on another Starter folder or repository-level application package, THEN THE Multi_Stack_Boilerplates_Repository SHALL report Standalone_Validation as failed.
8. IF two Starters require equivalent configuration or source logic, THEN THE Multi_Stack_Boilerplates_Repository SHALL keep an independent copy within each affected Starter folder.
9. WHERE a Starter provides a replaceable or test-substituted Applicable_Integration, THE Starter SHALL place the Provider_Abstraction within the Starter folder.
10. THE Multi_Stack_Boilerplates_Repository SHALL permit repeated primary frameworks when the Normative_Catalog assigns different use cases or provider combinations.
11. THE Multi_Stack_Boilerplates_Repository SHALL exclude generated dependency directories, caches, logs, and Production_Build artifacts from committed Starter contents.
12. THE Multi_Stack_Boilerplates_Repository SHALL exclude credentials, functional secrets, private keys, and local environment files from committed Starter contents.

### Requirement 3: Web SaaS family readiness

**User Story:** As a web product developer, I want each Web_SaaS Starter to include the product capabilities assigned to its use case, so that the Starter supports a deployable SaaS workflow rather than a generic framework demo.

#### Acceptance Criteria

1. WHILE a Starter belongs to Web_SaaS, THE Starter SHALL implement Authentication using the identity provider in the Starter's Required_Technology_Set.
2. WHILE a Starter belongs to Web_SaaS, THE Starter SHALL enforce Authorization for protected resources and state-changing actions.
3. WHEN an unauthenticated request targets a protected Web_SaaS resource or action, THE Starter SHALL deny the request with the documented unauthenticated outcome.
4. WHEN an authenticated identity lacks permission for a protected Web_SaaS resource or action, THE Starter SHALL deny the request with the documented unauthorized outcome.
5. WHILE a Starter belongs to Web_SaaS, THE Starter SHALL provide migrations or an equivalent repeatable mechanism that initializes the complete required Data_Layer schema from an empty supported data store.
6. WHILE a Starter belongs to Web_SaaS, THE Starter SHALL provide at least one executable state-changing action that demonstrates the named use case through the user interface and Data_Layer.
7. WHILE a Starter belongs to Web_SaaS, THE Starter SHALL implement the category-appropriate Monetization flow assigned by the Required_Technology_Set.
8. WHEN a Web_SaaS Monetization flow changes checkout, subscription, usage, merchant, or entitlement state, THE Starter SHALL persist and display the resulting state applicable to the named use case.
9. WHERE an email provider appears in a Web_SaaS Starter's Required_Technology_Set, THE Starter SHALL include one transactional email flow and local preview or test instructions for the assigned provider.
10. WHILE a Starter belongs to Web_SaaS, THE Starter SHALL include a public product entry page and an authenticated dashboard that demonstrates the named use case.
11. WHERE a Web_SaaS Starter receives provider webhooks, THE Starter SHALL complete Webhook_Verification before applying event-driven state changes.
12. WHERE a Web_SaaS Starter receives provider webhooks, THE Starter SHALL include an automated test that accepts a valid authenticity proof and applies the expected state transition.
13. WHERE a Web_SaaS Starter receives provider webhooks, THE Starter SHALL include an automated test that rejects an invalid authenticity proof and preserves pre-request persistent state.
14. WHERE a Web_SaaS Starter uses scheduled or background processing, THE Starter SHALL include one executable representative task with documented local execution instructions.
15. WHERE a Web_SaaS Starter uses scheduled or background processing, THE Starter SHALL use a documented configurable retry limit and record a terminal failure after the retry limit is exhausted.
16. WHILE a Starter belongs to Web_SaaS, THE Starter SHALL include an Environment_Template covering configured Authentication, Data_Layer, Monetization, email, webhook, and background-processing values used by the Starter.
17. WHILE a Starter belongs to Web_SaaS, THE Starter SHALL include automated tests for unauthenticated denial, unauthorized denial, and one core use-case action.
18. WHILE a Starter belongs to Web_SaaS, THE Starter SHALL provide a lint One_Shot_Command.
19. WHILE a Starter belongs to Web_SaaS, THE Starter_README SHALL document Authentication, Authorization, schema initialization, Monetization, Applicable_Integration setup, background processing where present, tests, linting, and deployment configuration.
20. WHERE `sveltekit-ai-saas` reports metered usage, THE Starter SHALL use the current Stripe Billing Meters API rather than a retired usage-record interface.
21. WHERE a Web_SaaS Starter implements subscriptions or memberships, THE Starter SHALL persist and display subscription status, entitlement status, renewal or expiration state, and cancellation outcome.
22. WHERE a Web_SaaS Starter implements usage-metered Monetization, THE Starter SHALL associate billable usage with an authenticated customer, prevent duplicate usage application, and display the recorded usage state.
23. WHERE a Web_SaaS Starter implements paid bookings or reservations, THE Starter SHALL associate payment state with the corresponding booking and preserve a consistent booking outcome when payment confirmation or cancellation fails.
24. WHERE a Web_SaaS Starter implements merchant storefront or direct-to-consumer commerce, THE Starter SHALL associate checkout state with an order and display the resulting payment and order status.

### Requirement 4: API and backend family readiness

**User Story:** As a backend developer, I want each API_Backend Starter to expose a secured, observable, documented service, so that I can integrate clients and operate the service from the supplied foundation.

#### Acceptance Criteria

1. WHERE Authentication appears in an API_Backend Starter's Required_Technology_Set, THE Starter SHALL implement Authentication using the assigned mechanism.
2. WHERE Authentication appears in an API_Backend Starter's Required_Technology_Set, THE Starter SHALL enforce Authorization for protected endpoints and resources.
3. WHILE a Starter belongs to API_Backend, THE Starter SHALL implement a persistent Data_Layer and a repeatable schema initialization or migration process using the assigned data technology.
4. WHILE a Starter belongs to API_Backend, THE Starter SHALL publish an OpenAPI_Description for every public HTTP endpoint.
5. WHEN the OpenAPI_Description documents a public HTTP endpoint, THE Starter SHALL specify applicable path, query, header, and body inputs; Authentication requirements; success outcomes; and error outcomes.
6. WHEN an API_Backend Starter receives request data, THE Starter SHALL validate applicable path, query, header, and body values before domain processing or persistent state changes.
7. IF API_Backend request validation fails, THEN THE Starter SHALL return the documented status and stable machine-readable error shape without changing persistent state.
8. IF API_Backend domain processing fails before the Commit_Point, THEN THE Starter SHALL return a documented sanitized error outcome and preserve pre-request persistent state.
9. IF an API_Backend error response is returned, THEN THE Starter SHALL exclude secret values, provider credentials, internal stack traces, and implementation-only details from the response.
10. WHILE a Starter belongs to API_Backend, THE Starter SHALL enforce rate limits whose thresholds and windows are configurable through documented configuration.
11. WHEN an API_Backend rate limit is exceeded, THE Starter SHALL return the documented limit-exceeded status and machine-readable error shape.
12. WHERE an API_Backend Starter includes background processing, THE Starter SHALL demonstrate job submission, processing, retry, and terminal failure behavior.
13. WHERE an API_Backend Starter includes background processing, THE Starter SHALL use a documented configurable retry limit and record terminal failure after the retry limit is exhausted.
14. WHILE a Starter belongs to API_Backend, THE Starter SHALL emit structured request logs containing a request correlation identifier.
15. WHILE a Starter belongs to API_Backend, THE Starter SHALL expose a health endpoint and a documented error-reporting integration point.
16. WHEN an API_Backend request fails, THE Starter SHALL include the request correlation identifier in the structured error log and documented error response location.
17. WHILE a Starter belongs to API_Backend, THE Starter SHALL include a container definition and documented container startup command.
18. WHILE a Starter belongs to API_Backend, THE Starter SHALL include a documented non-container startup command using the supported local runtime.
19. WHILE a Starter belongs to API_Backend, THE Starter SHALL include automated tests for request validation, stable errors, state preservation, configurable rate limiting, Data_Layer operations, health reporting, and one representative domain endpoint.
20. WHERE Authentication appears in an API_Backend Starter's Required_Technology_Set, THE Starter SHALL include automated tests for accepted Authentication, unauthenticated denial, and unauthorized denial.
21. WHERE background processing appears in an API_Backend Starter, THE Starter SHALL include an automated test for successful processing and exhausted-retry terminal failure.
22. WHERE the Normative_Catalog assigns Monetization to an API_Backend Starter, THE Starter SHALL implement and test the assigned Monetization provider and flow.
23. WHERE the Normative_Catalog assigns no Monetization to an API_Backend Starter, THE Starter SHALL remain valid without a Monetization integration.
24. WHERE an API_Backend Starter processes webhooks or payment events, THE Starter SHALL include automated tests that accept a valid authenticity proof and reject an invalid authenticity proof without changing persistent state.
25. WHILE a Starter belongs to API_Backend, THE Starter_README SHALL document endpoint discovery, applicable Authentication and Authorization, schema initialization, background processing where present, Observability, container and non-container startup, tests, and deployment configuration.
26. WHEN an API_Backend Starter restarts after a successful persistent state change, THE Starter SHALL retain the committed state and return the retained state through the documented interface.
27. WHILE a Starter belongs to API_Backend, THE Starter_README SHALL document the default rate-limit thresholds and windows, the configuration names used to change the defaults, and the observable limit-exceeded outcome.
28. WHILE a Starter belongs to API_Backend, THE Starter SHALL include an automated test that verifies committed Data_Layer state remains available after the documented process-restart procedure.

### Requirement 5: Android-first Expo family readiness

**User Story:** As an Android mobile developer, I want each Expo_Mobile Starter to include Android build and runtime foundations, so that I can test, package, and extend the named mobile use case.

#### Acceptance Criteria

1. WHILE a Starter belongs to Expo_Mobile, THE Starter SHALL use Expo Router for file-based navigation and route organization.
2. WHILE a Starter belongs to Expo_Mobile, THE Starter SHALL provide Android_First_Config with a Placeholder_Value package identifier that the Starter_README instructs the developer to replace.
3. WHEN Catalog_Validation compares Android package identifiers across Expo_Mobile Starters, THE Multi_Stack_Boilerplates_Repository SHALL require a distinct package identifier for each of the 12 Expo_Mobile Starters.
4. WHILE a Starter belongs to Expo_Mobile, THE Starter SHALL define development, preview, and production EAS_Profiles.
5. WHERE an Expo_Mobile Starter stores session tokens or sensitive device-local values, THE Starter SHALL use Secure_Storage for those values.
6. WHILE a Starter belongs to Expo_Mobile, THE Starter SHALL configure at least one Deep_Link route and document an Android procedure that opens the route.
7. WHEN a Deep_Link starts an Expo_Mobile Starter from a terminated state, THE Starter SHALL open the configured destination after required initialization completes.
8. WHEN a Deep_Link reaches a running or backgrounded Expo_Mobile Starter, THE Starter SHALL open the configured destination without resetting unrelated navigation state.
9. WHILE a Starter belongs to Expo_Mobile, THE Starter SHALL render explicit loading, empty, offline, recoverable error, and retry states for the representative use-case flow.
10. WHERE an Expo_Mobile Starter accepts mutable user actions during network loss, THE Starter SHALL persist pending actions across application restarts until synchronization succeeds or the user cancels the actions.
11. WHEN connectivity returns after an Expo_Mobile Starter queued pending actions, THE Starter SHALL synchronize each pending action without applying the action more than once.
12. WHERE an Expo_Mobile Starter uses a Protected_Device_Capability, THE Starter SHALL implement a Permission_Flow before accessing the capability.
13. WHEN a user denies a Protected_Device_Capability permission, THE Starter SHALL display the unavailable capability state and a documented retry or settings path.
14. WHERE notifications appear in an Expo_Mobile Starter's Required_Technology_Set, THE Starter SHALL implement notification permission handling and device-token registration.
15. WHERE notifications appear in an Expo_Mobile Starter's Required_Technology_Set, THE Starter SHALL route foreground, background, and notification-tap events to the documented application behavior.
16. WHEN a notification contains a supported Deep_Link destination, THE Starter SHALL navigate to the destination after required Authentication and initialization checks complete.
17. WHILE a Starter belongs to Expo_Mobile, THE Starter SHALL implement the Monetization model assigned by the Normative_Catalog without adding an unlisted mandatory payment provider.
18. WHERE an Expo_Mobile Starter sells digital features, digital services, or digital content, THE Starter SHALL route purchases through the assigned mobile purchase provider.
19. WHERE an Expo_Mobile Starter uses Stripe, THE Starter SHALL limit Stripe payment flows to eligible physical goods, physical services, marketplace, booking, rental, or physical-event transactions stated by the named use case.
20. WHILE a Starter belongs to Expo_Mobile, THE Starter SHALL include automated tests for route state, terminated-state and running-state Deep_Link handling, and loading, empty, offline, error, and retry states.
21. WHERE an Expo_Mobile Starter synchronizes pending actions, THE Starter SHALL include an automated test that preserves pending actions across restart and prevents duplicate application after retry.
22. WHERE a Protected_Device_Capability appears in an Expo_Mobile Starter, THE Starter SHALL include automated tests for granted, denied, and retried permission outcomes.
23. WHERE notifications appear in an Expo_Mobile Starter's Required_Technology_Set, THE Starter SHALL include an automated test for notification routing.
24. WHERE Monetization is present in an Expo_Mobile Starter, THE Starter SHALL include an automated test for the assigned Monetization boundary.
25. WHERE an Expo_Mobile capability does not depend on an Android-only platform integration, THE Starter SHALL provide iOS-compatible configuration and runtime behavior for that capability.
26. WHILE a Starter belongs to Expo_Mobile, THE Starter_README SHALL document Android prerequisites, local Android execution, Deep_Link verification, EAS_Profile use, required permissions, package and signing placeholders, and production Android build steps.
27. WHERE an Expo_Mobile Starter provides iOS-compatible behavior, THE Starter_README SHALL identify the supported iOS behavior and each Android-only capability.
28. WHERE an Expo_Mobile Starter queues pending actions, THE Starter SHALL enforce a documented configurable queue-capacity bound and present a recoverable outcome that preserves existing queued actions when the bound is reached.
29. WHERE an Expo_Mobile Starter synchronizes pending actions, THE Starter SHALL assign each logical action a stable synchronization identity and produce no more than one persistent domain effect when delivery or acknowledgement is retried.
30. WHERE an Expo_Mobile Starter queues pending actions, THE Starter_README SHALL document queue persistence, queue-capacity configuration, cancellation, retry, conflict handling, and duplicate-prevention behavior.

### Requirement 6: Content and advertising family readiness

**User Story:** As a content publisher, I want each Content_Adsense Starter to include discoverability, policy, authoring, and performance foundations, so that content and monetization can be launched without rebuilding publishing essentials.

#### Acceptance Criteria

1. WHILE a Starter belongs to Content_Adsense, THE Starter SHALL implement SEO_Basics for indexable pages.
2. WHEN a Content_Adsense Starter generates a page title or meta description, THE Starter SHALL enforce documented configurable minimum and maximum lengths selected by the Starter.
3. WHILE a Starter belongs to Content_Adsense, THE Starter SHALL emit Structured_Data matching the Starter's content subtype.
4. WHEN the Validation_Command inspects generated Structured_Data, THE Starter SHALL reject markup that fails the documented schema vocabulary and required-field validation.
5. WHILE a Starter belongs to Content_Adsense, THE Starter SHALL generate a sitemap containing the canonical URLs permitted for indexing.
6. WHEN a URL is excluded by the robots directives or page-level indexing rules, THE Starter SHALL exclude the URL from the sitemap.
7. WHERE a Content_Adsense Starter publishes chronological articles, news, documentation updates, recipes, jobs, deals, or other feed-compatible entries, THE Starter SHALL generate an RSS feed linked from the rendered site.
8. WHILE a Starter belongs to Content_Adsense, THE Starter SHALL provide a reusable responsive Ad_Component that reserves documented width and height dimensions before advertising content loads.
9. WHEN the Ad_Component renders at the Starter's documented mobile, tablet, or desktop viewport class, THE Ad_Component SHALL reserve the dimensions selected for that viewport class.
10. WHEN advertising content is unavailable, blocked, delayed, or withheld for consent, THE Ad_Component SHALL preserve the reserved layout dimensions.
11. WHEN the representative page runs the documented layout-shift check, THE Starter SHALL report advertising-attributable layout shifts as validation failures.
12. WHILE a Starter belongs to Content_Adsense, THE Starter SHALL store advertising and analytics consent in one shared consent state.
13. WHEN the shared consent state does not permit consent-dependent processing, THE Starter SHALL defer consent-dependent advertising and analytics initialization.
14. WHERE affiliate links, sponsored listings, promoted listings, or paid placements are present, THE Starter SHALL render a visible disclosure adjacent to or clearly associated with the placement.
15. WHERE affiliate links or paid outbound links are present, THE Starter SHALL emit the documented machine-readable relationship attributes for each applicable link.
16. WHILE a Starter belongs to Content_Adsense, THE Starter SHALL centralize analytics initialization and consume the shared consent state.
17. WHILE a Starter belongs to Content_Adsense, THE Starter_README SHALL document the content workflow, title and description bounds, front matter or record fields, image handling, Structured_Data fields, advertising dimensions and placement, consent configuration, analytics, and deployment.
18. WHILE a Starter belongs to Content_Adsense, THE Starter SHALL provide a One_Shot_Command that measures CLS and the documented page-weight or loading-performance budget on representative Production_Build pages.
19. WHEN a representative Content_Adsense page runs the documented performance check, THE Starter SHALL keep CLS at or below 0.10.
20. WHEN a representative Content_Adsense page exceeds the Starter's documented page-weight or loading-performance budget, THE Starter SHALL return a failed process status.
21. WHILE a Starter belongs to Content_Adsense, THE Starter SHALL provide a One_Shot_Command that checks representative Production_Build pages for accessibility violations.
22. WHEN the accessibility check finds a serious or critical violation, THE Starter SHALL return a failed process status.
23. WHERE Authentication or payment appears in a Content_Adsense Starter's Required_Technology_Set, THE Starter SHALL implement only the listed Authentication or payment capability required by the named use case.
24. WHERE Authentication or payment is absent from a Content_Adsense Starter's Required_Technology_Set, THE Starter SHALL remain valid without Authentication or payment.
25. WHEN a Content_Adsense Starter generates two distinct indexable pages, THE Starter SHALL emit distinct page titles, meta descriptions, and canonical URLs for the pages.
26. WHERE a Content_Adsense Starter generates an RSS feed, THE Starter SHALL exclude drafts, future-dated entries, non-indexable entries, and entries without canonical public URLs from the feed.
27. WHERE a Content_Adsense Starter generates an RSS feed, THE Starter SHALL order feed entries by publication time from newest to oldest using a documented deterministic tie-breaker.
28. WHEN the Validation_Command checks a Content_Adsense Starter, THE Starter SHALL verify title and meta-description bounds, metadata uniqueness, Structured_Data validity, sitemap and robots consistency, RSS eligibility and order where applicable, reserved advertising dimensions at documented mobile, tablet, and desktop viewports, CLS, page performance, and accessibility.

### Requirement 7: Beginner static family readiness

**User Story:** As a beginner, I want a small static Starter with clear structure and deployment instructions, so that I can learn the framework without unrelated service configuration.

#### Acceptance Criteria

1. WHILE a Starter belongs to Beginner_Static, THE Starter SHALL require zero external backend services for installation, local execution, validation, and Production_Build.
2. WHILE a Starter belongs to Beginner_Static, THE Starter SHALL omit mandatory Authentication, database, payment, queue, email, and provider account configuration.
3. WHILE a Starter belongs to Beginner_Static, THE Starter SHALL limit runtime dependencies to packages required for the framework, selected styling approach, SEO_Basics, sitemap generation, and static output.
4. WHILE a Starter belongs to Beginner_Static, THE Starter SHALL include between three and four rendered pages covering home, about, and contact or project content.
5. WHEN a Beginner_Static page renders at the documented mobile, tablet, or desktop viewport class, THE Starter SHALL preserve readable content and operable navigation without horizontal page overflow.
6. WHILE a Starter belongs to Beginner_Static, THE Starter SHALL provide semantic page structure, keyboard-operable navigation, visible focus indicators, and labeled interactive controls.
7. WHILE a Starter belongs to Beginner_Static, THE Starter SHALL provide a shared layout, navigation, footer, and at least two reusable content components.
8. WHILE a Starter belongs to Beginner_Static, THE Starter SHALL include beginner-oriented comments explaining the root layout, one reusable component, and static-output configuration.
9. WHERE a Beginner_Static Starter renders a non-functional contact form, THE Starter SHALL identify the form as a demonstration and prevent submission data from being transmitted or persisted.
10. WHERE a Beginner_Static Starter provides a contact link, THE Starter SHALL use a non-secret Placeholder_Value or documented user-replaceable destination.
11. WHILE a Starter belongs to Beginner_Static, THE Starter SHALL implement SEO_Basics and generate a sitemap through the framework's static build or export mode.
12. WHEN a Beginner_Static Starter completes the documented Production_Build, THE Starter SHALL produce deployable static files without runtime environment secrets.
13. WHILE a Starter belongs to Beginner_Static, THE Starter_README SHALL explain folder structure, reusable components, content editing, styling, local validation, and static build or export.
14. WHILE a Starter belongs to Beginner_Static, THE Starter_README SHALL provide complete deployment instructions for at least two named static-hosting targets.
15. WHILE a Starter belongs to Beginner_Static, THE Starter_README SHALL list every direct runtime dependency and map each dependency to the framework, selected styling approach, SEO_Basics, sitemap generation, or static-output capability that requires the dependency.
16. IF a Beginner_Static direct runtime dependency lacks a documented mapping to an allowed capability, THEN THE Starter SHALL return a failed dependency validation status and identify the dependency.
17. WHILE a Starter belongs to Beginner_Static, THE Starter SHALL provide One_Shot_Commands that check representative generated pages at documented mobile, tablet, and desktop viewport classes for horizontal overflow and serious or critical accessibility violations.

### Requirement 8: Security and secret handling

**User Story:** As a developer adopting a Starter, I want secure defaults and explicit secret handling, so that sample code does not introduce avoidable credential or trust-boundary risks.

#### Acceptance Criteria

1. WHERE a Starter uses secret credentials, THE Starter SHALL read secret credentials from server-only runtime configuration or a platform secret store.
2. WHERE a Starter uses secret credentials, THE Environment_Template SHALL represent each secret credential with a Placeholder_Value.
3. THE Starter SHALL configure version-control ignore rules for local environment files, provider credential files, generated credentials, and private keys.
4. THE Starter SHALL keep server-authorized credentials and privileged provider operations outside browser and mobile client bundles.
5. WHERE source executes in both client and server contexts, THE Starter SHALL document and enforce the client-safe and server-only module boundary.
6. WHERE an AI provider requires a privileged credential, THE Starter SHALL route AI provider requests through a server-side boundary that keeps the privileged credential outside the client application.
7. WHEN a Starter receives untrusted input, THE Starter SHALL validate the input before passing the input to Authentication, Authorization, persistence, command execution, file processing, provider, webhook, or rendering boundaries.
8. WHEN an authenticated identity requests a tenant-owned or user-owned resource, THE Starter SHALL enforce Authorization before returning or changing the resource.
9. WHEN a webhook request reaches a Starter, THE Starter SHALL complete Webhook_Verification before applying a persistent state transition.
10. IF Webhook_Verification fails, THEN THE Starter SHALL return a non-success response and preserve pre-request persistent state.
11. WHEN a Starter records logs or error reports, THE Starter SHALL redact passwords, tokens, secret keys, payment details, authorization headers, cookies, and documented sensitive fields.
12. WHERE a Starter accepts file uploads or file-conversion inputs, THE Starter SHALL enforce documented configurable type and size limits before durable storage or processing.
13. WHEN the security Validation_Command inspects committed files, THE Starter SHALL return a failed process status for a detected functional secret, private credential, or private key.
14. WHEN the security Validation_Command reports a detected secret, THE Starter SHALL identify the affected file and rule without printing the detected secret value.
15. WHEN an Applicable_Integration returns an error, THE Starter SHALL return or display the documented sanitized provider-error outcome.
16. IF a state-changing operation fails before the Commit_Point, THEN THE Starter SHALL preserve pre-operation persistent state.
17. WHEN a state-changing operation crosses the Commit_Point, THE Starter SHALL record the resulting state through the documented success outcome.
18. IF a required server-only secret is absent or retains a Placeholder_Value at startup, THEN THE Starter SHALL refuse startup and identify every affected configuration name without printing a secret value.

### Requirement 9: Environment configuration and setup documentation

**User Story:** As a developer cloning one Starter, I want complete local setup and provider configuration instructions, so that I can run the Starter without inferring missing steps.

#### Acceptance Criteria

1. WHERE a Starter reads environment variables, THE Environment_Template SHALL list every environment variable read by committed source, scripts, or configuration files.
2. WHEN an Environment_Template lists an environment variable, THE Starter SHALL reference the variable from committed source, scripts, configuration, or documented deployment configuration.
3. WHERE a Starter includes an Environment_Template, THE Environment_Template SHALL classify each value as client-safe or server-only.
4. WHERE a Starter includes an Environment_Template, THE Environment_Template SHALL classify each value as required or optional and use a Placeholder_Value for secret examples.
5. THE Starter_README SHALL identify supported runtime and package-manager versions using exact versions or documented supported version ranges.
6. THE Starter_README SHALL provide an ordered clean-setup procedure covering dependency installation, configuration, Data_Layer initialization where present, local startup, Validation_Commands, and Production_Build.
7. WHEN the Starter_README documents a clean-setup step, THE Starter_README SHALL state the command or action and the expected observable outcome.
8. WHERE a Starter uses provider or data configuration in Development_Environment and Production_Environment, THE Starter_README SHALL identify separate development and production resources, values, provider modes, and callback URLs.
9. WHERE an Applicable_Integration requires a provider console, callback URL, webhook endpoint, product identifier, mobile entitlement, service account, or application identifier, THE Starter_README SHALL document the provider-console steps and expected configured value.
10. WHERE a Starter includes migrations or seed data, THE Starter_README SHALL document initialization, application, and verification commands.
11. WHERE a Starter includes scheduled imports, queues, workers, or synchronization, THE Starter_README SHALL document startup, execution, retry where applicable, and verification commands.
12. WHERE a Starter offers an explicitly optional integration, THE Starter_README SHALL label the integration as optional and describe the functional fallback when the integration remains unconfigured.
13. THE Starter_README SHALL document deployment prerequisites, required configuration, build command, output or start command, and post-deployment verification for at least one named compatible deployment target.
14. WHEN the documented post-deployment verification runs, THE Starter SHALL expose the expected health, page, API, or application entry outcome identified by the Starter_README.
15. IF one or more required environment values are absent at startup, THEN THE Starter SHALL terminate startup with one configuration error that identifies every missing configuration name.
16. IF one or more required environment values retain a Placeholder_Value at startup, THEN THE Starter SHALL terminate startup with one configuration error that identifies every placeholder configuration name.
17. IF an optional environment value is absent at startup, THEN THE Starter SHALL activate the documented optional-integration fallback behavior.
18. WHERE an Applicable_Integration requires provider-console configuration, THE Starter_README SHALL provide a verification action and expected observable outcome for the configured console resource, callback, webhook, product, entitlement, service account, or application identifier.
19. WHERE a Starter supports both Development_Environment and Production_Environment, THE Starter_README SHALL identify configuration values that differ between the environments and the procedure used to prevent development resources from being selected in Production_Environment.

### Requirement 10: Reproducible installation, build, and validation

**User Story:** As a maintainer, I want each Starter to install and validate reproducibly, so that repository quality can be checked from a clean clone.

#### Acceptance Criteria

1. THE Starter SHALL commit each framework-idiomatic dependency manifest and lockfile required for reproducible dependency resolution.
2. WHEN the documented installation command runs in a Clean_Environment, THE Starter SHALL complete dependency installation without modifying any committed dependency manifest or lockfile.
3. WHEN the documented Production_Build command runs after clean installation and documented setup, THE Starter SHALL execute non-interactively and complete without compile, type, or bundling errors.
4. THE Starter SHALL provide test, lint, and stack-idiomatic static-analysis One_Shot_Commands.
5. WHEN the documented test One_Shot_Command runs in a Clean_Environment, THE Starter SHALL terminate with a process status without opening watch or interactive mode.
6. WHEN the documented lint or static-analysis One_Shot_Command runs in a Clean_Environment, THE Starter SHALL terminate with a process status without opening watch or interactive mode.
7. WHEN all documented Validation_Commands run in a Clean_Environment, THE Starter SHALL return successful process statuses.
8. THE Starter SHALL include an automated smoke test for the primary use-case entry point.
9. WHERE a Starter has Authentication, THE Starter SHALL include automated tests for accepted identity state and rejected unauthenticated access.
10. WHERE a Starter enforces role, tenant, ownership, or resource permissions, THE Starter SHALL include an automated test for rejected unauthorized access.
11. WHERE a Starter has Webhook_Verification, THE Starter SHALL include automated tests for valid and invalid authenticity proofs and resulting persistent state.
12. WHERE a Starter exposes an API, THE Starter SHALL include an automated test that compares documented and implemented request and response behavior for one representative endpoint.
13. WHERE a Starter generates static pages, THE Starter SHALL include an automated route and link check over representative generated output.
14. WHERE a Starter provides background processing, THE Starter SHALL include an automated test for representative success and terminal failure behavior.
15. WHEN Catalog_Validation runs, THE Multi_Stack_Boilerplates_Repository SHALL check all 52 Normative_Catalog entries for exact folder identity, Starter_README presence, Environment_Template presence where configuration is read, dependency manifests, lockfiles, and Family_Readiness_Mapping.
16. WHEN Catalog_Validation completes successfully, THE Multi_Stack_Boilerplates_Repository SHALL report that all 52 Normative_Catalog entries were checked.
17. WHEN dependency validation compares a committed manifest with the matching lockfile, THE Starter SHALL report a failed process status if the lockfile does not represent the manifest's declared dependency set.
18. IF Catalog_Validation detects a folder, documentation, Environment_Template, manifest, lockfile, Family_Readiness_Mapping, or catalog-metadata discrepancy, THEN THE Multi_Stack_Boilerplates_Repository SHALL identify the affected Starter, mismatch category, expected condition, observed condition, and corrective action.
19. WHEN a Starter's documented installation, Production_Build, test, lint, static-analysis, or smoke-test One_Shot_Command runs, THE Starter SHALL complete without interactive prompts and terminate with a process status.

### Requirement 11: Root catalog comparison and filtering

**User Story:** As a developer comparing 52 options, I want a searchable and filterable root catalog, so that I can identify suitable Starters by family, use case, framework, provider, and monetization model.

#### Acceptance Criteria

1. THE Root_README SHALL contain exactly one catalog entry for each of the 52 exact folder names in the Normative_Catalog.
2. WHEN a Root_README catalog entry describes a Starter, THE Root_README SHALL display the Starter_Family, use case, primary framework, Authentication provider or `None`, Data_Layer provider or `None`, Monetization provider or `None`, and notable Applicable_Integrations.
3. WHEN a Root_README catalog entry describes a Starter, THE Root_README SHALL link to the matching Starter folder, Starter_README, and setup instructions.
4. THE Root_README SHALL organize catalog entries into sections containing exactly 15 Web_SaaS, 9 API_Backend, 12 Expo_Mobile, 14 Content_Adsense, and 2 Beginner_Static entries.
5. THE Root_README SHALL render visible text labels for Starter_Family, use case, framework, Authentication provider, Data_Layer provider, Monetization provider, and Applicable_Integrations.
6. WHEN a repository-page text search uses a displayed catalog label, THE Root_README SHALL expose each matching entry through visible searchable text rather than image-only or generated-only metadata.
7. THE Root_README SHALL include a comparison guide mapping each Starter_Family to the applicable family-readiness requirement and identifying optional capabilities.
8. THE Root_README SHALL state that each Starter is standalone and contains project-local setup documentation.
9. THE Root_README SHALL state that framework reuse is intentional when use cases or provider combinations differ.
10. WHEN Catalog_Validation checks Root_README links, THE Multi_Stack_Boilerplates_Repository SHALL resolve all 52 folder links to matching root-level Starter folders.
11. WHEN Catalog_Validation checks Root_README links, THE Multi_Stack_Boilerplates_Repository SHALL resolve all 52 Starter_README links to files within the matching Starter folders.
12. IF a Root_README entry is missing, duplicated, assigned to the wrong family section, or references an unlisted folder, THEN THE Multi_Stack_Boilerplates_Repository SHALL return Catalog_Validation as failed and identify the affected entry.
13. WHEN Catalog_Validation detects a Root_README mismatch, THE Multi_Stack_Boilerplates_Repository SHALL classify the mismatch as entry presence, duplicate identity, family grouping, folder link, Starter_README link, searchable field, field value, or implementation status.
14. WHILE implementation proceeds before Final_Catalog_Completion, THE Root_README SHALL display exactly one `pending`, `in progress`, or `complete` status for every Normative_Catalog entry.

### Requirement 12: License and attribution records

**User Story:** As a repository distributor, I want dependency and asset licensing documented, so that adopters can identify redistribution obligations and retained attribution.

#### Acceptance Criteria

1. THE Multi_Stack_Boilerplates_Repository SHALL include a repository license file that states the licensing terms for original repository code.
2. WHERE incorporated code, assets, fonts, icons, datasets, or templates require attribution or notice retention, THE Starter SHALL include a License_Attribution_Record identifying the material, source, license, and required notice.
3. WHERE incorporated material has no attribution or notice-retention requirement, THE Starter SHALL remain valid without a License_Attribution_Record for that material.
4. WHERE third-party material requires a license text or notice, THE Starter SHALL retain the required text or notice in the location required by the third-party license.
5. WHEN a Starter_README names a provider, product, or framework trademark, THE Starter_README SHALL use factual compatibility language without an endorsement, sponsorship, or affiliation claim.
6. IF incorporated material prohibits redistribution in the Multi_Stack_Boilerplates_Repository, THEN THE Starter SHALL replace the material with redistributable material before Catalog_Validation succeeds.
7. IF a required License_Attribution_Record, license text, or retained notice is missing, THEN THE Multi_Stack_Boilerplates_Repository SHALL return Catalog_Validation as failed and identify the affected Starter and material.

### Requirement 13: Family-scoped capability enforcement

**User Story:** As a repository maintainer, I want readiness checks to follow each Starter's family and use case, so that unrelated infrastructure is not imposed on simpler or differently monetized Starters.

#### Acceptance Criteria

1. WHEN a Starter is validated, THE Multi_Stack_Boilerplates_Repository SHALL apply exactly one Family_Readiness_Mapping derived from the Starter_Family assigned by the Normative_Catalog.
2. IF a Starter has zero or more than one Family_Readiness_Mapping, THEN THE Multi_Stack_Boilerplates_Repository SHALL return Catalog_Validation as failed and identify the Starter.
3. WHERE Authentication, a remote database, payments, email, notifications, jobs, advertising, analytics, or RSS are absent from both the Required_Technology_Set and applicable family-readiness criteria, THE Starter SHALL remain valid without that capability.
4. WHERE an Applicable_Integration is present, THE Starter SHALL implement the Applicable_Integration within the Starter folder.
5. WHERE an Applicable_Integration is present, THE Starter_README SHALL document setup, local validation, production configuration, and fallback behavior where the integration is optional.
6. IF a validation rule requires Authentication, a database, payments, or another capability from every Starter without regard to Family_Readiness_Mapping, THEN THE Multi_Stack_Boilerplates_Repository SHALL return the validation rule as failed.
7. WHEN two Starters share a primary framework, THE Multi_Stack_Boilerplates_Repository SHALL differentiate the Starters through the Normative_Catalog use cases and provider combinations.
8. WHERE the Normative_Catalog assigns distinct provider combinations to Starters that share a framework, THE Multi_Stack_Boilerplates_Repository SHALL preserve the assigned provider combination in each affected Starter.
9. WHILE implementation proceeds before Final_Catalog_Completion, THE Multi_Stack_Boilerplates_Repository SHALL assign each Normative_Catalog entry exactly one status of `pending`, `in progress`, or `complete`.
10. WHEN a Starter status changes, THE Multi_Stack_Boilerplates_Repository SHALL retain the Starter in the tracked set of 52 Normative_Catalog entries.
11. WHEN a Starter is marked `complete`, THE Multi_Stack_Boilerplates_Repository SHALL require the Starter to satisfy every acceptance criterion applicable through Requirements 1 through 13.
12. WHEN Final_Catalog_Completion is evaluated, THE Multi_Stack_Boilerplates_Repository SHALL require all 52 Normative_Catalog entries to have status `complete`.
13. WHEN Final_Catalog_Completion is evaluated, THE Multi_Stack_Boilerplates_Repository SHALL require all 52 Starters to pass Catalog_Validation and every applicable family and cross-cutting criterion in Requirements 1 through 13.
14. WHERE a Required_Technology_Set lists alternatives using `or` or `/`, THE Starter SHALL implement and document exactly one of the listed alternatives unless the Normative_Catalog explicitly requires combined use.
15. IF Final_Catalog_Completion fails, THEN THE Multi_Stack_Boilerplates_Repository SHALL report every affected Starter, applicable requirement and acceptance-criterion number, expected condition, and observed failure.
16. WHEN Final_Catalog_Completion succeeds, THE Multi_Stack_Boilerplates_Repository SHALL report all 52 Normative_Catalog entries as `complete` and report zero unresolved applicable-criterion failures.

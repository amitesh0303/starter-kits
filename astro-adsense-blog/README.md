# Astro AdSense Blog

A niche blog starter built with Astro, featuring Google AdSense monetization with consent-aware ad placement, structured data, RSS feeds, and comprehensive SEO out of the box.

## Technology Stack

- **Framework:** [Astro 5.x](https://astro.build/) (static output)
- **Content:** MDX with typed content collections (Zod schemas)
- **Language:** TypeScript (strict mode)
- **Styling:** Scoped CSS
- **Testing:** Vitest + fast-check (property tests) + Playwright (built-output)
- **Linting:** ESLint with TypeScript and Astro plugins
- **Package Manager:** pnpm

## Folder Structure

```
astro-adsense-blog/
├── src/
│   ├── content/          # Content collections (MDX articles, JSON authors/categories)
│   │   ├── articles/     # MDX blog posts
│   │   ├── authors/      # Author JSON records
│   │   └── categories/   # Category JSON records
│   ├── components/       # Astro components (Ad.astro)
│   ├── layouts/          # Page layouts (BaseLayout.astro)
│   ├── lib/              # Shared utilities (consent-store, config)
│   ├── pages/            # Static routes
│   │   ├── articles/     # Article detail pages ([slug].astro)
│   │   ├── categories/   # Category pages ([slug].astro)
│   │   ├── index.astro   # Home page
│   │   ├── rss.xml.ts    # RSS feed endpoint
│   │   └── robots.txt.ts # Robots.txt endpoint
│   ├── seo/              # SEO utilities (metadata, structured-data, RSS, robots)
│   └── analytics/        # Consent-gated analytics initializer
├── tests/
│   ├── unit/             # Unit and property tests
│   └── output/           # Built-output tests (require pnpm build first)
├── scripts/              # Validation scripts
├── .env.example          # Environment variable template
├── astro.config.mjs      # Astro configuration
├── eslint.config.mjs     # ESLint flat config
├── vitest.config.ts      # Vitest configuration
└── tsconfig.json         # TypeScript configuration
```

## Content Authoring Workflow

### Adding an Article

1. Create a new `.mdx` file in `src/content/articles/`:

```mdx
---
title: "Your Article Title Here (30-60 characters)"
description: "A compelling description of your article content (50-160 characters)."
author: "author-slug"
category: "category-slug"
publishedAt: 2024-06-15
tags: ["tag1", "tag2"]
draft: false
---

Your MDX content here...
```

2. The article will appear on the home page, in the RSS feed, and in the sitemap once `draft: false` and `publishedAt` is not in the future.

### Adding an Author

Create a JSON file in `src/content/authors/`:

```json
{
  "name": "Jane Doe",
  "bio": "Web developer and technical writer.",
  "slug": "jane-doe"
}
```

### Adding a Category

Create a JSON file in `src/content/categories/`:

```json
{
  "name": "Web Development",
  "description": "Articles about modern web development techniques.",
  "slug": "web-development"
}
```

### Front-matter Fields (Articles)

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | Yes | 30-60 characters |
| `description` | string | Yes | 50-160 characters |
| `author` | string | Yes | Must match an author slug |
| `category` | string | Yes | Must match a category slug |
| `publishedAt` | date | Yes | ISO date string |
| `updatedAt` | date | No | ISO date string |
| `draft` | boolean | No | Defaults to `false` |
| `image` | string | No | URL to featured image |
| `tags` | string[] | Yes | Array of tag strings |

## Metadata Bounds

- **Title:** 30-60 characters (enforced by schema and `generatePageMetadata`)
- **Description:** 50-160 characters (enforced by schema and `generatePageMetadata`)
- Titles are truncated with `...` if exceeding 60 characters
- Descriptions are truncated with `...` if exceeding 160 characters
- Titles shorter than 30 characters get the site name appended

## Structured Data (Article JSON-LD)

Every published article page includes a `<script type="application/ld+json">` block with:

- `@context`: `https://schema.org`
- `@type`: `Article`
- `headline`: Article title
- `datePublished`: ISO timestamp
- `dateModified`: Updated date or published date
- `author`: `{ @type: Person, name: "..." }`
- `publisher`: `{ @type: Organization, name: "Astro AdSense Blog" }`
- `mainEntityOfPage`: `{ @type: WebPage, @id: canonicalUrl }`
- `image` (optional): Featured image URL

## Ad Component

The `Ad.astro` component renders a responsive reserved-space container:

| Viewport | Breakpoint | Dimensions |
|----------|-----------|------------|
| Mobile | < 468px | 320 x 100 |
| Tablet | 468px - 727px | 468 x 60 |
| Desktop | >= 728px | 728 x 90 |

**Key behaviors:**
- Space is reserved via CSS `width`/`height` and `min-width`/`min-height` before any scripts load
- This prevents Cumulative Layout Shift (CLS) when ads eventually render
- When ads are blocked, delayed, or unavailable, the reserved space remains unchanged
- The component is consent-aware: only marks containers for ad loading after consent is granted

## Consent Configuration

The shared consent store (`src/lib/consent-store.ts`) manages advertising and analytics consent:

- **Default state:** Both advertising and analytics are disabled
- **Accept:** Enables both advertising and analytics, persists to localStorage
- **Reject:** Keeps both disabled, persists to localStorage
- The consent banner appears on first visit (no prior state in localStorage)
- Ad component reads consent state before marking containers for provider scripts
- Analytics initializer only activates when `consent.analytics === true`

## Analytics Setup

The analytics initializer (`src/analytics/index.ts`):

1. Checks consent state on page load
2. Subscribes to consent state changes
3. Only initializes when `consent.analytics === true`
4. Dispatches a `analytics:initialized` custom event on activation
5. Initialization happens at most once per page load

## Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

| Variable | Purpose | Required |
|----------|---------|----------|
| `PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense publisher ID | No |
| `PUBLIC_ANALYTICS_ID` | Google Analytics measurement ID | No |

Both variables are **client-safe** (prefixed with `PUBLIC_`) and **optional**:

- When `PUBLIC_ADSENSE_CLIENT_ID` is absent or placeholder (`ca-pub-XXXXXXXXXXXXXXXX`), the Ad component renders reserved space without loading AdSense scripts
- When `PUBLIC_ANALYTICS_ID` is absent or placeholder (`G-XXXXXXXXXX`), analytics does not initialize

The config loader (`src/lib/config.ts`) validates these values and provides typed access with graceful fallback.

## Commands

```bash
# Install dependencies (frozen lockfile for reproducible builds)
pnpm install --frozen-lockfile

# Development server
pnpm dev

# Lint (ESLint with TypeScript and Astro plugins)
pnpm lint

# Type checking (Astro check)
pnpm check

# Build static site
pnpm build

# Preview built site locally
pnpm preview

# Run unit and property tests
pnpm test

# Run built-output tests (requires pnpm build first)
pnpm test:output

# Run all tests (unit + output)
pnpm test:all

# Full validation pipeline (lint + check + build + all tests)
pnpm validate

# One-shot site validation (build + output tests)
pnpm validate:site
```

## Deployment

### Cloudflare Pages

1. Connect your repository in the Cloudflare Pages dashboard
2. Set build settings:
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
   - **Node.js version:** 22
3. Add environment variables in the dashboard (optional):
   - `PUBLIC_ADSENSE_CLIENT_ID`
   - `PUBLIC_ANALYTICS_ID`

### Netlify

1. Connect your repository in Netlify
2. Set build settings:
   - **Build command:** `pnpm build`
   - **Publish directory:** `dist`
3. Add a `netlify.toml`:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

4. Add environment variables in the Netlify dashboard (optional):
   - `PUBLIC_ADSENSE_CLIENT_ID`
   - `PUBLIC_ANALYTICS_ID`

### General Static Hosting

The `pnpm build` command produces a fully static site in the `dist/` directory. Deploy it to any static hosting provider (Vercel, GitHub Pages, AWS S3 + CloudFront, etc.) by pointing the build output to `dist/`.

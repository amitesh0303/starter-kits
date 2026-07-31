# Astro Beginner Static Site

A very simple beginner-friendly static site built with [Astro](https://astro.build). It uses plain CSS for styling, reusable layouts and components, and ships zero JavaScript by default. No external services, databases, or API keys are needed.

## Folder Structure

```
astro-beginner-static-site/
├── public/              Static assets served as-is (favicon, images)
│   └── favicon.svg
├── src/
│   ├── components/      Reusable UI components
│   │   ├── Card.astro       Content card for listings
│   │   ├── Footer.astro     Site footer with copyright
│   │   ├── Hero.astro       Hero/banner section
│   │   └── Navigation.astro Site header with nav links
│   ├── layouts/
│   │   └── BaseLayout.astro Root layout (head, nav, footer, slot)
│   ├── pages/           File-based routing (one file = one page)
│   │   ├── index.astro      Home page (/)
│   │   ├── about.astro      About page (/about/)
│   │   ├── contact.astro    Contact page (/contact/)
│   │   └── projects.astro   Projects page (/projects/)
│   ├── styles/
│   │   └── global.css       Global responsive styles
│   └── config.ts        Site-wide configuration constants
├── tests/
│   ├── unit/            Vitest unit/property tests
│   └── output/          Playwright-based built-output tests
├── astro.config.mjs     Astro configuration (static output, sitemap)
├── eslint.config.mjs    ESLint flat config
├── vitest.config.ts     Vitest configuration
├── tsconfig.json        TypeScript config (extends Astro strict)
├── package.json         Project manifest
├── pnpm-lock.yaml       Locked dependency tree
├── starter.json         Starter catalog metadata
├── .env.example         Comment-only (no env vars required)
└── .gitignore
```

## Reusable Components

| Component | Purpose |
|-----------|---------|
| `BaseLayout.astro` | Wraps every page with `<html>`, `<head>`, navigation, footer, and a `<slot />` for page content |
| `Navigation.astro` | Renders the site header with links to all pages; highlights the current page |
| `Footer.astro` | Displays copyright year and site author from config |
| `Hero.astro` | A title/subtitle banner section; accepts `title` and optional `subtitle` props |
| `Card.astro` | A bordered content card; accepts `title`, `description`, and optional `href` props |

## Editing Content

1. **Pages** - Edit or add `.astro` files in `src/pages/`. Each file becomes a route automatically.
2. **Site metadata** - Update `src/config.ts` to change the site name, description, author, and contact email.
3. **Projects** - Edit the `projects` array in `src/pages/projects.astro` to list your own work.
4. **About** - Replace placeholder text in `src/pages/about.astro`.
5. **Contact** - The email link uses `SiteConfig.contactEmail` from `src/config.ts`. Change it to your address.

## Styling

This starter uses **plain CSS** with no frameworks or preprocessors:

- Global styles live in `src/styles/global.css` and are imported by `BaseLayout.astro`.
- Component-scoped styles use `<style>` blocks inside each `.astro` file (Astro scopes them automatically).
- The design is mobile-first and responsive at all viewport widths.
- Focus indicators (`:focus-visible`) ensure keyboard users always see which element is active.

To customise colors, fonts, or spacing, edit `global.css` or the component `<style>` blocks directly.

## Runtime Dependencies

| Dependency | Capability |
|-----------|------------|
| `astro` | Framework / static-output (builds HTML at compile time) |
| `@astrojs/sitemap` | Sitemap / SEO (generates sitemap.xml at build time) |

All other packages (TypeScript, ESLint, Vitest, Playwright, etc.) are **devDependencies** used only during development and testing.

## Local Development

### Prerequisites

- **Node.js** >= 18.17.1 (LTS recommended)
- **pnpm** 10.28.1 (the exact version is enforced via `packageManager` in package.json)

### Commands

```bash
# Install dependencies (uses lockfile for reproducibility)
pnpm install --frozen-lockfile

# Start the dev server with hot reload
pnpm dev

# Lint with ESLint
pnpm lint

# Type-check with astro check
pnpm check

# Build static output to dist/
pnpm build

# Preview the built site locally
pnpm preview

# Run unit tests (dependency allowlist, etc.)
pnpm test

# Run output tests (links, accessibility, overflow, keyboard focus)
pnpm test:output

# Run all tests (unit + output)
pnpm test:all
```

### One-Shot Validation

Run the full validation pipeline in a single command:

```bash
pnpm validate
```

This executes: `lint` -> `check` -> `build` -> `test:all` (unit + output tests including accessibility, viewport overflow, and link checks).

## Deployment

The `pnpm build` command produces a `dist/` folder containing plain HTML, CSS, and assets. Deploy this folder to any static hosting provider.

### Cloudflare Pages

1. Push your code to a GitHub or GitLab repository.
2. Go to the [Cloudflare Pages dashboard](https://dash.cloudflare.com/?to=/:account/pages) and click **Create a project**.
3. Connect your repository.
4. Set the build settings:
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
   - **Root directory:** `astro-beginner-static-site` (if inside a monorepo)
5. Click **Save and Deploy**.

### GitHub Pages

1. Push your code to a GitHub repository.
2. In the repo settings, go to **Pages** > **Source** and select **GitHub Actions**.
3. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. Update `site` in `astro.config.mjs` to your GitHub Pages URL (e.g., `https://username.github.io/repo-name`).
5. Push to `main` and the workflow will build and deploy automatically.

## Supported Runtimes

- **Node.js**: 18.17.1+ (LTS versions 18, 20, and 22 are tested)
- **pnpm**: 10.28.1 (enforced via `packageManager` field)

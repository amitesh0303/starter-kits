# Next.js Beginner Static Site

A very simple beginner-friendly static portfolio site built with [Next.js](https://nextjs.org). It uses CSS Modules for styling, reusable components, and exports to plain HTML/CSS/JS. No external services, databases, or API keys are needed.

## Folder Structure

```
nextjs-beginner-static-site/
├── public/              Static assets served as-is (favicon, images)
│   └── favicon.svg
├── app/
│   ├── layout.tsx       Root layout (html, head, nav, footer)
│   ├── page.tsx         Home page (/)
│   ├── page.module.css  Home page styles
│   ├── globals.css      Global responsive styles
│   ├── sitemap.ts       Dynamic sitemap generation
│   ├── about/
│   │   ├── page.tsx     About page (/about)
│   │   └── page.module.css
│   ├── projects/
│   │   ├── page.tsx     Projects page (/projects)
│   │   └── page.module.css
│   └── contact/
│       ├── page.tsx     Contact page (/contact)
│       └── page.module.css
├── components/
│   ├── Card.tsx             Content card for listings
│   ├── Card.module.css
│   ├── Footer.tsx           Site footer with copyright
│   ├── Footer.module.css
│   ├── Hero.tsx             Hero/banner section
│   ├── Hero.module.css
│   ├── Navigation.tsx       Site header with nav links
│   └── Navigation.module.css
├── config.ts            Site-wide configuration constants
├── tests/
│   ├── unit/            Vitest unit/property tests
│   └── output/          Built-output tests (links, accessibility, overflow)
├── next.config.ts       Next.js config (static export)
├── vitest.config.ts     Vitest configuration
├── tsconfig.json        TypeScript config
├── package.json         Project manifest
├── pnpm-lock.yaml       Locked dependency tree
├── starter.json         Starter catalog metadata
└── .gitignore
```

## Reusable Components

| Component | Purpose |
|-----------|---------|
| `Navigation.tsx` | Renders the site header with links to all pages; highlights the current page |
| `Footer.tsx` | Displays copyright year and site author from config |
| `Hero.tsx` | A title/subtitle banner section; accepts `title` and optional `subtitle` props |
| `Card.tsx` | A bordered content card; accepts `title`, `description`, and optional `href` props |

## Editing Content

1. **Pages** - Edit or add page files in `app/`. Each folder with a `page.tsx` becomes a route.
2. **Site metadata** - Update `config.ts` to change the site name, description, author, and contact email.
3. **Projects** - Edit the `projects` array in `app/projects/page.tsx` to list your own work.
4. **About** - Replace placeholder text in `app/about/page.tsx`.
5. **Contact** - The email link uses `SiteConfig.contactEmail` from `config.ts`. Change it to your address.

## Styling

This starter uses **CSS Modules** with no additional frameworks or preprocessors:

- Global styles live in `app/globals.css` and are imported by `app/layout.tsx`.
- Component-scoped styles use `*.module.css` files imported in each component.
- The design is mobile-first and responsive at all viewport widths.
- Focus indicators (`:focus-visible`) ensure keyboard users always see which element is active.

To customise colors, fonts, or spacing, edit `globals.css` or the component `.module.css` files directly.

## Runtime Dependencies

| Dependency | Capability |
|-----------|------------|
| `next` | Framework / static-output / SEO / sitemap |
| `react` | Rendering (peer of next) |
| `react-dom` | Rendering (peer of next) |

All other packages (TypeScript, ESLint, Vitest, etc.) are **devDependencies** used only during development and testing.

## Local Development

### Prerequisites

- **Node.js** >= 18.17.0 (LTS recommended)
- **pnpm** 10.28.1 (the exact version is enforced via `packageManager` in package.json)

### Commands

```bash
# Install dependencies (uses lockfile for reproducibility)
pnpm install --frozen-lockfile

# Start the dev server with hot reload
pnpm dev

# Lint with ESLint
pnpm lint

# Type-check with TypeScript
pnpm typecheck

# Build static output to out/
pnpm build

# Run unit tests (dependency allowlist, etc.)
pnpm test

# Run output tests (links, accessibility, overflow)
pnpm test:output

# Run all tests (unit + output)
pnpm test:all
```

## Deployment

The `pnpm build` command produces an `out/` folder containing plain HTML, CSS, and JS. Deploy this folder to any static hosting provider.

### Vercel

1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Vercel auto-detects Next.js. No additional config needed.
4. Click **Deploy**.

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
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. Update `siteUrl` in `config.ts` to your GitHub Pages URL.
5. Push to `main` and the workflow will build and deploy automatically.

## Supported Runtimes

- **Node.js**: 18.17.0+ (LTS versions 18, 20, and 22 are tested)
- **pnpm**: 10.28.1 (enforced via `packageManager` field)

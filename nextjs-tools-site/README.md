# Next.js Tools Site

Free online tools site built with Next.js, static typed data, AdSense, and analytics.

## Features

- Static typed tool definitions (no database needed)
- Next.js pages for each tool
- AdSense monetization
- Analytics integration for tool usage tracking
- SEO-optimized pages with keywords

## Getting Started

```bash
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm lint` - Lint source files
- `pnpm typecheck` - TypeScript type checking

## Adding Tools

Add new tools by editing `data/tools.ts`. Each tool needs a unique slug, name, description, category, and keywords.

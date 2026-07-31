# Astro Comparison Site

Product comparison site built with Astro content collections, structured data, affiliate links, and AdSense monetization.

## Features

- Content collections for product comparisons with pros/cons
- schema.org ItemList and Product structured data
- Affiliate link builder with tracking
- Responsive AdSense ad component
- Sitemap generation
- Analytics integration

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

## Content

Add comparisons as MDX files in `src/content/comparisons/` with a products array containing name, rating, price, pros, cons, and affiliate URLs.

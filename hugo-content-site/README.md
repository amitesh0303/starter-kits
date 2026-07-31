# Hugo Content Site

Large static blog or documentation site built with Hugo, Markdown content, AdSense, Pagefind client-side search, and affiliate link support.

## Features

- Hugo static site generator (Go-based)
- Markdown content with frontmatter
- Pagefind for client-side search (indexed at build time)
- AdSense ad placeholder partial
- Affiliate link disclosure component
- RSS feed and sitemap generation
- SEO-friendly configuration

## Prerequisites

- Hugo installed (Go binary)
- Node.js for Pagefind and testing

## Getting Started

```bash
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev` - Start Hugo development server
- `pnpm build` - Build site to `public/`
- `pnpm search:index` - Index site with Pagefind
- `pnpm test` - Run tests

## Content

Add posts as Markdown files in `content/posts/` with YAML frontmatter for title, description, date, tags, and categories.

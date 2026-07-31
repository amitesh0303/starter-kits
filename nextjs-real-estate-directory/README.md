# Next.js Real Estate Directory

Property and rental listings site built with Next.js App Router, PostgreSQL with Drizzle ORM, MapLibre/OpenStreetMap for maps, Cloudflare R2 for image storage, and AdSense.

## Features

- Next.js App Router with server components
- PostgreSQL database with Drizzle ORM
- MapLibre GL JS with OpenStreetMap tiles
- Cloudflare R2 for property image storage
- RealEstateListing schema.org structured data
- AdSense with promoted listings
- Property search with map view

## Getting Started

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm lint` - Lint source files
- `pnpm typecheck` - TypeScript type checking

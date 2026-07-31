# Expo Content Reader

A production-ready Expo starter for building news, articles, and educational content reader apps with Sanity CMS, SQLite offline cache, AdMob, and Firebase Messaging.

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Start development server
pnpm run dev

# Run on Android emulator
npx expo run:android
```

## Testing

```bash
# Run all tests
pnpm test

# Type check
pnpm run typecheck

# Lint
pnpm run lint
```

## Architecture

```
app/                      # Expo Router file-based navigation
  _layout.tsx             # Root layout
  (auth)/                 # Auth group
  (app)/                  # App group (auth-guarded)
src/
  domain/                 # Pure business logic (no framework deps)
    entities.ts           # Core domain types
    policies.ts           # Business rules
  adapters/               # External service wrappers (with fakes)
    config.ts             # Environment validation
  storage/                # Persistence layer
    sqlite-repository.ts  # SQLite cache
  sync/                   # Sync engine
    queue.ts              # Bounded persistent queue
```

## License

MIT

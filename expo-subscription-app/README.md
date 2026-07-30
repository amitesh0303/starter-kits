# Expo Subscription App

A production-ready Expo starter kit for building Android-first subscription-based mobile apps with Supabase Auth, RevenueCat in-app purchases, Sentry error reporting, SQLite offline cache, and a bounded persistent queue.

## Features

- **Supabase Auth** - Sign-in/sign-up with SecureStore token persistence
- **RevenueCat Purchases** - Digital goods only, purchase/restore flows
- **Sentry Error Reporting** - PII-redacted exception capture with error boundary
- **SQLite Cache** - Offline-first with local profile/feature/entitlement cache
- **Bounded Persistent Queue** - Configurable capacity (default 50), idempotent sync
- **Deep Linking** - Cold/warm start handling with auth hydration
- **Expo Router** - File-based navigation with auth/app route groups
- **EAS Build Profiles** - Development, preview, and production configurations

## Android Prerequisites

- Node.js 22.x or later
- pnpm 10.x
- Android SDK (API 34+) for local builds
- Java 17+ for Gradle builds
- EAS CLI (`npm install -g eas-cli`) for cloud builds

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

## Local Execution

The app runs in **fake mode** by default (no real credentials needed):

```bash
# Start with fake adapters (no Supabase/RevenueCat/Sentry required)
pnpm run dev
```

All adapters fall back to built-in fake implementations when credentials are missing:
- Fake Auth: Always succeeds with test user
- Fake Purchase: Simulates subscription flow
- Fake Error Reporter: Logs to console with PII redaction

## Environment Variables

| Variable | Classification | Required | Description |
|----------|---------------|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Client-safe | For real mode | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Client-safe | For real mode | Supabase anon key (RLS-restricted) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | No | Only for Edge Functions, never in client |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` | Client-safe | For real mode | RevenueCat public API key |
| `EXPO_PUBLIC_SENTRY_DSN` | Client-safe | No | Sentry DSN (disabled if missing) |
| `QUEUE_CAPACITY` | Client-safe | No | Queue capacity (default: 50) |

## Deep-Link Verification

The app handles deep links via the `exposubscription://` scheme.

### Testing on Android

```bash
# Open premium screen via deep link
adb shell am start -a android.intent.action.VIEW -d "exposubscription://premium"

# Open purchase screen
adb shell am start -a android.intent.action.VIEW -d "exposubscription://purchase"

# Open settings
adb shell am start -a android.intent.action.VIEW -d "exposubscription://settings"
```

### Deep-Link Behavior

- **Cold start**: App waits for auth hydration before navigating to the deep-link destination
- **Warm start**: Push/replace only the destination branch without resetting unrelated navigation state

## EAS Build Profiles

Defined in `eas.json`:

| Profile | Channel | Distribution | Use Case |
|---------|---------|--------------|----------|
| `development` | - | Internal | Local dev with dev client |
| `preview` | preview | Internal | Team testing |
| `production` | production | Store | Google Play release |

```bash
# Build for development
eas build --profile development --platform android

# Build for preview (internal distribution)
eas build --profile preview --platform android

# Build for production (store submission)
eas build --profile production --platform android
```

## Permissions

The app requests minimal permissions:
- `INTERNET` - Network access for API calls
- No camera, location, contacts, or storage permissions required

## Package and Signing Placeholders

- Android package: `com.example.exposubscriptionapp` (change before publishing)
- iOS bundle ID: `com.example.exposubscriptionapp` (change before publishing)
- Signing: Managed by EAS Build (configure credentials via `eas credentials`)

## Queue Behavior

The bounded persistent queue manages offline operations:

### Capacity
- Default: 50 pending actions (configurable via `QUEUE_CAPACITY`)
- Overflow: New actions are rejected; existing actions are preserved
- Freed capacity: Terminal states (applied/cancelled) free up queue slots

### States
```
pending -> syncing -> applied (terminal)
                   -> conflict -> pending (retry)
                              -> cancelled (terminal)
                   -> failed -> pending (retry)
                            -> cancelled (terminal)
pending -> cancelled (terminal)
```

### Idempotency
- Each action has a stable UUID as its idempotency key
- Same action ID produces at most one domain effect
- Re-enqueue of an applied action is rejected

### Retry and Conflict Resolution
- Failed actions can be retried (transition back to pending)
- Conflicts can be retried or cancelled
- Sync engine processes pending actions when connectivity is available

## Architecture

```
app/                      # Expo Router file-based navigation
  _layout.tsx             # Root layout (Sentry boundary, config hydration)
  index.tsx               # Entry redirect
  deep-link.tsx           # Deep-link destination handler
  (auth)/                 # Auth group (sign-in)
  (app)/                  # App group (auth-guarded)
    index.tsx             # Dashboard with features list
    premium.tsx           # Premium feature screen
    purchase.tsx          # Purchase/restore flow
    settings.tsx          # Profile and sign-out
src/
  domain/                 # Pure business logic
    entities.ts           # Profile, Feature, Entitlement, PendingAction
    eligibility.ts        # Digital-goods routing rules
    policies.ts           # Entitlement-unlock, feature-access
    queue-policy.ts       # Capacity bounds, idempotency, state machine
  adapters/               # External service wrappers
    config.ts             # Aggregate startup validation
    auth-adapter.ts       # Supabase Auth (+ fake)
    purchase-adapter.ts   # RevenueCat (+ fake)
    error-reporter.ts     # Sentry (+ fake) with PII redaction
    sentry-boundary.tsx   # React error boundary
  storage/                # Persistence layer
    secure-store.ts       # SecureStore token wrapper
    sqlite-repository.ts  # SQLite cache and queue tables
    supabase-client.ts    # Supabase client singleton
  sync/                   # Sync engine
    queue.ts              # Bounded persistent queue
    sync-engine.ts        # Connectivity-aware dispatch
```

## Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Enable Email/Password auth in Authentication settings
3. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. The app uses Supabase Auth for authentication and Supabase DB for remote data

## RevenueCat Setup

1. Create a RevenueCat project at https://www.revenuecat.com
2. Connect your Google Play Console app
3. Set `EXPO_PUBLIC_REVENUECAT_API_KEY` to your public API key
4. Configure products/offerings in RevenueCat dashboard
5. **Important**: Digital goods MUST go through RevenueCat on mobile (app store policy)

## Sentry Setup

1. Create a Sentry project at https://sentry.io
2. Set `EXPO_PUBLIC_SENTRY_DSN` to your project DSN
3. The app automatically captures exceptions with PII redacted
4. Sensitive fields (tokens, passwords, emails) are stripped before sending

## Production Build and Deployment

```bash
# 1. Update package name in app.config.ts
# 2. Configure EAS credentials
eas credentials

# 3. Build production APK/AAB
eas build --profile production --platform android

# 4. Submit to Google Play
eas submit --platform android
```

## Testing

```bash
# Run all tests
pnpm run test

# Run specific test suite
pnpm run test -- --testPathPattern=properties

# Run with coverage
pnpm run test -- --coverage

# Type check
pnpm run typecheck

# Lint
pnpm run lint
```

### Test Structure

- `__tests__/domain/` - Domain logic unit tests
- `__tests__/sync/` - Queue operation tests
- `__tests__/adapters/` - Adapter integration tests (with fakes)
- `__tests__/routes/` - Navigation and state tests
- `__tests__/properties/` - Property-based tests (fast-check, 100+ cases each)
- `__tests__/smoke/` - Entry point smoke tests

### Property Tests

- **Property 9** (`queue-capacity.test.ts`): Verifies queue capacity bounds and idempotency invariants across 100+ generated test cases
- **Property 10** (`monetization-eligibility.test.ts`): Verifies digital-goods routing rules (RevenueCat-only for digital) across 100+ generated test cases

## Troubleshooting

### "Module not found" errors
```bash
pnpm install
npx expo start --clear
```

### Deep links not working
1. Verify scheme in `app.config.ts` is `"exposubscription"`
2. Rebuild the app after scheme changes
3. Test with: `adb shell am start -a android.intent.action.VIEW -d "exposubscription://premium"`

### EAS build failures
1. Run `eas build:configure` to regenerate config
2. Check credentials with `eas credentials`
3. Verify `eas.json` profiles match your requirements

### Tests failing
1. Clear Jest cache: `pnpm run test -- --clearCache`
2. Ensure all dependencies installed: `pnpm install`
3. Check Node version: `node --version` (must be 22.x+)

## License

MIT

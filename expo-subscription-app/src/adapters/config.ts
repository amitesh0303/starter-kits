/**
 * Aggregate startup configuration validation.
 *
 * Required env vars must be present and not placeholder values.
 * Optional vars fall back to fake/disabled mode if missing.
 */

export interface AppConfig {
  /** Supabase project URL (client-safe, required for real mode) */
  supabaseUrl: string | null;
  /** Supabase anon key (client-safe, required for real mode) */
  supabaseAnonKey: string | null;
  /** RevenueCat public API key (client-safe, required for real mode) */
  revenueCatApiKey: string | null;
  /** Sentry DSN (client-safe, optional - disabled if missing) */
  sentryDsn: string | null;
  /** Queue capacity (optional, defaults to 50) */
  queueCapacity: number;
  /** Whether we are running in fake/dev mode */
  isFakeMode: boolean;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  config: AppConfig;
}

const PLACEHOLDER_VALUES = [
  "your-project-url",
  "your-anon-key",
  "your-api-key",
  "your-dsn",
  "placeholder",
  "TODO",
  "CHANGE_ME",
];

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return false;
  return PLACEHOLDER_VALUES.some(
    (p) => value.toLowerCase().includes(p.toLowerCase())
  );
}

function getEnvVar(key: string): string | undefined {
  try {
    // In Expo, env vars are accessed through process.env with EXPO_PUBLIC_ prefix
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (process.env as any)[key] as string | undefined;
  } catch {
    return undefined;
  }
}

/**
 * Reads and validates all configuration from environment.
 * In fake mode (no real credentials), all adapters use their fake implementations.
 */
export function validateConfig(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const supabaseUrl = getEnvVar("EXPO_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getEnvVar("EXPO_PUBLIC_SUPABASE_ANON_KEY");
  const revenueCatApiKey = getEnvVar("EXPO_PUBLIC_REVENUECAT_API_KEY");
  const sentryDsn = getEnvVar("EXPO_PUBLIC_SENTRY_DSN");
  const queueCapacityStr = getEnvVar("QUEUE_CAPACITY");

  // Check for placeholder values
  if (supabaseUrl && isPlaceholder(supabaseUrl)) {
    errors.push("EXPO_PUBLIC_SUPABASE_URL contains a placeholder value");
  }
  if (supabaseAnonKey && isPlaceholder(supabaseAnonKey)) {
    errors.push("EXPO_PUBLIC_SUPABASE_ANON_KEY contains a placeholder value");
  }
  if (revenueCatApiKey && isPlaceholder(revenueCatApiKey)) {
    errors.push("EXPO_PUBLIC_REVENUECAT_API_KEY contains a placeholder value");
  }

  // Optional: Sentry DSN
  if (sentryDsn && isPlaceholder(sentryDsn)) {
    warnings.push(
      "EXPO_PUBLIC_SENTRY_DSN contains a placeholder value; Sentry disabled"
    );
  }

  // Determine mode
  const isFakeMode = !supabaseUrl || !supabaseAnonKey || !revenueCatApiKey;

  if (isFakeMode) {
    warnings.push(
      "Running in fake mode: missing one or more required credentials. " +
        "All adapters will use fake implementations."
    );
  }

  // Queue capacity
  let queueCapacity = 50;
  if (queueCapacityStr) {
    const parsed = parseInt(queueCapacityStr, 10);
    if (isNaN(parsed) || parsed < 1) {
      errors.push("QUEUE_CAPACITY must be a positive integer");
    } else {
      queueCapacity = parsed;
    }
  }

  const config: AppConfig = {
    supabaseUrl: supabaseUrl && !isPlaceholder(supabaseUrl) ? supabaseUrl : null,
    supabaseAnonKey:
      supabaseAnonKey && !isPlaceholder(supabaseAnonKey) ? supabaseAnonKey : null,
    revenueCatApiKey:
      revenueCatApiKey && !isPlaceholder(revenueCatApiKey)
        ? revenueCatApiKey
        : null,
    sentryDsn: sentryDsn && !isPlaceholder(sentryDsn) ? sentryDsn : null,
    queueCapacity,
    isFakeMode,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

// Cached config singleton
let cachedConfig: AppConfig | null = null;

/**
 * Gets the current app configuration. Validates on first call.
 */
export function getConfig(): AppConfig {
  if (!cachedConfig) {
    const result = validateConfig();
    // Log warnings but don't block startup
    for (const warning of result.warnings) {
      console.warn(`[Config] ${warning}`);
    }
    // Log errors but continue in fake mode
    for (const error of result.errors) {
      console.error(`[Config] ${error}`);
    }
    cachedConfig = result.config;
  }
  return cachedConfig;
}

/**
 * Resets cached config (for testing).
 */
export function resetConfig(): void {
  cachedConfig = null;
}

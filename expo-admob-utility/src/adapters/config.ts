/**
 * Configuration validation for AdMob utility app.
 */

export interface AppConfig {
  admobAppId: string | null;
  admobBannerId: string | null;
  firebaseApiKey: string | null;
  revenueCatApiKey: string | null;
  isFakeMode: boolean;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  config: AppConfig;
}

function getEnvVar(key: string): string | undefined {
  try {
    return (process.env as Record<string, string | undefined>)[key];
  } catch {
    return undefined;
  }
}

export function validateConfig(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const admobAppId = getEnvVar("EXPO_PUBLIC_ADMOB_APP_ID") || null;
  const admobBannerId = getEnvVar("EXPO_PUBLIC_ADMOB_BANNER_ID") || null;
  const firebaseApiKey = getEnvVar("EXPO_PUBLIC_FIREBASE_API_KEY") || null;
  const revenueCatApiKey = getEnvVar("EXPO_PUBLIC_REVENUECAT_API_KEY") || null;

  const isFakeMode = !admobAppId;

  if (isFakeMode) {
    warnings.push("Running in fake mode: AdMob credentials missing.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    config: { admobAppId, admobBannerId, firebaseApiKey, revenueCatApiKey, isFakeMode },
  };
}

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    const result = validateConfig();
    result.warnings.forEach((w) => console.warn(`[Config] ${w}`));
    result.errors.forEach((e) => console.error(`[Config] ${e}`));
    cachedConfig = result.config;
  }
  return cachedConfig;
}

export function resetConfig(): void {
  cachedConfig = null;
}

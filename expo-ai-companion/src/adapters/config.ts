export interface AppConfig {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  aiApiUrl: string | null;
  aiApiKey: string | null;
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
  try { return (process.env as Record<string, string | undefined>)[key]; } catch { return undefined; }
}

export function validateConfig(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const supabaseUrl = getEnvVar("EXPO_PUBLIC_SUPABASE_URL") || null;
  const supabaseAnonKey = getEnvVar("EXPO_PUBLIC_SUPABASE_ANON_KEY") || null;
  const aiApiUrl = getEnvVar("EXPO_PUBLIC_AI_API_URL") || null;
  const aiApiKey = getEnvVar("EXPO_PUBLIC_AI_API_KEY") || null;
  const revenueCatApiKey = getEnvVar("EXPO_PUBLIC_REVENUECAT_API_KEY") || null;
  const isFakeMode = !supabaseUrl || !aiApiUrl;
  if (isFakeMode) warnings.push("Running in fake mode.");
  return { valid: errors.length === 0, errors, warnings, config: { supabaseUrl, supabaseAnonKey, aiApiUrl, aiApiKey, revenueCatApiKey, isFakeMode } };
}

let cachedConfig: AppConfig | null = null;
export function getConfig(): AppConfig {
  if (!cachedConfig) { const r = validateConfig(); r.warnings.forEach(w => console.warn('[Config] ' + w)); cachedConfig = r.config; }
  return cachedConfig;
}
export function resetConfig(): void { cachedConfig = null; }

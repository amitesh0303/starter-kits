export interface AppConfig { sanityProjectId: string | null; sanityDataset: string | null; admobAppId: string | null; admobBannerId: string | null; isFakeMode: boolean; }
export interface ConfigValidationResult { valid: boolean; errors: string[]; warnings: string[]; config: AppConfig; }
function getEnvVar(k: string): string | undefined { try { return (process.env as Record<string,string|undefined>)[k]; } catch { return undefined; } }
export function validateConfig(): ConfigValidationResult {
  const w: string[] = [];
  const sanityProjectId = getEnvVar("EXPO_PUBLIC_SANITY_PROJECT_ID") || null;
  const sanityDataset = getEnvVar("EXPO_PUBLIC_SANITY_DATASET") || null;
  const admobAppId = getEnvVar("EXPO_PUBLIC_ADMOB_APP_ID") || null;
  const admobBannerId = getEnvVar("EXPO_PUBLIC_ADMOB_BANNER_ID") || null;
  const isFakeMode = !sanityProjectId;
  if (isFakeMode) w.push("Running in fake mode.");
  return { valid: true, errors: [], warnings: w, config: { sanityProjectId, sanityDataset, admobAppId, admobBannerId, isFakeMode } };
}
let cached: AppConfig | null = null;
export function getConfig(): AppConfig { if (!cached) { const r = validateConfig(); r.warnings.forEach(w => console.warn('[Config] '+w)); cached = r.config; } return cached; }
export function resetConfig(): void { cached = null; }

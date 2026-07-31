export interface AppConfig { shopifyDomain: string | null; shopifyToken: string | null; isFakeMode: boolean; }
export interface ConfigValidationResult { valid: boolean; errors: string[]; warnings: string[]; config: AppConfig; }
function getEnvVar(k: string): string | undefined { try { return (process.env as Record<string,string|undefined>)[k]; } catch { return undefined; } }
export function validateConfig(): ConfigValidationResult {
  const w: string[] = [];
  const shopifyDomain = getEnvVar("EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN") || null;
  const shopifyToken = getEnvVar("EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN") || null;
  const isFakeMode = !shopifyDomain || !shopifyToken;
  if (isFakeMode) w.push("Running in fake mode.");
  return { valid: true, errors: [], warnings: w, config: { shopifyDomain, shopifyToken, isFakeMode } };
}
let cached: AppConfig | null = null;
export function getConfig(): AppConfig { if (!cached) { const r = validateConfig(); r.warnings.forEach(w => console.warn('[Config] '+w)); cached = r.config; } return cached; }
export function resetConfig(): void { cached = null; }

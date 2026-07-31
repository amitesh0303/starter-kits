export interface AppConfig { supabaseUrl: string | null; supabaseAnonKey: string | null; stripeKey: string | null; googleMapsKey: string | null; isFakeMode: boolean; }
export interface ConfigValidationResult { valid: boolean; errors: string[]; warnings: string[]; config: AppConfig; }
function getEnvVar(k: string): string | undefined { try { return (process.env as Record<string,string|undefined>)[k]; } catch { return undefined; } }
export function validateConfig(): ConfigValidationResult {
  const w: string[] = [];
  const supabaseUrl = getEnvVar("EXPO_PUBLIC_SUPABASE_URL") || null;
  const supabaseAnonKey = getEnvVar("EXPO_PUBLIC_SUPABASE_ANON_KEY") || null;
  const stripeKey = getEnvVar("EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY") || null;
  const googleMapsKey = getEnvVar("EXPO_PUBLIC_GOOGLE_MAPS_KEY") || null;
  const isFakeMode = !supabaseUrl;
  if (isFakeMode) w.push("Running in fake mode.");
  return { valid: true, errors: [], warnings: w, config: { supabaseUrl, supabaseAnonKey, stripeKey, googleMapsKey, isFakeMode } };
}
let cached: AppConfig | null = null;
export function getConfig(): AppConfig { if (!cached) { const r = validateConfig(); r.warnings.forEach(w => console.warn('[Config] '+w)); cached = r.config; } return cached; }
export function resetConfig(): void { cached = null; }

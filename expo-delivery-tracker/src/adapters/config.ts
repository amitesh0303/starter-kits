export interface AppConfig { firebaseApiKey: string | null; firebaseProjectId: string | null; googleMapsKey: string | null; isFakeMode: boolean; }
export interface ConfigValidationResult { valid: boolean; errors: string[]; warnings: string[]; config: AppConfig; }
function getEnvVar(k: string): string | undefined { try { return (process.env as Record<string,string|undefined>)[k]; } catch { return undefined; } }
export function validateConfig(): ConfigValidationResult {
  const w: string[] = [];
  const firebaseApiKey = getEnvVar("EXPO_PUBLIC_FIREBASE_API_KEY") || null;
  const firebaseProjectId = getEnvVar("EXPO_PUBLIC_FIREBASE_PROJECT_ID") || null;
  const googleMapsKey = getEnvVar("EXPO_PUBLIC_GOOGLE_MAPS_KEY") || null;
  const isFakeMode = !firebaseApiKey;
  if (isFakeMode) w.push("Running in fake mode.");
  return { valid: true, errors: [], warnings: w, config: { firebaseApiKey, firebaseProjectId, googleMapsKey, isFakeMode } };
}
let cached: AppConfig | null = null;
export function getConfig(): AppConfig { if (!cached) { const r = validateConfig(); r.warnings.forEach(w => console.warn('[Config] '+w)); cached = r.config; } return cached; }
export function resetConfig(): void { cached = null; }

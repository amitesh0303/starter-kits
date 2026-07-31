export interface AppConfig { clerkKey: string | null; convexUrl: string | null; streamApiKey: string | null; isFakeMode: boolean; }
export interface ConfigValidationResult { valid: boolean; errors: string[]; warnings: string[]; config: AppConfig; }
function getEnvVar(k: string): string | undefined { try { return (process.env as Record<string,string|undefined>)[k]; } catch { return undefined; } }
export function validateConfig(): ConfigValidationResult {
  const warnings: string[] = [];
  const clerkKey = getEnvVar("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY") || null;
  const convexUrl = getEnvVar("EXPO_PUBLIC_CONVEX_URL") || null;
  const streamApiKey = getEnvVar("EXPO_PUBLIC_STREAM_API_KEY") || null;
  const isFakeMode = !clerkKey || !convexUrl;
  if (isFakeMode) warnings.push("Running in fake mode.");
  return { valid: true, errors: [], warnings, config: { clerkKey, convexUrl, streamApiKey, isFakeMode } };
}
let cached: AppConfig | null = null;
export function getConfig(): AppConfig { if (!cached) { const r = validateConfig(); r.warnings.forEach(w => console.warn('[Config] '+w)); cached = r.config; } return cached; }
export function resetConfig(): void { cached = null; }

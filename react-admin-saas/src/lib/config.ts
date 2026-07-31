/**
 * Typed configuration boundary.
 */

export interface ConfigSpec {
  auth0Domain: string;
  auth0ClientId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey: string;
}

interface ConfigVarDeclaration { envKey: string; configKey: keyof ConfigSpec; required: boolean; }

const CONFIG_DECLARATIONS: ConfigVarDeclaration[] = [
  { envKey: "VITE_AUTH0_DOMAIN", configKey: "auth0Domain", required: true },
  { envKey: "VITE_AUTH0_CLIENT_ID", configKey: "auth0ClientId", required: true },
  { envKey: "VITE_SUPABASE_URL", configKey: "supabaseUrl", required: true },
  { envKey: "VITE_SUPABASE_ANON_KEY", configKey: "supabaseAnonKey", required: true },
  { envKey: "VITE_STRIPE_PUBLISHABLE_KEY", configKey: "stripePublishableKey", required: true },
];

const PLACEHOLDER_VALUES = ["your-value-here", "CHANGE_ME", "xxx", ""];

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  if (lower.includes("placeholder")) return true;
  return PLACEHOLDER_VALUES.some((p) => value === p || lower === p.toLowerCase());
}

export function isPlaceholderValue(value: string | undefined): boolean {
  return isPlaceholder(value);
}

export function validateConfig(): ConfigSpec {
  const missing: string[] = [];
  const values: Record<string, string> = {};
  for (const decl of CONFIG_DECLARATIONS) {
    const value = process.env[decl.envKey];
    if (decl.required && isPlaceholder(value)) { missing.push(decl.envKey); }
    values[decl.configKey] = value ?? "";
  }
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}. Set these in .env before starting.`);
  }
  return values as unknown as ConfigSpec;
}

export function getRawConfig(): Partial<ConfigSpec> {
  const values: Partial<ConfigSpec> = {};
  for (const decl of CONFIG_DECLARATIONS) {
    const value = process.env[decl.envKey];
    if (value && !isPlaceholder(value)) { (values as Record<string, string>)[decl.configKey] = value; }
  }
  return values;
}

/**
 * Typed configuration boundary.
 */

export interface ConfigSpec {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  aiApiKey: string;
  aiModelId: string;
}

interface ConfigVarDeclaration { envKey: string; configKey: keyof ConfigSpec; required: boolean; }

const CONFIG_DECLARATIONS: ConfigVarDeclaration[] = [
  { envKey: "PUBLIC_SUPABASE_URL", configKey: "supabaseUrl", required: true },
  { envKey: "PUBLIC_SUPABASE_ANON_KEY", configKey: "supabaseAnonKey", required: true },
  { envKey: "SUPABASE_SERVICE_ROLE_KEY", configKey: "supabaseServiceRoleKey", required: true },
  { envKey: "STRIPE_SECRET_KEY", configKey: "stripeSecretKey", required: true },
  { envKey: "STRIPE_WEBHOOK_SECRET", configKey: "stripeWebhookSecret", required: true },
  { envKey: "AI_API_KEY", configKey: "aiApiKey", required: true },
  { envKey: "AI_MODEL_ID", configKey: "aiModelId", required: true },
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

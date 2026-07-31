/**
 * Typed configuration boundary.
 */

export interface ConfigSpec {
  sessionSecret: string;
  shopifyAccessToken: string;
  shopifyStoreDomain: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
}

interface ConfigVarDeclaration { envKey: string; configKey: keyof ConfigSpec; required: boolean; }

const CONFIG_DECLARATIONS: ConfigVarDeclaration[] = [
  { envKey: "SESSION_SECRET", configKey: "sessionSecret", required: true },
  { envKey: "SHOPIFY_ACCESS_TOKEN", configKey: "shopifyAccessToken", required: true },
  { envKey: "SHOPIFY_STORE_DOMAIN", configKey: "shopifyStoreDomain", required: true },
  { envKey: "STRIPE_SECRET_KEY", configKey: "stripeSecretKey", required: true },
  { envKey: "STRIPE_WEBHOOK_SECRET", configKey: "stripeWebhookSecret", required: true },
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

/**
 * Typed configuration boundary.
 * Server-only secrets are validated at startup and never exposed to the client.
 * Aggregate validation collects ALL missing required vars and fails with one error.
 */

export interface ConfigSpec {
  // Public (available client-side)
  supabaseUrl: string;
  supabaseAnonKey: string;
  appUrl: string;

  // Server-only secrets
  supabaseServiceRoleKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripePriceId: string;
  resendApiKey: string;
}

interface ConfigVarDeclaration {
  envKey: string;
  configKey: keyof ConfigSpec;
  required: boolean;
  serverOnly: boolean;
}

const CONFIG_DECLARATIONS: ConfigVarDeclaration[] = [
  {
    envKey: "NEXT_PUBLIC_SUPABASE_URL",
    configKey: "supabaseUrl",
    required: true,
    serverOnly: false,
  },
  {
    envKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    configKey: "supabaseAnonKey",
    required: true,
    serverOnly: false,
  },
  {
    envKey: "NEXT_PUBLIC_APP_URL",
    configKey: "appUrl",
    required: true,
    serverOnly: false,
  },
  {
    envKey: "SUPABASE_SERVICE_ROLE_KEY",
    configKey: "supabaseServiceRoleKey",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "STRIPE_SECRET_KEY",
    configKey: "stripeSecretKey",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "STRIPE_WEBHOOK_SECRET",
    configKey: "stripeWebhookSecret",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "STRIPE_PRICE_ID",
    configKey: "stripePriceId",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "RESEND_API_KEY",
    configKey: "resendApiKey",
    required: true,
    serverOnly: true,
  },
];

const PLACEHOLDER_VALUES = [
  "your-value-here",
  "placeholder",
  "CHANGE_ME",
  "xxx",
  "",
];

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return PLACEHOLDER_VALUES.some(
    (p) => value === p || value.toLowerCase() === p.toLowerCase()
  );
}

export function isPlaceholderValue(value: string | undefined): boolean {
  return isPlaceholder(value);
}

/**
 * Validates and returns the full typed configuration.
 * Collects ALL missing/placeholder required vars and throws a single error.
 */
export function validateConfig(): ConfigSpec {
  const missing: string[] = [];
  const values: Record<string, string> = {};

  for (const decl of CONFIG_DECLARATIONS) {
    const value = process.env[decl.envKey];
    if (decl.required && isPlaceholder(value)) {
      missing.push(decl.envKey);
    }
    values[decl.configKey] = value ?? "";
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        `Set these in .env.local before starting the application.`
    );
  }

  return values as unknown as ConfigSpec;
}

/**
 * Get config without validation (for checking if adapters should use fakes).
 * Returns raw env values without throwing.
 */
export function getRawConfig(): Partial<ConfigSpec> {
  const values: Partial<ConfigSpec> = {};
  for (const decl of CONFIG_DECLARATIONS) {
    const value = process.env[decl.envKey];
    if (value && !isPlaceholder(value)) {
      (values as Record<string, string>)[decl.configKey] = value;
    }
  }
  return values;
}

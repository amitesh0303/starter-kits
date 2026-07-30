/**
 * Typed configuration boundary.
 * Server-only secrets are validated at startup and never exposed to the client.
 * Aggregate validation collects ALL missing required vars and fails with one error.
 */

export interface ConfigSpec {
  // Public (available client-side)
  appUrl: string;

  // Server-only secrets
  auth0Secret: string;
  auth0BaseUrl: string;
  auth0IssuerBaseUrl: string;
  auth0ClientId: string;
  auth0ClientSecret: string;
  databaseUrl: string;
  paddleApiKey: string;
  paddleWebhookSecret: string;
  postmarkApiKey: string;
}

interface ConfigVarDeclaration {
  envKey: string;
  configKey: keyof ConfigSpec;
  required: boolean;
  serverOnly: boolean;
}

const CONFIG_DECLARATIONS: ConfigVarDeclaration[] = [
  {
    envKey: "NEXT_PUBLIC_APP_URL",
    configKey: "appUrl",
    required: true,
    serverOnly: false,
  },
  {
    envKey: "AUTH0_SECRET",
    configKey: "auth0Secret",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "AUTH0_BASE_URL",
    configKey: "auth0BaseUrl",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "AUTH0_ISSUER_BASE_URL",
    configKey: "auth0IssuerBaseUrl",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "AUTH0_CLIENT_ID",
    configKey: "auth0ClientId",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "AUTH0_CLIENT_SECRET",
    configKey: "auth0ClientSecret",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "DATABASE_URL",
    configKey: "databaseUrl",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "PADDLE_API_KEY",
    configKey: "paddleApiKey",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "PADDLE_WEBHOOK_SECRET",
    configKey: "paddleWebhookSecret",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "POSTMARK_API_KEY",
    configKey: "postmarkApiKey",
    required: true,
    serverOnly: true,
  },
];

const PLACEHOLDER_VALUES = [
  "your-value-here",
  "CHANGE_ME",
  "xxx",
  "",
];

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  if (lower.includes("placeholder")) return true;
  return PLACEHOLDER_VALUES.some(
    (p) => value === p || lower === p.toLowerCase()
  );
}

export function isPlaceholderValue(value: string | undefined): boolean {
  return isPlaceholder(value);
}

/**
 * Returns the list of server-only env variable keys.
 */
export function getServerOnlyKeys(): string[] {
  return CONFIG_DECLARATIONS.filter((d) => d.serverOnly).map((d) => d.envKey);
}

/**
 * Returns the list of public (client-safe) env variable keys.
 */
export function getPublicKeys(): string[] {
  return CONFIG_DECLARATIONS.filter((d) => !d.serverOnly).map((d) => d.envKey);
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

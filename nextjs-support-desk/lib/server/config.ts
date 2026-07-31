/**
 * Typed configuration boundary.
 * Server-only secrets are validated at startup and never exposed to the client.
 * Aggregate validation collects ALL missing required vars and fails with one error.
 */

export interface ConfigSpec {
  appUrl: string;
  nextauthSecret: string;
  nextauthUrl: string;
  databaseUrl: string;
  resendApiKey: string;
  r2AccountId: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  r2BucketName: string;
  r2PublicUrl: string;
}

interface ConfigVarDeclaration {
  envKey: string;
  configKey: keyof ConfigSpec;
  required: boolean;
  serverOnly: boolean;
}

export const CONFIG_DECLARATIONS: ConfigVarDeclaration[] = [
  {
    envKey: "NEXT_PUBLIC_APP_URL",
    configKey: "appUrl",
    required: true,
    serverOnly: false,
  },
  {
    envKey: "NEXTAUTH_SECRET",
    configKey: "nextauthSecret",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "NEXTAUTH_URL",
    configKey: "nextauthUrl",
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
    envKey: "RESEND_API_KEY",
    configKey: "resendApiKey",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "R2_ACCOUNT_ID",
    configKey: "r2AccountId",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "R2_ACCESS_KEY_ID",
    configKey: "r2AccessKeyId",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "R2_SECRET_ACCESS_KEY",
    configKey: "r2SecretAccessKey",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "R2_BUCKET_NAME",
    configKey: "r2BucketName",
    required: true,
    serverOnly: true,
  },
  {
    envKey: "R2_PUBLIC_URL",
    configKey: "r2PublicUrl",
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

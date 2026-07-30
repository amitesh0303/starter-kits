/**
 * Error reporter adapter wrapping Sentry with PII redaction and fake default.
 */

export interface ErrorContext {
  userId?: string;
  screen?: string;
  action?: string;
  [key: string]: unknown;
}

export interface ErrorReporter {
  initialize(dsn: string | null): void;
  captureException(error: Error, context?: ErrorContext): void;
  captureMessage(message: string, context?: ErrorContext): void;
}

/**
 * Sensitive keys that should be redacted from error context.
 */
const PII_KEYS = [
  "token",
  "accessToken",
  "refreshToken",
  "password",
  "secret",
  "authorization",
  "email",
  "phone",
  "address",
  "creditCard",
  "ssn",
];

/**
 * Redacts PII from error context before sending to Sentry.
 * Preserves userId as the only user identifier.
 */
export function redactPII(context: ErrorContext): ErrorContext {
  const redacted: ErrorContext = {};

  for (const [key, value] of Object.entries(context)) {
    if (key === "userId") {
      redacted[key] = value as string | undefined;
      continue;
    }

    const isPI = PII_KEYS.some(
      (piiKey) => key.toLowerCase().includes(piiKey.toLowerCase())
    );

    if (isPI) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "string" && value.length > 200) {
      redacted[key] = "[TRUNCATED]";
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Creates a fake error reporter that logs to console.
 */
export function createFakeErrorReporter(): ErrorReporter {
  return {
    initialize(_dsn: string | null): void {
      // No-op for fake
    },

    captureException(error: Error, context?: ErrorContext): void {
      const safeContext = context ? redactPII(context) : {};
      console.warn("[FakeErrorReporter] Exception:", error.message, safeContext);
    },

    captureMessage(message: string, context?: ErrorContext): void {
      const safeContext = context ? redactPII(context) : {};
      console.warn("[FakeErrorReporter] Message:", message, safeContext);
    },
  };
}

/**
 * Creates a Sentry-backed error reporter with PII redaction.
 */
export function createSentryErrorReporter(): ErrorReporter {
  let initialized = false;

  return {
    initialize(dsn: string | null): void {
      if (!dsn) {
        return;
      }
      try {
        // Dynamic import to avoid build issues when Sentry is not configured
        const Sentry = require("@sentry/react-native");
        Sentry.init({ dsn, tracesSampleRate: 0.2 });
        initialized = true;
      } catch (err) {
        console.warn("[Sentry] Failed to initialize:", err);
      }
    },

    captureException(error: Error, context?: ErrorContext): void {
      const safeContext = context ? redactPII(context) : {};
      if (initialized) {
        try {
          const Sentry = require("@sentry/react-native");
          Sentry.captureException(error, { extra: safeContext });
        } catch {
          console.error("[Sentry] Failed to capture exception:", error.message);
        }
      } else {
        console.warn("[ErrorReporter] Not initialized:", error.message, safeContext);
      }
    },

    captureMessage(message: string, context?: ErrorContext): void {
      const safeContext = context ? redactPII(context) : {};
      if (initialized) {
        try {
          const Sentry = require("@sentry/react-native");
          Sentry.captureMessage(message, { extra: safeContext });
        } catch {
          console.error("[Sentry] Failed to capture message:", message);
        }
      } else {
        console.warn("[ErrorReporter] Not initialized:", message, safeContext);
      }
    },
  };
}

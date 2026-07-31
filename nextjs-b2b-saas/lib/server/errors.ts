/**
 * Sanitized domain errors.
 * No stack traces, no secrets in error messages.
 */

export class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.statusCode = statusCode;
  }

  /**
   * Returns a safe representation suitable for API responses.
   * Never includes stack traces or internal details.
   */
  toSafeResponse(): { error: { code: string; message: string } } {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

export class AuthenticationError extends DomainError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHENTICATED", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends DomainError {
  constructor(message = "Insufficient permissions") {
    super(message, "FORBIDDEN", 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends DomainError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends DomainError {
  constructor(message = "Resource conflict") {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class WebhookVerificationError extends DomainError {
  constructor() {
    super("Webhook signature verification failed", "WEBHOOK_INVALID", 400);
    this.name = "WebhookVerificationError";
  }
}

export class BillingError extends DomainError {
  constructor(message = "Billing operation failed") {
    super(message, "BILLING_ERROR", 500);
    this.name = "BillingError";
  }
}

export class MailError extends DomainError {
  constructor(message = "Mail delivery failed") {
    super(message, "MAIL_ERROR", 500);
    this.name = "MailError";
  }
}

/**
 * Wraps an unknown provider error into a sanitized DomainError.
 * Strips stack traces and any potential secret leakage.
 */
export function sanitizeProviderError(
  error: unknown,
  fallbackMessage: string
): DomainError {
  if (error instanceof DomainError) {
    return error;
  }
  return new DomainError(fallbackMessage, "PROVIDER_ERROR", 500);
}

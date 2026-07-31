/**
 * Sanitized domain errors.
 * No stack traces, no secrets in error messages.
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }

  toSafeResponse(): { error: { code: string; message: string } } {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHENTICATED", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, "FORBIDDEN", 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class BillingError extends AppError {
  constructor(message = "Billing operation failed") {
    super(message, "BILLING_ERROR", 500);
    this.name = "BillingError";
  }
}

export class WebhookVerificationError extends AppError {
  constructor() {
    super("Webhook signature verification failed", "WEBHOOK_INVALID", 400);
    this.name = "WebhookVerificationError";
  }
}

export class FileSizeError extends AppError {
  constructor(maxSize: number) {
    super(
      `File exceeds maximum allowed size of ${maxSize} bytes`,
      "FILE_TOO_LARGE",
      413
    );
    this.name = "FileSizeError";
  }
}

export class FileTypeError extends AppError {
  constructor(mimeType: string, allowedTypes: string[]) {
    super(
      `File type "${mimeType}" is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      "FILE_TYPE_NOT_ALLOWED",
      415
    );
    this.name = "FileTypeError";
  }
}

export class QuotaExceededError extends AppError {
  constructor(message = "Storage quota exceeded") {
    super(message, "QUOTA_EXCEEDED", 403);
    this.name = "QuotaExceededError";
  }
}

export class RetryExhaustedError extends AppError {
  constructor(maxAttempts: number) {
    super(
      `Job failed after exhausting ${maxAttempts} attempt(s)`,
      "RETRY_EXHAUSTED",
      500
    );
    this.name = "RetryExhaustedError";
  }
}

/**
 * Wraps an unknown provider error into a sanitized AppError.
 * Strips stack traces and any potential secret leakage.
 */
export function sanitizeProviderError(
  error: unknown,
  fallbackMessage: string
): AppError {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError(fallbackMessage, "PROVIDER_ERROR", 500);
}

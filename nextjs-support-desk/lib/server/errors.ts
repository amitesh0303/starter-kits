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

export class MailError extends AppError {
  constructor(message = "Mail delivery failed") {
    super(message, "MAIL_ERROR", 500);
    this.name = "MailError";
  }
}

export class StorageError extends AppError {
  constructor(message = "Storage operation failed") {
    super(message, "STORAGE_ERROR", 500);
    this.name = "StorageError";
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

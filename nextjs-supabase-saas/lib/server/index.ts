/**
 * Server-side infrastructure layer barrel export.
 * All modules in this directory are server-only.
 */

export { validateConfig, getRawConfig, isPlaceholderValue } from "./config";
export type { ConfigSpec } from "./config";

export { SupabaseAuthAdapter } from "./auth";
export type { IdentityPort, AuthUser, AuthSession } from "./auth";

export {
  createServiceClient,
  createUserClient,
  SupabaseTenantRepository,
  SupabaseMembershipRepository,
  SupabaseProjectRepository,
  SupabaseSubscriptionRepository,
  SupabaseProcessedEventRepository,
} from "./database";
export type {
  TenantRepository,
  MembershipRepository,
  ProjectRepository,
  SubscriptionRepository,
  ProcessedEventRepository,
} from "./database";

export { StripeBillingAdapter } from "./billing";
export type {
  BillingPort,
  CheckoutSessionParams,
  BillingPortalParams,
  WebhookEvent,
} from "./billing";

export { ResendMailAdapter, createMailAdapter } from "./mail";
export type { MailPort } from "./mail";

export { FakeBillingAdapter } from "./billing-fake";
export { FakeMailAdapter } from "./mail-fake";

export { getProviders, resetProviders } from "./providers";
export type { Providers } from "./providers";

export {
  DomainError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ValidationError,
  WebhookVerificationError,
  BillingError,
  MailError,
  sanitizeProviderError,
} from "./errors";

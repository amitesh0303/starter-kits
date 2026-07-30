/**
 * Core domain entities for the subscription app.
 */

/** User profile stored in Supabase and cached locally. */
export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A feature that may be locked behind a subscription. */
export interface Feature {
  id: string;
  name: string;
  description: string;
  /** Whether the feature requires a paid entitlement. */
  isPremium: boolean;
}

/** An entitlement representing access to premium features. */
export interface Entitlement {
  id: string;
  profileId: string;
  productId: string;
  /** Whether this entitlement is currently active. */
  isActive: boolean;
  expiresAt: string | null;
  purchasedAt: string;
  source: "revenuecat";
}

/**
 * Pending action states:
 * - pending: queued, waiting to sync
 * - syncing: currently being sent to the server
 * - applied: successfully applied server-side
 * - conflict: server rejected due to conflict
 * - failed: sync attempt failed (retryable)
 * - cancelled: action was cancelled by user or system
 */
export type PendingActionState =
  | "pending"
  | "syncing"
  | "applied"
  | "conflict"
  | "failed"
  | "cancelled";

/** A queued action that persists through restarts. */
export interface PendingAction {
  /** Stable UUID serving as idempotency key. */
  id: string;
  /** The type/kind of action (e.g., "update_profile", "sync_entitlement"). */
  kind: string;
  /** JSON-serializable payload. */
  payload: Record<string, unknown>;
  /** Current state of the action. */
  state: PendingActionState;
  /** Number of sync attempts made. */
  attempts: number;
  /** ISO timestamp of creation. */
  createdAt: string;
  /** ISO timestamp of last state change. */
  updatedAt: string;
}

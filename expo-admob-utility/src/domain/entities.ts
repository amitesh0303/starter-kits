/**
 * Core domain entities for the AdMob utility app.
 */

/** A utility tool provided by the app. */
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  isPremium: boolean;
}

/** Record of tool usage for analytics. */
export interface UsageRecord {
  id: string;
  toolId: string;
  timestamp: string;
  durationMs: number;
}

/** Ad display configuration. */
export interface AdConfig {
  bannerId: string;
  interstitialId: string;
  /** Minimum seconds between interstitial ads. */
  interstitialCooldownSec: number;
  /** Whether ads are disabled (premium user). */
  adsDisabled: boolean;
}

/** Local user preference (no account needed). */
export interface UserPreference {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

/** Pending action states for the sync queue. */
export type PendingActionState =
  | "pending"
  | "syncing"
  | "applied"
  | "conflict"
  | "failed"
  | "cancelled";

/** A queued action that persists through restarts. */
export interface PendingAction {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  state: PendingActionState;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

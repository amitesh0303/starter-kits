/**
 * Queue policy: capacity bounds, idempotency key validation, and state machine.
 *
 * Property 9: Bounded persistent queue with configurable capacity (default 50).
 * - Capacity overflow rejects new actions while preserving existing ones.
 * - Same action ID produces at most one domain effect (idempotency).
 */

import { PendingAction, PendingActionState } from "./entities";

/** Default queue capacity */
export const DEFAULT_QUEUE_CAPACITY = 50;

/**
 * Valid state transitions for pending actions.
 * Note: "syncing -> pending" is a recovery transition for orphaned actions
 * that were in-flight when the app crashed or was killed.
 */
const VALID_TRANSITIONS: Record<PendingActionState, PendingActionState[]> = {
  pending: ["syncing", "cancelled"],
  syncing: ["applied", "conflict", "failed", "pending"], // pending = crash recovery
  applied: [], // terminal
  conflict: ["pending", "cancelled"], // can retry or cancel
  failed: ["pending", "cancelled"], // can retry or cancel
  cancelled: [], // terminal
};

/**
 * Checks if a state transition is valid.
 */
export function isValidTransition(
  from: PendingActionState,
  to: PendingActionState
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

/**
 * Checks if a state is terminal (no further transitions possible).
 */
export function isTerminalState(state: PendingActionState): boolean {
  return VALID_TRANSITIONS[state].length === 0;
}

/**
 * Determines whether a new action can be enqueued given current queue state.
 * Returns { allowed: true } or { allowed: false, reason: string }.
 */
export function canEnqueue(
  currentActions: PendingAction[],
  newActionId: string,
  capacity: number = DEFAULT_QUEUE_CAPACITY
): { allowed: true } | { allowed: false; reason: string } {
  // Check capacity: count non-terminal actions
  const activeCount = currentActions.filter(
    (a) => !isTerminalState(a.state)
  ).length;

  if (activeCount >= capacity) {
    return {
      allowed: false,
      reason: `Queue at capacity (${capacity}). Cannot enqueue new action.`,
    };
  }

  // Check idempotency: reject if action ID already exists and is not terminal
  const existing = currentActions.find((a) => a.id === newActionId);
  if (existing && !isTerminalState(existing.state)) {
    return {
      allowed: false,
      reason: `Action with ID ${newActionId} already exists in non-terminal state '${existing.state}'.`,
    };
  }

  return { allowed: true };
}

/**
 * Checks if an action ID has already been applied (for idempotency enforcement).
 * If an action was previously applied, it should not produce another domain effect.
 */
export function hasBeenApplied(
  actions: PendingAction[],
  actionId: string
): boolean {
  return actions.some((a) => a.id === actionId && a.state === "applied");
}

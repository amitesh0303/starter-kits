/**
 * Bounded persistent queue with configurable capacity and idempotent sync.
 *
 * Property 9:
 * - Queue capacity is bounded (default 50).
 * - Overflow rejects new actions while preserving existing items.
 * - Same action ID produces at most one domain effect.
 */

import {
  PendingAction,
  PendingActionState,
} from "../domain/entities";
import {
  canEnqueue,
  isValidTransition,
  hasBeenApplied,
  DEFAULT_QUEUE_CAPACITY,
} from "../domain/queue-policy";

export interface BoundedQueue {
  /** Get all actions in the queue. */
  getAll(): PendingAction[];
  /** Enqueue a new action. Returns success/failure with reason. */
  enqueue(action: PendingAction): { success: boolean; reason?: string };
  /** Transition an action to a new state. */
  transition(
    id: string,
    newState: PendingActionState
  ): { success: boolean; reason?: string };
  /** Check if an action has already been applied (idempotency). */
  isApplied(actionId: string): boolean;
  /** Get pending actions ready for sync. */
  getPending(): PendingAction[];
  /** Get the current queue size (non-terminal actions). */
  activeSize(): number;
  /** The capacity of this queue. */
  capacity: number;
}

/**
 * Creates an in-memory bounded queue.
 * In production, this would be backed by SQLite for persistence.
 */
export function createBoundedQueue(
  capacity: number = DEFAULT_QUEUE_CAPACITY,
  initialActions: PendingAction[] = []
): BoundedQueue {
  const actions: PendingAction[] = [...initialActions];

  return {
    capacity,

    getAll(): PendingAction[] {
      return [...actions];
    },

    enqueue(action: PendingAction): { success: boolean; reason?: string } {
      const result = canEnqueue(actions, action.id, capacity);
      if (!result.allowed) {
        return { success: false, reason: result.reason };
      }

      // Idempotency: if already applied, reject silently
      if (hasBeenApplied(actions, action.id)) {
        return {
          success: false,
          reason: `Action ${action.id} has already been applied.`,
        };
      }

      actions.push(action);
      return { success: true };
    },

    transition(
      id: string,
      newState: PendingActionState
    ): { success: boolean; reason?: string } {
      const action = actions.find((a) => a.id === id);
      if (!action) {
        return { success: false, reason: `Action ${id} not found.` };
      }

      if (!isValidTransition(action.state, newState)) {
        return {
          success: false,
          reason: `Invalid transition from '${action.state}' to '${newState}'.`,
        };
      }

      action.state = newState;
      action.updatedAt = new Date().toISOString();
      if (newState === "syncing") {
        action.attempts += 1;
      }
      return { success: true };
    },

    isApplied(actionId: string): boolean {
      return hasBeenApplied(actions, actionId);
    },

    getPending(): PendingAction[] {
      return actions.filter((a) => a.state === "pending");
    },

    activeSize(): number {
      return actions.filter(
        (a) =>
          a.state !== "applied" && a.state !== "cancelled"
      ).length;
    },
  };
}

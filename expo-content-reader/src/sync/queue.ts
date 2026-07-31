/**
 * Bounded persistent queue for offline-first operations.
 */

import { PendingAction, PendingActionState } from "../domain/entities";

export const DEFAULT_QUEUE_CAPACITY = 50;

const VALID_TRANSITIONS: Record<PendingActionState, PendingActionState[]> = {
  pending: ["syncing", "cancelled"],
  syncing: ["applied", "conflict", "failed", "pending"],
  applied: [],
  conflict: ["pending", "cancelled"],
  failed: ["pending", "cancelled"],
  cancelled: [],
};

export function isValidTransition(from: PendingActionState, to: PendingActionState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function isTerminalState(state: PendingActionState): boolean {
  return VALID_TRANSITIONS[state].length === 0;
}

export function canEnqueue(
  actions: PendingAction[],
  newId: string,
  capacity: number = DEFAULT_QUEUE_CAPACITY
): { allowed: true } | { allowed: false; reason: string } {
  const activeCount = actions.filter((a) => !isTerminalState(a.state)).length;
  if (activeCount >= capacity) {
    return { allowed: false, reason: "Queue at capacity." };
  }
  const existing = actions.find((a) => a.id === newId);
  if (existing && !isTerminalState(existing.state)) {
    return { allowed: false, reason: "Action already exists." };
  }
  return { allowed: true };
}

export function hasBeenApplied(actions: PendingAction[], actionId: string): boolean {
  return actions.some((a) => a.id === actionId && a.state === "applied");
}

export interface BoundedQueue {
  getAll(): PendingAction[];
  enqueue(action: PendingAction): { success: boolean; reason?: string };
  transition(id: string, newState: PendingActionState): { success: boolean; reason?: string };
  getPending(): PendingAction[];
  activeSize(): number;
  capacity: number;
}

export function createBoundedQueue(capacity: number = DEFAULT_QUEUE_CAPACITY): BoundedQueue {
  const actions: PendingAction[] = [];

  return {
    capacity,
    getAll() { return [...actions]; },
    enqueue(action: PendingAction) {
      const result = canEnqueue(actions, action.id, capacity);
      if (!result.allowed) return { success: false, reason: result.reason };
      if (hasBeenApplied(actions, action.id)) {
        return { success: false, reason: "Already applied." };
      }
      actions.push(action);
      return { success: true };
    },
    transition(id: string, newState: PendingActionState) {
      const action = actions.find((a) => a.id === id);
      if (!action) return { success: false, reason: "Not found." };
      if (!isValidTransition(action.state, newState)) {
        return { success: false, reason: "Invalid transition." };
      }
      action.state = newState;
      action.updatedAt = new Date().toISOString();
      if (newState === "syncing") action.attempts += 1;
      return { success: true };
    },
    getPending() { return actions.filter((a) => a.state === "pending"); },
    activeSize() { return actions.filter((a) => !isTerminalState(a.state)).length; },
  };
}

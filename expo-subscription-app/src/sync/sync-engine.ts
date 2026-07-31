/**
 * Sync engine: connectivity-aware dispatch of pending actions.
 * On creation, recovers any orphaned syncing actions from a prior crash.
 */

import { BoundedQueue } from "./queue";

export interface SyncEngine {
  /** Process all pending actions in the queue. */
  processQueue(): Promise<void>;
  /** Check if the device is online. */
  isOnline(): boolean;
  /** Set online status (for testing or manual override). */
  setOnline(online: boolean): void;
  /** Number of orphaned actions recovered on startup. */
  recoveredOnStartup: number;
}

export type SyncHandler = (
  actionId: string,
  kind: string,
  payload: Record<string, unknown>
) => Promise<"applied" | "conflict" | "failed">;

/**
 * Creates a sync engine that processes queue items when online.
 * Automatically recovers orphaned syncing actions on creation.
 */
export function createSyncEngine(
  queue: BoundedQueue,
  handler: SyncHandler
): SyncEngine {
  let online = true;

  // Recover any actions stuck in "syncing" state from a prior crash
  const recoveredOnStartup = queue.recoverOrphanedSyncing();
  if (recoveredOnStartup > 0) {
    console.warn(
      `[SyncEngine] Recovered ${recoveredOnStartup} orphaned syncing action(s) on startup.`
    );
  }

  return {
    recoveredOnStartup,

    async processQueue(): Promise<void> {
      if (!online) {
        return;
      }

      const pending = queue.getPending();
      for (const action of pending) {
        // Skip if already applied (idempotency)
        if (queue.isApplied(action.id)) {
          continue;
        }

        // Transition to syncing
        const transitionResult = queue.transition(action.id, "syncing");
        if (!transitionResult.success) {
          continue;
        }

        try {
          const result = await handler(action.id, action.kind, action.payload);
          queue.transition(action.id, result);
        } catch {
          queue.transition(action.id, "failed");
        }
      }
    },

    isOnline(): boolean {
      return online;
    },

    setOnline(value: boolean): void {
      online = value;
    },
  };
}

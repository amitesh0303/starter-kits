/**
 * Concrete QueuePersistence-to-SQLite bridge.
 *
 * Maps the QueuePersistence interface callbacks to SQLiteRepository methods,
 * enabling write-through persistence of queue state changes to SQLite.
 */

import { QueuePersistence } from "../sync/queue";
import { SQLiteRepository } from "./sqlite-repository";

/**
 * Creates a QueuePersistence implementation backed by a SQLiteRepository.
 *
 * - onEnqueue: inserts the action into the pending_actions table
 * - onTransition: updates the action state in the pending_actions table
 *
 * Errors are caught and logged to avoid crashing the queue on persistence failures.
 */
export function createSQLiteQueuePersistence(
  repo: SQLiteRepository
): QueuePersistence {
  return {
    onEnqueue(action) {
      try {
        repo.insertAction(action);
      } catch (error) {
        console.warn(
          "[SQLiteQueuePersistence] Failed to persist enqueue:",
          error
        );
      }
    },

    onTransition(id, newState) {
      try {
        repo.updateActionState(id, newState);
      } catch (error) {
        console.warn(
          "[SQLiteQueuePersistence] Failed to persist transition:",
          error
        );
      }
    },
  };
}

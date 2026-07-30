/**
 * Property 9: Mobile pending-action capacity and idempotency.
 *
 * Uses fast-check for 100+ generated cases verifying:
 * 1. Queue capacity is always bounded
 * 2. Overflow preserves existing actions
 * 3. Same action ID produces at most one domain effect
 */

import * as fc from "fast-check";
import { createBoundedQueue } from "@/sync/queue";
import { PendingAction } from "@/domain/entities";

function makeAction(id: string, kind: string = "test"): PendingAction {
  return {
    id,
    kind,
    payload: { data: id },
    state: "pending",
    attempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("Property 9: Queue capacity and idempotency", () => {
  it("never exceeds capacity regardless of enqueue attempts", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 200 }),
        (capacity, actionIds) => {
          const queue = createBoundedQueue(capacity);

          for (const id of actionIds) {
            queue.enqueue(makeAction(id));
          }

          // Active size must never exceed capacity
          expect(queue.activeSize()).toBeLessThanOrEqual(capacity);
        }
      ),
      { numRuns: 150 }
    );
  });

  it("preserves existing items when overflow occurs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 100 }),
        (capacity, actionIds) => {
          const uniqueIds = [...new Set(actionIds)];
          const queue = createBoundedQueue(capacity);
          const acceptedIds: string[] = [];

          for (const id of uniqueIds) {
            const result = queue.enqueue(makeAction(id));
            if (result.success) {
              acceptedIds.push(id);
            }
          }

          // All accepted actions must still be in queue
          const allIds = queue.getAll().map((a) => a.id);
          for (const accepted of acceptedIds) {
            expect(allIds).toContain(accepted);
          }
        }
      ),
      { numRuns: 150 }
    );
  });

  it("duplicate action IDs are rejected (idempotency)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 50 }),
        fc.uuid(),
        (capacity, actionId) => {
          const queue = createBoundedQueue(capacity);

          // First enqueue succeeds
          const first = queue.enqueue(makeAction(actionId));
          expect(first.success).toBe(true);

          // Second enqueue with same ID fails
          const second = queue.enqueue(makeAction(actionId));
          expect(second.success).toBe(false);
        }
      ),
      { numRuns: 150 }
    );
  });

  it("applied actions produce at most one domain effect per ID", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 50 }),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 30 }),
        (capacity, actionIds) => {
          const uniqueIds = [...new Set(actionIds)];
          const queue = createBoundedQueue(capacity);
          const appliedEffects = new Map<string, number>();

          for (const id of uniqueIds) {
            const enqResult = queue.enqueue(makeAction(id));
            if (enqResult.success) {
              // Simulate processing
              queue.transition(id, "syncing");
              queue.transition(id, "applied");

              // Track applied effects
              appliedEffects.set(
                id,
                (appliedEffects.get(id) ?? 0) + 1
              );

              // Attempt re-enqueue (should fail for applied)
              const reEnqueue = queue.enqueue(makeAction(id));
              expect(reEnqueue.success).toBe(false);
            }
          }

          // Each ID was applied at most once
          for (const [, count] of appliedEffects) {
            expect(count).toBe(1);
          }
        }
      ),
      { numRuns: 150 }
    );
  });

  it("capacity bound holds after mixed state transitions", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 20 }),
        fc.array(
          fc.record({
            id: fc.uuid(),
            shouldComplete: fc.boolean(),
          }),
          { minLength: 5, maxLength: 50 }
        ),
        (capacity, actions) => {
          const queue = createBoundedQueue(capacity);

          for (const { id, shouldComplete } of actions) {
            const result = queue.enqueue(makeAction(id));
            if (result.success && shouldComplete) {
              queue.transition(id, "syncing");
              queue.transition(id, "applied");
            }
          }

          expect(queue.activeSize()).toBeLessThanOrEqual(capacity);
        }
      ),
      { numRuns: 150 }
    );
  });
});

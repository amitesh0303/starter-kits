import { createBoundedQueue } from "@/sync/queue";
import { PendingAction } from "@/domain/entities";

function makeAction(id: string): PendingAction {
  return { id, kind: "test", payload: {}, state: "pending", attempts: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

describe("Bounded queue", () => {
  it("enqueues and retrieves actions", () => {
    const queue = createBoundedQueue(10);
    const result = queue.enqueue(makeAction("a1"));
    expect(result.success).toBe(true);
    expect(queue.getAll()).toHaveLength(1);
  });

  it("rejects when at capacity", () => {
    const queue = createBoundedQueue(2);
    queue.enqueue(makeAction("a1"));
    queue.enqueue(makeAction("a2"));
    const result = queue.enqueue(makeAction("a3"));
    expect(result.success).toBe(false);
  });

  it("rejects duplicate IDs", () => {
    const queue = createBoundedQueue(10);
    queue.enqueue(makeAction("a1"));
    const result = queue.enqueue(makeAction("a1"));
    expect(result.success).toBe(false);
  });

  it("transitions states", () => {
    const queue = createBoundedQueue(10);
    queue.enqueue(makeAction("a1"));
    expect(queue.transition("a1", "syncing").success).toBe(true);
    expect(queue.transition("a1", "applied").success).toBe(true);
  });

  it("rejects invalid transitions", () => {
    const queue = createBoundedQueue(10);
    queue.enqueue(makeAction("a1"));
    expect(queue.transition("a1", "applied").success).toBe(false);
  });
});

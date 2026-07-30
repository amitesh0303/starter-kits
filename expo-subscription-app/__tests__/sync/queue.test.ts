import { createBoundedQueue } from "@/sync/queue";
import { PendingAction } from "@/domain/entities";

function makeAction(id: string): PendingAction {
  return {
    id,
    kind: "test_action",
    payload: { key: "value" },
    state: "pending",
    attempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("Bounded queue", () => {
  describe("basic operations", () => {
    it("enqueues and retrieves actions", () => {
      const queue = createBoundedQueue(10);
      const result = queue.enqueue(makeAction("a1"));
      expect(result.success).toBe(true);
      expect(queue.getAll()).toHaveLength(1);
    });

    it("preserves action data", () => {
      const queue = createBoundedQueue(10);
      const action = makeAction("a2");
      queue.enqueue(action);
      const stored = queue.getAll()[0];
      expect(stored.id).toBe("a2");
      expect(stored.kind).toBe("test_action");
      expect(stored.payload).toEqual({ key: "value" });
      expect(stored.state).toBe("pending");
    });

    it("returns pending actions", () => {
      const queue = createBoundedQueue(10);
      queue.enqueue(makeAction("p1"));
      queue.enqueue(makeAction("p2"));
      queue.transition("p1", "syncing");
      expect(queue.getPending()).toHaveLength(1);
      expect(queue.getPending()[0].id).toBe("p2");
    });
  });

  describe("capacity enforcement", () => {
    it("rejects new actions when at capacity", () => {
      const queue = createBoundedQueue(3);
      queue.enqueue(makeAction("c1"));
      queue.enqueue(makeAction("c2"));
      queue.enqueue(makeAction("c3"));
      const result = queue.enqueue(makeAction("c4"));
      expect(result.success).toBe(false);
      expect(result.reason).toContain("capacity");
    });

    it("preserves existing items on overflow", () => {
      const queue = createBoundedQueue(2);
      queue.enqueue(makeAction("e1"));
      queue.enqueue(makeAction("e2"));
      queue.enqueue(makeAction("e3")); // rejected
      expect(queue.getAll()).toHaveLength(2);
      expect(queue.getAll().map((a) => a.id)).toEqual(["e1", "e2"]);
    });

    it("allows enqueue after terminal state frees capacity", () => {
      const queue = createBoundedQueue(2);
      queue.enqueue(makeAction("f1"));
      queue.enqueue(makeAction("f2"));
      queue.transition("f1", "syncing");
      queue.transition("f1", "applied");
      const result = queue.enqueue(makeAction("f3"));
      expect(result.success).toBe(true);
    });

    it("reports correct active size", () => {
      const queue = createBoundedQueue(10);
      queue.enqueue(makeAction("s1"));
      queue.enqueue(makeAction("s2"));
      queue.transition("s1", "syncing");
      queue.transition("s1", "applied");
      expect(queue.activeSize()).toBe(1);
    });
  });

  describe("state transitions", () => {
    it("transitions pending -> syncing -> applied", () => {
      const queue = createBoundedQueue(10);
      queue.enqueue(makeAction("t1"));
      expect(queue.transition("t1", "syncing").success).toBe(true);
      expect(queue.transition("t1", "applied").success).toBe(true);
      expect(queue.getAll()[0].state).toBe("applied");
    });

    it("rejects invalid transitions", () => {
      const queue = createBoundedQueue(10);
      queue.enqueue(makeAction("t2"));
      const result = queue.transition("t2", "applied");
      expect(result.success).toBe(false);
    });

    it("increments attempts on syncing transition", () => {
      const queue = createBoundedQueue(10);
      queue.enqueue(makeAction("t3"));
      queue.transition("t3", "syncing");
      expect(queue.getAll()[0].attempts).toBe(1);
    });
  });

  describe("idempotency", () => {
    it("rejects duplicate action IDs in non-terminal state", () => {
      const queue = createBoundedQueue(10);
      queue.enqueue(makeAction("dup"));
      const result = queue.enqueue(makeAction("dup"));
      expect(result.success).toBe(false);
    });

    it("marks applied actions correctly", () => {
      const queue = createBoundedQueue(10);
      queue.enqueue(makeAction("id1"));
      queue.transition("id1", "syncing");
      queue.transition("id1", "applied");
      expect(queue.isApplied("id1")).toBe(true);
      expect(queue.isApplied("id2")).toBe(false);
    });

    it("rejects re-enqueue of applied action", () => {
      const queue = createBoundedQueue(10);
      queue.enqueue(makeAction("re1"));
      queue.transition("re1", "syncing");
      queue.transition("re1", "applied");
      const result = queue.enqueue(makeAction("re1"));
      expect(result.success).toBe(false);
      expect(result.reason).toContain("already been applied");
    });
  });

  describe("restart persistence", () => {
    it("initializes with pre-existing actions (simulates restart)", () => {
      const existingActions: PendingAction[] = [
        makeAction("r1"),
        makeAction("r2"),
      ];
      const queue = createBoundedQueue(10, existingActions);
      expect(queue.getAll()).toHaveLength(2);
      expect(queue.getPending()).toHaveLength(2);
    });
  });
});

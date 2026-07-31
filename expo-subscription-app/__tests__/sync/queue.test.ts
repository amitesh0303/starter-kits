import { createBoundedQueue, QueuePersistence } from "@/sync/queue";
import { PendingAction, PendingActionState } from "@/domain/entities";

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

  describe("persistence callbacks", () => {
    it("fires onEnqueue when an action is enqueued", () => {
      const onEnqueue = jest.fn();
      const onTransition = jest.fn();
      const persistence: QueuePersistence = { onEnqueue, onTransition };

      const queue = createBoundedQueue({ capacity: 10, persistence });
      const action = makeAction("pe1");
      queue.enqueue(action);

      expect(onEnqueue).toHaveBeenCalledTimes(1);
      expect(onEnqueue).toHaveBeenCalledWith(action);
    });

    it("fires onTransition when an action transitions state", () => {
      const onEnqueue = jest.fn();
      const onTransition = jest.fn();
      const persistence: QueuePersistence = { onEnqueue, onTransition };

      const queue = createBoundedQueue({ capacity: 10, persistence });
      queue.enqueue(makeAction("pt1"));
      queue.transition("pt1", "syncing");

      expect(onTransition).toHaveBeenCalledTimes(1);
      expect(onTransition).toHaveBeenCalledWith("pt1", "syncing");
    });

    it("fires onTransition for each state change in a full lifecycle", () => {
      const onEnqueue = jest.fn();
      const onTransition = jest.fn();
      const persistence: QueuePersistence = { onEnqueue, onTransition };

      const queue = createBoundedQueue({ capacity: 10, persistence });
      queue.enqueue(makeAction("lifecycle1"));
      queue.transition("lifecycle1", "syncing");
      queue.transition("lifecycle1", "applied");

      expect(onEnqueue).toHaveBeenCalledTimes(1);
      expect(onTransition).toHaveBeenCalledTimes(2);
      expect(onTransition).toHaveBeenCalledWith("lifecycle1", "syncing");
      expect(onTransition).toHaveBeenCalledWith("lifecycle1", "applied");
    });

    it("does not fire onEnqueue when action is rejected (capacity full)", () => {
      const onEnqueue = jest.fn();
      const onTransition = jest.fn();
      const persistence: QueuePersistence = { onEnqueue, onTransition };

      const queue = createBoundedQueue({ capacity: 2, persistence });
      queue.enqueue(makeAction("cap1"));
      queue.enqueue(makeAction("cap2"));
      queue.enqueue(makeAction("cap3")); // rejected

      expect(onEnqueue).toHaveBeenCalledTimes(2);
    });

    it("does not crash if persistence throws on enqueue", () => {
      const persistence: QueuePersistence = {
        onEnqueue: () => { throw new Error("DB write failed"); },
        onTransition: jest.fn(),
      };

      const queue = createBoundedQueue({ capacity: 10, persistence });
      const result = queue.enqueue(makeAction("err1"));
      // Enqueue still succeeds in-memory despite persistence failure
      expect(result.success).toBe(true);
      expect(queue.getAll()).toHaveLength(1);
    });

    it("does not crash if persistence throws on transition", () => {
      const persistence: QueuePersistence = {
        onEnqueue: jest.fn(),
        onTransition: () => { throw new Error("DB update failed"); },
      };

      const queue = createBoundedQueue({ capacity: 10, persistence });
      queue.enqueue(makeAction("err2"));
      const result = queue.transition("err2", "syncing");
      // Transition still succeeds in-memory despite persistence failure
      expect(result.success).toBe(true);
      expect(queue.getAll()[0].state).toBe("syncing");
    });
  });

  describe("crash recovery (recoverOrphanedSyncing)", () => {
    it("recovers orphaned syncing actions back to pending", () => {
      const orphanedAction: PendingAction = {
        ...makeAction("orphan1"),
        state: "syncing" as PendingActionState,
        attempts: 1,
      };
      const queue = createBoundedQueue({
        capacity: 10,
        initialActions: [orphanedAction],
      });

      const recovered = queue.recoverOrphanedSyncing();
      expect(recovered).toBe(1);
      expect(queue.getAll()[0].state).toBe("pending");
    });

    it("recovers multiple orphaned syncing actions", () => {
      const actions: PendingAction[] = [
        { ...makeAction("o1"), state: "syncing" as PendingActionState, attempts: 1 },
        { ...makeAction("o2"), state: "syncing" as PendingActionState, attempts: 2 },
        { ...makeAction("o3"), state: "pending" as PendingActionState, attempts: 0 },
      ];
      const queue = createBoundedQueue({
        capacity: 10,
        initialActions: actions,
      });

      const recovered = queue.recoverOrphanedSyncing();
      expect(recovered).toBe(2);
      expect(queue.getAll().filter((a) => a.state === "pending")).toHaveLength(3);
    });

    it("does not recover actions in non-syncing states", () => {
      const actions: PendingAction[] = [
        { ...makeAction("ns1"), state: "pending" as PendingActionState, attempts: 0 },
        { ...makeAction("ns2"), state: "applied" as PendingActionState, attempts: 1 },
        { ...makeAction("ns3"), state: "failed" as PendingActionState, attempts: 3 },
      ];
      const queue = createBoundedQueue({
        capacity: 10,
        initialActions: actions,
      });

      const recovered = queue.recoverOrphanedSyncing();
      expect(recovered).toBe(0);
    });

    it("fires persistence onTransition for each recovered action", () => {
      const onEnqueue = jest.fn();
      const onTransition = jest.fn();
      const persistence: QueuePersistence = { onEnqueue, onTransition };

      const actions: PendingAction[] = [
        { ...makeAction("rp1"), state: "syncing" as PendingActionState, attempts: 1 },
        { ...makeAction("rp2"), state: "syncing" as PendingActionState, attempts: 2 },
      ];
      const queue = createBoundedQueue({
        capacity: 10,
        initialActions: actions,
        persistence,
      });

      const recovered = queue.recoverOrphanedSyncing();
      expect(recovered).toBe(2);
      expect(onTransition).toHaveBeenCalledTimes(2);
      expect(onTransition).toHaveBeenCalledWith("rp1", "pending");
      expect(onTransition).toHaveBeenCalledWith("rp2", "pending");
    });

    it("returns zero when no actions are orphaned", () => {
      const queue = createBoundedQueue({
        capacity: 10,
        initialActions: [makeAction("healthy1"), makeAction("healthy2")],
      });

      const recovered = queue.recoverOrphanedSyncing();
      expect(recovered).toBe(0);
    });

    it("recovered actions are subsequently processable as pending", () => {
      const orphaned: PendingAction = {
        ...makeAction("proc1"),
        state: "syncing" as PendingActionState,
        attempts: 1,
      };
      const queue = createBoundedQueue({
        capacity: 10,
        initialActions: [orphaned],
      });

      queue.recoverOrphanedSyncing();
      const pending = queue.getPending();
      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe("proc1");

      // Can transition again after recovery
      const result = queue.transition("proc1", "syncing");
      expect(result.success).toBe(true);
      expect(queue.getAll()[0].attempts).toBe(2);
    });
  });
});

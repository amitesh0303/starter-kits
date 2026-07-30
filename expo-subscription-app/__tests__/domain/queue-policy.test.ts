import {
  canEnqueue,
  isValidTransition,
  isTerminalState,
  hasBeenApplied,
  DEFAULT_QUEUE_CAPACITY,
} from "@/domain/queue-policy";
import { PendingAction, PendingActionState } from "@/domain/entities";

function makeAction(
  id: string,
  state: PendingActionState = "pending"
): PendingAction {
  return {
    id,
    kind: "test",
    payload: {},
    state,
    attempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("Queue policy", () => {
  describe("capacity enforcement", () => {
    it("allows enqueue when under capacity", () => {
      const actions = [makeAction("1"), makeAction("2")];
      const result = canEnqueue(actions, "3", 5);
      expect(result.allowed).toBe(true);
    });

    it("rejects enqueue when at capacity", () => {
      const actions = Array.from({ length: 5 }, (_, i) =>
        makeAction(`action-${i}`)
      );
      const result = canEnqueue(actions, "new", 5);
      expect(result).toEqual({
        allowed: false,
        reason: expect.stringContaining("at capacity"),
      });
    });

    it("uses default capacity of 50", () => {
      expect(DEFAULT_QUEUE_CAPACITY).toBe(50);
    });

    it("does not count terminal states toward capacity", () => {
      const actions = [
        makeAction("1", "applied"),
        makeAction("2", "cancelled"),
        makeAction("3", "pending"),
      ];
      const result = canEnqueue(actions, "new", 2);
      expect(result.allowed).toBe(true);
    });
  });

  describe("idempotency", () => {
    it("rejects enqueue if action ID exists in non-terminal state", () => {
      const actions = [makeAction("dup")];
      const result = canEnqueue(actions, "dup", 10);
      expect(result.allowed).toBe(false);
      expect((result as { reason: string }).reason).toContain("already exists");
    });

    it("allows re-enqueue if action ID is in terminal state", () => {
      const actions = [makeAction("done", "applied")];
      const result = canEnqueue(actions, "done", 10);
      // Applied actions are terminal, so the ID check passes.
      // However, hasBeenApplied would catch this at the queue level.
      expect(result.allowed).toBe(true);
    });

    it("detects previously applied actions", () => {
      const actions = [makeAction("a", "applied"), makeAction("b", "pending")];
      expect(hasBeenApplied(actions, "a")).toBe(true);
      expect(hasBeenApplied(actions, "b")).toBe(false);
    });
  });

  describe("state transitions", () => {
    it("allows pending -> syncing", () => {
      expect(isValidTransition("pending", "syncing")).toBe(true);
    });

    it("allows pending -> cancelled", () => {
      expect(isValidTransition("pending", "cancelled")).toBe(true);
    });

    it("allows syncing -> applied", () => {
      expect(isValidTransition("syncing", "applied")).toBe(true);
    });

    it("allows syncing -> conflict", () => {
      expect(isValidTransition("syncing", "conflict")).toBe(true);
    });

    it("allows syncing -> failed", () => {
      expect(isValidTransition("syncing", "failed")).toBe(true);
    });

    it("rejects invalid transitions", () => {
      expect(isValidTransition("applied", "pending")).toBe(false);
      expect(isValidTransition("cancelled", "pending")).toBe(false);
      expect(isValidTransition("pending", "applied")).toBe(false);
    });

    it("identifies terminal states", () => {
      expect(isTerminalState("applied")).toBe(true);
      expect(isTerminalState("cancelled")).toBe(true);
      expect(isTerminalState("pending")).toBe(false);
      expect(isTerminalState("syncing")).toBe(false);
      expect(isTerminalState("failed")).toBe(false);
      expect(isTerminalState("conflict")).toBe(false);
    });
  });
});

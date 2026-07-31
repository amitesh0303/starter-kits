import { createSQLiteQueuePersistence } from "@/storage/queue-persistence";
import { SQLiteRepository } from "@/storage/sqlite-repository";
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

function createMockRepository(): jest.Mocked<SQLiteRepository> {
  return {
    initialize: jest.fn(),
    getCachedProfile: jest.fn(),
    cacheProfile: jest.fn(),
    getCachedFeatures: jest.fn().mockReturnValue([]),
    cacheFeatures: jest.fn(),
    getCachedEntitlements: jest.fn().mockReturnValue([]),
    cacheEntitlements: jest.fn(),
    getQueuedActions: jest.fn().mockReturnValue([]),
    insertAction: jest.fn(),
    updateActionState: jest.fn(),
    incrementAttempts: jest.fn(),
    getActionById: jest.fn(),
    clearAppliedActions: jest.fn(),
  };
}

describe("createSQLiteQueuePersistence", () => {
  it("calls repo.insertAction on onEnqueue", () => {
    const repo = createMockRepository();
    const persistence = createSQLiteQueuePersistence(repo);

    const action = makeAction("sql1");
    persistence.onEnqueue(action);

    expect(repo.insertAction).toHaveBeenCalledTimes(1);
    expect(repo.insertAction).toHaveBeenCalledWith(action);
  });

  it("calls repo.updateActionState on onTransition", () => {
    const repo = createMockRepository();
    const persistence = createSQLiteQueuePersistence(repo);

    persistence.onTransition("sql2", "syncing" as PendingActionState);

    expect(repo.updateActionState).toHaveBeenCalledTimes(1);
    expect(repo.updateActionState).toHaveBeenCalledWith("sql2", "syncing");
  });

  it("does not throw if repo.insertAction throws", () => {
    const repo = createMockRepository();
    repo.insertAction.mockImplementation(() => {
      throw new Error("DB constraint violation");
    });
    const persistence = createSQLiteQueuePersistence(repo);

    expect(() => persistence.onEnqueue(makeAction("err1"))).not.toThrow();
  });

  it("does not throw if repo.updateActionState throws", () => {
    const repo = createMockRepository();
    repo.updateActionState.mockImplementation(() => {
      throw new Error("DB write failed");
    });
    const persistence = createSQLiteQueuePersistence(repo);

    expect(() =>
      persistence.onTransition("err2", "applied" as PendingActionState)
    ).not.toThrow();
  });

  it("bridges multiple transitions to the repository", () => {
    const repo = createMockRepository();
    const persistence = createSQLiteQueuePersistence(repo);

    persistence.onTransition("multi1", "syncing" as PendingActionState);
    persistence.onTransition("multi1", "applied" as PendingActionState);

    expect(repo.updateActionState).toHaveBeenCalledTimes(2);
    expect(repo.updateActionState).toHaveBeenNthCalledWith(1, "multi1", "syncing");
    expect(repo.updateActionState).toHaveBeenNthCalledWith(2, "multi1", "applied");
  });
});

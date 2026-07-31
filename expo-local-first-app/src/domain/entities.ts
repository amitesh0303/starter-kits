export interface Note { id: string; title: string; content: string; tags: string[]; createdAt: string; updatedAt: string; syncedAt: string | null; deleted: boolean; }
export interface SyncRecord { id: string; noteId: string; operation: "create" | "update" | "delete"; timestamp: string; synced: boolean; }
export interface Conflict { id: string; noteId: string; localVersion: Note; remoteVersion: Note; resolvedAt: string | null; resolution: "local" | "remote" | "merge" | null; }
export interface ChangeLog { id: string; noteId: string; field: string; oldValue: string; newValue: string; changedAt: string; }
export type PendingActionState = "pending" | "syncing" | "applied" | "conflict" | "failed" | "cancelled";
export interface PendingAction { id: string; kind: string; payload: Record<string, unknown>; state: PendingActionState; attempts: number; createdAt: string; updatedAt: string; }

import { Note, Conflict } from "./entities";

/** Check if a note needs syncing. */
export function needsSync(note: Note): boolean {
  if (!note.syncedAt) return true;
  return new Date(note.updatedAt) > new Date(note.syncedAt);
}

/** Detect if there is a conflict between local and remote. */
export function detectConflict(local: Note, remote: Note): boolean {
  if (!local.syncedAt) return false;
  const localUpdated = new Date(local.updatedAt).getTime();
  const remoteUpdated = new Date(remote.updatedAt).getTime();
  const lastSync = new Date(local.syncedAt).getTime();
  return localUpdated > lastSync && remoteUpdated > lastSync;
}

/** Resolve conflict by choosing a strategy. */
export function resolveConflict(conflict: Conflict, strategy: "local" | "remote"): Note {
  return strategy === "local" ? conflict.localVersion : conflict.remoteVersion;
}

/** Get pending sync count. */
export function pendingSyncCount(notes: Note[]): number {
  return notes.filter(n => needsSync(n) && !n.deleted).length;
}

/** Validate note title. */
export function isValidNoteTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= 200;
}

/** Validate note content (max 50KB). */
export function isValidNoteContent(content: string): boolean {
  return content.length <= 50000;
}

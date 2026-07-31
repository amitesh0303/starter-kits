import { Note } from "../domain/entities";
export interface SyncAdapter { pushNotes(notes: Note[]): Promise<{ synced: string[]; conflicts: string[] }>; pullNotes(since: string | null): Promise<Note[]>; }
export function createFakeSyncAdapter(): SyncAdapter {
  return { async pushNotes(notes) { return { synced: notes.map(n => n.id), conflicts: [] }; }, async pullNotes(_since) { return []; } };
}

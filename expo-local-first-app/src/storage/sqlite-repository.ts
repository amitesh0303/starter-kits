import { Note } from "../domain/entities";
export interface SQLiteRepository { initialize(): void; getAllNotes(): Note[]; saveNote(note: Note): void; deleteNote(id: string): void; }
export function createSQLiteRepository(): SQLiteRepository { return { initialize() {}, getAllNotes() { return []; }, saveNote(_n) {}, deleteNote(_id) {} }; }

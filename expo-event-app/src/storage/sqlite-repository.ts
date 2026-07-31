export interface SQLiteRepository { initialize(): void; cacheEvents(events: Array<{id:string}>): void; getTickets(): Array<{id:string;eventId:string}>; }
export function createSQLiteRepository(): SQLiteRepository { return { initialize() {}, cacheEvents(_e) {}, getTickets() { return []; } }; }

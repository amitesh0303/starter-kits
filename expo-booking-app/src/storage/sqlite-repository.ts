export interface SQLiteRepository { initialize(): void; cacheBookings(bookings: Array<{id:string}>): void; getCachedBookings(): Array<{id:string}>; }
export function createSQLiteRepository(): SQLiteRepository { return { initialize() {}, cacheBookings(_b) {}, getCachedBookings() { return []; } }; }

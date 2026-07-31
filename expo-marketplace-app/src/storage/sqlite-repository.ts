export interface SQLiteRepository { initialize(): void; cacheListings(listings: Array<{id:string}>): void; getCachedListings(): Array<{id:string}>; }
export function createSQLiteRepository(): SQLiteRepository { return { initialize() {}, cacheListings(_l) {}, getCachedListings() { return []; } }; }

export interface SQLiteRepository { initialize(): void; cacheDeliveries(d: Array<{id:string}>): void; getLocationHistory(): Array<{lat:number;lng:number;timestamp:string}>; }
export function createSQLiteRepository(): SQLiteRepository { return { initialize() {}, cacheDeliveries(_d) {}, getLocationHistory() { return []; } }; }

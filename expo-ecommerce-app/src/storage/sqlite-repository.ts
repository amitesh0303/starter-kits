export interface SQLiteRepository { initialize(): void; cacheProducts(p: Array<{id:string}>): void; getCartCache(): Array<{variantId:string;quantity:number}>; }
export function createSQLiteRepository(): SQLiteRepository { return { initialize() {}, cacheProducts(_p) {}, getCartCache() { return []; } }; }

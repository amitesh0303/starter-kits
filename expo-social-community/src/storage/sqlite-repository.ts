export interface SQLiteRepository { initialize(): void; cachePosts(posts: Array<{id:string}>): void; getCachedPosts(): Array<{id:string}>; }
export function createSQLiteRepository(): SQLiteRepository { return { initialize() {}, cachePosts(_p) {}, getCachedPosts() { return []; } }; }

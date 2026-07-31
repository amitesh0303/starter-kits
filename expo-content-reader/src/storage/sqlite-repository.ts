export interface SQLiteRepository { initialize(): void; cacheArticles(articles: Array<{id:string}>): void; getBookmarks(): Array<{articleId:string}>; }
export function createSQLiteRepository(): SQLiteRepository { return { initialize() {}, cacheArticles(_a) {}, getBookmarks() { return []; } }; }

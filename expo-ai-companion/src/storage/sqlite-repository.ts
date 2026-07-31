export interface SQLiteRepository {
  initialize(): void;
  getConversations(): Array<{ id: string; title: string; createdAt: string }>;
  saveMessage(conversationId: string, role: string, content: string): void;
}
export function createSQLiteRepository(): SQLiteRepository {
  return {
    initialize() {},
    getConversations() { return []; },
    saveMessage(_cid, _role, _content) {},
  };
}

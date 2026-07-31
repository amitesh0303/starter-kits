export interface ChatAdapter {
  connect(userId: string): Promise<void>;
  sendMessage(channelId: string, content: string): Promise<{ id: string }>;
  disconnect(): Promise<void>;
}
export function createFakeChatAdapter(): ChatAdapter {
  return {
    async connect(_userId) {},
    async sendMessage(_channelId, _content) { return { id: "msg-" + Date.now() }; },
    async disconnect() {},
  };
}

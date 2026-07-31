export interface RealtimeAdapter {
  subscribe(channel: string, callback: (data: unknown) => void): () => void;
  publish(channel: string, data: unknown): Promise<void>;
}
export function createFakeRealtimeAdapter(): RealtimeAdapter {
  return {
    subscribe(_channel, _callback) { return () => {}; },
    async publish(_channel, _data) {},
  };
}

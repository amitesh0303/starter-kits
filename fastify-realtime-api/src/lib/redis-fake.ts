/**
 * Fake Redis pub/sub and store for testing.
 */
export class FakeRedis {
  private store: Map<string, string> = new Map();
  private subscribers: Map<string, ((message: string) => void)[]> = new Map();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string): Promise<"OK"> {
    this.store.set(key, value);
    return "OK";
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async publish(channel: string, message: string): Promise<number> {
    const subs = this.subscribers.get(channel) || [];
    subs.forEach((cb) => cb(message));
    return subs.length;
  }

  subscribe(channel: string, callback: (message: string) => void): void {
    const subs = this.subscribers.get(channel) || [];
    subs.push(callback);
    this.subscribers.set(channel, subs);
  }

  reset(): void {
    this.store.clear();
    this.subscribers.clear();
  }
}

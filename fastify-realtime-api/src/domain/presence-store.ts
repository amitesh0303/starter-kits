export interface UserPresence {
  userId: string;
  lastSeen: string;
  online: boolean;
}

class InMemoryPresenceStore {
  private presence: Map<string, UserPresence> = new Map();

  heartbeat(userId: string): void {
    this.presence.set(userId, {
      userId,
      lastSeen: new Date().toISOString(),
      online: true,
    });
  }

  getOnlineUsers(): UserPresence[] {
    return Array.from(this.presence.values()).filter((p) => p.online);
  }

  setOffline(userId: string): void {
    const p = this.presence.get(userId);
    if (p) {
      p.online = false;
    }
  }

  reset(): void {
    this.presence.clear();
  }
}

let instance: InMemoryPresenceStore | null = null;

export function getPresenceStore(): InMemoryPresenceStore {
  if (!instance) {
    instance = new InMemoryPresenceStore();
  }
  return instance;
}

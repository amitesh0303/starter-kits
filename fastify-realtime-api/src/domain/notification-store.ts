import crypto from "node:crypto";

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

class InMemoryNotificationStore {
  private notifications: Map<string, Notification> = new Map();

  getByUserId(userId: string): Notification[] {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId
    );
  }

  create(userId: string, message: string, type: string): Notification {
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  markAsRead(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
    }
  }

  reset(): void {
    this.notifications.clear();
  }
}

let instance: InMemoryNotificationStore | null = null;

export function getNotificationStore(): InMemoryNotificationStore {
  if (!instance) {
    instance = new InMemoryNotificationStore();
  }
  return instance;
}

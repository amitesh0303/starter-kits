/**
 * Deterministic in-memory fake mail adapter for testing.
 * Records all sent notifications for assertion in tests.
 */

import type {
  MailPort,
  TicketCreatedParams,
  NewReplyParams,
} from "./mail";

export interface SentTicketCreated {
  params: TicketCreatedParams;
  sentAt: Date;
}

export interface SentReplyNotification {
  params: NewReplyParams;
  sentAt: Date;
}

export class FakeMailAdapter implements MailPort {
  public sentTicketCreated: SentTicketCreated[] = [];
  public sentReplyNotifications: SentReplyNotification[] = [];

  async sendTicketCreatedNotification(params: TicketCreatedParams): Promise<void> {
    this.sentTicketCreated.push({
      params,
      sentAt: new Date(),
    });
  }

  async sendNewReplyNotification(params: NewReplyParams): Promise<void> {
    this.sentReplyNotifications.push({
      params,
      sentAt: new Date(),
    });
  }

  /**
   * Get the last sent ticket created notification.
   */
  getLastTicketCreated(): SentTicketCreated | null {
    return this.sentTicketCreated[this.sentTicketCreated.length - 1] ?? null;
  }

  /**
   * Get the last sent reply notification.
   */
  getLastReplyNotification(): SentReplyNotification | null {
    return this.sentReplyNotifications[this.sentReplyNotifications.length - 1] ?? null;
  }

  /**
   * Check if a ticket created notification was sent to a specific email.
   */
  hasTicketCreatedTo(email: string): boolean {
    return this.sentTicketCreated.some((n) => n.params.to === email);
  }

  /**
   * Check if a reply notification was sent to a specific email.
   */
  hasReplyNotificationTo(email: string): boolean {
    return this.sentReplyNotifications.some((n) => n.params.to === email);
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.sentTicketCreated = [];
    this.sentReplyNotifications = [];
  }
}

/**
 * Deterministic in-memory fake mail adapter for testing.
 * Records all sent invites for assertion in tests.
 */

import type { MailPort, InviteParams } from "./mail";

export interface SentInvite {
  params: InviteParams;
  sentAt: Date;
}

export class FakeMailAdapter implements MailPort {
  public sentInvites: SentInvite[] = [];

  async sendInvite(params: InviteParams): Promise<void> {
    this.sentInvites.push({
      params,
      sentAt: new Date(),
    });
  }

  /**
   * Get the last sent invite (for assertions).
   */
  getLastInvite(): SentInvite | null {
    return this.sentInvites[this.sentInvites.length - 1] ?? null;
  }

  /**
   * Check if an invite was sent to a specific email.
   */
  hasSentTo(email: string): boolean {
    return this.sentInvites.some((i) => i.params.to === email);
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.sentInvites = [];
  }
}

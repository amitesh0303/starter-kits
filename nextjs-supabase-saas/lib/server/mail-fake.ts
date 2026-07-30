/**
 * Deterministic in-memory fake mail adapter for testing.
 * Captures all sent emails for assertion in tests.
 */

import type { MailPort } from "./mail";

export interface CapturedEmail {
  type: "welcome" | "invite";
  to: string;
  subject: string;
  params: Record<string, string>;
  sentAt: Date;
}

export class FakeMailAdapter implements MailPort {
  public sentEmails: CapturedEmail[] = [];

  async sendWelcomeEmail(params: {
    to: string;
    tenantName: string;
  }): Promise<void> {
    this.sentEmails.push({
      type: "welcome",
      to: params.to,
      subject: `Welcome to ${params.tenantName}!`,
      params: { tenantName: params.tenantName },
      sentAt: new Date(),
    });
  }

  async sendInviteEmail(params: {
    to: string;
    tenantName: string;
    inviterName: string;
    inviteUrl: string;
  }): Promise<void> {
    this.sentEmails.push({
      type: "invite",
      to: params.to,
      subject: `You've been invited to ${params.tenantName}`,
      params: {
        tenantName: params.tenantName,
        inviterName: params.inviterName,
        inviteUrl: params.inviteUrl,
      },
      sentAt: new Date(),
    });
  }

  /**
   * Get all emails sent to a specific address.
   */
  getEmailsTo(address: string): CapturedEmail[] {
    return this.sentEmails.filter((e) => e.to === address);
  }

  /**
   * Get all emails of a specific type.
   */
  getEmailsByType(type: "welcome" | "invite"): CapturedEmail[] {
    return this.sentEmails.filter((e) => e.type === type);
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.sentEmails = [];
  }
}

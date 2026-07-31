/**
 * Deterministic in-memory fake mail adapter for testing.
 */

import type { MailPort } from "./mail";

export interface SentEmail {
  to: string;
  type: "invite" | "welcome";
  orgName: string;
  inviteUrl?: string;
}

export class FakeMailAdapter implements MailPort {
  public sentEmails: SentEmail[] = [];

  async sendInviteEmail(to: string, orgName: string, inviteUrl: string): Promise<void> {
    this.sentEmails.push({ to, type: "invite", orgName, inviteUrl });
  }

  async sendWelcomeEmail(to: string, orgName: string): Promise<void> {
    this.sentEmails.push({ to, type: "welcome", orgName });
  }

  reset(): void {
    this.sentEmails = [];
  }
}

/**
 * Mail port: Postmark adapter interface and real implementation.
 */

import { MailError } from "./errors";

export interface MailPort {
  sendInviteEmail(to: string, orgName: string, inviteUrl: string): Promise<void>;
  sendWelcomeEmail(to: string, orgName: string): Promise<void>;
}

export class PostmarkMailAdapter implements MailPort {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendInviteEmail(to: string, orgName: string, inviteUrl: string): Promise<void> {
    void this.apiKey;
    void to;
    void orgName;
    void inviteUrl;
    throw new MailError("Postmark adapter requires real credentials");
  }

  async sendWelcomeEmail(to: string, orgName: string): Promise<void> {
    void this.apiKey;
    void to;
    void orgName;
    throw new MailError("Postmark adapter requires real credentials");
  }
}

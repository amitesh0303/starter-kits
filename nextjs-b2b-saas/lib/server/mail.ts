/**
 * Mail port: Postmark adapter for transactional emails (team invitations).
 * Uses the Postmark API to send structured invite emails.
 */

import { MailError, sanitizeProviderError } from "./errors";

// --- Mail Port Interface ---

export interface InviteParams {
  to: string;
  inviterName: string;
  organizationName: string;
  inviteUrl: string;
}

export interface MailPort {
  sendInvite(params: InviteParams): Promise<void>;
}

// --- Postmark Adapter ---

export class PostmarkMailAdapter implements MailPort {
  private apiKey: string;
  private fromAddress: string;

  constructor(apiKey: string, fromAddress = "noreply@example.com") {
    this.apiKey = apiKey;
    this.fromAddress = fromAddress;
  }

  async sendInvite(params: InviteParams): Promise<void> {
    try {
      const response = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Postmark-Server-Token": this.apiKey,
        },
        body: JSON.stringify({
          From: this.fromAddress,
          To: params.to,
          Subject: `You've been invited to ${params.organizationName}`,
          HtmlBody: `
            <p>${params.inviterName} has invited you to join <strong>${params.organizationName}</strong>.</p>
            <p><a href="${params.inviteUrl}">Accept Invitation</a></p>
          `,
          TextBody: `${params.inviterName} has invited you to join ${params.organizationName}. Accept at: ${params.inviteUrl}`,
        }),
      });

      if (!response.ok) {
        throw new MailError("Failed to send invite email");
      }
    } catch (error) {
      if (error instanceof MailError) throw error;
      throw sanitizeProviderError(error, "Failed to send invite email");
    }
  }
}

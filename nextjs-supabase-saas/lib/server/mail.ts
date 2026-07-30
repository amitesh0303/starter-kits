/**
 * Mail port: Resend adapter with fake fallback when API key is missing/placeholder.
 */

import { Resend } from "resend";
import { MailError, sanitizeProviderError } from "./errors";
import { isPlaceholderValue } from "./config";

// ─── Mail Port Interface ────────────────────────────────────────────────────────

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface MailPort {
  sendWelcomeEmail(params: { to: string; tenantName: string }): Promise<void>;
  sendInviteEmail(params: {
    to: string;
    tenantName: string;
    inviterName: string;
    inviteUrl: string;
  }): Promise<void>;
}

// ─── Resend Adapter ─────────────────────────────────────────────────────────────

export class ResendMailAdapter implements MailPort {
  private resend: Resend;
  private fromAddress: string;

  constructor(apiKey: string, fromAddress?: string) {
    this.resend = new Resend(apiKey);
    this.fromAddress = fromAddress ?? "noreply@example.com";
  }

  async sendWelcomeEmail(params: {
    to: string;
    tenantName: string;
  }): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: params.to,
        subject: `Welcome to ${params.tenantName}!`,
        html: `
          <h1>Welcome to ${params.tenantName}!</h1>
          <p>Your workspace has been set up and is ready to use.</p>
          <p>Get started by creating your first project.</p>
        `,
      });

      if (error) {
        throw new MailError("Failed to send welcome email");
      }
    } catch (error) {
      if (error instanceof MailError) throw error;
      throw sanitizeProviderError(error, "Failed to send welcome email");
    }
  }

  async sendInviteEmail(params: {
    to: string;
    tenantName: string;
    inviterName: string;
    inviteUrl: string;
  }): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: params.to,
        subject: `You've been invited to ${params.tenantName}`,
        html: `
          <h1>You're invited!</h1>
          <p>${params.inviterName} has invited you to join ${params.tenantName}.</p>
          <p><a href="${params.inviteUrl}">Accept Invitation</a></p>
        `,
      });

      if (error) {
        throw new MailError("Failed to send invite email");
      }
    } catch (error) {
      if (error instanceof MailError) throw error;
      throw sanitizeProviderError(error, "Failed to send invite email");
    }
  }
}

/**
 * Factory: Returns Resend adapter or null if key is placeholder.
 * Use FakeMailAdapter from mail-fake.ts when this returns null.
 */
export function createMailAdapter(): ResendMailAdapter | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || isPlaceholderValue(apiKey)) {
    return null;
  }
  return new ResendMailAdapter(apiKey);
}

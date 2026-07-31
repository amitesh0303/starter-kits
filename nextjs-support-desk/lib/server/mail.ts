/**
 * Mail port: Resend adapter for transactional emails (ticket notifications).
 */

import { MailError, sanitizeProviderError } from "./errors";

// --- Mail Port Interface ---

export interface TicketCreatedParams {
  to: string;
  ticketId: string;
  subject: string;
  customerName: string;
  teamName: string;
}

export interface NewReplyParams {
  to: string;
  ticketId: string;
  subject: string;
  authorName: string;
  preview: string;
}

export interface MailPort {
  sendTicketCreatedNotification(params: TicketCreatedParams): Promise<void>;
  sendNewReplyNotification(params: NewReplyParams): Promise<void>;
}

// --- Resend Adapter ---

export class ResendMailAdapter implements MailPort {
  private apiKey: string;
  private fromAddress: string;

  constructor(apiKey: string, fromAddress = "support@example.com") {
    this.apiKey = apiKey;
    this.fromAddress = fromAddress;
  }

  async sendTicketCreatedNotification(params: TicketCreatedParams): Promise<void> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.fromAddress,
          to: [params.to],
          subject: `New Ticket: ${params.subject}`,
          html: `
            <p>A new support ticket has been created.</p>
            <p><strong>Ticket:</strong> ${params.subject}</p>
            <p><strong>From:</strong> ${params.customerName}</p>
            <p><strong>Team:</strong> ${params.teamName}</p>
            <p><strong>Ticket ID:</strong> ${params.ticketId}</p>
          `,
        }),
      });

      if (!response.ok) {
        throw new MailError("Failed to send ticket created notification");
      }
    } catch (error) {
      if (error instanceof MailError) throw error;
      throw sanitizeProviderError(error, "Failed to send ticket created notification");
    }
  }

  async sendNewReplyNotification(params: NewReplyParams): Promise<void> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.fromAddress,
          to: [params.to],
          subject: `Re: ${params.subject}`,
          html: `
            <p><strong>${params.authorName}</strong> replied to ticket "${params.subject}":</p>
            <p>${params.preview}</p>
            <p><strong>Ticket ID:</strong> ${params.ticketId}</p>
          `,
        }),
      });

      if (!response.ok) {
        throw new MailError("Failed to send new reply notification");
      }
    } catch (error) {
      if (error instanceof MailError) throw error;
      throw sanitizeProviderError(error, "Failed to send new reply notification");
    }
  }
}

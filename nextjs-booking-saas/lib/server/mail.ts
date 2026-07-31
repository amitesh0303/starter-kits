/**
 * Mail port: Resend adapter for transactional emails (booking confirmations and cancellations).
 */

import { MailError, sanitizeProviderError } from "./errors";

// --- Mail Port Interface ---

export interface BookingConfirmationParams {
  to: string;
  providerName: string;
  startTime: Date;
  endTime: Date;
  bookingId: string;
}

export interface CancellationNoticeParams {
  to: string;
  providerName: string;
  startTime: Date;
  bookingId: string;
  reason?: string;
}

export interface MailPort {
  sendBookingConfirmation(params: BookingConfirmationParams): Promise<void>;
  sendCancellationNotice(params: CancellationNoticeParams): Promise<void>;
}

// --- Resend Adapter ---

export class ResendMailAdapter implements MailPort {
  private apiKey: string;
  private fromAddress: string;

  constructor(apiKey: string, fromAddress = "bookings@example.com") {
    this.apiKey = apiKey;
    this.fromAddress = fromAddress;
  }

  async sendBookingConfirmation(params: BookingConfirmationParams): Promise<void> {
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
          subject: `Booking Confirmed with ${params.providerName}`,
          html: `
            <p>Your booking with <strong>${params.providerName}</strong> has been confirmed.</p>
            <p>Date: ${params.startTime.toLocaleDateString()}</p>
            <p>Time: ${params.startTime.toLocaleTimeString()} - ${params.endTime.toLocaleTimeString()}</p>
            <p>Booking ID: ${params.bookingId}</p>
          `,
        }),
      });

      if (!response.ok) {
        throw new MailError("Failed to send booking confirmation email");
      }
    } catch (error) {
      if (error instanceof MailError) throw error;
      throw sanitizeProviderError(error, "Failed to send booking confirmation email");
    }
  }

  async sendCancellationNotice(params: CancellationNoticeParams): Promise<void> {
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
          subject: `Booking Cancelled with ${params.providerName}`,
          html: `
            <p>Your booking with <strong>${params.providerName}</strong> has been cancelled.</p>
            <p>Original date: ${params.startTime.toLocaleDateString()}</p>
            <p>Booking ID: ${params.bookingId}</p>
            ${params.reason ? `<p>Reason: ${params.reason}</p>` : ""}
          `,
        }),
      });

      if (!response.ok) {
        throw new MailError("Failed to send cancellation notice email");
      }
    } catch (error) {
      if (error instanceof MailError) throw error;
      throw sanitizeProviderError(error, "Failed to send cancellation notice email");
    }
  }
}

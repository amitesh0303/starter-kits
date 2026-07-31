/**
 * Deterministic in-memory fake mail adapter for testing.
 * Records all sent messages for assertion in tests.
 */

import type {
  MailPort,
  BookingConfirmationParams,
  CancellationNoticeParams,
} from "./mail";

export interface SentConfirmation {
  params: BookingConfirmationParams;
  sentAt: Date;
}

export interface SentCancellation {
  params: CancellationNoticeParams;
  sentAt: Date;
}

export class FakeMailAdapter implements MailPort {
  public sentConfirmations: SentConfirmation[] = [];
  public sentCancellations: SentCancellation[] = [];

  async sendBookingConfirmation(params: BookingConfirmationParams): Promise<void> {
    this.sentConfirmations.push({
      params,
      sentAt: new Date(),
    });
  }

  async sendCancellationNotice(params: CancellationNoticeParams): Promise<void> {
    this.sentCancellations.push({
      params,
      sentAt: new Date(),
    });
  }

  /**
   * Get the last sent confirmation (for assertions).
   */
  getLastConfirmation(): SentConfirmation | null {
    return this.sentConfirmations[this.sentConfirmations.length - 1] ?? null;
  }

  /**
   * Get the last sent cancellation (for assertions).
   */
  getLastCancellation(): SentCancellation | null {
    return this.sentCancellations[this.sentCancellations.length - 1] ?? null;
  }

  /**
   * Check if a confirmation was sent to a specific email.
   */
  hasConfirmationTo(email: string): boolean {
    return this.sentConfirmations.some((c) => c.params.to === email);
  }

  /**
   * Check if a cancellation was sent to a specific email.
   */
  hasCancellationTo(email: string): boolean {
    return this.sentCancellations.some((c) => c.params.to === email);
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.sentConfirmations = [];
    this.sentCancellations = [];
  }
}

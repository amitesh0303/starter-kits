/**
 * Calendar port: Google Calendar adapter for event management.
 * Creates and cancels calendar events linked to bookings.
 */

import { CalendarError, sanitizeProviderError } from "./errors";

// --- Calendar Port Interface ---

export interface CalendarEventParams {
  bookingId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail: string;
}

export interface CalendarPort {
  createEvent(params: CalendarEventParams): Promise<string>;
  cancelEvent(eventId: string): Promise<void>;
}

// --- Google Calendar Adapter ---

export class GoogleCalendarAdapter implements CalendarPort {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;

  constructor(clientId: string, clientSecret: string, refreshToken: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.refreshToken = refreshToken;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: "refresh_token",
        }).toString(),
      });

      if (!response.ok) {
        throw new CalendarError("Failed to refresh access token");
      }

      const result = await response.json();
      return result.access_token;
    } catch (error) {
      if (error instanceof CalendarError) throw error;
      throw sanitizeProviderError(error, "Failed to refresh access token");
    }
  }

  async createEvent(params: CalendarEventParams): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            summary: params.title,
            description: params.description,
            start: {
              dateTime: params.startTime.toISOString(),
            },
            end: {
              dateTime: params.endTime.toISOString(),
            },
            attendees: [{ email: params.attendeeEmail }],
            extendedProperties: {
              private: { bookingId: params.bookingId },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new CalendarError("Failed to create calendar event");
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      if (error instanceof CalendarError) throw error;
      throw sanitizeProviderError(error, "Failed to create calendar event");
    }
  }

  async cancelEvent(eventId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok && response.status !== 404) {
        throw new CalendarError("Failed to cancel calendar event");
      }
    } catch (error) {
      if (error instanceof CalendarError) throw error;
      throw sanitizeProviderError(error, "Failed to cancel calendar event");
    }
  }
}

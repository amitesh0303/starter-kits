/**
 * Deterministic in-memory fake calendar adapter for testing.
 * Records all created and cancelled events for assertion in tests.
 */

import type { CalendarPort, CalendarEventParams } from "./calendar";

export interface FakeCalendarEvent {
  id: string;
  params: CalendarEventParams;
  cancelled: boolean;
  createdAt: Date;
}

export class FakeCalendarAdapter implements CalendarPort {
  public events: Map<string, FakeCalendarEvent> = new Map();
  private counter = 0;

  async createEvent(params: CalendarEventParams): Promise<string> {
    this.counter++;
    const id = `cal_evt_${this.counter}`;
    this.events.set(id, {
      id,
      params,
      cancelled: false,
      createdAt: new Date(),
    });
    return id;
  }

  async cancelEvent(eventId: string): Promise<void> {
    const event = this.events.get(eventId);
    if (event) {
      event.cancelled = true;
    }
  }

  /**
   * Get the last created event (for assertions).
   */
  getLastEvent(): FakeCalendarEvent | null {
    const entries = Array.from(this.events.values());
    return entries[entries.length - 1] ?? null;
  }

  /**
   * Get all cancelled events.
   */
  getCancelledEvents(): FakeCalendarEvent[] {
    return Array.from(this.events.values()).filter((e) => e.cancelled);
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.events.clear();
    this.counter = 0;
  }
}

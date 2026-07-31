import { Event, Ticket } from "./entities";

/** Check if event has available tickets. */
export function hasAvailableTickets(event: Event): boolean {
  return event.ticketsSold < event.capacity;
}

/** Get remaining ticket count. */
export function remainingTickets(event: Event): number {
  return Math.max(0, event.capacity - event.ticketsSold);
}

/** Check if a ticket is valid for check-in. */
export function isTicketValidForCheckIn(ticket: Ticket): boolean {
  return ticket.status === "valid";
}

/** Check if event is in the future. */
export function isUpcoming(event: Event): boolean {
  return new Date(event.startDate) > new Date();
}

/** Check if event is currently happening. */
export function isOngoing(event: Event): boolean {
  const now = new Date();
  return new Date(event.startDate) <= now && new Date(event.endDate) >= now;
}

/** Validate QR code format (UUID-based). */
export function isValidQRCode(code: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(code);
}

/** Calculate event fill percentage. */
export function fillPercentage(event: Event): number {
  if (event.capacity <= 0) return 0;
  return Math.min(100, Math.round((event.ticketsSold / event.capacity) * 100));
}

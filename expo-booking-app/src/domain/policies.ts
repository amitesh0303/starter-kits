import { TimeSlot, Booking } from "./entities";

/** Check if a time slot can be booked. */
export function canBookSlot(slot: TimeSlot): boolean {
  if (!slot.available) return false;
  const startTime = new Date(slot.startTime);
  return startTime > new Date();
}

/** Check for booking conflicts (overlapping times). */
export function hasConflict(existingBookings: Booking[], newSlot: TimeSlot): boolean {
  return existingBookings.some(b => b.timeSlotId === newSlot.id && b.status !== "cancelled");
}

/** Calculate total cost for multiple slots. */
export function calculateTotal(slots: TimeSlot[]): number {
  return slots.reduce((sum, s) => sum + s.price, 0);
}

/** Check if a booking can be cancelled (must be in future). */
export function canCancel(booking: Booking, slotStartTime: string): boolean {
  if (booking.status === "cancelled") return false;
  const start = new Date(slotStartTime);
  const now = new Date();
  // Must cancel at least 24 hours before
  return start.getTime() - now.getTime() > 24 * 60 * 60 * 1000;
}

/** Validate rating value. */
export function isValidRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}

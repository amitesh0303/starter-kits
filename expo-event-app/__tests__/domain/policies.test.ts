import { hasAvailableTickets, remainingTickets, isTicketValidForCheckIn, isValidQRCode, fillPercentage } from "@/domain/policies";
import { Event, Ticket } from "@/domain/entities";
describe("Ticket validation policies", () => {
  const event: Event = { id: "e1", title: "Concert", description: "", venue: "Hall", startDate: "2025-12-01T19:00:00Z", endDate: "2025-12-01T23:00:00Z", capacity: 100, ticketsSold: 80, price: 50, currency: "USD", imageUrl: null };
  it("checks available tickets", () => { expect(hasAvailableTickets(event)).toBe(true); expect(hasAvailableTickets({ ...event, ticketsSold: 100 })).toBe(false); });
  it("gets remaining count", () => { expect(remainingTickets(event)).toBe(20); });
  it("validates ticket for check-in", () => {
    const valid: Ticket = { id: "t1", eventId: "e1", attendeeId: "a1", type: "general", qrCode: "abc", status: "valid", purchasedAt: "" };
    expect(isTicketValidForCheckIn(valid)).toBe(true);
    expect(isTicketValidForCheckIn({ ...valid, status: "used" })).toBe(false);
  });
  it("validates QR code format", () => {
    expect(isValidQRCode("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidQRCode("not-a-uuid")).toBe(false);
  });
  it("calculates fill percentage", () => { expect(fillPercentage(event)).toBe(80); });
});

import { createFakeCalendarAdapter } from "@/adapters/calendar-adapter";
describe("Calendar adapter (fake)", () => {
  it("returns available slots", async () => { const a = createFakeCalendarAdapter(); const s = await a.getAvailableSlots("v1", "2025-01-01"); expect(s.length).toBeGreaterThan(0); });
  it("adds to calendar", async () => { const a = createFakeCalendarAdapter(); expect(await a.addToCalendar("Test", "2025-01-01T09:00:00Z", "2025-01-01T10:00:00Z")).toBe(true); });
});

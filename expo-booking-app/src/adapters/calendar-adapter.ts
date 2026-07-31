export interface CalendarAdapter { getAvailableSlots(venueId: string, date: string): Promise<Array<{ id: string; startTime: string; endTime: string }>>; addToCalendar(title: string, startTime: string, endTime: string): Promise<boolean>; }
export function createFakeCalendarAdapter(): CalendarAdapter {
  return {
    async getAvailableSlots(_v, _d) { return [{ id: "s1", startTime: "2025-01-01T09:00:00Z", endTime: "2025-01-01T10:00:00Z" }]; },
    async addToCalendar(_t, _s, _e) { return true; },
  };
}

import * as fc from "fast-check";
import { canSendMessage, remainingMessages } from "@/domain/policies";
import { UserProfile } from "@/domain/entities";

describe("Property: Message quota invariants", () => {
  it("premium users always can send", () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1, max: 100 }), (used, limit) => {
      const p: UserProfile = { id: "1", email: "a@b.com", displayName: null, tier: "premium", messagesUsedToday: used, dailyMessageLimit: limit, createdAt: "" };
      expect(canSendMessage(p)).toBe(true);
    }), { numRuns: 150 });
  });
  it("remaining is always non-negative", () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1, max: 100 }), (used, limit) => {
      const p: UserProfile = { id: "1", email: "a@b.com", displayName: null, tier: "free", messagesUsedToday: used, dailyMessageLimit: limit, createdAt: "" };
      expect(remainingMessages(p)).toBeGreaterThanOrEqual(0);
    }), { numRuns: 150 });
  });
});

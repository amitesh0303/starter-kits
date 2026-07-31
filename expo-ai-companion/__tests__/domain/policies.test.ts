import { canSendMessage, remainingMessages, isValidMessage, quotaUsagePercent } from "@/domain/policies";
import { UserProfile } from "@/domain/entities";

describe("Message quota policies", () => {
  const freeUser: UserProfile = { id: "1", email: "a@b.com", displayName: null, tier: "free", messagesUsedToday: 5, dailyMessageLimit: 10, createdAt: "2024-01-01T00:00:00Z" };
  const premiumUser: UserProfile = { ...freeUser, tier: "premium" };
  const exhaustedUser: UserProfile = { ...freeUser, messagesUsedToday: 10 };

  it("allows free user under limit", () => { expect(canSendMessage(freeUser)).toBe(true); });
  it("blocks free user at limit", () => { expect(canSendMessage(exhaustedUser)).toBe(false); });
  it("always allows premium user", () => { expect(canSendMessage(premiumUser)).toBe(true); });
  it("calculates remaining messages", () => { expect(remainingMessages(freeUser)).toBe(5); expect(remainingMessages(exhaustedUser)).toBe(0); });
  it("validates message content", () => {
    expect(isValidMessage("Hello")).toBe(true);
    expect(isValidMessage("")).toBe(false);
    expect(isValidMessage("   ")).toBe(false);
    expect(isValidMessage("a".repeat(5000))).toBe(false);
  });
  it("calculates quota percentage", () => { expect(quotaUsagePercent({ dailyLimit: 10, used: 5, resetsAt: "" })).toBe(50); });
});

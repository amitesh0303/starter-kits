import { describe, it, expect } from "vitest";
import { canAccessConversation, canCreateMessage, canDeleteConversation, hasExceededUsage } from "$lib/domain/policies";

const convo = { id: "c1", userId: "user1", title: "Test", model: "gpt-4", tokenCount: 100, createdAt: new Date(), updatedAt: new Date() };
const limit = { id: "l1", userId: "user1", maxTokensPerMonth: 10000, currentUsage: 5000, resetAt: new Date() };
const exceeded = { ...limit, currentUsage: 10000 };

describe("SvelteKit AI Policies", () => {
  it("allows user to access own conversation", () => { expect(canAccessConversation({ userId: "user1" }, convo)).toBe(true); });
  it("denies other user", () => { expect(canAccessConversation({ userId: "user2" }, convo)).toBe(false); });
  it("allows message creation within limits", () => { expect(canCreateMessage({ userId: "user1" }, limit)).toBe(true); });
  it("denies message creation when exceeded", () => { expect(canCreateMessage({ userId: "user1" }, exceeded)).toBe(false); });
  it("allows deletion by owner", () => { expect(canDeleteConversation({ userId: "user1" }, convo)).toBe(true); });
  it("detects exceeded usage", () => { expect(hasExceededUsage(exceeded)).toBe(true); });
  it("not exceeded when under limit", () => { expect(hasExceededUsage(limit)).toBe(false); });
});

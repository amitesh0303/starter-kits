import { describe, it, expect } from "vitest";
import { canCreateThread, canModerateThread, canDeletePost, canLockThread } from "@/domain/policies";
import type { Membership } from "@/domain/entities";

const membership = (userId: string, role: string): Membership => ({ id: "m1", communityId: "com1", userId, role: role as any, joinedAt: new Date() });

describe("Community Policies", () => {
  it("member can create thread", () => { expect(canCreateThread({ userId: "u1" }, [membership("u1", "member")], "com1")).toBe(true); });
  it("non-member cannot create thread", () => { expect(canCreateThread({ userId: "u2" }, [membership("u1", "member")], "com1")).toBe(false); });
  it("moderator can moderate", () => { expect(canModerateThread({ userId: "u1" }, [membership("u1", "moderator")], "com1")).toBe(true); });
  it("member cannot moderate", () => { expect(canModerateThread({ userId: "u1" }, [membership("u1", "member")], "com1")).toBe(false); });
  it("author can delete own post", () => { expect(canDeletePost({ userId: "u1" }, "u1", [membership("u1", "member")], "com1")).toBe(true); });
  it("non-author member cannot delete", () => { expect(canDeletePost({ userId: "u2" }, "u1", [membership("u2", "member")], "com1")).toBe(false); });
});

/**
 * Integration tests for authentication and authorization flows.
 * Tests Clerk auth context building and role-based access.
 */

import { describe, it, expect } from "vitest";
import { buildAuthContext, extractRoleFromMetadata } from "@/lib/server/auth";
import { canCreateCourse, canEditCourse, canEnroll } from "@/domain/policies";
import type { Course } from "@/domain/entities";

describe("Auth Context Building", () => {
  it("returns null for null userId", () => {
    const ctx = buildAuthContext(null);
    expect(ctx).toBeNull();
  });

  it("returns null for empty string userId", () => {
    const ctx = buildAuthContext("");
    expect(ctx).toBeNull();
  });

  it("builds context with default learner role", () => {
    const ctx = buildAuthContext("user_123");
    expect(ctx).toEqual({ userId: "user_123", role: "learner" });
  });

  it("builds context with explicit creator role", () => {
    const ctx = buildAuthContext("user_123", "creator");
    expect(ctx).toEqual({ userId: "user_123", role: "creator" });
  });
});

describe("Role Extraction from Clerk Metadata", () => {
  it("returns learner for null metadata", () => {
    expect(extractRoleFromMetadata(null)).toBe("learner");
  });

  it("returns learner for undefined metadata", () => {
    expect(extractRoleFromMetadata(undefined)).toBe("learner");
  });

  it("returns learner for empty metadata", () => {
    expect(extractRoleFromMetadata({})).toBe("learner");
  });

  it("returns creator for creator role in metadata", () => {
    expect(extractRoleFromMetadata({ role: "creator" })).toBe("creator");
  });

  it("returns learner for unknown role in metadata", () => {
    expect(extractRoleFromMetadata({ role: "admin" })).toBe("learner");
  });
});

describe("Auth + Policy Integration", () => {
  const course: Course = {
    id: "course_1",
    creatorId: "creator_1",
    title: "Test",
    description: "Test course",
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("unauthenticated user cannot create courses", () => {
    const ctx = buildAuthContext(null);
    expect(canCreateCourse(ctx)).toBe(false);
  });

  it("authenticated learner cannot create courses", () => {
    const ctx = buildAuthContext("learner_1", "learner");
    expect(canCreateCourse(ctx)).toBe(false);
  });

  it("authenticated creator can create courses", () => {
    const ctx = buildAuthContext("creator_1", "creator");
    expect(canCreateCourse(ctx)).toBe(true);
  });

  it("course creator can edit their own course", () => {
    const ctx = buildAuthContext("creator_1", "creator");
    expect(canEditCourse(ctx, course)).toBe(true);
  });

  it("different creator cannot edit course", () => {
    const ctx = buildAuthContext("other_creator", "creator");
    expect(canEditCourse(ctx, course)).toBe(false);
  });

  it("learner can enroll", () => {
    const ctx = buildAuthContext("learner_1", "learner");
    expect(canEnroll(ctx)).toBe(true);
  });

  it("creator cannot enroll (different role)", () => {
    const ctx = buildAuthContext("creator_1", "creator");
    expect(canEnroll(ctx)).toBe(false);
  });
});

/**
 * Unit tests for domain authorization policies.
 */

import { describe, it, expect } from "vitest";
import {
  canCreateCourse,
  canEditCourse,
  canEnroll,
  canAccessLesson,
  canViewProgress,
} from "@/domain/policies";
import type { AuthContext } from "@/domain/policies";
import type { Course, Enrollment, Subscription } from "@/domain/entities";

const mockCourse: Course = {
  id: "course_1",
  creatorId: "creator_user_1",
  title: "Test Course",
  description: "A test course",
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEnrollment: Enrollment = {
  id: "enr_1",
  userId: "learner_user_1",
  courseId: "course_1",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSubscription: Subscription = {
  id: "sub_1",
  userId: "learner_user_1",
  stripeCustomerId: "cus_1",
  stripeSubscriptionId: "sub_stripe_1",
  stripePriceId: "price_1",
  status: "active",
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  cancelAtPeriodEnd: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("canCreateCourse", () => {
  it("denies null context", () => {
    expect(canCreateCourse(null)).toBe(false);
  });

  it("denies empty userId", () => {
    expect(canCreateCourse({ userId: "", role: "creator" })).toBe(false);
  });

  it("denies learner role", () => {
    expect(canCreateCourse({ userId: "user1", role: "learner" })).toBe(false);
  });

  it("allows creator role", () => {
    expect(canCreateCourse({ userId: "user1", role: "creator" })).toBe(true);
  });
});

describe("canEditCourse", () => {
  it("denies null context", () => {
    expect(canEditCourse(null, mockCourse)).toBe(false);
  });

  it("denies empty userId", () => {
    expect(canEditCourse({ userId: "", role: "creator" }, mockCourse)).toBe(false);
  });

  it("denies learner role", () => {
    expect(canEditCourse({ userId: mockCourse.creatorId, role: "learner" }, mockCourse)).toBe(false);
  });

  it("denies creator of different course", () => {
    expect(canEditCourse({ userId: "other_user", role: "creator" }, mockCourse)).toBe(false);
  });

  it("allows course creator", () => {
    expect(canEditCourse({ userId: mockCourse.creatorId, role: "creator" }, mockCourse)).toBe(true);
  });
});

describe("canEnroll", () => {
  it("denies null context", () => {
    expect(canEnroll(null)).toBe(false);
  });

  it("denies empty userId", () => {
    expect(canEnroll({ userId: "", role: "learner" })).toBe(false);
  });

  it("denies creator role", () => {
    expect(canEnroll({ userId: "user1", role: "creator" })).toBe(false);
  });

  it("allows learner role", () => {
    expect(canEnroll({ userId: "user1", role: "learner" })).toBe(true);
  });
});

describe("canAccessLesson", () => {
  it("denies null context", () => {
    expect(canAccessLesson(null, mockEnrollment, mockSubscription)).toBe(false);
  });

  it("denies no enrollment", () => {
    const ctx: AuthContext = { userId: "learner_user_1", role: "learner" };
    expect(canAccessLesson(ctx, null, mockSubscription)).toBe(false);
  });

  it("denies no subscription", () => {
    const ctx: AuthContext = { userId: "learner_user_1", role: "learner" };
    expect(canAccessLesson(ctx, mockEnrollment, null)).toBe(false);
  });

  it("denies wrong user enrollment", () => {
    const ctx: AuthContext = { userId: "wrong_user", role: "learner" };
    expect(canAccessLesson(ctx, mockEnrollment, mockSubscription)).toBe(false);
  });

  it("denies expired enrollment", () => {
    const ctx: AuthContext = { userId: "learner_user_1", role: "learner" };
    const expiredEnrollment = { ...mockEnrollment, status: "expired" as const };
    expect(canAccessLesson(ctx, expiredEnrollment, mockSubscription)).toBe(false);
  });

  it("denies cancelled subscription", () => {
    const ctx: AuthContext = { userId: "learner_user_1", role: "learner" };
    const cancelledSub = { ...mockSubscription, status: "cancelled" as const };
    expect(canAccessLesson(ctx, mockEnrollment, cancelledSub)).toBe(false);
  });

  it("denies subscription belonging to different user", () => {
    const ctx: AuthContext = { userId: "learner_user_1", role: "learner" };
    const otherSub = { ...mockSubscription, userId: "other_user" };
    expect(canAccessLesson(ctx, mockEnrollment, otherSub)).toBe(false);
  });

  it("allows with active enrollment and active subscription", () => {
    const ctx: AuthContext = { userId: "learner_user_1", role: "learner" };
    expect(canAccessLesson(ctx, mockEnrollment, mockSubscription)).toBe(true);
  });

  it("allows with trialing subscription", () => {
    const ctx: AuthContext = { userId: "learner_user_1", role: "learner" };
    const trialSub = { ...mockSubscription, status: "trialing" as const };
    expect(canAccessLesson(ctx, mockEnrollment, trialSub)).toBe(true);
  });
});

describe("canViewProgress", () => {
  it("denies null context", () => {
    expect(canViewProgress(null, mockEnrollment)).toBe(false);
  });

  it("denies empty userId", () => {
    expect(canViewProgress({ userId: "", role: "learner" }, mockEnrollment)).toBe(false);
  });

  it("denies wrong user", () => {
    expect(canViewProgress({ userId: "other", role: "learner" }, mockEnrollment)).toBe(false);
  });

  it("allows enrollment owner", () => {
    expect(canViewProgress({ userId: "learner_user_1", role: "learner" }, mockEnrollment)).toBe(true);
  });
});

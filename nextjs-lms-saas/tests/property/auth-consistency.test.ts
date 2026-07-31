/**
 * Property 4: Authentication and access consistency.
 * For any identity state and resource ownership:
 * - Unauthenticated access is always denied
 * - Unauthorized access (wrong role/user) is always denied
 * - Valid access requires authentication AND correct conditions
 * Uses fast-check to generate random auth contexts and entities.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  canCreateCourse,
  canEditCourse,
  canEnroll,
  canAccessLesson,
  canViewProgress,
} from "@/domain/policies";
import type { AuthContext, UserRole } from "@/domain/policies";
import type {
  Course,
  Enrollment,
  EnrollmentStatus,
  Subscription,
  SubscriptionStatus,
} from "@/domain/entities";

// Arbitrary generators
const userIdArb = fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 20 });
const roleArb = fc.constantFrom<UserRole>("creator", "learner");
const enrollmentStatusArb = fc.constantFrom<EnrollmentStatus>(
  "active",
  "expired",
  "cancelled"
);
const subscriptionStatusArb = fc.constantFrom<SubscriptionStatus>(
  "active",
  "past_due",
  "cancelled",
  "trialing"
);

const courseArb = fc.record({
  id: fc.uuid(),
  creatorId: userIdArb,
  title: fc.string({ minLength: 1, maxLength: 30 }),
  description: fc.string({ maxLength: 50 }),
  published: fc.boolean(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

const enrollmentArb = (userId: string) =>
  fc.record({
    id: fc.uuid(),
    userId: fc.constant(userId),
    courseId: fc.uuid(),
    status: enrollmentStatusArb,
    createdAt: fc.date(),
    updatedAt: fc.date(),
  });

const subscriptionArb = (userId: string) =>
  fc.record({
    id: fc.uuid(),
    userId: fc.constant(userId),
    stripeCustomerId: fc.string({ minLength: 3, maxLength: 10 }),
    stripeSubscriptionId: fc.string({ minLength: 3, maxLength: 10 }),
    stripePriceId: fc.string({ minLength: 3, maxLength: 10 }),
    status: subscriptionStatusArb,
    currentPeriodEnd: fc.date(),
    cancelAtPeriodEnd: fc.boolean(),
    createdAt: fc.date(),
    updatedAt: fc.date(),
  });

describe("Property 4: Authentication and Access Consistency", () => {
  it("unauthenticated (null context) always denied for canCreateCourse", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        expect(canCreateCourse(null)).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  it("unauthenticated (empty userId) always denied for canCreateCourse", () => {
    fc.assert(
      fc.property(roleArb, (role) => {
        expect(canCreateCourse({ userId: "", role })).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("unauthenticated always denied for canEditCourse", () => {
    fc.assert(
      fc.property(courseArb, (course) => {
        expect(canEditCourse(null, course)).toBe(false);
        expect(canEditCourse({ userId: "", role: "creator" }, course)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("unauthenticated always denied for canEnroll", () => {
    expect(canEnroll(null)).toBe(false);
    expect(canEnroll({ userId: "", role: "learner" })).toBe(false);
  });

  it("unauthenticated always denied for canAccessLesson", () => {
    fc.assert(
      fc.property(
        userIdArb,
        (userId) => {
          const enrollment: Enrollment = {
            id: "enr_1",
            userId,
            courseId: "c1",
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const subscription: Subscription = {
            id: "sub_1",
            userId,
            stripeCustomerId: "cus",
            stripeSubscriptionId: "sub",
            stripePriceId: "price",
            status: "active",
            currentPeriodEnd: new Date(),
            cancelAtPeriodEnd: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          expect(canAccessLesson(null, enrollment, subscription)).toBe(false);
          expect(
            canAccessLesson({ userId: "", role: "learner" }, enrollment, subscription)
          ).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("unauthenticated always denied for canViewProgress", () => {
    fc.assert(
      fc.property(userIdArb, (userId) => {
        const enrollment: Enrollment = {
          id: "enr_1",
          userId,
          courseId: "c1",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(canViewProgress(null, enrollment)).toBe(false);
        expect(canViewProgress({ userId: "", role: "learner" }, enrollment)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("only creator role can create courses", () => {
    fc.assert(
      fc.property(userIdArb, roleArb, (userId, role) => {
        const ctx: AuthContext = { userId, role };
        const result = canCreateCourse(ctx);
        const expected = role === "creator";
        expect(result).toBe(expected);
      }),
      { numRuns: 200 }
    );
  });

  it("only course creator with creator role can edit course", () => {
    fc.assert(
      fc.property(courseArb, userIdArb, roleArb, (course, callerId, callerRole) => {
        const ctx: AuthContext = { userId: callerId, role: callerRole };
        const result = canEditCourse(ctx, course);
        const expected = callerRole === "creator" && callerId === course.creatorId;
        expect(result).toBe(expected);
      }),
      { numRuns: 200 }
    );
  });

  it("only learner role can enroll", () => {
    fc.assert(
      fc.property(userIdArb, roleArb, (userId, role) => {
        const ctx: AuthContext = { userId, role };
        const result = canEnroll(ctx);
        const expected = role === "learner";
        expect(result).toBe(expected);
      }),
      { numRuns: 200 }
    );
  });

  it("access iff enrolled + active enrollment + active/trialing subscription owned by user", () => {
    fc.assert(
      fc.property(
        userIdArb,
        userIdArb,
        enrollmentStatusArb,
        subscriptionStatusArb,
        (ctxUserId, enrollUserId, enrollStatus, subStatus) => {
          const ctx: AuthContext = { userId: ctxUserId, role: "learner" };
          const enrollment: Enrollment = {
            id: "enr_1",
            userId: enrollUserId,
            courseId: "c1",
            status: enrollStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const subscription: Subscription = {
            id: "sub_1",
            userId: ctxUserId,
            stripeCustomerId: "cus",
            stripeSubscriptionId: "sub",
            stripePriceId: "price",
            status: subStatus,
            currentPeriodEnd: new Date(),
            cancelAtPeriodEnd: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const result = canAccessLesson(ctx, enrollment, subscription);
          const expected =
            ctxUserId === enrollUserId &&
            enrollStatus === "active" &&
            (subStatus === "active" || subStatus === "trialing");
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("canViewProgress: only enrollment owner can view", () => {
    fc.assert(
      fc.property(userIdArb, userIdArb, (ctxUserId, enrollUserId) => {
        const ctx: AuthContext = { userId: ctxUserId, role: "learner" };
        const enrollment: Enrollment = {
          id: "enr_1",
          userId: enrollUserId,
          courseId: "c1",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = canViewProgress(ctx, enrollment);
        const expected = ctxUserId === enrollUserId;
        expect(result).toBe(expected);
      }),
      { numRuns: 200 }
    );
  });
});

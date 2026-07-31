/**
 * Deny-by-default authorization policies for the LMS SaaS.
 * All access checks return false unless an explicit allow condition is met.
 */

import type { Course, Enrollment, Subscription } from "./entities";

export type UserRole = "creator" | "learner";

export interface AuthContext {
  userId: string;
  role: UserRole;
}

/**
 * Check if the user can create a course (creator role only).
 */
export function canCreateCourse(ctx: AuthContext | null): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return ctx.role === "creator";
}

/**
 * Check if the user can edit a course (must be the course creator).
 */
export function canEditCourse(
  ctx: AuthContext | null,
  course: Course
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  if (ctx.role !== "creator") return false;
  return ctx.userId === course.creatorId;
}

/**
 * Check if the user can enroll in a course (any authenticated learner).
 */
export function canEnroll(ctx: AuthContext | null): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return ctx.role === "learner";
}

/**
 * Check if the user can access a lesson (must be enrolled with active subscription).
 */
export function canAccessLesson(
  ctx: AuthContext | null,
  enrollment: Enrollment | null,
  subscription: Subscription | null
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  if (!enrollment) return false;
  if (enrollment.userId !== ctx.userId) return false;
  if (enrollment.status !== "active") return false;
  if (!subscription) return false;
  if (
    subscription.userId !== ctx.userId ||
    (subscription.status !== "active" && subscription.status !== "trialing")
  ) {
    return false;
  }
  return true;
}

/**
 * Check if the user can view progress (must be the enrollment owner).
 */
export function canViewProgress(
  ctx: AuthContext | null,
  enrollment: Enrollment
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return ctx.userId === enrollment.userId;
}

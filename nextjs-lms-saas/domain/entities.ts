/**
 * Domain entity types for the LMS SaaS application.
 * Core business objects: courses, lessons, enrollments, progress, subscriptions, and events.
 */

export type VideoStatus = "waiting" | "preparing" | "ready" | "errored";

export type EnrollmentStatus = "active" | "expired" | "cancelled";

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

export interface Course {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  position: number;
  videoAssetId: string | null;
  videoPlaybackId: string | null;
  videoStatus: VideoStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Progress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessedEvent {
  id: string;
  providerEventId: string;
  eventType: string;
  processedAt: Date;
}

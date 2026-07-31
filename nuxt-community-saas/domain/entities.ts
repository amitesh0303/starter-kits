/**
 * Domain entities for community SaaS.
 */

export interface Community {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Thread {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  pinned: boolean;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  id: string;
  communityId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
}

export type MemberRole = "owner" | "moderator" | "member";
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

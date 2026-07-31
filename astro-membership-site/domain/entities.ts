/**
 * Domain entities for membership site.
 */

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  authorId: string;
  tier: ContentTier;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentTier = "free" | "member" | "premium";

export interface Subscriber {
  id: string;
  userId: string;
  email: string;
  name: string;
  tier: SubscriberTier;
  stripeCustomerId: string | null;
  createdAt: Date;
}

export type SubscriberTier = "free" | "member" | "premium";

export interface Newsletter {
  id: string;
  subject: string;
  content: string;
  sentAt: Date | null;
  targetTier: ContentTier;
  createdAt: Date;
}

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

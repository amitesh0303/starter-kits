/**
 * Domain entities for admin SaaS.
 */

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: ContactStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ContactStatus = "lead" | "prospect" | "customer" | "churned";

export interface Deal {
  id: string;
  contactId: string;
  title: string;
  valueInCents: number;
  stage: DealStage;
  ownerId: string;
  closedAt: Date | null;
  createdAt: Date;
}

export type DealStage = "discovery" | "proposal" | "negotiation" | "closed_won" | "closed_lost";

export interface Activity {
  id: string;
  contactId: string;
  type: ActivityType;
  note: string;
  performedBy: string;
  createdAt: Date;
}

export type ActivityType = "call" | "email" | "meeting" | "note";

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

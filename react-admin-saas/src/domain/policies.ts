/**
 * Authorization policies for admin CRM.
 */

import type { Contact, Deal } from "./entities";

export interface AuthContext {
  userId: string;
  role: "admin" | "user";
}

export function canViewContact(ctx: AuthContext, contact: Contact): boolean {
  if (!ctx.userId) return false;
  if (ctx.role === "admin") return true;
  return contact.ownerId === ctx.userId;
}

export function canEditContact(ctx: AuthContext, contact: Contact): boolean {
  if (!ctx.userId) return false;
  if (ctx.role === "admin") return true;
  return contact.ownerId === ctx.userId;
}

export function canViewDeal(ctx: AuthContext, deal: Deal): boolean {
  if (!ctx.userId) return false;
  if (ctx.role === "admin") return true;
  return deal.ownerId === ctx.userId;
}

export function canDeleteDeal(ctx: AuthContext): boolean {
  if (!ctx.userId) return false;
  return ctx.role === "admin";
}

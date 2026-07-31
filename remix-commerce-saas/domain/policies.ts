/**
 * Authorization policies for commerce.
 */

import type { Order, Customer } from "./entities";

export interface AuthContext {
  userId: string;
}

export function canViewOrder(ctx: AuthContext, order: Order, customer: Customer): boolean {
  if (!ctx.userId) return false;
  void order;
  return customer.userId === ctx.userId;
}

export function canCancelOrder(ctx: AuthContext, order: Order, customer: Customer): boolean {
  if (!ctx.userId) return false;
  if (customer.userId !== ctx.userId) return false;
  return order.status === "pending";
}

export function canCheckout(ctx: AuthContext): boolean {
  return !!ctx.userId;
}

export function canManageProducts(ctx: AuthContext, adminIds: string[]): boolean {
  if (!ctx.userId) return false;
  return adminIds.includes(ctx.userId);
}

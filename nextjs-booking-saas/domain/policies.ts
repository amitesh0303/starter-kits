/**
 * Deny-by-default authorization policies for the Booking SaaS.
 * All access checks return false unless an explicit allow condition is met.
 */

import type { Booking, Provider } from "./entities";

export interface AuthContext {
  userId: string;
}

/**
 * Check if the user can manage a provider profile (must be the provider's own user).
 */
export function canManageProvider(
  ctx: AuthContext | null,
  provider: Provider
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return ctx.userId === provider.userId;
}

/**
 * Check if the user can create a booking (any authenticated user).
 */
export function canCreateBooking(ctx: AuthContext | null): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return true;
}

/**
 * Check if the user can cancel a booking (booking customer or provider).
 */
export function canCancelBooking(
  ctx: AuthContext | null,
  booking: Booking,
  provider: Provider
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return ctx.userId === booking.customerId || ctx.userId === provider.userId;
}

/**
 * Check if the user can view a booking (booking customer or provider).
 */
export function canViewBooking(
  ctx: AuthContext | null,
  booking: Booking,
  provider: Provider
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return ctx.userId === booking.customerId || ctx.userId === provider.userId;
}

/**
 * Check if the user can manage availability (provider only).
 */
export function canManageAvailability(
  ctx: AuthContext | null,
  provider: Provider
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return ctx.userId === provider.userId;
}

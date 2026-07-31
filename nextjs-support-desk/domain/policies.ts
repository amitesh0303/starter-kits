/**
 * Deny-by-default authorization policies for the Support Desk.
 * All access checks return false unless an explicit allow condition is met.
 * Ownership-based: ticket customer or team agent can access.
 */

import type { Ticket, Agent, AgentRole } from "./entities";

export interface AuthContext {
  userId: string;
  role?: AgentRole;
  teamId?: string;
}

/**
 * Check if the user can create a ticket (any authenticated user).
 */
export function canCreateTicket(ctx: AuthContext | null): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return true;
}

/**
 * Check if the user can view a ticket.
 * Allowed: ticket customer OR any agent on the ticket's team.
 */
export function canViewTicket(
  ctx: AuthContext | null,
  ticket: Ticket,
  teamAgents: Agent[]
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  // Ticket customer can view their own ticket
  if (ctx.userId === ticket.customerId) return true;
  // Any agent on the team can view team tickets
  return teamAgents.some((a) => a.userId === ctx.userId && a.teamId === ticket.teamId);
}

/**
 * Check if the user can reply to a ticket.
 * Allowed: ticket customer OR any agent on the ticket's team.
 */
export function canReplyToTicket(
  ctx: AuthContext | null,
  ticket: Ticket,
  teamAgents: Agent[]
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  // Ticket customer can reply
  if (ctx.userId === ticket.customerId) return true;
  // Any team agent can reply
  return teamAgents.some((a) => a.userId === ctx.userId && a.teamId === ticket.teamId);
}

/**
 * Check if the user can assign a ticket to an agent.
 * Allowed: admin agent on the ticket's team.
 */
export function canAssignTicket(
  ctx: AuthContext | null,
  ticket: Ticket,
  teamAgents: Agent[]
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return teamAgents.some(
    (a) => a.userId === ctx.userId && a.teamId === ticket.teamId && a.role === "admin"
  );
}

/**
 * Check if the user can close a ticket.
 * Allowed: ticket customer OR any agent on the ticket's team.
 */
export function canCloseTicket(
  ctx: AuthContext | null,
  ticket: Ticket,
  teamAgents: Agent[]
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  // Customer can close their own ticket
  if (ctx.userId === ticket.customerId) return true;
  // Any team agent can close
  return teamAgents.some((a) => a.userId === ctx.userId && a.teamId === ticket.teamId);
}

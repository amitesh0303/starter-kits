/**
 * Authorization policies for collaboration.
 */

import type { Document, Board } from "./entities";

export interface AuthContext {
  userId: string;
}

export function canViewDocument(ctx: AuthContext, doc: Document): boolean {
  if (!ctx.userId) return false;
  return doc.ownerId === ctx.userId || doc.collaboratorIds.includes(ctx.userId);
}

export function canEditDocument(ctx: AuthContext, doc: Document): boolean {
  if (!ctx.userId) return false;
  return doc.ownerId === ctx.userId || doc.collaboratorIds.includes(ctx.userId);
}

export function canDeleteDocument(ctx: AuthContext, doc: Document): boolean {
  if (!ctx.userId) return false;
  return doc.ownerId === ctx.userId;
}

export function canViewBoard(ctx: AuthContext, board: Board): boolean {
  if (!ctx.userId) return false;
  return board.ownerId === ctx.userId || board.collaboratorIds.includes(ctx.userId);
}

export function canInviteCollaborator(ctx: AuthContext, doc: Document): boolean {
  if (!ctx.userId) return false;
  return doc.ownerId === ctx.userId;
}

/**
 * Prisma-based repository for all domain entities.
 * Server-only module providing data access functions.
 */

import type {
  Workspace,
  Conversation,
  Message,
  Generation,
  Entitlement,
  ProcessedEvent,
} from "@/domain/entities";

// --- Repository Interfaces ---

export interface WorkspaceRepository {
  findById(id: string): Promise<Workspace | null>;
  findByOwnerId(ownerId: string): Promise<Workspace[]>;
  create(data: Omit<Workspace, "id" | "createdAt" | "updatedAt">): Promise<Workspace>;
}

export interface ConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findByWorkspaceId(workspaceId: string): Promise<Conversation[]>;
  create(data: Omit<Conversation, "id" | "createdAt" | "updatedAt">): Promise<Conversation>;
}

export interface MessageRepository {
  findByConversationId(conversationId: string): Promise<Message[]>;
  create(data: Omit<Message, "id" | "createdAt">): Promise<Message>;
}

export interface GenerationRepository {
  findByWorkspaceId(workspaceId: string): Promise<Generation[]>;
  create(data: Omit<Generation, "id" | "createdAt">): Promise<Generation>;
  countByWorkspaceId(workspaceId: string): Promise<number>;
}

export interface EntitlementRepository {
  findByWorkspaceId(workspaceId: string): Promise<Entitlement | null>;
  upsertBySubscriptionId(data: {
    workspaceId: string;
    lemonSqueezyCustomerId: string;
    lemonSqueezySubscriptionId: string;
    lemonSqueezyVariantId: string;
    status: Entitlement["status"];
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }): Promise<Entitlement>;
  updateStatus(
    subscriptionId: string,
    data: {
      status: Entitlement["status"];
      currentPeriodEnd?: Date;
      cancelAtPeriodEnd?: boolean;
    }
  ): Promise<void>;
}

export interface ProcessedEventRepository {
  exists(providerEventId: string): Promise<boolean>;
  create(data: { providerEventId: string; eventType: string }): Promise<ProcessedEvent>;
}

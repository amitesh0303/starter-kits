/**
 * Domain entity types for the Support Desk application.
 * Core business objects: teams, agents, tickets, messages, and attachments.
 */

export type AgentRole = "admin" | "agent";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type AuthorType = "customer" | "agent";

export interface Team {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  teamId: string;
  userId: string;
  email: string;
  name: string;
  role: AgentRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  teamId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedAgentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  ticketId: string;
  authorId: string;
  authorType: AuthorType;
  content: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  messageId: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

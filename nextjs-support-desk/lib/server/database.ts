/**
 * Database repository layer using Prisma.
 * Provides typed access to teams, agents, tickets, messages, and attachments.
 * In test/development, use in-memory fakes.
 */

import type {
  Team,
  Agent,
  AgentRole,
  Ticket,
  TicketStatus,
  TicketPriority,
  Message,
  AuthorType,
  Attachment,
} from "@/domain/entities";

// --- Repository Interfaces ---

export interface TeamRepository {
  findById(id: string): Promise<Team | null>;
  create(team: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team>;
}

export interface AgentRepository {
  findById(id: string): Promise<Agent | null>;
  findByUserId(userId: string): Promise<Agent | null>;
  findByTeam(teamId: string): Promise<Agent[]>;
  create(agent: Omit<Agent, "id" | "createdAt" | "updatedAt">): Promise<Agent>;
}

export interface TicketRepository {
  findById(id: string): Promise<Ticket | null>;
  findByTeam(teamId: string): Promise<Ticket[]>;
  findByCustomer(customerId: string): Promise<Ticket[]>;
  create(ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt">): Promise<Ticket>;
  updateStatus(id: string, status: TicketStatus): Promise<Ticket | null>;
  assignAgent(id: string, agentId: string): Promise<Ticket | null>;
}

export interface MessageRepository {
  findById(id: string): Promise<Message | null>;
  findByTicket(ticketId: string): Promise<Message[]>;
  create(message: Omit<Message, "id" | "createdAt">): Promise<Message>;
}

export interface AttachmentRepository {
  findById(id: string): Promise<Attachment | null>;
  findByMessage(messageId: string): Promise<Attachment[]>;
  create(attachment: Omit<Attachment, "id" | "createdAt">): Promise<Attachment>;
  delete(id: string): Promise<void>;
}

// --- In-Memory Fake Repositories (for testing) ---

export class InMemoryTeamRepository implements TeamRepository {
  private teams: Map<string, Team> = new Map();

  async findById(id: string): Promise<Team | null> {
    return this.teams.get(id) ?? null;
  }

  async create(data: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team> {
    const team: Team = {
      ...data,
      id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.teams.set(team.id, team);
    return team;
  }
}

export class InMemoryAgentRepository implements AgentRepository {
  private agents: Map<string, Agent> = new Map();

  async findById(id: string): Promise<Agent | null> {
    return this.agents.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Agent | null> {
    for (const a of this.agents.values()) {
      if (a.userId === userId) return a;
    }
    return null;
  }

  async findByTeam(teamId: string): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter((a) => a.teamId === teamId);
  }

  async create(data: Omit<Agent, "id" | "createdAt" | "updatedAt">): Promise<Agent> {
    const agent: Agent = {
      ...data,
      id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.agents.set(agent.id, agent);
    return agent;
  }
}

export class InMemoryTicketRepository implements TicketRepository {
  private tickets: Map<string, Ticket> = new Map();

  async findById(id: string): Promise<Ticket | null> {
    return this.tickets.get(id) ?? null;
  }

  async findByTeam(teamId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter((t) => t.teamId === teamId);
  }

  async findByCustomer(customerId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter((t) => t.customerId === customerId);
  }

  async create(data: Omit<Ticket, "id" | "createdAt" | "updatedAt">): Promise<Ticket> {
    const ticket: Ticket = {
      ...data,
      id: `ticket_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket | null> {
    const t = this.tickets.get(id);
    if (!t) return null;
    const updated = { ...t, status, updatedAt: new Date() };
    this.tickets.set(id, updated);
    return updated;
  }

  async assignAgent(id: string, agentId: string): Promise<Ticket | null> {
    const t = this.tickets.get(id);
    if (!t) return null;
    const updated = { ...t, assignedAgentId: agentId, updatedAt: new Date() };
    this.tickets.set(id, updated);
    return updated;
  }
}

export class InMemoryMessageRepository implements MessageRepository {
  private messages: Map<string, Message> = new Map();

  async findById(id: string): Promise<Message | null> {
    return this.messages.get(id) ?? null;
  }

  async findByTicket(ticketId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter((m) => m.ticketId === ticketId);
  }

  async create(data: Omit<Message, "id" | "createdAt">): Promise<Message> {
    const message: Message = {
      ...data,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }
}

export class InMemoryAttachmentRepository implements AttachmentRepository {
  private attachments: Map<string, Attachment> = new Map();

  async findById(id: string): Promise<Attachment | null> {
    return this.attachments.get(id) ?? null;
  }

  async findByMessage(messageId: string): Promise<Attachment[]> {
    return Array.from(this.attachments.values()).filter(
      (a) => a.messageId === messageId
    );
  }

  async create(data: Omit<Attachment, "id" | "createdAt">): Promise<Attachment> {
    const attachment: Attachment = {
      ...data,
      id: `attach_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
    };
    this.attachments.set(attachment.id, attachment);
    return attachment;
  }

  async delete(id: string): Promise<void> {
    this.attachments.delete(id);
  }
}

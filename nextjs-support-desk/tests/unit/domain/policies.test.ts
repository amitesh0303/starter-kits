/**
 * Unit tests for domain authorization policies.
 * Tests ownership-based and role-based access control.
 */

import { describe, it, expect } from "vitest";
import {
  canCreateTicket,
  canViewTicket,
  canReplyToTicket,
  canAssignTicket,
  canCloseTicket,
} from "@/domain/policies";
import type { AuthContext } from "@/domain/policies";
import type { Ticket, Agent } from "@/domain/entities";

const teamId = "team_1";

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "ticket_1",
    teamId,
    customerId: "customer_1",
    customerEmail: "customer@test.com",
    customerName: "Test Customer",
    subject: "Test ticket",
    status: "open",
    priority: "medium",
    assignedAgentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent_1",
    teamId,
    userId: "agent_user_1",
    email: "agent@test.com",
    name: "Agent One",
    role: "agent",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("canCreateTicket", () => {
  it("denies null context", () => {
    expect(canCreateTicket(null)).toBe(false);
  });

  it("denies empty userId", () => {
    expect(canCreateTicket({ userId: "" })).toBe(false);
  });

  it("allows any authenticated user", () => {
    expect(canCreateTicket({ userId: "user_1" })).toBe(true);
  });
});

describe("canViewTicket", () => {
  const ticket = makeTicket();
  const teamAgents = [makeAgent()];

  it("denies null context", () => {
    expect(canViewTicket(null, ticket, teamAgents)).toBe(false);
  });

  it("denies empty userId", () => {
    expect(canViewTicket({ userId: "" }, ticket, teamAgents)).toBe(false);
  });

  it("allows ticket customer", () => {
    const ctx: AuthContext = { userId: "customer_1" };
    expect(canViewTicket(ctx, ticket, teamAgents)).toBe(true);
  });

  it("allows team agent", () => {
    const ctx: AuthContext = { userId: "agent_user_1" };
    expect(canViewTicket(ctx, ticket, teamAgents)).toBe(true);
  });

  it("denies unrelated user", () => {
    const ctx: AuthContext = { userId: "random_user" };
    expect(canViewTicket(ctx, ticket, teamAgents)).toBe(false);
  });

  it("denies agent from different team", () => {
    const otherTeamAgents = [makeAgent({ teamId: "other_team", userId: "other_user" })];
    const ctx: AuthContext = { userId: "other_user" };
    expect(canViewTicket(ctx, ticket, otherTeamAgents)).toBe(false);
  });
});

describe("canReplyToTicket", () => {
  const ticket = makeTicket();
  const teamAgents = [makeAgent()];

  it("denies null context", () => {
    expect(canReplyToTicket(null, ticket, teamAgents)).toBe(false);
  });

  it("allows ticket customer", () => {
    const ctx: AuthContext = { userId: "customer_1" };
    expect(canReplyToTicket(ctx, ticket, teamAgents)).toBe(true);
  });

  it("allows team agent", () => {
    const ctx: AuthContext = { userId: "agent_user_1" };
    expect(canReplyToTicket(ctx, ticket, teamAgents)).toBe(true);
  });

  it("denies unrelated user", () => {
    const ctx: AuthContext = { userId: "random_user" };
    expect(canReplyToTicket(ctx, ticket, teamAgents)).toBe(false);
  });
});

describe("canAssignTicket", () => {
  const ticket = makeTicket();
  const adminAgent = makeAgent({ role: "admin", userId: "admin_user_1" });
  const regularAgent = makeAgent({ role: "agent", userId: "agent_user_1" });

  it("denies null context", () => {
    expect(canAssignTicket(null, ticket, [adminAgent, regularAgent])).toBe(false);
  });

  it("allows admin agent on the team", () => {
    const ctx: AuthContext = { userId: "admin_user_1" };
    expect(canAssignTicket(ctx, ticket, [adminAgent, regularAgent])).toBe(true);
  });

  it("denies regular agent", () => {
    const ctx: AuthContext = { userId: "agent_user_1" };
    expect(canAssignTicket(ctx, ticket, [adminAgent, regularAgent])).toBe(false);
  });

  it("denies customer", () => {
    const ctx: AuthContext = { userId: "customer_1" };
    expect(canAssignTicket(ctx, ticket, [adminAgent, regularAgent])).toBe(false);
  });
});

describe("canCloseTicket", () => {
  const ticket = makeTicket();
  const teamAgents = [makeAgent()];

  it("denies null context", () => {
    expect(canCloseTicket(null, ticket, teamAgents)).toBe(false);
  });

  it("allows ticket customer", () => {
    const ctx: AuthContext = { userId: "customer_1" };
    expect(canCloseTicket(ctx, ticket, teamAgents)).toBe(true);
  });

  it("allows team agent", () => {
    const ctx: AuthContext = { userId: "agent_user_1" };
    expect(canCloseTicket(ctx, ticket, teamAgents)).toBe(true);
  });

  it("denies unrelated user", () => {
    const ctx: AuthContext = { userId: "random_user" };
    expect(canCloseTicket(ctx, ticket, teamAgents)).toBe(false);
  });
});

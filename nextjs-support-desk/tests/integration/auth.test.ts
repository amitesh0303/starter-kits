/**
 * Integration tests for authenticated/unauthenticated access.
 */

import { describe, it, expect } from "vitest";
import { requireAuth, getOptionalAuth } from "@/lib/server/auth";
import { AuthenticationError } from "@/lib/server/errors";
import {
  canCreateTicket,
  canViewTicket,
  canReplyToTicket,
  canAssignTicket,
  canCloseTicket,
} from "@/domain/policies";
import type { Ticket, Agent } from "@/domain/entities";

const teamId = "team_1";

const ticket: Ticket = {
  id: "ticket_1",
  teamId,
  customerId: "customer_1",
  customerEmail: "customer@test.com",
  customerName: "Test Customer",
  subject: "Test",
  status: "open",
  priority: "medium",
  assignedAgentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const teamAgents: Agent[] = [
  {
    id: "agent_1",
    teamId,
    userId: "agent_user_1",
    email: "agent@test.com",
    name: "Agent One",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("Authentication", () => {
  it("requireAuth throws for null userId", () => {
    expect(() => requireAuth({ userId: null })).toThrow(AuthenticationError);
  });

  it("requireAuth returns context for valid userId", () => {
    const ctx = requireAuth({ userId: "user_1" });
    expect(ctx.userId).toBe("user_1");
  });

  it("getOptionalAuth returns null for null userId", () => {
    expect(getOptionalAuth({ userId: null })).toBeNull();
  });

  it("getOptionalAuth returns context for valid userId", () => {
    const ctx = getOptionalAuth({ userId: "user_1" });
    expect(ctx?.userId).toBe("user_1");
  });
});

describe("Unauthenticated access denied", () => {
  it("canCreateTicket denied", () => {
    expect(canCreateTicket(null)).toBe(false);
  });

  it("canViewTicket denied", () => {
    expect(canViewTicket(null, ticket, teamAgents)).toBe(false);
  });

  it("canReplyToTicket denied", () => {
    expect(canReplyToTicket(null, ticket, teamAgents)).toBe(false);
  });

  it("canAssignTicket denied", () => {
    expect(canAssignTicket(null, ticket, teamAgents)).toBe(false);
  });

  it("canCloseTicket denied", () => {
    expect(canCloseTicket(null, ticket, teamAgents)).toBe(false);
  });
});

describe("Authenticated access with proper ownership", () => {
  it("customer can create ticket", () => {
    expect(canCreateTicket({ userId: "customer_1" })).toBe(true);
  });

  it("customer can view own ticket", () => {
    expect(canViewTicket({ userId: "customer_1" }, ticket, teamAgents)).toBe(true);
  });

  it("agent can view team ticket", () => {
    expect(canViewTicket({ userId: "agent_user_1" }, ticket, teamAgents)).toBe(true);
  });

  it("customer can reply to own ticket", () => {
    expect(canReplyToTicket({ userId: "customer_1" }, ticket, teamAgents)).toBe(true);
  });

  it("agent can reply to team ticket", () => {
    expect(canReplyToTicket({ userId: "agent_user_1" }, ticket, teamAgents)).toBe(true);
  });

  it("admin agent can assign ticket", () => {
    expect(canAssignTicket({ userId: "agent_user_1" }, ticket, teamAgents)).toBe(true);
  });

  it("customer can close own ticket", () => {
    expect(canCloseTicket({ userId: "customer_1" }, ticket, teamAgents)).toBe(true);
  });

  it("agent can close team ticket", () => {
    expect(canCloseTicket({ userId: "agent_user_1" }, ticket, teamAgents)).toBe(true);
  });
});

describe("Unauthorized access denied", () => {
  it("random user cannot view ticket", () => {
    expect(canViewTicket({ userId: "random" }, ticket, teamAgents)).toBe(false);
  });

  it("random user cannot reply to ticket", () => {
    expect(canReplyToTicket({ userId: "random" }, ticket, teamAgents)).toBe(false);
  });

  it("regular agent cannot assign ticket", () => {
    const regularAgents: Agent[] = [
      { ...teamAgents[0], role: "agent" },
    ];
    expect(canAssignTicket({ userId: "agent_user_1" }, ticket, regularAgents)).toBe(false);
  });

  it("random user cannot close ticket", () => {
    expect(canCloseTicket({ userId: "random" }, ticket, teamAgents)).toBe(false);
  });
});

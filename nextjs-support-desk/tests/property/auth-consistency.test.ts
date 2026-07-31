/**
 * Property 4: Authentication and access consistency.
 * For any identity state and resource ownership:
 * - Unauthenticated access is always denied
 * - Unauthorized access (wrong user, not on team) is always denied
 * - Valid access requires authentication AND correct ownership/membership
 * Uses fast-check to generate random auth contexts and entities.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  canCreateTicket,
  canViewTicket,
  canReplyToTicket,
  canAssignTicket,
  canCloseTicket,
} from "@/domain/policies";
import type { AuthContext } from "@/domain/policies";
import type { Ticket, Agent, AgentRole, TicketStatus, TicketPriority } from "@/domain/entities";

// Arbitrary generators
const userIdArb = fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 20 });
const roleArb = fc.constantFrom<AgentRole>("admin", "agent");
const ticketStatusArb = fc.constantFrom<TicketStatus>(
  "open",
  "in_progress",
  "resolved",
  "closed"
);
const ticketPriorityArb = fc.constantFrom<TicketPriority>(
  "low",
  "medium",
  "high",
  "urgent"
);

const teamIdArb = fc.uuid();

const ticketArb = (teamId: string) =>
  fc.record({
    id: fc.uuid(),
    teamId: fc.constant(teamId),
    customerId: userIdArb,
    customerEmail: fc.string({ minLength: 5, maxLength: 20 }).map((s) => `${s}@test.com`),
    customerName: fc.string({ minLength: 1, maxLength: 30 }),
    subject: fc.string({ minLength: 1, maxLength: 50 }),
    status: ticketStatusArb,
    priority: ticketPriorityArb,
    assignedAgentId: fc.option(fc.uuid(), { nil: null }),
    createdAt: fc.date(),
    updatedAt: fc.date(),
  });

const agentArb = (teamId: string) =>
  fc.record({
    id: fc.uuid(),
    teamId: fc.constant(teamId),
    userId: userIdArb,
    email: fc.string({ minLength: 5, maxLength: 20 }).map((s) => `${s}@test.com`),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    role: roleArb,
    createdAt: fc.date(),
    updatedAt: fc.date(),
  });

describe("Property 4: Authentication and Access Consistency", () => {
  it("unauthenticated (null context) is always denied for canCreateTicket", () => {
    expect(canCreateTicket(null)).toBe(false);
  });

  it("unauthenticated (empty userId) is always denied for canCreateTicket", () => {
    expect(canCreateTicket({ userId: "" })).toBe(false);
  });

  it("any authenticated user can create tickets", () => {
    fc.assert(
      fc.property(userIdArb, (userId) => {
        expect(canCreateTicket({ userId })).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it("unauthenticated always denied for canViewTicket", () => {
    fc.assert(
      fc.property(teamIdArb, (teamId) => {
        return fc.assert(
          fc.property(
            ticketArb(teamId),
            agentArb(teamId),
            (ticket, agent) => {
              expect(canViewTicket(null, ticket, [agent])).toBe(false);
              expect(canViewTicket({ userId: "" }, ticket, [agent])).toBe(false);
            }
          ),
          { numRuns: 10 }
        );
      }),
      { numRuns: 20 }
    );
  });

  it("unauthenticated always denied for canReplyToTicket", () => {
    fc.assert(
      fc.property(teamIdArb, (teamId) => {
        return fc.assert(
          fc.property(
            ticketArb(teamId),
            agentArb(teamId),
            (ticket, agent) => {
              expect(canReplyToTicket(null, ticket, [agent])).toBe(false);
              expect(canReplyToTicket({ userId: "" }, ticket, [agent])).toBe(false);
            }
          ),
          { numRuns: 10 }
        );
      }),
      { numRuns: 20 }
    );
  });

  it("unauthenticated always denied for canAssignTicket", () => {
    fc.assert(
      fc.property(teamIdArb, (teamId) => {
        return fc.assert(
          fc.property(
            ticketArb(teamId),
            agentArb(teamId),
            (ticket, agent) => {
              expect(canAssignTicket(null, ticket, [agent])).toBe(false);
              expect(canAssignTicket({ userId: "" }, ticket, [agent])).toBe(false);
            }
          ),
          { numRuns: 10 }
        );
      }),
      { numRuns: 20 }
    );
  });

  it("unauthenticated always denied for canCloseTicket", () => {
    fc.assert(
      fc.property(teamIdArb, (teamId) => {
        return fc.assert(
          fc.property(
            ticketArb(teamId),
            agentArb(teamId),
            (ticket, agent) => {
              expect(canCloseTicket(null, ticket, [agent])).toBe(false);
              expect(canCloseTicket({ userId: "" }, ticket, [agent])).toBe(false);
            }
          ),
          { numRuns: 10 }
        );
      }),
      { numRuns: 20 }
    );
  });

  it("ticket customer can always view their own ticket", () => {
    fc.assert(
      fc.property(teamIdArb, (teamId) => {
        return fc.assert(
          fc.property(
            ticketArb(teamId),
            agentArb(teamId),
            (ticket, agent) => {
              const ctx: AuthContext = { userId: ticket.customerId };
              expect(canViewTicket(ctx, ticket, [agent])).toBe(true);
            }
          ),
          { numRuns: 10 }
        );
      }),
      { numRuns: 20 }
    );
  });

  it("ticket customer can always reply to their own ticket", () => {
    fc.assert(
      fc.property(teamIdArb, (teamId) => {
        return fc.assert(
          fc.property(
            ticketArb(teamId),
            agentArb(teamId),
            (ticket, agent) => {
              const ctx: AuthContext = { userId: ticket.customerId };
              expect(canReplyToTicket(ctx, ticket, [agent])).toBe(true);
            }
          ),
          { numRuns: 10 }
        );
      }),
      { numRuns: 20 }
    );
  });

  it("ticket customer can always close their own ticket", () => {
    fc.assert(
      fc.property(teamIdArb, (teamId) => {
        return fc.assert(
          fc.property(
            ticketArb(teamId),
            agentArb(teamId),
            (ticket, agent) => {
              const ctx: AuthContext = { userId: ticket.customerId };
              expect(canCloseTicket(ctx, ticket, [agent])).toBe(true);
            }
          ),
          { numRuns: 10 }
        );
      }),
      { numRuns: 20 }
    );
  });

  it("team agent can view team tickets", () => {
    fc.assert(
      fc.property(teamIdArb, (teamId) => {
        return fc.assert(
          fc.property(
            ticketArb(teamId),
            agentArb(teamId),
            (ticket, agent) => {
              const ctx: AuthContext = { userId: agent.userId };
              expect(canViewTicket(ctx, ticket, [agent])).toBe(true);
            }
          ),
          { numRuns: 10 }
        );
      }),
      { numRuns: 20 }
    );
  });

  it("team agent can reply to team tickets", () => {
    fc.assert(
      fc.property(teamIdArb, (teamId) => {
        return fc.assert(
          fc.property(
            ticketArb(teamId),
            agentArb(teamId),
            (ticket, agent) => {
              const ctx: AuthContext = { userId: agent.userId };
              expect(canReplyToTicket(ctx, ticket, [agent])).toBe(true);
            }
          ),
          { numRuns: 10 }
        );
      }),
      { numRuns: 20 }
    );
  });

  it("only admin agents can assign tickets", () => {
    fc.assert(
      fc.property(teamIdArb, (teamId) => {
        return fc.assert(
          fc.property(
            ticketArb(teamId),
            agentArb(teamId),
            (ticket, agent) => {
              const ctx: AuthContext = { userId: agent.userId };
              const result = canAssignTicket(ctx, ticket, [agent]);
              const expected = agent.role === "admin";
              expect(result).toBe(expected);
            }
          ),
          { numRuns: 10 }
        );
      }),
      { numRuns: 20 }
    );
  });

  it("non-team user cannot view, reply, assign, or close ticket", () => {
    fc.assert(
      fc.property(
        teamIdArb,
        userIdArb,
        (teamId, randomUserId) => {
          return fc.assert(
            fc.property(
              ticketArb(teamId),
              agentArb(teamId),
              (ticket, agent) => {
                // Only test when random user is neither customer nor team agent
                if (randomUserId === ticket.customerId) return;
                if (randomUserId === agent.userId) return;

                const ctx: AuthContext = { userId: randomUserId };
                expect(canViewTicket(ctx, ticket, [agent])).toBe(false);
                expect(canReplyToTicket(ctx, ticket, [agent])).toBe(false);
                expect(canAssignTicket(ctx, ticket, [agent])).toBe(false);
                expect(canCloseTicket(ctx, ticket, [agent])).toBe(false);
              }
            ),
            { numRuns: 10 }
          );
        }
      ),
      { numRuns: 20 }
    );
  });
});

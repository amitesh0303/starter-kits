/**
 * Integration tests for the ticket lifecycle: create, reply, close.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  InMemoryTeamRepository,
  InMemoryAgentRepository,
  InMemoryTicketRepository,
  InMemoryMessageRepository,
  InMemoryAttachmentRepository,
} from "@/lib/server/database";
import { FakeObjectStoreAdapter } from "@/lib/server/storage-fake";
import { FakeMailAdapter } from "@/lib/server/mail-fake";
import { validateFile } from "@/lib/server/storage";
import {
  canViewTicket,
  canReplyToTicket,
  canCloseTicket,
  canAssignTicket,
} from "@/domain/policies";
import type { AuthContext } from "@/domain/policies";
import type { Agent, Ticket } from "@/domain/entities";

describe("Ticket Lifecycle Integration", () => {
  let teamRepo: InMemoryTeamRepository;
  let agentRepo: InMemoryAgentRepository;
  let ticketRepo: InMemoryTicketRepository;
  let messageRepo: InMemoryMessageRepository;
  let attachmentRepo: InMemoryAttachmentRepository;
  let storage: FakeObjectStoreAdapter;
  let mail: FakeMailAdapter;

  beforeEach(() => {
    teamRepo = new InMemoryTeamRepository();
    agentRepo = new InMemoryAgentRepository();
    ticketRepo = new InMemoryTicketRepository();
    messageRepo = new InMemoryMessageRepository();
    attachmentRepo = new InMemoryAttachmentRepository();
    storage = new FakeObjectStoreAdapter();
    mail = new FakeMailAdapter();
  });

  async function setupTeamAndAgent() {
    const team = await teamRepo.create({ name: "Support Team" });
    const agent = await agentRepo.create({
      teamId: team.id,
      userId: "agent_user_1",
      email: "agent@company.com",
      name: "Agent Smith",
      role: "admin",
    });
    return { team, agent };
  }

  it("creates a ticket and sends notification", async () => {
    const { team } = await setupTeamAndAgent();

    // Customer creates ticket
    const ticket = await ticketRepo.create({
      teamId: team.id,
      customerId: "customer_1",
      customerEmail: "customer@example.com",
      customerName: "Jane Doe",
      subject: "Cannot login to my account",
      status: "open",
      priority: "high",
      assignedAgentId: null,
    });

    // Send notification
    await mail.sendTicketCreatedNotification({
      to: "agent@company.com",
      ticketId: ticket.id,
      subject: ticket.subject,
      customerName: ticket.customerName,
      teamName: team.name,
    });

    expect(ticket.status).toBe("open");
    expect(ticket.customerId).toBe("customer_1");
    expect(mail.hasTicketCreatedTo("agent@company.com")).toBe(true);
  });

  it("customer can reply to their own ticket", async () => {
    const { team, agent } = await setupTeamAndAgent();
    const teamAgents = await agentRepo.findByTeam(team.id);

    const ticket = await ticketRepo.create({
      teamId: team.id,
      customerId: "customer_1",
      customerEmail: "customer@example.com",
      customerName: "Jane Doe",
      subject: "Issue with billing",
      status: "open",
      priority: "medium",
      assignedAgentId: null,
    });

    const ctx: AuthContext = { userId: "customer_1" };
    expect(canReplyToTicket(ctx, ticket, teamAgents)).toBe(true);

    const message = await messageRepo.create({
      ticketId: ticket.id,
      authorId: "customer_1",
      authorType: "customer",
      content: "I still cannot access my account.",
    });

    expect(message.ticketId).toBe(ticket.id);
    expect(message.authorType).toBe("customer");
  });

  it("agent can reply and update ticket status", async () => {
    const { team, agent } = await setupTeamAndAgent();
    const teamAgents = await agentRepo.findByTeam(team.id);

    const ticket = await ticketRepo.create({
      teamId: team.id,
      customerId: "customer_1",
      customerEmail: "customer@example.com",
      customerName: "Jane Doe",
      subject: "Account locked",
      status: "open",
      priority: "urgent",
      assignedAgentId: null,
    });

    const agentCtx: AuthContext = { userId: "agent_user_1" };
    expect(canReplyToTicket(agentCtx, ticket, teamAgents)).toBe(true);

    const reply = await messageRepo.create({
      ticketId: ticket.id,
      authorId: "agent_user_1",
      authorType: "agent",
      content: "I have unlocked your account. Please try again.",
    });

    const updatedTicket = await ticketRepo.updateStatus(ticket.id, "in_progress");

    // Send notification to customer
    await mail.sendNewReplyNotification({
      to: "customer@example.com",
      ticketId: ticket.id,
      subject: ticket.subject,
      authorName: agent.name,
      preview: reply.content.slice(0, 100),
    });

    expect(updatedTicket?.status).toBe("in_progress");
    expect(mail.hasReplyNotificationTo("customer@example.com")).toBe(true);
  });

  it("admin can assign ticket to agent", async () => {
    const { team, agent } = await setupTeamAndAgent();
    const teamAgents = await agentRepo.findByTeam(team.id);

    const ticket = await ticketRepo.create({
      teamId: team.id,
      customerId: "customer_1",
      customerEmail: "customer@example.com",
      customerName: "Jane Doe",
      subject: "Feature request",
      status: "open",
      priority: "low",
      assignedAgentId: null,
    });

    const adminCtx: AuthContext = { userId: "agent_user_1" };
    expect(canAssignTicket(adminCtx, ticket, teamAgents)).toBe(true);

    const assigned = await ticketRepo.assignAgent(ticket.id, agent.id);
    expect(assigned?.assignedAgentId).toBe(agent.id);
  });

  it("ticket can be closed by customer", async () => {
    const { team } = await setupTeamAndAgent();
    const teamAgents = await agentRepo.findByTeam(team.id);

    const ticket = await ticketRepo.create({
      teamId: team.id,
      customerId: "customer_1",
      customerEmail: "customer@example.com",
      customerName: "Jane Doe",
      subject: "Resolved issue",
      status: "resolved",
      priority: "medium",
      assignedAgentId: null,
    });

    const ctx: AuthContext = { userId: "customer_1" };
    expect(canCloseTicket(ctx, ticket, teamAgents)).toBe(true);

    const closed = await ticketRepo.updateStatus(ticket.id, "closed");
    expect(closed?.status).toBe("closed");
  });

  it("handles file attachment on a message", async () => {
    const { team } = await setupTeamAndAgent();

    const ticket = await ticketRepo.create({
      teamId: team.id,
      customerId: "customer_1",
      customerEmail: "customer@example.com",
      customerName: "Jane Doe",
      subject: "Screenshot of error",
      status: "open",
      priority: "high",
      assignedAgentId: null,
    });

    const message = await messageRepo.create({
      ticketId: ticket.id,
      authorId: "customer_1",
      authorType: "customer",
      content: "Here is the screenshot of the error I see.",
    });

    // Validate and upload file
    const fileBody = Buffer.from("fake png data");
    validateFile(fileBody.length, "image/png");

    const uploadResult = await storage.uploadFile({
      key: `tickets/${ticket.id}/${message.id}/error-screenshot.png`,
      body: fileBody,
      mimeType: "image/png",
      fileName: "error-screenshot.png",
    });

    const attachment = await attachmentRepo.create({
      messageId: message.id,
      fileName: "error-screenshot.png",
      fileKey: uploadResult.key,
      fileSize: fileBody.length,
      mimeType: "image/png",
    });

    expect(attachment.messageId).toBe(message.id);
    expect(storage.hasFile(uploadResult.key)).toBe(true);
  });

  it("customer cannot view another customer's ticket", async () => {
    const { team } = await setupTeamAndAgent();
    const teamAgents = await agentRepo.findByTeam(team.id);

    const ticket = await ticketRepo.create({
      teamId: team.id,
      customerId: "customer_1",
      customerEmail: "customer1@example.com",
      customerName: "Customer One",
      subject: "Private ticket",
      status: "open",
      priority: "medium",
      assignedAgentId: null,
    });

    const otherCustomerCtx: AuthContext = { userId: "customer_2" };
    expect(canViewTicket(otherCustomerCtx, ticket, teamAgents)).toBe(false);
  });
});

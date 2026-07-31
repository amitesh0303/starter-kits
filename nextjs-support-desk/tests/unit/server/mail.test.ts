/**
 * Unit tests for the FakeMailAdapter.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { FakeMailAdapter } from "@/lib/server/mail-fake";

describe("FakeMailAdapter", () => {
  let adapter: FakeMailAdapter;

  beforeEach(() => {
    adapter = new FakeMailAdapter();
  });

  it("sends ticket created notification", async () => {
    await adapter.sendTicketCreatedNotification({
      to: "agent@test.com",
      ticketId: "ticket_1",
      subject: "Login issue",
      customerName: "John Doe",
      teamName: "Support Team",
    });

    expect(adapter.sentTicketCreated).toHaveLength(1);
    expect(adapter.sentTicketCreated[0].params.to).toBe("agent@test.com");
    expect(adapter.sentTicketCreated[0].params.ticketId).toBe("ticket_1");
  });

  it("sends new reply notification", async () => {
    await adapter.sendNewReplyNotification({
      to: "customer@test.com",
      ticketId: "ticket_1",
      subject: "Login issue",
      authorName: "Agent Smith",
      preview: "We are looking into this...",
    });

    expect(adapter.sentReplyNotifications).toHaveLength(1);
    expect(adapter.sentReplyNotifications[0].params.to).toBe("customer@test.com");
    expect(adapter.sentReplyNotifications[0].params.authorName).toBe("Agent Smith");
  });

  it("getLastTicketCreated returns null when empty", () => {
    expect(adapter.getLastTicketCreated()).toBeNull();
  });

  it("getLastTicketCreated returns latest", async () => {
    await adapter.sendTicketCreatedNotification({
      to: "a@test.com",
      ticketId: "t1",
      subject: "First",
      customerName: "A",
      teamName: "Team",
    });
    await adapter.sendTicketCreatedNotification({
      to: "b@test.com",
      ticketId: "t2",
      subject: "Second",
      customerName: "B",
      teamName: "Team",
    });

    const last = adapter.getLastTicketCreated();
    expect(last?.params.to).toBe("b@test.com");
  });

  it("getLastReplyNotification returns null when empty", () => {
    expect(adapter.getLastReplyNotification()).toBeNull();
  });

  it("hasTicketCreatedTo checks by email", async () => {
    await adapter.sendTicketCreatedNotification({
      to: "specific@test.com",
      ticketId: "t1",
      subject: "Test",
      customerName: "User",
      teamName: "Team",
    });

    expect(adapter.hasTicketCreatedTo("specific@test.com")).toBe(true);
    expect(adapter.hasTicketCreatedTo("other@test.com")).toBe(false);
  });

  it("hasReplyNotificationTo checks by email", async () => {
    await adapter.sendNewReplyNotification({
      to: "someone@test.com",
      ticketId: "t1",
      subject: "Test",
      authorName: "Agent",
      preview: "Hello",
    });

    expect(adapter.hasReplyNotificationTo("someone@test.com")).toBe(true);
    expect(adapter.hasReplyNotificationTo("nobody@test.com")).toBe(false);
  });

  it("reset clears all state", async () => {
    await adapter.sendTicketCreatedNotification({
      to: "a@test.com",
      ticketId: "t1",
      subject: "Test",
      customerName: "User",
      teamName: "Team",
    });
    await adapter.sendNewReplyNotification({
      to: "b@test.com",
      ticketId: "t1",
      subject: "Test",
      authorName: "Agent",
      preview: "Reply",
    });

    adapter.reset();
    expect(adapter.sentTicketCreated).toHaveLength(0);
    expect(adapter.sentReplyNotifications).toHaveLength(0);
  });
});

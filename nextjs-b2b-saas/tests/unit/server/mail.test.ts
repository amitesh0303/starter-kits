/**
 * Unit tests for Postmark fake mail adapter.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { FakeMailAdapter } from "@/lib/server/mail-fake";

describe("FakeMailAdapter", () => {
  let mail: FakeMailAdapter;

  beforeEach(() => {
    mail = new FakeMailAdapter();
  });

  describe("sendInvite", () => {
    it("records sent invite", async () => {
      await mail.sendInvite({
        to: "user@example.com",
        inviterName: "Alice",
        organizationName: "Acme Corp",
        inviteUrl: "http://localhost:3000/invite/abc",
      });

      expect(mail.sentInvites).toHaveLength(1);
      expect(mail.sentInvites[0].params.to).toBe("user@example.com");
      expect(mail.sentInvites[0].params.inviterName).toBe("Alice");
      expect(mail.sentInvites[0].params.organizationName).toBe("Acme Corp");
    });

    it("records multiple invites", async () => {
      await mail.sendInvite({
        to: "user1@example.com",
        inviterName: "Alice",
        organizationName: "Acme",
        inviteUrl: "http://localhost:3000/invite/1",
      });
      await mail.sendInvite({
        to: "user2@example.com",
        inviterName: "Bob",
        organizationName: "Acme",
        inviteUrl: "http://localhost:3000/invite/2",
      });

      expect(mail.sentInvites).toHaveLength(2);
    });
  });

  describe("getLastInvite", () => {
    it("returns null when no invites sent", () => {
      expect(mail.getLastInvite()).toBeNull();
    });

    it("returns the most recently sent invite", async () => {
      await mail.sendInvite({
        to: "first@example.com",
        inviterName: "Alice",
        organizationName: "Acme",
        inviteUrl: "http://localhost:3000/invite/1",
      });
      await mail.sendInvite({
        to: "second@example.com",
        inviterName: "Bob",
        organizationName: "Acme",
        inviteUrl: "http://localhost:3000/invite/2",
      });

      expect(mail.getLastInvite()!.params.to).toBe("second@example.com");
    });
  });

  describe("hasSentTo", () => {
    it("returns false when no invites sent", () => {
      expect(mail.hasSentTo("test@example.com")).toBe(false);
    });

    it("returns true when invite was sent to address", async () => {
      await mail.sendInvite({
        to: "target@example.com",
        inviterName: "Alice",
        organizationName: "Acme",
        inviteUrl: "http://localhost:3000/invite/1",
      });

      expect(mail.hasSentTo("target@example.com")).toBe(true);
      expect(mail.hasSentTo("other@example.com")).toBe(false);
    });
  });

  describe("reset", () => {
    it("clears all state", async () => {
      await mail.sendInvite({
        to: "user@example.com",
        inviterName: "Alice",
        organizationName: "Acme",
        inviteUrl: "http://localhost:3000/invite/1",
      });

      mail.reset();
      expect(mail.sentInvites).toHaveLength(0);
      expect(mail.getLastInvite()).toBeNull();
    });
  });
});

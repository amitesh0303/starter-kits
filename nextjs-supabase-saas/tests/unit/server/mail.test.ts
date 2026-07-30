/**
 * Unit tests for the fake mail adapter.
 * Tests: email capture without real sending, expected fields.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { FakeMailAdapter } from "@/lib/server/mail-fake";

describe("Mail Adapter (Fake)", () => {
  let mail: FakeMailAdapter;

  beforeEach(() => {
    mail = new FakeMailAdapter();
  });

  describe("Email Capture", () => {
    it("captures emails without sending to external service", async () => {
      await mail.sendWelcomeEmail({
        to: "user@example.com",
        tenantName: "Acme Inc",
      });

      expect(mail.sentEmails).toHaveLength(1);
      expect(mail.sentEmails[0].to).toBe("user@example.com");
    });

    it("resets state between tests", async () => {
      await mail.sendWelcomeEmail({
        to: "a@example.com",
        tenantName: "Test",
      });
      expect(mail.sentEmails).toHaveLength(1);

      mail.reset();
      expect(mail.sentEmails).toHaveLength(0);
    });
  });

  describe("Welcome Email", () => {
    it("contains expected fields", async () => {
      await mail.sendWelcomeEmail({
        to: "user@example.com",
        tenantName: "Acme Inc",
      });

      const email = mail.sentEmails[0];
      expect(email.type).toBe("welcome");
      expect(email.to).toBe("user@example.com");
      expect(email.subject).toContain("Acme Inc");
      expect(email.params.tenantName).toBe("Acme Inc");
      expect(email.sentAt).toBeInstanceOf(Date);
    });

    it("filters welcome emails by type", async () => {
      await mail.sendWelcomeEmail({ to: "a@test.com", tenantName: "A" });
      await mail.sendInviteEmail({
        to: "b@test.com",
        tenantName: "A",
        inviterName: "Alice",
        inviteUrl: "https://example.com/invite",
      });

      const welcomes = mail.getEmailsByType("welcome");
      expect(welcomes).toHaveLength(1);
      expect(welcomes[0].to).toBe("a@test.com");
    });
  });

  describe("Invite Email", () => {
    it("contains expected fields", async () => {
      await mail.sendInviteEmail({
        to: "invitee@example.com",
        tenantName: "Acme Inc",
        inviterName: "Alice",
        inviteUrl: "https://example.com/invite/abc",
      });

      const email = mail.sentEmails[0];
      expect(email.type).toBe("invite");
      expect(email.to).toBe("invitee@example.com");
      expect(email.subject).toContain("Acme Inc");
      expect(email.params.tenantName).toBe("Acme Inc");
      expect(email.params.inviterName).toBe("Alice");
      expect(email.params.inviteUrl).toBe("https://example.com/invite/abc");
      expect(email.sentAt).toBeInstanceOf(Date);
    });

    it("filters emails by recipient", async () => {
      await mail.sendWelcomeEmail({ to: "a@test.com", tenantName: "A" });
      await mail.sendInviteEmail({
        to: "b@test.com",
        tenantName: "A",
        inviterName: "Alice",
        inviteUrl: "https://example.com/invite",
      });

      const emails = mail.getEmailsTo("b@test.com");
      expect(emails).toHaveLength(1);
      expect(emails[0].type).toBe("invite");
    });
  });
});

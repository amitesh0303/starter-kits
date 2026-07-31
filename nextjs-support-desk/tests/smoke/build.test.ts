/**
 * Smoke test: verifies key project entry points and module resolution.
 */

import { describe, it, expect } from "vitest";

describe("Smoke Test", () => {
  it("domain entities module can be imported", async () => {
    const entities = await import("@/domain/entities");
    expect(entities).toBeDefined();
  });

  it("domain policies module can be imported", async () => {
    const policies = await import("@/domain/policies");
    expect(policies).toBeDefined();
    expect(typeof policies.canCreateTicket).toBe("function");
    expect(typeof policies.canViewTicket).toBe("function");
    expect(typeof policies.canReplyToTicket).toBe("function");
    expect(typeof policies.canAssignTicket).toBe("function");
    expect(typeof policies.canCloseTicket).toBe("function");
  });

  it("server config module can be imported", async () => {
    const config = await import("@/lib/server/config");
    expect(config).toBeDefined();
    expect(typeof config.validateConfig).toBe("function");
    expect(typeof config.isPlaceholderValue).toBe("function");
    expect(typeof config.getRawConfig).toBe("function");
    expect(typeof config.getServerOnlyKeys).toBe("function");
    expect(typeof config.getPublicKeys).toBe("function");
  });

  it("server errors module can be imported", async () => {
    const errors = await import("@/lib/server/errors");
    expect(errors).toBeDefined();
    expect(errors.AuthenticationError).toBeDefined();
    expect(errors.AuthorizationError).toBeDefined();
    expect(errors.FileSizeError).toBeDefined();
    expect(errors.FileTypeError).toBeDefined();
    expect(errors.MailError).toBeDefined();
    expect(errors.StorageError).toBeDefined();
  });

  it("fake storage adapter can be imported and instantiated", async () => {
    const { FakeObjectStoreAdapter } = await import(
      "@/lib/server/storage-fake"
    );
    const adapter = new FakeObjectStoreAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.uploadFile).toBe("function");
    expect(typeof adapter.deleteFile).toBe("function");
    expect(typeof adapter.getSignedUrl).toBe("function");
  });

  it("fake mail adapter can be imported and instantiated", async () => {
    const { FakeMailAdapter } = await import("@/lib/server/mail-fake");
    const adapter = new FakeMailAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.sendTicketCreatedNotification).toBe("function");
    expect(typeof adapter.sendNewReplyNotification).toBe("function");
  });

  it("database repositories can be imported and instantiated", async () => {
    const db = await import("@/lib/server/database");
    const teamRepo = new db.InMemoryTeamRepository();
    const agentRepo = new db.InMemoryAgentRepository();
    const ticketRepo = new db.InMemoryTicketRepository();
    const messageRepo = new db.InMemoryMessageRepository();
    const attachmentRepo = new db.InMemoryAttachmentRepository();
    expect(teamRepo).toBeDefined();
    expect(agentRepo).toBeDefined();
    expect(ticketRepo).toBeDefined();
    expect(messageRepo).toBeDefined();
    expect(attachmentRepo).toBeDefined();
  });

  it("storage validation functions can be imported", async () => {
    const storage = await import("@/lib/server/storage");
    expect(typeof storage.validateFile).toBe("function");
    expect(typeof storage.MAX_FILE_SIZE).toBe("number");
    expect(Array.isArray(storage.ALLOWED_MIME_TYPES)).toBe(true);
  });
});

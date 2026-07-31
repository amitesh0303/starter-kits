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
    expect(typeof policies.canManageProvider).toBe("function");
    expect(typeof policies.canCreateBooking).toBe("function");
    expect(typeof policies.canCancelBooking).toBe("function");
    expect(typeof policies.canViewBooking).toBe("function");
    expect(typeof policies.canManageAvailability).toBe("function");
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
    expect(errors.WebhookVerificationError).toBeDefined();
    expect(errors.BillingError).toBeDefined();
    expect(errors.MailError).toBeDefined();
    expect(errors.BookingConflictError).toBeDefined();
    expect(errors.CalendarError).toBeDefined();
  });

  it("fake billing adapter can be imported and instantiated", async () => {
    const { FakeBillingAdapter } = await import("@/lib/server/billing-fake");
    const adapter = new FakeBillingAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.verifyWebhook).toBe("function");
    expect(typeof adapter.handleWebhookEvent).toBe("function");
    expect(typeof adapter.createPaymentIntent).toBe("function");
    expect(typeof adapter.refundPayment).toBe("function");
  });

  it("fake mail adapter can be imported and instantiated", async () => {
    const { FakeMailAdapter } = await import("@/lib/server/mail-fake");
    const adapter = new FakeMailAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.sendBookingConfirmation).toBe("function");
    expect(typeof adapter.sendCancellationNotice).toBe("function");
  });

  it("fake calendar adapter can be imported and instantiated", async () => {
    const { FakeCalendarAdapter } = await import("@/lib/server/calendar-fake");
    const adapter = new FakeCalendarAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.createEvent).toBe("function");
    expect(typeof adapter.cancelEvent).toBe("function");
  });

  it("database repositories can be imported and instantiated", async () => {
    const db = await import("@/lib/server/database");
    const providerRepo = new db.InMemoryProviderRepository();
    const availRepo = new db.InMemoryAvailabilityRepository();
    const bookingRepo = new db.InMemoryBookingRepository();
    const paymentRepo = new db.InMemoryPaymentRepository();
    const eventRepo = new db.InMemoryEventRepository();
    expect(providerRepo).toBeDefined();
    expect(availRepo).toBeDefined();
    expect(bookingRepo).toBeDefined();
    expect(paymentRepo).toBeDefined();
    expect(eventRepo).toBeDefined();
  });
});

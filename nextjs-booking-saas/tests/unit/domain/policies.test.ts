/**
 * Unit tests for booking authorization policies.
 * Tests all deny-by-default access rules.
 */

import { describe, it, expect } from "vitest";
import {
  canManageProvider,
  canCreateBooking,
  canCancelBooking,
  canViewBooking,
  canManageAvailability,
} from "@/domain/policies";
import type { AuthContext } from "@/domain/policies";
import type { Booking, Provider } from "@/domain/entities";

const provider: Provider = {
  id: "prov_1",
  userId: "user_provider",
  name: "Dr. Smith",
  email: "smith@test.com",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const booking: Booking = {
  id: "book_1",
  providerId: "prov_1",
  customerId: "user_customer",
  customerEmail: "customer@test.com",
  startTime: new Date("2025-01-15T10:00:00Z"),
  endTime: new Date("2025-01-15T11:00:00Z"),
  status: "confirmed",
  paymentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("canManageProvider", () => {
  it("denies when auth context is null", () => {
    expect(canManageProvider(null, provider)).toBe(false);
  });

  it("denies when userId is empty", () => {
    expect(canManageProvider({ userId: "" }, provider)).toBe(false);
  });

  it("denies when userId does not match provider", () => {
    expect(canManageProvider({ userId: "other_user" }, provider)).toBe(false);
  });

  it("allows when userId matches provider", () => {
    expect(canManageProvider({ userId: "user_provider" }, provider)).toBe(true);
  });
});

describe("canCreateBooking", () => {
  it("denies when auth context is null", () => {
    expect(canCreateBooking(null)).toBe(false);
  });

  it("denies when userId is empty", () => {
    expect(canCreateBooking({ userId: "" })).toBe(false);
  });

  it("allows any authenticated user", () => {
    expect(canCreateBooking({ userId: "any_user" })).toBe(true);
  });
});

describe("canCancelBooking", () => {
  it("denies when auth context is null", () => {
    expect(canCancelBooking(null, booking, provider)).toBe(false);
  });

  it("denies when userId is empty", () => {
    expect(canCancelBooking({ userId: "" }, booking, provider)).toBe(false);
  });

  it("denies when user is neither customer nor provider", () => {
    expect(canCancelBooking({ userId: "stranger" }, booking, provider)).toBe(false);
  });

  it("allows the booking customer to cancel", () => {
    expect(canCancelBooking({ userId: "user_customer" }, booking, provider)).toBe(true);
  });

  it("allows the provider to cancel", () => {
    expect(canCancelBooking({ userId: "user_provider" }, booking, provider)).toBe(true);
  });
});

describe("canViewBooking", () => {
  it("denies when auth context is null", () => {
    expect(canViewBooking(null, booking, provider)).toBe(false);
  });

  it("denies when userId is empty", () => {
    expect(canViewBooking({ userId: "" }, booking, provider)).toBe(false);
  });

  it("denies when user is neither customer nor provider", () => {
    expect(canViewBooking({ userId: "stranger" }, booking, provider)).toBe(false);
  });

  it("allows the booking customer to view", () => {
    expect(canViewBooking({ userId: "user_customer" }, booking, provider)).toBe(true);
  });

  it("allows the provider to view", () => {
    expect(canViewBooking({ userId: "user_provider" }, booking, provider)).toBe(true);
  });
});

describe("canManageAvailability", () => {
  it("denies when auth context is null", () => {
    expect(canManageAvailability(null, provider)).toBe(false);
  });

  it("denies when userId is empty", () => {
    expect(canManageAvailability({ userId: "" }, provider)).toBe(false);
  });

  it("denies when userId does not match provider", () => {
    expect(canManageAvailability({ userId: "other_user" }, provider)).toBe(false);
  });

  it("allows when userId matches provider", () => {
    expect(canManageAvailability({ userId: "user_provider" }, provider)).toBe(true);
  });
});

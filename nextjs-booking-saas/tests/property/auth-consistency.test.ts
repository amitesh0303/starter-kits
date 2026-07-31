/**
 * Property 4: Authentication and access consistency.
 * For any identity state and resource ownership:
 * - Unauthenticated access is always denied
 * - Unauthorized access (wrong user) is always denied
 * - Valid access requires authentication AND correct ownership
 * Uses fast-check to generate random auth contexts and entities.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  canManageProvider,
  canCreateBooking,
  canCancelBooking,
  canViewBooking,
  canManageAvailability,
} from "@/domain/policies";
import type { AuthContext } from "@/domain/policies";
import type { Booking, Provider, BookingStatus } from "@/domain/entities";

// Arbitrary generators
const userIdArb = fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 20 });
const bookingStatusArb = fc.constantFrom<BookingStatus>(
  "pending",
  "confirmed",
  "cancelled",
  "completed"
);

const providerArb = fc.record({
  id: fc.uuid(),
  userId: userIdArb,
  name: fc.string({ minLength: 1, maxLength: 30 }),
  email: fc.string({ minLength: 5, maxLength: 30 }).map((s) => `${s}@test.com`),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

const bookingArb = (providerId: string, providerUserId: string) =>
  fc.record({
    id: fc.uuid(),
    providerId: fc.constant(providerId),
    customerId: userIdArb,
    customerEmail: fc.string({ minLength: 5, maxLength: 20 }).map((s) => `${s}@test.com`),
    startTime: fc.date(),
    endTime: fc.date(),
    status: bookingStatusArb,
    paymentId: fc.option(fc.uuid(), { nil: null }),
    createdAt: fc.date(),
    updatedAt: fc.date(),
  });

describe("Property 4: Authentication and Access Consistency", () => {
  it("unauthenticated (null context) always denied for canManageProvider", () => {
    fc.assert(
      fc.property(providerArb, (provider) => {
        expect(canManageProvider(null, provider)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("unauthenticated (empty userId) always denied for canManageProvider", () => {
    fc.assert(
      fc.property(providerArb, (provider) => {
        expect(canManageProvider({ userId: "" }, provider)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("unauthenticated always denied for canCreateBooking", () => {
    expect(canCreateBooking(null)).toBe(false);
    expect(canCreateBooking({ userId: "" })).toBe(false);
  });

  it("any authenticated user can create bookings", () => {
    fc.assert(
      fc.property(userIdArb, (userId) => {
        expect(canCreateBooking({ userId })).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it("unauthenticated always denied for canCancelBooking", () => {
    fc.assert(
      fc.property(providerArb, (provider) => {
        const booking: Booking = {
          id: "b1",
          providerId: provider.id,
          customerId: "cust1",
          customerEmail: "c@t.com",
          startTime: new Date(),
          endTime: new Date(),
          status: "confirmed",
          paymentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(canCancelBooking(null, booking, provider)).toBe(false);
        expect(canCancelBooking({ userId: "" }, booking, provider)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("unauthenticated always denied for canViewBooking", () => {
    fc.assert(
      fc.property(providerArb, (provider) => {
        const booking: Booking = {
          id: "b1",
          providerId: provider.id,
          customerId: "cust1",
          customerEmail: "c@t.com",
          startTime: new Date(),
          endTime: new Date(),
          status: "confirmed",
          paymentId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(canViewBooking(null, booking, provider)).toBe(false);
        expect(canViewBooking({ userId: "" }, booking, provider)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("only provider's own user can manage provider", () => {
    fc.assert(
      fc.property(providerArb, userIdArb, (provider, randomUserId) => {
        const ctx: AuthContext = { userId: randomUserId };
        const result = canManageProvider(ctx, provider);
        const expected = randomUserId === provider.userId;
        expect(result).toBe(expected);
      }),
      { numRuns: 200 }
    );
  });

  it("only customer or provider can cancel booking", () => {
    fc.assert(
      fc.property(
        providerArb,
        userIdArb,
        userIdArb,
        (provider, customerId, callerUserId) => {
          const booking: Booking = {
            id: "b1",
            providerId: provider.id,
            customerId,
            customerEmail: "c@t.com",
            startTime: new Date(),
            endTime: new Date(),
            status: "confirmed",
            paymentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const ctx: AuthContext = { userId: callerUserId };
          const result = canCancelBooking(ctx, booking, provider);
          const expected =
            callerUserId === customerId || callerUserId === provider.userId;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("only customer or provider can view booking", () => {
    fc.assert(
      fc.property(
        providerArb,
        userIdArb,
        userIdArb,
        (provider, customerId, callerUserId) => {
          const booking: Booking = {
            id: "b1",
            providerId: provider.id,
            customerId,
            customerEmail: "c@t.com",
            startTime: new Date(),
            endTime: new Date(),
            status: "confirmed",
            paymentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const ctx: AuthContext = { userId: callerUserId };
          const result = canViewBooking(ctx, booking, provider);
          const expected =
            callerUserId === customerId || callerUserId === provider.userId;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("canManageAvailability follows same rules as canManageProvider", () => {
    fc.assert(
      fc.property(providerArb, userIdArb, (provider, randomUserId) => {
        const ctx: AuthContext = { userId: randomUserId };
        const manageProvResult = canManageProvider(ctx, provider);
        const manageAvailResult = canManageAvailability(ctx, provider);
        expect(manageAvailResult).toBe(manageProvResult);
      }),
      { numRuns: 200 }
    );
  });
});

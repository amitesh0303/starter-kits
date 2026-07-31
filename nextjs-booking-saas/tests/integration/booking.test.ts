/**
 * Integration tests for the booking creation flow with concurrency protection.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  InMemoryBookingRepository,
  InMemoryProviderRepository,
  InMemoryAvailabilityRepository,
} from "@/lib/server/database";
import { BookingConflictError } from "@/lib/server/errors";
import type { Booking } from "@/domain/entities";

describe("Booking Creation Flow", () => {
  let bookingRepo: InMemoryBookingRepository;
  let providerRepo: InMemoryProviderRepository;
  let availabilityRepo: InMemoryAvailabilityRepository;

  beforeEach(() => {
    bookingRepo = new InMemoryBookingRepository();
    providerRepo = new InMemoryProviderRepository();
    availabilityRepo = new InMemoryAvailabilityRepository();
  });

  it("creates a booking successfully when slot is available", async () => {
    const provider = await providerRepo.create({
      userId: "user_1",
      name: "Dr. Smith",
      email: "smith@test.com",
    });

    const booking = await bookingRepo.create({
      providerId: provider.id,
      customerId: "customer_1",
      customerEmail: "customer@test.com",
      startTime: new Date("2025-01-15T10:00:00Z"),
      endTime: new Date("2025-01-15T11:00:00Z"),
      status: "pending",
      paymentId: null,
    });

    expect(booking.id).toBeDefined();
    expect(booking.status).toBe("pending");
    expect(booking.providerId).toBe(provider.id);
  });

  it("rejects booking when slot overlaps with existing confirmed booking", async () => {
    const provider = await providerRepo.create({
      userId: "user_1",
      name: "Dr. Smith",
      email: "smith@test.com",
    });

    // Create first booking
    await bookingRepo.create({
      providerId: provider.id,
      customerId: "customer_1",
      customerEmail: "cust1@test.com",
      startTime: new Date("2025-01-15T10:00:00Z"),
      endTime: new Date("2025-01-15T11:00:00Z"),
      status: "confirmed",
      paymentId: null,
    });

    // Attempt overlapping booking
    await expect(
      bookingRepo.create({
        providerId: provider.id,
        customerId: "customer_2",
        customerEmail: "cust2@test.com",
        startTime: new Date("2025-01-15T10:30:00Z"),
        endTime: new Date("2025-01-15T11:30:00Z"),
        status: "pending",
        paymentId: null,
      })
    ).rejects.toThrow(BookingConflictError);
  });

  it("allows booking when existing booking is cancelled", async () => {
    const provider = await providerRepo.create({
      userId: "user_1",
      name: "Dr. Smith",
      email: "smith@test.com",
    });

    // Create and cancel first booking
    const first = await bookingRepo.create({
      providerId: provider.id,
      customerId: "customer_1",
      customerEmail: "cust1@test.com",
      startTime: new Date("2025-01-15T10:00:00Z"),
      endTime: new Date("2025-01-15T11:00:00Z"),
      status: "pending",
      paymentId: null,
    });
    await bookingRepo.updateStatus(first.id, "cancelled");

    // Now same slot is available
    const second = await bookingRepo.create({
      providerId: provider.id,
      customerId: "customer_2",
      customerEmail: "cust2@test.com",
      startTime: new Date("2025-01-15T10:00:00Z"),
      endTime: new Date("2025-01-15T11:00:00Z"),
      status: "pending",
      paymentId: null,
    });

    expect(second.id).toBeDefined();
  });

  it("allows non-overlapping bookings for the same provider", async () => {
    const provider = await providerRepo.create({
      userId: "user_1",
      name: "Dr. Smith",
      email: "smith@test.com",
    });

    const first = await bookingRepo.create({
      providerId: provider.id,
      customerId: "customer_1",
      customerEmail: "cust1@test.com",
      startTime: new Date("2025-01-15T10:00:00Z"),
      endTime: new Date("2025-01-15T11:00:00Z"),
      status: "confirmed",
      paymentId: null,
    });

    const second = await bookingRepo.create({
      providerId: provider.id,
      customerId: "customer_2",
      customerEmail: "cust2@test.com",
      startTime: new Date("2025-01-15T11:00:00Z"),
      endTime: new Date("2025-01-15T12:00:00Z"),
      status: "pending",
      paymentId: null,
    });

    expect(first.id).toBeDefined();
    expect(second.id).toBeDefined();
  });

  it("transitions booking through status states correctly", async () => {
    const provider = await providerRepo.create({
      userId: "user_1",
      name: "Dr. Smith",
      email: "smith@test.com",
    });

    const booking = await bookingRepo.create({
      providerId: provider.id,
      customerId: "customer_1",
      customerEmail: "cust@test.com",
      startTime: new Date("2025-01-15T10:00:00Z"),
      endTime: new Date("2025-01-15T11:00:00Z"),
      status: "pending",
      paymentId: null,
    });

    expect(booking.status).toBe("pending");

    const confirmed = await bookingRepo.updateStatus(booking.id, "confirmed");
    expect(confirmed!.status).toBe("confirmed");

    const completed = await bookingRepo.updateStatus(booking.id, "completed");
    expect(completed!.status).toBe("completed");
  });

  it("links payment to booking", async () => {
    const provider = await providerRepo.create({
      userId: "user_1",
      name: "Dr. Smith",
      email: "smith@test.com",
    });

    const booking = await bookingRepo.create({
      providerId: provider.id,
      customerId: "customer_1",
      customerEmail: "cust@test.com",
      startTime: new Date("2025-01-15T10:00:00Z"),
      endTime: new Date("2025-01-15T11:00:00Z"),
      status: "pending",
      paymentId: null,
    });

    const updated = await bookingRepo.setPaymentId(booking.id, "pay_123");
    expect(updated!.paymentId).toBe("pay_123");
  });
});

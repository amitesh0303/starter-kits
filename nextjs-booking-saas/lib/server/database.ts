/**
 * Database repository layer using Prisma.
 * Provides typed access to providers, availability, bookings, payments, and events.
 * In test/development, use in-memory fakes.
 */

import type {
  Provider,
  Availability,
  Booking,
  BookingStatus,
  Payment,
  PaymentStatus,
  ProcessedEvent,
} from "@/domain/entities";
import { BookingConflictError } from "./errors";

// --- Repository Interfaces ---

export interface ProviderRepository {
  findById(id: string): Promise<Provider | null>;
  findByUserId(userId: string): Promise<Provider | null>;
  create(provider: Omit<Provider, "id" | "createdAt" | "updatedAt">): Promise<Provider>;
}

export interface AvailabilityRepository {
  findByProvider(providerId: string): Promise<Availability[]>;
  create(availability: Omit<Availability, "id" | "createdAt">): Promise<Availability>;
  delete(id: string): Promise<void>;
}

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByProvider(providerId: string): Promise<Booking[]>;
  findByCustomer(customerId: string): Promise<Booking[]>;
  findOverlapping(providerId: string, startTime: Date, endTime: Date): Promise<Booking[]>;
  create(booking: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<Booking>;
  updateStatus(id: string, status: BookingStatus): Promise<Booking | null>;
  setPaymentId(id: string, paymentId: string): Promise<Booking | null>;
}

export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByBooking(bookingId: string): Promise<Payment | null>;
  create(payment: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment>;
  updateStatus(id: string, status: PaymentStatus): Promise<Payment | null>;
}

export interface EventRepository {
  exists(providerEventId: string): Promise<boolean>;
  create(event: Omit<ProcessedEvent, "id" | "processedAt">): Promise<ProcessedEvent>;
}

// --- In-Memory Fake Repository (for testing) ---

export class InMemoryProviderRepository implements ProviderRepository {
  private providers: Map<string, Provider> = new Map();

  async findById(id: string): Promise<Provider | null> {
    return this.providers.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Provider | null> {
    for (const p of this.providers.values()) {
      if (p.userId === userId) return p;
    }
    return null;
  }

  async create(data: Omit<Provider, "id" | "createdAt" | "updatedAt">): Promise<Provider> {
    const provider: Provider = {
      ...data,
      id: `prov_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.providers.set(provider.id, provider);
    return provider;
  }
}

export class InMemoryAvailabilityRepository implements AvailabilityRepository {
  private slots: Map<string, Availability> = new Map();

  async findByProvider(providerId: string): Promise<Availability[]> {
    return Array.from(this.slots.values()).filter(
      (a) => a.providerId === providerId
    );
  }

  async create(data: Omit<Availability, "id" | "createdAt">): Promise<Availability> {
    const slot: Availability = {
      ...data,
      id: `avail_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
    };
    this.slots.set(slot.id, slot);
    return slot;
  }

  async delete(id: string): Promise<void> {
    this.slots.delete(id);
  }
}

export class InMemoryBookingRepository implements BookingRepository {
  private bookings: Map<string, Booking> = new Map();

  async findById(id: string): Promise<Booking | null> {
    return this.bookings.get(id) ?? null;
  }

  async findByProvider(providerId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (b) => b.providerId === providerId
    );
  }

  async findByCustomer(customerId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (b) => b.customerId === customerId
    );
  }

  async findOverlapping(
    providerId: string,
    startTime: Date,
    endTime: Date
  ): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (b) =>
        b.providerId === providerId &&
        b.status !== "cancelled" &&
        b.startTime < endTime &&
        b.endTime > startTime
    );
  }

  async create(data: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<Booking> {
    // Check for overlapping bookings (concurrency protection)
    const overlapping = await this.findOverlapping(
      data.providerId,
      data.startTime,
      data.endTime
    );
    if (overlapping.length > 0) {
      throw new BookingConflictError();
    }

    const booking: Booking = {
      ...data,
      id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookings.set(booking.id, booking);
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    const b = this.bookings.get(id);
    if (!b) return null;
    const updated = { ...b, status, updatedAt: new Date() };
    this.bookings.set(id, updated);
    return updated;
  }

  async setPaymentId(id: string, paymentId: string): Promise<Booking | null> {
    const b = this.bookings.get(id);
    if (!b) return null;
    const updated = { ...b, paymentId, updatedAt: new Date() };
    this.bookings.set(id, updated);
    return updated;
  }
}

export class InMemoryPaymentRepository implements PaymentRepository {
  private payments: Map<string, Payment> = new Map();

  async findById(id: string): Promise<Payment | null> {
    return this.payments.get(id) ?? null;
  }

  async findByBooking(bookingId: string): Promise<Payment | null> {
    for (const p of this.payments.values()) {
      if (p.bookingId === bookingId) return p;
    }
    return null;
  }

  async create(data: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> {
    const payment: Payment = {
      ...data,
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment | null> {
    const p = this.payments.get(id);
    if (!p) return null;
    const updated = { ...p, status, updatedAt: new Date() };
    this.payments.set(id, updated);
    return updated;
  }
}

export class InMemoryEventRepository implements EventRepository {
  private events: Map<string, ProcessedEvent> = new Map();

  async exists(providerEventId: string): Promise<boolean> {
    for (const e of this.events.values()) {
      if (e.providerEventId === providerEventId) return true;
    }
    return false;
  }

  async create(data: Omit<ProcessedEvent, "id" | "processedAt">): Promise<ProcessedEvent> {
    const event: ProcessedEvent = {
      ...data,
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      processedAt: new Date(),
    };
    this.events.set(event.id, event);
    return event;
  }
}

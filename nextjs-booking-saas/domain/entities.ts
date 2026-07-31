/**
 * Domain entity types for the Booking SaaS application.
 * Core business objects: providers, availability, bookings, payments, and events.
 */

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface Provider {
  id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  createdAt: Date;
}

export interface Booking {
  id: string;
  providerId: string;
  customerId: string;
  customerEmail: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  paymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessedEvent {
  id: string;
  providerEventId: string;
  eventType: string;
  processedAt: Date;
}

/**
 * Drizzle ORM schema for File SaaS entities.
 * Defines tables for file assets, conversion jobs, output assets, subscriptions,
 * and processed events.
 */

import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  bigint,
  pgEnum,
} from "drizzle-orm/pg-core";

// --- Enums ---

export const fileStatusEnum = pgEnum("file_status", [
  "uploaded",
  "processing",
  "ready",
  "failed",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "cancelled",
  "trialing",
]);

// --- Tables ---

export const fileAssets = pgTable("file_assets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileKey: varchar("file_key", { length: 512 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  status: fileStatusEnum("status").notNull().default("uploaded"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const conversionJobs = pgTable("conversion_jobs", {
  id: text("id").primaryKey(),
  fileAssetId: text("file_asset_id")
    .notNull()
    .references(() => fileAssets.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  outputFormat: varchar("output_format", { length: 50 }).notNull(),
  status: jobStatusEnum("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  error: text("error"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const outputAssets = pgTable("output_assets", {
  id: text("id").primaryKey(),
  conversionJobId: text("conversion_job_id")
    .notNull()
    .references(() => conversionJobs.id, { onDelete: "cascade" }),
  fileKey: varchar("file_key", { length: 512 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull(),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  storageQuotaBytes: bigint("storage_quota_bytes", { mode: "number" })
    .notNull()
    .default(5_368_709_120), // 5 GB
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const processedEvents = pgTable("processed_events", {
  id: text("id").primaryKey(),
  providerEventId: varchar("provider_event_id", { length: 255 }).notNull().unique(),
  eventType: varchar("event_type", { length: 255 }).notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

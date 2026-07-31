-- Initial migration for nextjs-file-saas
-- Creates all tables for file conversion, storage, and Stripe billing

CREATE TYPE "file_status" AS ENUM ('uploaded', 'processing', 'ready', 'failed');
CREATE TYPE "job_status" AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE "subscription_status" AS ENUM ('active', 'past_due', 'cancelled', 'trialing');

CREATE TABLE "file_assets" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "file_key" varchar(512) NOT NULL,
  "file_size" bigint NOT NULL,
  "mime_type" varchar(255) NOT NULL,
  "status" "file_status" NOT NULL DEFAULT 'uploaded',
  "uploaded_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "conversion_jobs" (
  "id" text PRIMARY KEY NOT NULL,
  "file_asset_id" text NOT NULL REFERENCES "file_assets"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL,
  "output_format" varchar(50) NOT NULL,
  "status" "job_status" NOT NULL DEFAULT 'pending',
  "attempts" integer NOT NULL DEFAULT 0,
  "max_attempts" integer NOT NULL DEFAULT 3,
  "error" text,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "output_assets" (
  "id" text PRIMARY KEY NOT NULL,
  "conversion_job_id" text NOT NULL REFERENCES "conversion_jobs"("id") ON DELETE CASCADE,
  "file_key" varchar(512) NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "file_size" bigint NOT NULL,
  "mime_type" varchar(255) NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "subscriptions" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "stripe_customer_id" varchar(255) NOT NULL,
  "stripe_subscription_id" varchar(255) NOT NULL,
  "stripe_price_id" varchar(255) NOT NULL,
  "status" "subscription_status" NOT NULL DEFAULT 'active',
  "current_period_end" timestamp with time zone NOT NULL,
  "cancel_at_period_end" boolean NOT NULL DEFAULT false,
  "storage_quota_bytes" bigint NOT NULL DEFAULT 5368709120,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "processed_events" (
  "id" text PRIMARY KEY NOT NULL,
  "provider_event_id" varchar(255) NOT NULL UNIQUE,
  "event_type" varchar(255) NOT NULL,
  "processed_at" timestamp with time zone NOT NULL DEFAULT now()
);

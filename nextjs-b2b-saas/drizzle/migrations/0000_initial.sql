-- Migration: 0000_initial
-- Creates all tables for the B2B SaaS application

DO $$ BEGIN
  CREATE TYPE "role" AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "membership_status" AS ENUM ('active', 'pending', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "subscription_status" AS ENUM ('active', 'past_due', 'cancelled', 'trialing');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "organizations" (
  "id" text PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL UNIQUE,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "memberships" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL,
  "email" varchar(320) NOT NULL,
  "role" "role" NOT NULL DEFAULT 'member',
  "status" "membership_status" NOT NULL DEFAULT 'pending',
  "invited_by" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "customers" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "paddle_customer_id" varchar(255) NOT NULL,
  "email" varchar(320) NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "paddle_subscription_id" varchar(255) NOT NULL,
  "paddle_price_id" varchar(255) NOT NULL,
  "status" "subscription_status" NOT NULL DEFAULT 'active',
  "current_period_end" timestamp with time zone NOT NULL,
  "cancel_at_period_end" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "processed_events" (
  "id" text PRIMARY KEY NOT NULL,
  "provider_event_id" varchar(255) NOT NULL UNIQUE,
  "event_type" varchar(255) NOT NULL,
  "processed_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Initial migration for nextjs-automation-saas
-- Creates all tables for workflow automation with Inngest and Stripe billing

CREATE TYPE "trigger_type" AS ENUM ('manual', 'scheduled', 'webhook');
CREATE TYPE "run_status" AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE "step_status" AS ENUM ('pending', 'running', 'succeeded', 'failed');
CREATE TYPE "subscription_status" AS ENUM ('active', 'past_due', 'cancelled', 'trialing');

CREATE TABLE "workflows" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "trigger_type" "trigger_type" NOT NULL DEFAULT 'manual',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "triggers" (
  "id" text PRIMARY KEY NOT NULL,
  "workflow_id" text NOT NULL REFERENCES "workflows"("id") ON DELETE CASCADE,
  "type" "trigger_type" NOT NULL,
  "config" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "runs" (
  "id" text PRIMARY KEY NOT NULL,
  "workflow_id" text NOT NULL REFERENCES "workflows"("id") ON DELETE CASCADE,
  "triggered_by" text NOT NULL,
  "status" "run_status" NOT NULL DEFAULT 'pending',
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "error" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "step_attempts" (
  "id" text PRIMARY KEY NOT NULL,
  "run_id" text NOT NULL REFERENCES "runs"("id") ON DELETE CASCADE,
  "step_name" varchar(255) NOT NULL,
  "attempt_number" integer NOT NULL,
  "status" "step_status" NOT NULL DEFAULT 'pending',
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "error" text,
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
  "max_runs_per_month" integer NOT NULL DEFAULT 100,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE "processed_events" (
  "id" text PRIMARY KEY NOT NULL,
  "provider_event_id" varchar(255) NOT NULL UNIQUE,
  "event_type" varchar(255) NOT NULL,
  "processed_at" timestamp with time zone NOT NULL DEFAULT now()
);

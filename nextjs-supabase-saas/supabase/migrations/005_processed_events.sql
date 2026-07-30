-- Create processed_events table for webhook idempotency
CREATE TABLE IF NOT EXISTS public.processed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_processed_events_provider_event_id ON public.processed_events (provider_event_id);

-- Enable Row Level Security
ALTER TABLE public.processed_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access processed events (server-side webhook processing)
CREATE POLICY "Service role can manage processed events"
  ON public.processed_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create subscribers table for email notifications
CREATE TABLE public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT,
  last_notification_sent TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{"newsletter": true, "visit_updates": true, "donation_updates": false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for public to subscribe (insert only)
CREATE POLICY "allow_public_subscribe" ON public.email_subscribers
FOR INSERT
WITH CHECK (true);

-- Create policy for public to verify their email
CREATE POLICY "allow_email_verification" ON public.email_subscribers
FOR UPDATE
USING (verification_token IS NOT NULL);

-- Create policy for service role to manage all records
CREATE POLICY "service_role_all_access" ON public.email_subscribers
FOR ALL
USING (true);

-- Create notification logs table to track what was sent
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_email TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_status TEXT DEFAULT 'sent',
  error_message TEXT,
  resend_message_id TEXT
);

-- Enable RLS for notification logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage notification logs
CREATE POLICY "service_role_notification_logs" ON public.notification_logs
FOR ALL
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email_subscribers
CREATE TRIGGER update_email_subscribers_updated_at
BEFORE UPDATE ON public.email_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Fix RLS policies for notification_logs table to prevent unauthorized access
-- This table contains sensitive email delivery information that should only be accessible to admins

-- First ensure RLS is enabled on notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "Only admins can view notification logs" ON public.notification_logs;
DROP POLICY IF EXISTS "service_role_notification_logs" ON public.notification_logs;

-- Create restrictive policy for SELECT operations - only admins can view
CREATE POLICY "Only admins can view notification logs" ON public.notification_logs
FOR SELECT
USING (is_admin(auth.uid()));

-- Create policy for INSERT operations - only service role can create logs
CREATE POLICY "Only service role can create notification logs" ON public.notification_logs
FOR INSERT
WITH CHECK (current_setting('role') = 'service_role');

-- Create policy for UPDATE/DELETE operations - only admins can modify
CREATE POLICY "Only admins can modify notification logs" ON public.notification_logs
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete notification logs" ON public.notification_logs
FOR DELETE
USING (is_admin(auth.uid()));

-- Service role needs full access for edge functions
CREATE POLICY "Service role full access to notification logs" ON public.notification_logs
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');
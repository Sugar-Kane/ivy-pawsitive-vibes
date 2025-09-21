-- Fix email_subscribers RLS to allow users to manage their own subscriptions
-- This enables subscription management while maintaining security

-- Update the restrictive SELECT policy to allow users to view their own subscription
DROP POLICY IF EXISTS "restrict_subscriber_data_access" ON public.email_subscribers;

-- Create new policy allowing users to view their own subscription by email
CREATE POLICY "Users can view their own subscription" ON public.email_subscribers
FOR SELECT
USING (email = auth.email() OR is_admin(auth.uid()));

-- Allow users to update their own subscription preferences
CREATE POLICY "Users can update their own subscription" ON public.email_subscribers
FOR UPDATE
USING (email = auth.email() OR is_admin(auth.uid()))
WITH CHECK (email = auth.email() OR is_admin(auth.uid()));

-- Allow users to delete their own subscription (unsubscribe)
CREATE POLICY "Users can delete their own subscription" ON public.email_subscribers
FOR DELETE
USING (email = auth.email() OR is_admin(auth.uid()));
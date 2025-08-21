-- Fix email_subscribers table security vulnerability
-- Remove public read access and restrict to service role only

-- Add SELECT policy that only allows service role access
CREATE POLICY "restrict_subscriber_data_access" 
ON public.email_subscribers 
FOR SELECT 
USING (false); -- Deny all SELECT access by default

-- Update service_role policy to be more explicit
DROP POLICY IF EXISTS "service_role_all_access" ON public.email_subscribers;

CREATE POLICY "service_role_full_access" 
ON public.email_subscribers 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure public can still subscribe (INSERT only)
-- The existing allow_public_subscribe policy already handles this correctly

-- Add policy for email verification updates (keep existing functionality)
-- The existing allow_email_verification policy already handles this correctly
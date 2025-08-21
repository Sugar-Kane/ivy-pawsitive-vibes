-- Fix newsletters table security vulnerability
-- Remove public access and restrict to authenticated admin users only

-- Drop the overly permissive policy that allows anyone to manage newsletters
DROP POLICY IF EXISTS "Anyone can manage newsletters" ON public.newsletters;

-- Create policy for admin users to manage newsletters
CREATE POLICY "admins_can_manage_newsletters" 
ON public.newsletters 
FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create policy for service role to access newsletters (needed for sending functionality)
CREATE POLICY "service_role_newsletters_access" 
ON public.newsletters 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);